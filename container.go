package main

import (
	"fmt"
)

type rStartContainer struct {
	ContainerID string `json:"container_id"`
	Error       string `json:"error,omitempty"`
}

func (a *App) GoStartContainer(containerID string) rStartContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker start %s", containerID))
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	return rStartContainer{
		ContainerID: string(output),
		Error:       getErrorNotice(errs),
	}
}

type rStopContainer struct {
	ContainerID string `json:"container_id"`
	Error       string `json:"error,omitempty"`
}

func (a *App) GoStopContainer(containerID string) rStopContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker stop %s", containerID))
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	return rStopContainer{
		ContainerID: string(output),
		Error:       getErrorNotice(errs),
	}
}

type rDeleteContainer struct {
	ContainerID string `json:"container_id"`
	Error       string `json:"error,omitempty"`
}

func (a *App) GoDeleteContainer(containerID string) rDeleteContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker rm -f %s", containerID))
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	return rDeleteContainer{
		ContainerID: string(output),
		Error:       getErrorNotice(errs),
	}
}

type rPauseContainer struct {
	ContainerID string `json:"container_id"`
	Error       string `json:"error,omitempty"`
}

func (a *App) GoPauseContainer(containerID string) rPauseContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker pause %s", containerID))
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	return rPauseContainer{
		ContainerID: string(output),
		Error:       getErrorNotice(errs),
	}
}

type rUnpauseContainer struct {
	ContainerID string `json:"container_id"`
	Error       string `json:"error,omitempty"`
}

func (a *App) GoUnpauseContainer(containerID string) rUnpauseContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker unpause %s", containerID))
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	return rUnpauseContainer{
		ContainerID: string(output),
		Error:       getErrorNotice(errs),
	}
}

type rRestartContainer struct {
	ContainerID string `json:"container_id"`
	Error       string `json:"error,omitempty"`
}

func (a *App) GoRestartContainer(containerID string) rRestartContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker restart %s", containerID))
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	return rRestartContainer{
		ContainerID: string(output),
		Error:       getErrorNotice(errs),
	}
}
