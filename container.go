package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"regexp"
	"slices"
	"strconv"
	"strings"

	"github.com/docker/docker/api/types/container"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type rStartContainer struct {
	ContainerID string `json:"ContainerID"`
	Error       string `json:"Error,omitempty"`
}

func (a *App) GoStartContainer(containerID string) rStartContainer {
	var errs []error
	var ids []string
	list := strings.Split(containerID, ",")
	for _, id := range list {
		err := a.cli.ContainerStart(a.ctx, id, container.StartOptions{})
		if err != nil {
			errs = append(errs, fmt.Errorf("ContainerStart err: %s", err.Error()))
		}
	}

	return rStartContainer{
		ContainerID: strings.Join(ids, ","),
		Error:       getErrorNotice(errs),
	}
}

type rStopContainer struct {
	ContainerID string `json:"ContainerID"`
	Error       string `json:"Error,omitempty"`
}

func (a *App) GoStopContainer(containerID string) rStopContainer {
	var errs []error
	var ids []string
	list := strings.Split(containerID, ",")
	for _, id := range list {
		err := a.cli.ContainerStop(a.ctx, id, container.StopOptions{})
		if err != nil {
			errs = append(errs, fmt.Errorf("ContainerStop err: %s", err.Error()))
		}
	}

	return rStopContainer{
		ContainerID: strings.Join(ids, ","),
		Error:       getErrorNotice(errs),
	}
}

type rDeleteContainer struct {
	ContainerID string `json:"ContainerID"`
	Error       string `json:"Error,omitempty"`
}

func (a *App) GoDeleteContainer(containerID string) rDeleteContainer {
	var errs []error
	var ids []string
	list := strings.Split(containerID, ",")
	for _, id := range list {
		err := a.cli.ContainerRemove(a.ctx, id, container.RemoveOptions{})
		if err != nil {
			errs = append(errs, fmt.Errorf("ContainerRemove err: %s", err.Error()))
		}
	}

	return rDeleteContainer{
		ContainerID: strings.Join(ids, ","),
		Error:       getErrorNotice(errs),
	}
}

type rPauseContainer struct {
	ContainerID string `json:"ContainerID"`
	Error       string `json:"Error,omitempty"`
}

func (a *App) GoPauseContainer(containerID string) rPauseContainer {
	var errs []error
	var ids []string
	list := strings.Split(containerID, ",")
	for _, id := range list {
		err := a.cli.ContainerPause(a.ctx, id)
		if err != nil {
			errs = append(errs, fmt.Errorf("ContainerPause err: %s", err.Error()))
		}
	}

	return rPauseContainer{
		ContainerID: strings.Join(ids, ","),
		Error:       getErrorNotice(errs),
	}
}

type rUnpauseContainer struct {
	ContainerID string `json:"ContainerID"`
	Error       string `json:"Error,omitempty"`
}

func (a *App) GoUnpauseContainer(containerID string) rUnpauseContainer {
	var errs []error
	var ids []string
	list := strings.Split(containerID, ",")
	for _, id := range list {
		err := a.cli.ContainerUnpause(a.ctx, id)
		if err != nil {
			errs = append(errs, fmt.Errorf("ContainerUnpause err: %s", err.Error()))
		}
	}

	return rUnpauseContainer{
		ContainerID: strings.Join(ids, ","),
		Error:       getErrorNotice(errs),
	}
}

type rRestartContainer struct {
	ContainerID string `json:"ContainerID"`
	Error       string `json:"Error,omitempty"`
}

func (a *App) GoRestartContainer(containerID string) rRestartContainer {
	var errs []error
	var ids []string
	list := strings.Split(containerID, ",")
	for _, id := range list {
		err := a.cli.ContainerRestart(a.ctx, id, container.StopOptions{})
		if err != nil {
			errs = append(errs, fmt.Errorf("ContainerUnpause err: %s", err.Error()))
		}
	}

	return rRestartContainer{
		ContainerID: strings.Join(ids, ","),
		Error:       getErrorNotice(errs),
	}
}

func (a *App) GoLogsContainer(containerID string) {
	cmd := genCmd(fmt.Sprintf(dockerCmdContainerLogs, containerID))
	res, stdout, err := execCmdPipe(cmd)
	if err != nil {
		runtime.LogErrorf(a.ctx, "failed to get stdout: %v", err)
		return
	}

	if err := res.Start(); err != nil {
		runtime.LogErrorf(a.ctx, "failed to start command: %v", err)
		return
	}

	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		line := scanner.Text()
		runtime.EventsEmit(a.ctx, "log", line)
	}

	res.Wait()
}

type rInspectContainer struct {
	Inspect string `json:"Inspect"`
	Error   string `json:"Error,omitempty"`
}

func (a *App) GoInspectContainer(containerID string) rInspectContainer {
	var errs []error
	var b []byte
	inspect, err := a.cli.ContainerInspect(a.ctx, containerID)
	if err != nil {
		errs = append(errs, fmt.Errorf("ContainerInspect err: %s", err.Error()))
	} else {
		b, err = json.Marshal(inspect)
		if err != nil {
			errs = append(errs, fmt.Errorf("json.Marshal err: %s", err.Error()))
		}
	}
	return rInspectContainer{
		Inspect: string(b),
		Error:   getErrorNotice(errs),
	}
}

type rExecContainer struct {
	Command string `json:"Command"`
	Error   string `json:"Error,omitempty"`
}

func (a *App) GoExecContainer(containerID string) rExecContainer {
	var errs []error
	command := []string{"/bin/bash"}

	_, err := a.cli.ContainerExecCreate(a.ctx, containerID, container.ExecOptions{
		Cmd: command,
	})
	if err != nil {
		errs = append(errs, fmt.Errorf("ContainerInspect err: %s", err.Error()))
	}

	return rExecContainer{
		Command: command[0],
		Error:   getErrorNotice(errs),
	}
}

type rFilesContainer struct {
	Files []File `json:"Files"`
	Error string `json:"Error,omitempty"`
}

type File struct {
	Mode         string `json:"Mode"`
	Links        int    `json:"Links"`
	Owner        string `json:"Owner"`
	Group        string `json:"Group"`
	Size         string `json:"Size"`
	ModifiedAt   string `json:"ModifiedAt"`
	Name         string `json:"Name"`
	AbsolutePath string `json:"AbsolutePath"`
	IsDir        bool   `json:"IsDir"`
	SubFiles     []File `json:"SubFiles"`
}

var lsReg = regexp.MustCompile(`^([d\-l][rwx\-]{9})\s+(\d+)\s+(\S+)\s+(\S+)\s+(\d+)\s+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s+(.+)$`)

func (a *App) GoFilesContainer(containerID string, filepath string) rFilesContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf(dockerCmdContainerExecLS, containerID, filepath))
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	var files []File
	lines := strings.Split(string(output), "\n")
	for _, line := range lines[1:] {
		if line == "" {
			continue
		}

		matches := lsReg.FindStringSubmatch(line)
		if len(matches) != 8 {
			continue
		}

		if slices.Contains([]string{".", ".."}, matches[7]) {
			continue
		}

		isDir := matches[1][0] == 'd'

		links, err := strconv.Atoi(matches[2])
		if err != nil {
			errs = append(errs, fmt.Errorf("links strconv.Atoi err: %s", err.Error()))
			continue
		}

		size, err := strconv.ParseUint(matches[5], 10, 64)
		if err != nil {
			errs = append(errs, fmt.Errorf("size strconv.ParseInt err: %s", err.Error()))
			continue
		}

		name := pathClean(matches[7])
		if isDir {
			name += "/"
		}

		absolutePath := pathClean(strings.Join([]string{filepath, matches[7]}, "/"))
		if isDir {
			absolutePath += "/"
		}

		f := File{
			Mode:         matches[1],
			Links:        links,
			Owner:        matches[3],
			Group:        matches[4],
			Size:         formatBytes(size),
			ModifiedAt:   matches[6],
			Name:         name,
			AbsolutePath: absolutePath,
			IsDir:        isDir,
		}
		files = append(files, f)
	}

	if len(files) == 0 {
		files = append(files, File{
			Name:         "",
			AbsolutePath: filepath,
		})
	}
	return rFilesContainer{
		Files: files,
		Error: getErrorNotice(errs),
	}
}

var pathCleanReg = regexp.MustCompile(`/+`)

func pathClean(s string) string {
	return pathCleanReg.ReplaceAllString(s, "/")
}

type rContainerStats struct {
	ContainerStats ContainerStats `json:"ContainerStats"`
	Error          string         `json:"Error,omitempty"`
}

func (a *App) GoStatsContainer(containerID string) rContainerStats {
	var errs []error
	containerStats, err := a.cli.ContainerStatsOneShot(a.ctx, containerID)
	if err != nil {
		errs = append(errs, fmt.Errorf("ContainerStatsOneShot err: %s", err.Error()))
		return rContainerStats{
			ContainerStats: ContainerStats{
				ContainerID: containerID,
			},
			Error: getErrorNotice(errs),
		}
	}
	defer containerStats.Body.Close()

	var s container.StatsResponse
	if err := json.NewDecoder(containerStats.Body).Decode(&s); err != nil {
		errs = append(errs, fmt.Errorf("NewDecoder.Decode err: %s", err.Error()))
	}

	container := ContainerStats{
		ContainerID: containerID,
		CPUPerc:     fmt.Sprintf("%.2f %%", calculateCPUPercent(s.PreCPUStats, s.CPUStats)),
		MemUsage:    formatBytes(s.MemoryStats.Usage),
	}

	CPULimit, err := getCPULimit()
	if err != nil {
		errs = append(errs, fmt.Errorf("getCPULimit err: %s", err.Error()))
	}
	container.CPULimit = fmt.Sprintf("%d %%", CPULimit*100)

	return rContainerStats{
		ContainerStats: container,
		Error:          getErrorNotice(errs),
	}
}
