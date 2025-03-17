package main

import (
	"fmt"
)

type rDeleteNetwork struct {
	NetworkName string `json:"NetworkName"`
	Error       string `json:"Error,omitempty"`
}

func (a *App) GoDeleteNetwork(networkID string) rDeleteNetwork {
	var errs []error
	cmd := genCmd(fmt.Sprintf(dockerCmdNetworkRemove, networkID))
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	return rDeleteNetwork{
		NetworkName: string(output),
		Error:       getErrorNotice(errs),
	}
}
