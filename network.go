package main

import (
	"fmt"
)

type rDeleteNetwork struct {
	NetworkName string `json:"NetworkName"`
	Error       string `json:"Error,omitempty"`
}

func (a *App) GoDeleteNetwork(networkID string) rDeleteNetwork {
	defer safeRecover()

	var errs []error
	err := a.cli.NetworkRemove(a.ctx, networkID)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}

	return rDeleteNetwork{
		NetworkName: networkID,
		Error:       getErrorNotice(errs),
	}
}
