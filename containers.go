package main

import (
	"encoding/json"
	"fmt"
	"regexp"
	"runtime"
	"strconv"
	"strings"
)

type rContainers struct {
	Containers []Container `json:"Containers"`
	Error      string      `json:"Error,omitempty"`
}

type Container struct {
	ContainerID string   `json:"ContainerID"`
	Image       string   `json:"Image"`
	Command     string   `json:"Command"`
	Created     string   `json:"Created"`
	Status      string   `json:"Status"`
	Ports       []string `json:"Ports"`
	Name        string   `json:"Name"`
	State       string   `json:"State"`
}

type ContainerJSON struct {
	Command      string `json:"Command"`
	CreatedAt    string `json:"CreatedAt"`
	ID           string `json:"ID"`
	Image        string `json:"Image"`
	Labels       string `json:"Labels"`
	LocalVolumes string `json:"LocalVolumes"`
	Mounts       string `json:"Mounts"`
	Names        string `json:"Names"`
	Networks     string `json:"Networks"`
	Ports        string `json:"Ports"`
	RunningFor   string `json:"RunningFor"`
	Size         string `json:"Size"`
	State        string `json:"State"`
	Status       string `json:"Status"`
}

func (a *App) GoContainers() rContainers {
	var errs []error
	cmd := genCmd("docker container ls -a --no-trunc --format '{{json .}}'")
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	containers := []Container{}
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if line == "" {
			continue
		}
		var cj ContainerJSON
		json.Unmarshal([]byte(line), &cj)

		var ports []string
		splitPorts := strings.Split(cj.Ports, ",")
		if 0 < len(splitPorts) {
			for _, p := range splitPorts {
				p = strings.TrimSpace(p)
				if strings.HasPrefix(p, "::") {
					// IPv6
					continue
				}
				ports = append(ports, p)
			}
		}

		container := Container{
			ContainerID: cj.ID,
			Image:       cj.Image,
			Command:     cj.Command,
			Created:     cj.CreatedAt,
			Status:      cj.Status,
			Ports:       ports,
			Name:        cj.Names,
			State:       cj.State,
		}
		containers = append(containers, container)
	}

	return rContainers{
		Containers: containers,
		Error:      getErrorNotice(errs),
	}
}

type rContainerStats struct {
	Stats          Stats            `json:"Stats"`
	ContainerStats []ContainerStats `json:"ContainerStats"`
	Error          string           `json:"Error,omitempty"`
}

type ContainerStats struct {
	ContainerID string `json:"ContainerID"`
	CPUPerc     string `json:"CPUPerc"`
	MemPerc     string `json:"MemPerc"`
	MemUsage    string `json:"MemUsage"`
}

type Stats struct {
	CPUUsage string `json:"CPUUsage"`
	CPULimit string `json:"CPULimit"`
	MemUsage string `json:"MemUsage"`
	MemLimit string `json:"MemLimit"`
}

type ContainerStatsJSON struct {
	BlockIO   string `json:"BlockIO"`
	CPUPerc   string `json:"CPUPerc"`
	Container string `json:"Container"`
	ID        string `json:"ID"`
	MemPerc   string `json:"MemPerc"`
	MemUsage  string `json:"MemUsage"`
	Name      string `json:"Name"`
	NetIO     string `json:"NetIO"`
	PIDs      string `json:"PIDs"`
}

var unitMap = map[string]float64{
	"B":   1,
	"KiB": 1024,
	"MiB": 1024 * 1024,
	"GiB": 1024 * 1024 * 1024,
}
var cpuUsageReg = regexp.MustCompile(`(\d+(\.\d+)?)%`)
var memUsageReg = regexp.MustCompile(`(\d+(\.\d+)?)\s*(B|KiB|MiB|GiB|TiB)`)
var memUsageTotalReg = regexp.MustCompile(`\s*\/\s*(\d+(\.\d+)?)\s*(B|KiB|MiB|GiB|TiB)`)

func (a *App) GoStatsContainer() rContainerStats {
	var errs []error
	cmd := genCmd("docker container stats -a --no-trunc --no-stream --format '{{json .}}'")
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	cpuUsage := 0.0
	memUsage := 0.0
	stats := Stats{
		MemUsage: "--",
		MemLimit: "--",
	}
	containers := []ContainerStats{}
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if line == "" {
			continue
		}
		var cj ContainerStatsJSON
		json.Unmarshal([]byte(line), &cj)

		container := ContainerStats{
			ContainerID: cj.ID,
			CPUPerc:     cj.CPUPerc,
			MemPerc:     cj.MemPerc,
			MemUsage:    cj.MemUsage,
		}

		// CPU
		match := cpuUsageReg.FindStringSubmatch(container.CPUPerc)
		if len(match) < 3 {
			errs = append(errs, fmt.Errorf("cpu match len < 3: %#v", container.CPUPerc))
			continue
		}
		value, err := strconv.ParseFloat(match[1], 64)
		if err != nil {
			errs = append(errs, fmt.Errorf("error parsing cpu value: %s", err.Error()))
			continue
		}
		cpuUsage += value

		// Memory
		match = memUsageReg.FindStringSubmatch(container.MemUsage)
		if len(match) < 4 {
			errs = append(errs, fmt.Errorf("memory usage match len < 4: %s", container.MemUsage))
			continue
		}
		value, err = strconv.ParseFloat(match[1], 64)
		if err != nil {
			errs = append(errs, fmt.Errorf("error parsing memory value: %s", err.Error()))
			continue
		}
		unit := match[3]
		if multiplier, exists := unitMap[unit]; exists {
			memUsage += value * multiplier
		} else {
			errs = append(errs, fmt.Errorf("unknown unit: %s", unit))
		}
		match = memUsageTotalReg.FindStringSubmatch(container.MemUsage)
		if len(match) < 4 {
			errs = append(errs, fmt.Errorf("memory total match len < 4: %s", container.MemUsage))
			continue
		}
		memLimit := fmt.Sprintf("%s %s", match[1], match[3])
		if memLimit != "0 B" {
			stats.MemLimit = memLimit
		}

		containers = append(containers, container)
	}
	stats.CPUUsage = fmt.Sprintf("%.2f%%", cpuUsage)
	stats.MemUsage = formatSize(memUsage)

	CPULimit, err := getCPULimit()
	if err != nil {
		errs = append(errs, fmt.Errorf("getCPULimit err: %s", err.Error()))
	}
	stats.CPULimit = fmt.Sprintf("%d %%", CPULimit*100)

	return rContainerStats{
		Stats:          stats,
		ContainerStats: containers,
		Error:          getErrorNotice(errs),
	}
}

func getCPULimit() (int, error) {
	var cmd []string
	switch runtime.GOOS {
	case "windows", "linux":
		cmd = genCmd("nproc --all")
	case "darwin":
		cmd = genCmd("sysctl -n hw.logicalcpu_max")
	default:
		return 0, fmt.Errorf("unknown os")
	}

	output, err := execCmd(cmd)
	if err != nil {
		return 0, fmt.Errorf("execCmd err: %s", err.Error())
	}
	writeBytes("output.log", output)

	var CPULimit int
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if line == "" {
			continue
		}
		CPULimit, err = strconv.Atoi(line)
	}

	return CPULimit, err
}
