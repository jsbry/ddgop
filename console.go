package main

import (
	"fmt"
	"os/exec"
	"runtime"
	"slices"
	"strings"
)

func (a *App) GoOpenConsole(s string) error {
	var cmd *exec.Cmd

	// OSごとに異なる端末を起動
	switch runtime.GOOS {
	case "windows":
		copyCmd := exec.Command("cmd.exe", "/c", fmt.Sprintf("echo %s | clip", s))
		if err := copyCmd.Run(); err != nil {
			return err
		}

		cmd = exec.Command("cmd.exe", "/c", "start", "wsl.exe")
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
		openDirList = append(openDirList, id)
	}

	slices.Sort(openDirList)
	unique := slices.Compact(openDirList)

	for _, id := range unique {
		inspect, err := a.cli.ContainerInspect(a.ctx, id)
		if err != nil {
			errs = append(errs, fmt.Errorf("ContainerInspect err: %s", err.Error()))
		} else {
			workingDir := inspect.Config.Labels["com.docker.compose.project.working_dir"]

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

			return cmd.Start()
		}
	}
	return nil
}
