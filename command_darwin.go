//go:build darwin

package main

import (
	"os/exec"
)

func execCmd(cmd []string) ([]byte, error) {
	res := exec.Command(cmd[0], cmd[1:]...)
	return res.Output()
}
