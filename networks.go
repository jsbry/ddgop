package main

import (
	"fmt"

	"github.com/docker/docker/api/types/network"
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
	defer safeRecover()

	var errs []error
	networkList, err := a.cli.NetworkList(a.ctx, network.ListOptions{})
	if err != nil {
		errs = append(errs, fmt.Errorf("NetworkList err: %s", err.Error()))
	}

	networks := []Network{}
	for _, n := range networkList {
		network := Network{
			Name:      n.Name,
			NetworkID: n.ID,
			Driver:    n.Driver,
		}

		networks = append(networks, network)
	}

	return rNetworks{
		Networks: networks,
		Error:    getErrorNotice(errs),
	}
}
