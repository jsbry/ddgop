package main

import (
	"encoding/json"
	"fmt"
	"strings"
)

type rNetworks struct {
	Networks []Network `json:"Networks"`
	Error    string    `json:"Error,omitempty"`
}

type Network struct {
	Name      string `json:"Name"`
	NetworkID string `json:"NetworkID"`
	Driver    string `json:"Driver"`
}

type NetworkJSON struct {
	CreatedAt string `json:"CreatedAt"`
	Driver    string `json:"Driver"`
	ID        string `json:"ID"`
	IPv6      string `json:"IPv6"`
	Internal  string `json:"Internal"`
	Labels    string `json:"Labels"`
	Name      string `json:"Name"`
	Scope     string `json:"Scope"`
}

func (a *App) GoNetworks() rNetworks {
	var errs []error
	cmd := genCmd(dockerCmdNetworkList)
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	networks := []Network{}
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if line == "" {
			continue
		}
		var nj NetworkJSON
		json.Unmarshal([]byte(line), &nj)

		network := Network{
			Name:      nj.Name,
			NetworkID: nj.ID,
			Driver:    nj.Driver,
		}

		networks = append(networks, network)
	}

	return rNetworks{
		Networks: networks,
		Error:    getErrorNotice(errs),
	}
}
