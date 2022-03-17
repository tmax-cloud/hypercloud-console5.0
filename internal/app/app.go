package app

type App struct {
	BasePath         string `yaml:"basePath" json:"basePath"`
	PublicDir        string `yaml:"publicDir,omitempty" json:"publicDir"`
	KubeAPIServerURL string `yaml:"KubeAPIServerURL" json:"kubeAPIServerURL"`

	ConsoleVersion string `json:"consoleVersion"`
	GOARCH         string `json:"GOARCH"`
	GOOS           string `json:"GOOS"`

	KeycloakAuthURL         string `yaml:"keycloakAuthURL" json:"keycloakAuthURL"`
	KeycloakRealm           string `yaml:"keycloakRealm" json:"keycloakRealm"`
	KeycloakClientId        string `yaml:"keycloakClientId" json:"keycloakClientId"`
	KeycloakUseHiddenIframe bool   `yaml:"keycloakUseHiddenIframe,omitempty" json:"keycloakUseHiddenIframe"`

	McMode            bool   `yaml:"mcMode,omitempty" json:"mcMode"`
	ReleaseMode       bool   `yaml:"releaseMode,omitempty" json:"releaseMode"`
	CustomProductName string `yaml:"customProductName,omitempty" json:"customProductName"`
}
