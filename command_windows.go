//go:build windows

package main

import (
	"os/exec"
	"syscall"
)

func execCmd(cmd []string) ([]byte, error) {
	res := exec.Command(cmd[0], cmd[1:]...)
	res.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return res.Output()
}
