package main

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

type rContainers struct {
	Containers []Container `json:"containers"`
	Error      error       `json:"error"`
}

type Container struct {
	ContainerID string   `json:"container_id"`
	Image       string   `json:"image"`
	Command     string   `json:"command"`
	Created     string   `json:"created"`
	Status      string   `json:"status"`
	Ports       []string `json:"ports"`
	Name        string   `json:"name"`
	State       string   `json:"state"`
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
	cmd := genCmd("docker ps -a --no-trunc --format '{{json .}}'")
	ps, err := execCmd(cmd)
	writeBytes("output.log", ps)

	containers := []Container{}
	lines := strings.Split(string(ps), "\n")
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
		Error:      err,
	}
}

type rContainerStats struct {
	Stats          Stats            `json:"stats"`
	ContainerStats []ContainerStats `json:"container_stats"`
	Error          error            `json:"error"`
}

type ContainerStats struct {
	ContainerID string `json:"container_id"`
	CPUPerc     string `json:"cpu_perc"`
	MemPerc     string `json:"mem_perc"`
	MemUsage    string `json:"mem_usage"`
}

type Stats struct {
	CPUPerc  float64 `json:"cpu_perc"`
	MemPerc  float64 `json:"mem_perc"`
	MemUsage string  `json:"mem_usage"`
	MemLimit string  `json:"mem_limit"`
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
	"KiB": 1024,
	"MiB": 1024 * 1024,
	"GiB": 1024 * 1024 * 1024,
}
var memUsageReg = regexp.MustCompile(`(\d+(\.\d+)?)\s*(KiB|MiB|GiB|TiB)`)
var memUsageTotalReg = regexp.MustCompile(`\s*\/\s*(\d+(\.\d+)?)\s*(KiB|MiB|GiB|TiB)`)

func (a *App) GoStatsContainer() rContainerStats {
	cmd := genCmd("docker stats -a --no-trunc --no-stream --format '{{json .}}'")
	ps, err := execCmd(cmd)
	writeBytes("output.log", ps)

	memUsage := 0.0
	stats := Stats{
		MemUsage: "--",
		MemLimit: "--",
	}
	containers := []ContainerStats{}
	lines := strings.Split(string(ps), "\n")
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

		match := memUsageReg.FindStringSubmatch(container.MemUsage)
		if len(match) < 4 {
			continue
		}
		value, err := strconv.ParseFloat(match[1], 64)
		if err != nil {
			fmt.Println("Error parsing memory value:", err)
			continue
		}
		unit := match[3]

		if multiplier, exists := unitMap[unit]; exists {
			memUsage += value * multiplier
		} else {
			fmt.Printf("Unknown unit: %s\n", unit)
		}

		match = memUsageTotalReg.FindStringSubmatch(container.MemUsage)
		stats.MemLimit = fmt.Sprintf("%s %s", match[1], match[3])

		containers = append(containers, container)
	}

	if memUsage > 0 {
		stats.MemUsage = formatSize(memUsage)
	}

	return rContainerStats{
		Stats:          stats,
		ContainerStats: containers,
		Error:          err,
	}
}
