//go:build darwin

package main

import (
	"io"
	"os/exec"
)

func execCmd(cmd []string) ([]byte, error) {
	res := exec.Command(cmd[0], cmd[1:]...)
	return res.Output()
}

func execCmdPipe(cmd []string) (*exec.Cmd, io.ReadCloser, error) {
	res := exec.Command(cmd[0], cmd[1:]...)
	stdout, err := res.StdoutPipe()
	return res, stdout, err
}
