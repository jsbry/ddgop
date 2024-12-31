package main

import (
	"fmt"
)

type rDeleteImage struct {
	ImageID string `json:"ImageID"`
	Error   string `json:"Error,omitempty"`
}

func (a *App) GoDeleteImage(containerID string) rDeleteImage {
	var errs []error
	cmd := genCmd(fmt.Sprintf("docker image rm -f %s", containerID))
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	return rDeleteImage{
		ImageID: string(output),
		Error:   getErrorNotice(errs),
	}
}
