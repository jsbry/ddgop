package main

import (
	"encoding/json"
	"fmt"
	"runtime"
	"slices"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/docker/docker/api/types/container"
)

type rContainers struct {
	Containers []Container `json:"Containers"`
	Error      string      `json:"Error,omitempty"`
}

type Container struct {
	ContainerID   string      `json:"ContainerID"`
	Image         string      `json:"Image"`
	Command       string      `json:"Command"`
	Created       string      `json:"Created"`
	Status        string      `json:"Status"`
	Ports         []uint16    `json:"Ports"`
	Name          string      `json:"Name"`
	State         string      `json:"State"`
	SubContainers []Container `json:"SubContainers"`
	Mounts        []string    `json:"Mounts"`
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
	defer safeRecover()

	var errs []error
	containerList, err := a.cli.ContainerList(a.ctx, container.ListOptions{
		All: true,
	})
	if err != nil {
		errs = append(errs, fmt.Errorf("ContainerList err: %s", err.Error()))
	}

	containers := []Container{}
	for _, c := range containerList {
		var ports []uint16
		for _, p := range c.Ports {
			if slices.Contains([]string{"::", "[::]"}, p.IP) {
				// IPv6
				continue
			}
			if p.PublicPort > 0 {
				ports = append(ports, p.PublicPort)
			}
		}
		slices.Sort(ports)

		container := Container{
			ContainerID: c.ID,
			Image:       c.Image,
			Command:     c.Command,
			Created:     time.Unix(c.Created, 0).Format("2006-01-02 15:04:05"),
			Status:      c.Status,
			Ports:       ports,
			Name:        c.Names[0][1:],
			State:       c.State,
		}

		var mounts []string
		for _, m := range c.Mounts {
			if string(m.Type) != "volume" {
				continue
			}
			mounts = append(mounts, m.Name)
		}
		container.Mounts = mounts

		containers = append(containers, container)
	}

	containers = groupByPrefix(containers)

	return rContainers{
		Containers: containers,
		Error:      getErrorNotice(errs),
	}
}

const separateKey = "-"

func groupByPrefix(data []Container) []Container {
	grouped := make(map[string][]Container)

	tmp := []Container{}
	for _, entry := range data {
		parts := strings.Split(entry.Name, separateKey)
		if len(parts) > 1 {
			groupKey := parts[0]

			entry.Name = strings.Replace(entry.Name, groupKey+separateKey, "", 1)
			grouped[groupKey] = append(grouped[groupKey], entry)
		} else {
			tmp = append(tmp, entry)
		}
	}

	keys := []string{}
	for parent := range grouped {
		keys = append(keys, parent)
	}
	sort.Strings(keys)

	containers := []Container{}
	for _, parent := range keys {
		pState := "exited"
		state := "exited"
		for _, child := range grouped[parent] {
			if slices.Contains([]string{"paused"}, child.State) {
				pState = "paused"
			}
			if slices.Contains([]string{"restarting", "running", "removing"}, child.State) {
				state = "running"
				break
			}
		}
		if state == "exited" {
			state = pState
		}

		container := Container{
			Name:          parent,
			Ports:         []uint16{},
			State:         state,
			SubContainers: grouped[parent],
		}

		containers = append(containers, container)

	}
	containers = append(containers, tmp...)

	return containers
}

type rContainersStats struct {
	Stats          Stats            `json:"Stats"`
	ContainerStats []ContainerStats `json:"ContainerStats"`
	Error          string           `json:"Error,omitempty"`
}

type ContainerStats struct {
	ContainerID string `json:"ContainerID"`
	CPUPerc     string `json:"CPUPerc"`
	CPULimit    string `json:"CPULimit"`
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

func (a *App) GoStatsContainers() rContainersStats {
	defer safeRecover()

	var errs []error
	containerList, err := a.cli.ContainerList(a.ctx, container.ListOptions{
		All: true,
	})
	if err != nil {
		errs = append(errs, fmt.Errorf("ContainerList err: %s", err.Error()))
	}

	var cpuUsage float64
	var memUsage uint64
	stats := Stats{
		MemUsage: "--",
		MemLimit: "--",
	}
	containers := []ContainerStats{}
	for _, c := range containerList {
		containerStats, err := a.cli.ContainerStatsOneShot(a.ctx, c.ID)
		if err != nil {
			errs = append(errs, fmt.Errorf("ContainerStatsOneShot err: %s", err.Error()))
		}
		defer containerStats.Body.Close()

		var s container.StatsResponse
		if err := json.NewDecoder(containerStats.Body).Decode(&s); err != nil {
			errs = append(errs, fmt.Errorf("NewDecoder.Decode err: %s", err.Error()))
			continue
		}

		container := ContainerStats{
			ContainerID: c.ID,
			CPUPerc:     fmt.Sprintf("%.2f %%", calculateCPUPercent(s.PreCPUStats, s.CPUStats)),
			MemUsage:    fmt.Sprintf("%d", s.MemoryStats.Usage),
		}
		cpuUsage += calculateCPUPercent(s.PreCPUStats, s.CPUStats)
		memUsage += s.MemoryStats.Usage

		memLimit := s.MemoryStats.Limit
		if memLimit != 0 {
			stats.MemLimit = formatBytes(memLimit)
		}

		containers = append(containers, container)
	}

	stats.CPUUsage = fmt.Sprintf("%.2f %%", cpuUsage)
	stats.MemUsage = formatBytes(memUsage)

	CPULimit, err := getCPULimit()
	if err != nil {
		errs = append(errs, fmt.Errorf("getCPULimit err: %s", err.Error()))
	}
	stats.CPULimit = fmt.Sprintf("%d %%", CPULimit*100)

	return rContainersStats{
		Stats:          stats,
		ContainerStats: containers,
		Error:          getErrorNotice(errs),
	}
}

func calculateCPUPercent(previous, current container.CPUStats) float64 {
	cpuDelta := float64(current.CPUUsage.TotalUsage - previous.CPUUsage.TotalUsage)
	systemDelta := float64(current.SystemUsage - previous.SystemUsage)

	cpuCount := current.OnlineCPUs
	if systemDelta > 0 && cpuCount > 0 {
		return (cpuDelta / systemDelta) * float64(cpuCount) * 100.0
	}
	return 0.0
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
