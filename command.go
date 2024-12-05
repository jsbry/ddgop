package main

import (
	"os/exec"
	"runtime"
)

func genCmd(cmd string) []string {
	cmds := []string{
		"sh", "-c", cmd,
	}
	if runtime.GOOS == "windows" {
		cmds = append([]string{"wsl.exe"}, cmds...)
	}

	return cmds
}

func execCmd(cmd []string) ([]byte, error) {
	res := exec.Command(cmd[0], cmd[1:]...)
	return res.Output()
}
