package main

import (
	"fmt"
	"os/exec"
	"runtime"
	"slices"
	"strings"
)

func (a *App) GoOpenConsole(id string, s string) error {
	var cmd *exec.Cmd

	workingDir := ""
	inspect, err := a.cli.ContainerInspect(a.ctx, id)
	if err == nil {
		ok := false
		workingDir, ok = inspect.Config.Labels["com.docker.compose.project.working_dir"]
		if !ok {
			workingDir = ""
		}
	}

	// OSごとに異なる端末を起動
	switch runtime.GOOS {
	case "windows":
		copyCmd := exec.Command("cmd.exe", "/c", fmt.Sprintf("echo %s | clip", s))
		if err := copyCmd.Run(); err != nil {
			return err
		}

		cmd = exec.Command(
			"cmd.exe", "/c", "start",
			"wsl.exe",
			"bash", "-lc", fmt.Sprintf("cd %s && exec bash", workingDir),
		)
	default:
		return nil
	}

	return cmd.Start()
}

func (a *App) GoOpenCompose(containerID string) error {
	defer safeRecover()

	var errs []error

	list := strings.Split(containerID, ",")
	openDirList := []string{}
	for _, id := range list {
		inspect, err := a.cli.ContainerInspect(a.ctx, id)
		if err != nil {
			errs = append(errs, fmt.Errorf("ContainerInspect err: %s", err.Error()))
		} else {
			workingDir, ok := inspect.Config.Labels["com.docker.compose.project.working_dir"]
			if !ok {
				errs = append(errs, fmt.Errorf("Container %s does not have working directory label", id))
				continue
			}
			openDirList = append(openDirList, workingDir)
		}
	}

	slices.Sort(openDirList)
	unique := slices.Compact(openDirList)

	for _, workingDir := range unique {
		var cmd *exec.Cmd
		// OSごとに異なる端末を起動
		switch runtime.GOOS {
		case "windows":
			cmd = exec.Command(
				"cmd.exe", "/c", "start",
				"wsl.exe",
				"bash", "-lc", fmt.Sprintf("cd %s && exec bash", workingDir),
			)
		default:
			return nil
		}

		cmd.Start()
	}
	return nil
}
