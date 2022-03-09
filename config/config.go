package config

import (
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/ilyakaznacheev/cleanenv"
)

type (
	Config struct {
		HTTP `yaml:"http"`
		AUTH `yaml:"auth"`
		APP  `yaml:"app"`
	}
	HTTP struct {
		Listen       string `yaml:"listen" env:"LISTEN" env-default:"http://0.0.0.0:9000" env-description:"listen Address"`
		BaseAddress  string `yaml:"baseAddress" env:"BASE_ADDRESS" env-default:"http://0.0.0.0:9000" env-description:"Format: <http | https>://domainOrIPAddress[:port]. Example: https://console.hypercloud.com."`
		BasePath     string `yaml:"basePath" env:"BASE_PATH" env-default:"/"`
		CertFile     string `yaml:"certFile,omitempty" env:"TLS_CERT_FILE" env-default:"./tls/tls.crt" env-description:"The TLS certificate"`
		KeyFile      string `yaml:"keyFile,omitempty" env:"TLS_KEY_FILE" env-default:"./tls/tls.key" env-description:"The TLS certificate key"`
		RedirectPort int    `yaml:"redirectPort,omitempty" env:"REDIRECT_PORT"`
	}
	AUTH struct {
		KeycloakAuthURL         string `yaml:"keycloakAuthURL" env:"KEYCLOAK_AUTH_URL" env-description:"URL of the Keycloak Auth server. Example: https://hyperauth.tmaxcloud.org/auth "`
		KeycloakRealm           string `yaml:"keycloakRealm" env:"KEYCLOAK_REALM" env-description:"Keycloak Realm Name"`
		KeycloakClientId        string `yaml:"keycloakClientId" env:"KEYCLOAK_CLIENT_ID" env-description:"Keycloak Client Id"`
		KeycloakUseHiddenIframe bool   `yaml:"keycloakUseHiddenIframe,omitempty" env:"KEYCLOAK_USE_HIDDEN_IFRAME"`
	}
	APP struct {
		McMode            bool   `yaml:"mcMode,omitempty" env:"MC_MODE" env-description:""`
		ReleaseMode       bool   `yaml:"releaseMode,omitempty" env:"RELEASE_MODE"`
		PublicDir         string `yaml:"publicDir,omitempty" env:"PUBLIC_DIR"`
		CustomProductName string `yaml:"customProductName,omitempty" env:"CUSTOM_PRODUCT_NAME"`
	}
)

func NewConfig() (*Config, error) {

	//var cfg Config
	cfg := &Config{}
	// override
	args := ProcessArgs(cfg)
	// check if config specified
	if args.ConfigPath != "" {
		// read configuration from the file and then override with environment variables
		err := cleanenv.ReadConfig(args.ConfigPath, cfg)
		if err != nil {
			return nil, fmt.Errorf("Config error: %w", err)
		} else {
			log.Println("Using config from ", args.ConfigPath)
		}
	} else {
		log.Println("No config specified, using environment and args")
		if err := cleanenv.ReadEnv(cfg); err != nil {
			return nil, fmt.Errorf("Env error: %w", err)
		}
		cfg.Listen = args.Listen
		//cfg.KeyFile = args.KeyFile
	}

	fmt.Printf("%v \n", args.KeyFile)
	fmt.Printf("%v \n", cfg.KeyFile)
	fmt.Printf("%v \n", cfg.CertFile)

	return cfg, nil

}

// Args command-line parameters
type Args struct {
	ConfigPath              string
	Listen                  string
	BaseAddress             string
	BasePath                string
	CertFile                string
	KeyFile                 string
	RedirectPort            string
	KeycloakAuthURL         string
	KeycloakRealm           string
	KeycloakClientId        string
	KeycloakUseHiddenIframe bool
	McMode                  bool
	ReleaseMode             bool
	PublicDir               string
	CustomProductName       string
}

func ProcessArgs(cfg interface{}) Args {
	var a Args

	f := flag.NewFlagSet("console-flag", flag.ContinueOnError)
	f.StringVar(&a.ConfigPath, "config", "", "Path to configuration file (./config/config.yaml)")
	f.StringVar(&a.Listen, "listen", "http://0.0.0.0:9000", "listen Address")
	f.StringVar(&a.BaseAddress, "base-address", "http://0.0.0.0:9000", "Format: <http | https>://domainOrIPAddress[:port]. Example: https://console.hypercloud.com.")
	f.StringVar(&a.BasePath, "base-path", "/", "")
	f.StringVar(&a.CertFile, "tls-cert-file", "./tls/tls.crt", "")
	f.StringVar(&a.KeyFile, "tls-cert-key", "checkout", "")
	fu := f.Usage
	f.Usage = func() {
		fu()
		envHelp, _ := cleanenv.GetDescription(cfg, nil)
		fmt.Fprintln(f.Output())
		fmt.Fprintln(f.Output(), envHelp)
	}

	f.Parse(os.Args[1:])

	return a
}