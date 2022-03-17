package config

import "console/pkg/version"

type (
	Config struct {
		HTTP `yaml:"http"`
		APP  `yaml:"app"`
	}
	HTTP struct {
		Listen       string `yaml:"listen"`
		BaseAddress  string `yaml:"baseAddress"`
		CertFile     string `yaml:"cert,omitempty"`
		KeyFile      string `yaml:"key,omitempty"`
		RedirectPort int    `yaml:"redirectPort,omitempty"`
	}
	APP struct {
		BasePath  string `yaml:"basePath" json:"basePath"`
		PublicDir string `yaml:"publicDir,omitempty" json:"publicDir"`

		ConsoleVersion string `json:"consoleVersion"`
		GOARCH         string `json:"GOARCH"`
		GOOS           string `json:"GOOS"`
		KubeVersion    string `json:"kubeVersion"`

		KeycloakAuthURL         string `yaml:"keycloakAuthURL" json:"keycloakAuthURL"`
		KeycloakRealm           string `yaml:"keycloakRealm" json:"keycloakRealm"`
		KeycloakClientId        string `yaml:"keycloakClientId" json:"keycloakClientId"`
		KeycloakUseHiddenIframe bool   `yaml:"keycloakUseHiddenIframe,omitempty" json:"keycloakUseHiddenIframe"`

		McMode            bool   `yaml:"mcMode,omitempty" json:"mcMode"`
		ReleaseMode       bool   `yaml:"releaseMode,omitempty" json:"releaseMode"`
		CustomProductName string `yaml:"customProductName,omitempty" json:"customProductName"`
	}
)

func NewConfig() *Config {
	cfg := &Config{
		HTTP: HTTP{},
		APP: APP{
			ConsoleVersion: version.Version,
			GOARCH:,
		},
	}
	return cfg
}

func (c *Config) Validate() error {

	return nil
}
