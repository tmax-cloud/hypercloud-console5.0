package config

type (
	Config struct {
		HTTP `yaml:"http"`
		AUTH `yaml:"auth"`
		APP  `yaml:"app"`
	}
	HTTP struct {
		Listen       string `yaml:"listen"`
		BaseAddress  string `yaml:"baseAddress"`
		BasePath     string `yaml:"basePath"`
		CertFile     string `yaml:"cert,omitempty"`
		KeyFile      string `yaml:"key,omitempty"`
		RedirectPort int    `yaml:"redirectPort,omitempty"`
	}
	AUTH struct {
		KeycloakAuthURL         string `yaml:"keycloakAuthURL"`
		KeycloakRealm           string `yaml:"keycloakRealm"`
		KeycloakClientId        string `yaml:"keycloakClientId"`
		KeycloakUseHiddenIframe bool   `yaml:"keycloakUseHiddenIframe,omitempty"`
	}
	APP struct {
		McMode            bool   `yaml:"mcMode,omitempty"`
		ReleaseMode       bool   `yaml:"releaseMode,omitempty"`
		PublicDir         string `yaml:"publicDir,omitempty"`
		CustomProductName string `yaml:"customProductName,omitempty"`
	}
)

func NewConfig() *Config {
	cfg := &Config{}
	return cfg
}

func (c *Config) Validate() error {

	return nil
}
