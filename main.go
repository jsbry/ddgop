package main

import (
	"embed"
	"fmt"
	"log"
	"log/slog"
	"os"
	"path/filepath"
	"strings"

	"github.com/pelletier/go-toml/v2"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

const (
	appTitle  string = "ddgop"
	appConfig string = appTitle + ".toml"
	appLog    string = appTitle + ".log"

	HostTypeInHost int = 1
	HostTypeTcp    int = 2
)

type Config struct {
	WithHostType int
	WithHost     string
}

var cfg Config

//go:embed all:frontend/dist all:public
var assets embed.FS

//go:embed ddgop.default.toml
var confDefault []byte

var debug = "on"

var (
	cacheDir  string
	configDir string

	opts *slog.HandlerOptions
)

func init() {
	var err error
	cacheDir, err = os.UserCacheDir()
	if err != nil {
		cacheDir = "."
	}
	configDir, err = os.UserConfigDir()
	if err != nil {
		configDir = "."
	}

	opts = &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}
	if debug == "on" {
		cacheDir = "."
		configDir = "."

		opts.Level = slog.LevelDebug
	}

	os.MkdirAll(filepath.Join(cacheDir, appTitle), 0755)
	os.MkdirAll(filepath.Join(configDir, appTitle), 0755)
}

func main() {
	// logging
	file, err := os.OpenFile(filepath.Join(cacheDir, appTitle, appLog), os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		log.Fatalf("failed open logging file: %v", err)
	}
	defer file.Close()

	logger := slog.New(slog.NewJSONHandler(file, opts))
	slog.SetDefault(logger)

	// config
	conf, err := os.ReadFile(filepath.Join(configDir, appTitle, appConfig))
	if err != nil {
		// log.Fatalf("failed ReadFile config file: %v", err)
		conf = confDefault
	}

	err = toml.Unmarshal(conf, &cfg)
	if err != nil {
		log.Fatalf("toml.Unmarshal file: %v", err)
	}

	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err = wails.Run(&options.App{
		Title:     appTitle,
		Width:     1024,
		Height:    768,
		MinWidth:  700,
		MinHeight: 500,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})
	if err != nil {
		slog.Error("wails run", slog.Any("error", err))
	}
}

func formatBytes(bytes uint64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.2f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

func getErrorNotice(errs []error) string {
	var n []string
	for _, errs := range errs {
		n = append(n, errs.Error())
	}
	return strings.Join(n, "\n")
}
