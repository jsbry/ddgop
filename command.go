package main

import (
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
