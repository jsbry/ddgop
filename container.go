package main

import (
	"bufio"
	"fmt"
	"regexp"
	"slices"
	"strconv"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type rStartContainer struct {
	ContainerID string `json:"ContainerID"`
	Error       string `json:"Error,omitempty"`
}

func (a *App) GoStartContainer(containerID string) rStartContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker container start %s", containerID))
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
	ContainerID string `json:"ContainerID"`
	Error       string `json:"Error,omitempty"`
}

func (a *App) GoStopContainer(containerID string) rStopContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker container stop %s", containerID))
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
	ContainerID string `json:"ContainerID"`
	Error       string `json:"Error,omitempty"`
}

func (a *App) GoDeleteContainer(containerID string) rDeleteContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker container rm -f %s", containerID))
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
	ContainerID string `json:"ContainerID"`
	Error       string `json:"Error,omitempty"`
}

func (a *App) GoPauseContainer(containerID string) rPauseContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker container pause %s", containerID))
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
	ContainerID string `json:"ContainerID"`
	Error       string `json:"Error,omitempty"`
}

func (a *App) GoUnpauseContainer(containerID string) rUnpauseContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker container unpause %s", containerID))
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
	ContainerID string `json:"ContainerID"`
	Error       string `json:"Error,omitempty"`
}

func (a *App) GoRestartContainer(containerID string) rRestartContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker container restart %s", containerID))
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

func (a *App) GoLogsContainer(containerID string) {
	cmd := genCmd(fmt.Sprintf("docker container logs %s --timestamps -f", containerID))
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
	cmd := genCmd(fmt.Sprintf("docker container inspect %s --format '{{json .}}'", containerID))
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	var inspect string
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if line == "" {
			continue
		}
		inspect = line
	}

	return rInspectContainer{
		Inspect: inspect,
		Error:   getErrorNotice(errs),
	}
}

type rExecContainer struct {
	Exec  string `json:"Exec"`
	Error string `json:"Error,omitempty"`
}

func (a *App) GoExecContainer(containerID string) rExecContainer {
	var errs []error
	exec := fmt.Sprintf("docker container exec -it %s /bin/bash", containerID[:12])
	cmd := genCmd(exec)
	res, stdout, err := execCmdPipe(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmdPipe err: %s", err.Error()))
	} else {
		if err := res.Start(); err != nil {
			errs = append(errs, fmt.Errorf("failed to start command: %s", err.Error()))
		}
	}

	errs = append(errs, fmt.Errorf("failed to start command: %s", "err.Error()"))
	if len(errs) > 0 {
		errs = []error{}
		exec = fmt.Sprintf("docker container exec -it %s /bin/sh", containerID)
		cmd = genCmd(exec)
		res, stdout, err = execCmdPipe(cmd)
		if err != nil {
			errs = append(errs, fmt.Errorf("execCmdPipe err: %s", err.Error()))
		} else {
			if err := res.Start(); err != nil {
				errs = append(errs, fmt.Errorf("failed to start command: %s", err.Error()))
			}
		}
	}

	if len(errs) > 0 {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			line := scanner.Text()
			runtime.EventsEmit(a.ctx, "exec", line)
		}

		res.Wait()
	}

	return rExecContainer{
		Exec:  exec,
		Error: getErrorNotice(errs),
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
	cmd := genCmd(fmt.Sprintf("docker container exec %s ls -la --time-style=\"+%%Y-%%m-%%d %%H:%%M:%%S\" %s", containerID, filepath))
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

		size, err := strconv.ParseFloat(matches[5], 64)
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
			Size:         formatSize(size),
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
