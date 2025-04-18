package main

import (
	"context"
	"log/slog"

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

	a.setDocker()
}

func (a *App) setDocker() {
	var err error
	opt := []client.Opt{
		client.WithAPIVersionNegotiation(),
	}
	switch cfg.WithHostType {
	case HostTypeInHost:
		opt = append(opt, client.FromEnv)
	case HostTypeTcp:
		opt = append(opt, client.WithHost(cfg.WithHost))
	}
	a.cli, err = client.NewClientWithOpts(opt...)
	if err != nil {
		slog.Error("NewClientWithOpts", slog.Any("error", err))
	}
	a.cli.NegotiateAPIVersion(a.ctx)
}

func safeRecover() {
	if r := recover(); r != nil {
		slog.Error("panic recover", slog.Any("error", r))
	}
}
