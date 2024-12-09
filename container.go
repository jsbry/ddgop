package main

import (
	"fmt"
)

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
