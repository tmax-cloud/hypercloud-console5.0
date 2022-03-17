package server

import (
	"console/pkg/auth"
	kitlog "github.com/go-kit/log"
	"net/url"
)

type consoleHandler struct {
	logger kitlog.Logger
}

type Console struct {
	BaseURL    *url.URL
	PublicDir  string
	StaticUser *auth.User
	// A lister for resource listing a particular kind
	GOARCH      string
	GOOS        string
	KubeVersion string
	// customization
	McMode            bool
	ReleaseModeFlag   bool
	GitlabURL         string
	CustomProductName string
	// Keycloak (Hyperauth) information for logging to console
	KeycloakRealm           string
	KeycloakAuthURL         string
	KeycloakClientId        string
	KeycloakUseHiddenIframe bool
}

//func (c *consoleHandler) router() chi.Router {
//	r := chi.NewRouter()
//
//	r.Route("/")
//
//
//}
