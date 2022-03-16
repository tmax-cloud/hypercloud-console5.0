package main

import (
	"console/config"
	"console/internal/server"
	"fmt"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"net/http"
	"strings"
)

const (
	defaultConfigFileName = "config"
	defaultConfigFilePath = "./config"
	envPrefix             = "CONSOLE"
)

func main() {
	cmd := NewConsoleCommand()
	cobra.CheckErr(cmd.Execute())
}

func NewConsoleCommand() *cobra.Command {
	cfg := config.NewConfig()

	rootCmd := &cobra.Command{
		Use:   "console",
		Short: "web console for supercloud & hypercloud",
		Long: `The console has three major features, 
First, we provide a react app for supercloud UI. 
Second, we provide the index.html for react app operation. 
Finally, we provide a proxy function for querying the kubernetes resource API`,
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
			return initializeConfig(cmd)
		},
		Run: func(cmd *cobra.Command, args []string) {
			out := cmd.OutOrStdout()
			fmt.Fprintln(out, "config", cfg)
			srv := server.New()
			http.ListenAndServe(":9090",srv)

		},
	}
	rootCmd.PersistentFlags().StringVar(&cfg.HTTP.Listen, "http.listen", "http://0.0.0.0:9000", "listen Address")
	rootCmd.PersistentFlags().StringVar(&cfg.HTTP.BaseAddress, "http.baseAddress", "http://0.0.0.0:9000", "Format: <http | https>://domainOrIPAddress[:port]. Example: https://console.hypercloud.com.")
	rootCmd.PersistentFlags().StringVar(&cfg.HTTP.BasePath, "http.basePath", "/test", "testubg")
	rootCmd.PersistentFlags().StringVar(&cfg.HTTP.CertFile, "http.certFile", "./tls/tls.crt", "TLS certificate. If the certificate is signed by a certificate authority, the certFile should be the concatenation of the server's certificate followed by the CA's certificate.")
	rootCmd.PersistentFlags().StringVar(&cfg.HTTP.KeyFile, "http.keyFile", "./tls/tls.key", "The TLS certificate key.")
	rootCmd.PersistentFlags().IntVar(&cfg.HTTP.RedirectPort, "http.redirectPort", 0, "Port number under which the console should listen for custom hostname redirect.")

	rootCmd.PersistentFlags().StringVar(&cfg.AUTH.KeycloakRealm, "auth.keycloakRealm", "", "Keycloak Realm Name")
	rootCmd.MarkPersistentFlagRequired("auth.keycloakRealm")
	rootCmd.PersistentFlags().StringVar(&cfg.AUTH.KeycloakClientId, "auth.keycloakClientId", "", "Keycloak Client Id")
	rootCmd.MarkPersistentFlagRequired("auth.keycloakClientId")
	rootCmd.PersistentFlags().StringVar(&cfg.AUTH.KeycloakAuthURL, "auth.keycloakAuthUrl", "", "URL of the Keycloak Auth server.")
	rootCmd.MarkPersistentFlagRequired("auth.keycloakAuthUrl")
	rootCmd.PersistentFlags().BoolVar(&cfg.AUTH.KeycloakUseHiddenIframe, "auth.keycloakUseHiddenIframe", false, "Use keycloak Hidden Iframe")

	rootCmd.PersistentFlags().BoolVar(&cfg.APP.McMode, "app.mcMode", true, "Choose Cluster Mode (multi | single)")
	rootCmd.PersistentFlags().BoolVar(&cfg.APP.ReleaseMode, "app.releaseMode", true, "when true, use jwt token given by keycloak")
	rootCmd.PersistentFlags().StringVar(&cfg.APP.PublicDir, "app.publicDir", "./frontend/public/dist", "listen Address")
	rootCmd.PersistentFlags().StringVar(&cfg.APP.CustomProductName, "app.customProductName", "hypercloud", "prduct name for console | default hypercloud")


	fmt.Println(viper.AllKeys())
	return rootCmd
}

func initializeConfig(cmd *cobra.Command) error {
	v := viper.New()

	v.SetConfigName(defaultConfigFileName)
	v.AddConfigPath(defaultConfigFilePath)

	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return err
		}
	}

	v.SetEnvPrefix(envPrefix)
	v.AutomaticEnv()

	bindFlags(cmd, v)

	fmt.Println(v.AllKeys())

	return nil
}

// Bind each cobra flag to its associated viper configuration (config file and environment variable)
func bindFlags(cmd *cobra.Command, v *viper.Viper) {
	cmd.Flags().VisitAll(func(f *pflag.Flag) {
		// Environment variables can't have dashes in them, so bind them to their equivalent
		// keys with underscores, e.g. --favorite-color to STING_FAVORITE_COLOR
		if strings.Contains(f.Name, "-") || strings.Contains(f.Name, ".") {
			envVarSuffix := strings.ToUpper(strings.ReplaceAll(f.Name, "-", "_"))
			envVarSuffix = strings.ReplaceAll(envVarSuffix, ".", "_")
			v.BindEnv(f.Name, fmt.Sprintf("%s_%s", envPrefix, envVarSuffix))
		}

		// Apply the viper config value to the flag when the flag is not set and viper has a value
		if !f.Changed && v.IsSet(f.Name) {
			val := v.Get(f.Name)
			cmd.Flags().Set(f.Name, fmt.Sprintf("%v", val))
		}
	})
}
