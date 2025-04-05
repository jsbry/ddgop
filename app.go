package main

import (
	"context"
	"regexp"
	"strings"

	"github.com/docker/docker/client"
)

// App struct
type App struct {
	ctx context.Context
	cli *client.Client
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	var err error
	a.cli, err = client.NewClientWithOpts(
		client.WithHost("tcp://localhost:2375"),
		client.WithAPIVersionNegotiation(),
	)
	if err != nil {
		panic(err)
	}
	a.cli.NegotiateAPIVersion(ctx)
}

var sizeReg = regexp.MustCompile(`(\d+(\.\d+)?)(B|KB|MB|GB|TB)`)

const sizeNA = "N/A"

func getErrorNotice(errs []error) string {
	var n []string
	for _, errs := range errs {
		n = append(n, errs.Error())
	}
	return strings.Join(n, "\n")
}
