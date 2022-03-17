package config

import (
	"console/internal/server"
	"console/pkg/version"
	"runtime"
)

type (
	Config struct {
		HTTP `yaml:"http"`
		App  server.App `yaml:"app"`
		Api  cluster.Api
	}
	HTTP struct {
		Listen       string `yaml:"listen"`
		BaseAddress  string `yaml:"baseAddress"`
		CertFile     string `yaml:"cert,omitempty"`
		KeyFile      string `yaml:"key,omitempty"`
		RedirectPort int    `yaml:"redirectPort,omitempty"`
	}
)

func NewConfig() *Config {
	cfg := &Config{
		HTTP: HTTP{},
		App: server.App{
			ConsoleVersion: version.Version,
			GOARCH:         runtime.GOARCH,
			GOOS:           runtime.GOOS,
			kubeVersion:,
		},
	}
	return cfg
}

func (c *Config) Validate() error {

	return nil
}
