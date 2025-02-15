package main

import (
	"fmt"
	"os/exec"
	"runtime"
)

func (a *App) GoOpenConsole(s string) error {
	var cmd *exec.Cmd

	copyCmd := exec.Command("cmd.exe", "/c", fmt.Sprintf("echo %s | clip", s))
	if err := copyCmd.Run(); err != nil {
		return err
	}

	// OSごとに異なる端末を起動
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("cmd.exe", "/c", "start", "wsl.exe")
	default:
		return nil
	}

	return cmd.Start()
}
