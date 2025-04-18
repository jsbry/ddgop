package main

import (
	"bytes"
	"os"
	"path/filepath"
	"time"

	"github.com/pelletier/go-toml/v2"
)

type rConfig struct {
	WithHostType int    `json:"WithHostType"`
	WithHost     string `json:"WithHost"`
	Modified     string `json:"Modified"`
	Error        string `json:"Error,omitempty"`
}

func (a *App) GoConfigGet() rConfig {
	defer safeRecover()

	return rConfig{
		WithHostType: cfg.WithHostType,
		WithHost:     cfg.WithHost,
	}
}

func (a *App) GoConfigUpdate(WithHostType int, WithHost string) rConfig {
	defer safeRecover()

	var errs []error
	conf, err := os.OpenFile(filepath.Join(configDir, appTitle, appConfig), os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		return rConfig{
			Error: getErrorNotice(errs),
		}
	}
	defer conf.Close()

	cfg = Config{
		WithHostType: WithHostType,
		WithHost:     WithHost,
	}
	b, err := toml.Marshal(cfg)
	if err != nil {
		return rConfig{
			Error: getErrorNotice(errs),
		}
	}
	if _, err = bytes.NewReader(b).WriteTo(conf); err != nil {
		return rConfig{
			Error: getErrorNotice(errs),
		}
	}

	a.setDocker()

	return rConfig{
		WithHostType: WithHostType,
		WithHost:     WithHost,
		Modified:     time.Now().Format("2006-01-02 15:04:05"),
	}
}
