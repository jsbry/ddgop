package main

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"sort"
	"strings"
)

type rStartContainer struct {
	ContainerID string `json:"container_id"`
	Error       string `json:"error,omitempty"`
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
	ContainerID string `json:"container_id"`
	Error       string `json:"error,omitempty"`
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
	ContainerID string `json:"container_id"`
	Error       string `json:"error,omitempty"`
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
	ContainerID string `json:"container_id"`
	Error       string `json:"error,omitempty"`
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
	ContainerID string `json:"container_id"`
	Error       string `json:"error,omitempty"`
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
	ContainerID string `json:"container_id"`
	Error       string `json:"error,omitempty"`
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

type rLogsContainer struct {
	Logs  []string `json:"logs"`
	Error string   `json:"error,omitempty"`
}

func (a *App) GoLogsContainer(containerID string) rLogsContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker container logs %s", containerID))
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	logs := []string{}
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		logs = append(logs, line)
	}

	return rLogsContainer{
		Logs:  logs,
		Error: getErrorNotice(errs),
	}
}

type rInspectContainer struct {
	Inspect string `json:"inspect"`
	Error   string `json:"error,omitempty"`
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

type rFilesContainer struct {
	Files string `json:"files"`
	Error string `json:"error,omitempty"`
}

func (a *App) GoFilesContainer(containerID string) rFilesContainer {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker container exec %s find / -maxdepth 2 -type d -o -type f 2>/dev/null | sort", containerID))
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	lines := strings.Split(string(output), "\n")

	idCounter = 0
	tree := buildTree(lines)
	filesJson, err := json.Marshal(tree)
	if err != nil {
		errs = append(errs, fmt.Errorf("json.Marshal err: %s", err.Error()))
	}

	return rFilesContainer{
		Files: string(filesJson),
		Error: getErrorNotice(errs),
	}
}

type Node struct {
	Name  string  `json:"name"`
	ID    int     `json:"id"`
	Child []*Node `json:"child"`
}

var idCounter int

func generateID() int {
	idCounter++
	return idCounter
}

func buildTree(paths []string) *Node {
	root := &Node{
		Name:  "/",
		ID:    generateID(),
		Child: []*Node{},
	}
	pathMap := map[string]*Node{
		"/": root,
	}

	for _, path := range paths {
		if path == "/" {
			continue
		}
		cleanPath := strings.TrimSuffix(path, "/")
		parts := strings.Split(strings.TrimPrefix(cleanPath, "/"), "/")

		currentPath := "/"
		parent := pathMap[currentPath]

		for _, part := range parts {
			currentPath = filepath.Join(currentPath, part)

			child, exists := pathMap[currentPath]
			if !exists {
				child = &Node{
					Name:  part,
					ID:    generateID(),
					Child: []*Node{},
				}
				parent.Child = append(parent.Child, child)
				pathMap[currentPath] = child
			}

			parent = child
		}
	}

	sortTree(root)
	return root
}

func sortTree(node *Node) {
	sort.Slice(node.Child, func(i, j int) bool {
		return node.Child[i].Name < node.Child[j].Name
	})
	for _, child := range node.Child {
		sortTree(child)
	}
}
