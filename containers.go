package main

import (
	"encoding/json"
	"fmt"
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

type rStartContainer struct {
	ContainerID string `json:"container_id"`
	Error       error  `json:"error"`
}

func (a *App) GoStartContainer(containerID string) rStartContainer {
	cmd := genCmd(fmt.Sprintf("docker start %s", containerID))
	ps, err := execCmd(cmd)
	writeBytes("output.log", ps)

	return rStartContainer{
		ContainerID: string(ps),
		Error:       err,
	}
}

type rStopContainer struct {
	ContainerID string `json:"container_id"`
	Error       error  `json:"error"`
}

func (a *App) GoStopContainer(containerID string) rStopContainer {
	cmd := genCmd(fmt.Sprintf("docker stop %s", containerID))
	ps, err := execCmd(cmd)
	writeBytes("output.log", ps)

	return rStopContainer{
		ContainerID: string(ps),
		Error:       err,
	}
}

type rDeleteContainer struct {
	ContainerID string `json:"container_id"`
	Error       error  `json:"error"`
}

func (a *App) GoDeleteContainer(containerID string) rDeleteContainer {
	cmd := genCmd(fmt.Sprintf("docker rm -f %s", containerID))
	ps, err := execCmd(cmd)
	writeBytes("output.log", ps)

	return rDeleteContainer{
		ContainerID: string(ps),
		Error:       err,
	}
}

type rPauseContainer struct {
	ContainerID string `json:"container_id"`
	Error       error  `json:"error"`
}

func (a *App) GoPauseContainer(containerID string) rPauseContainer {
	cmd := genCmd(fmt.Sprintf("docker pause %s", containerID))
	ps, err := execCmd(cmd)
	writeBytes("output.log", ps)

	return rPauseContainer{
		ContainerID: string(ps),
		Error:       err,
	}
}

type rUnpauseContainer struct {
	ContainerID string `json:"container_id"`
	Error       error  `json:"error"`
}

func (a *App) GoUnpauseContainer(containerID string) rUnpauseContainer {
	cmd := genCmd(fmt.Sprintf("docker unpause %s", containerID))
	ps, err := execCmd(cmd)
	writeBytes("output.log", ps)

	return rUnpauseContainer{
		ContainerID: string(ps),
		Error:       err,
	}
}

type rRestartContainer struct {
	ContainerID string `json:"container_id"`
	Error       error  `json:"error"`
}

func (a *App) GoRestartContainer(containerID string) rRestartContainer {
	cmd := genCmd(fmt.Sprintf("docker restart %s", containerID))
	ps, err := execCmd(cmd)
	writeBytes("output.log", ps)

	return rRestartContainer{
		ContainerID: string(ps),
		Error:       err,
	}
}
