//go:build windows

package main

import (
	"io"
	"os/exec"
	"syscall"
)

func execCmd(cmd []string) ([]byte, error) {
	res := exec.Command(cmd[0], cmd[1:]...)
	res.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return res.Output()
}

func execCmdPipe(cmd []string) (*exec.Cmd, io.ReadCloser, error) {
	res := exec.Command(cmd[0], cmd[1:]...)
	res.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	stdout, err := res.StdoutPipe()
	return res, stdout, err
}
