package console

import (
	"errors"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"html/template"
	"net/http"
	"net/url"
	"os"
	"path"

	"github.com/gorilla/handlers"
	"github.com/justinas/alice"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/rest"
	"k8s.io/klog"

	v1 "console/pkg/api/v1"
	"console/pkg/auth"
	"console/pkg/hypercloud/proxy"
	"console/pkg/version"

	"github.com/sirupsen/logrus"
)

var (
	log = logrus.New().WithField("MODULE", "CONSOLE")
)

const (
	indexPageTemplateName = "index.html"

	k8sProxyPath               = "/api/kubernetes/"
	consolePath = "/api/console"
)


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
	// Proxy
	// A client with the correct TLS setup for communicating with the API server.
	K8sProxyConfig                   *proxy.Config
	K8sClient                        *http.Client
}

func New(cfg *v1.Config) (*Console, error) {
	log.WithField("FILE", "routes.go").Infoln("Create Router based on *v1.Config")
	config := cfg.DeepCopy()

	return createConsole(config)
}

// Server is server only serving static asset & jsconfig
func (c *Console) Server() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Recoverer)
	r.Use(middleware.RealIP)

	standardMiddleware := alice.New(c.RecoverPanic, c.LogRequest, handlers.ProxyHeaders)
	tokenMiddleware := alice.New(c.TokenHandler) // select token depending on release-mode

	staticHandler := http.StripPrefix(proxy.SingleJoiningSlash(c.BaseURL.Path, "/static/"), http.FileServer(http.Dir(c.PublicDir)))
	r.Handle(proxy.SingleJoiningSlash(c.BaseURL.Path, "/static/"), gzipHandler(staticHandler))

	k8sApiHandler := http.StripPrefix(proxy.SingleJoiningSlash(c.BaseURL.Path, "/api/resource/"), http.FileServer(http.Dir("./api")))
	r.Handle(proxy.SingleJoiningSlash(c.BaseURL.Path, "/api/resource/"),gzipHandler(securityHeadersMiddleware(k8sApiHandler)))

	r.HandleFunc(c.BaseURL.Path,c.indexHandler)
	r.Get(c.BaseURL.Path,c.indexHandler)

	k8sProxy := proxy.NewProxy(c.K8sProxyConfig)
	k8sProxyHandler := http.StripPrefix(proxy.SingleJoiningSlash(c.BaseURL.Path, k8sProxyPath), tokenMiddleware.ThenFunc(func(rw http.ResponseWriter, r *http.Request) {
		r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
		k8sProxy.ServeHTTP(rw, r)
	}))
	r.Handle(proxy.SingleJoiningSlash(c.BaseURL.Path, k8sProxyPath),k8sProxyHandler)


	r.Method("GET",consolePath + "/apis/networking.k8s.io/",http.StripPrefix(consolePath,
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request){
			r.Header.Set("Authorization",fmt.Sprintf("Bearer %s", c.StaticUser.Token))
			k8sProxy.ServeHTTP(w,r)
		})))

	r.Method("GET",consolePath + "/api/v1/",http.StripPrefix(consolePath,
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			log.Info("Use default serviceaccount token")
			r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.StaticUser.Token))
			k8sProxy.ServeHTTP(w, r)
		})))

	r.HandleFunc("/api/",r.NotFoundHandler())

	return standardMiddleware.Then(r)
}

func (c *Console) indexHandler(w http.ResponseWriter, r *http.Request) {
	type jsGlobals struct {
		ConsoleVersion string `json:"consoleVersion"`
		BasePath       string `json:"basePath"`

		KubeAPIServerURL         string `json:"kubeAPIServerURL"`
		PrometheusBaseURL        string `json:"prometheusBaseURL"`
		PrometheusTenancyBaseURL string `json:"prometheusTenancyBaseURL"`
		AlertManagerBaseURL      string `json:"alertManagerBaseURL"`

		GrafanaPublicURL    string `json:"grafanaPublicURL"`
		PrometheusPublicURL string `json:"prometheusPublicURL"`
		GitlabURL           string `json:"gitlabURL"`

		GOARCH string `json:"GOARCH"`
		GOOS   string `json:"GOOS"`

		KeycloakRealm           string `json:keycloakRealm`
		KeycloakAuthURL         string `json:keycloakAuthURL`
		KeycloakClientId        string `json:keycloakClientId`
		KeycloakUseHiddenIframe bool   `json:keycloakUseHiddenIframe`

		McMode            bool   `json:mcMode`
		ReleaseModeFlag   bool   `json:"releaseModeFlag"`
		CustomProductName string `json:"customProductName"`
	}

	jsg := &jsGlobals{
		ConsoleVersion:   version.Version,
		BasePath:         c.BaseURL.Path,
		KubeAPIServerURL: c.K8sProxyConfig.Endpoint.String(),

		GOARCH: c.GOARCH,
		GOOS:   c.GOOS,

		// return ekycloak info
		KeycloakRealm:           c.KeycloakRealm,
		KeycloakAuthURL:         c.KeycloakAuthURL,
		KeycloakClientId:        c.KeycloakClientId,
		KeycloakUseHiddenIframe: c.KeycloakUseHiddenIframe,

		GitlabURL:         c.GitlabURL,
		McMode:            c.McMode,
		ReleaseModeFlag:   c.ReleaseModeFlag,
		CustomProductName: c.CustomProductName,
	}

	tpl := template.New(indexPageTemplateName)
	tpl.Delims("[[", "]]")
	tpls, err := tpl.ParseFiles(path.Join(c.PublicDir, indexPageTemplateName))
	if err != nil {
		fmt.Printf("index.html not found in configured public-dir path: %v", err)
		os.Exit(1)
	}

	if err := tpls.ExecuteTemplate(w, indexPageTemplateName, jsg); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (c *Console) GetKubeVersion() string {
	if c.KubeVersion != "" {
		return c.KubeVersion
	}
	config := &rest.Config{
		Host:      c.K8sProxyConfig.Endpoint.String(),
		Transport: c.K8sClient.Transport,
	}
	kubeVersion, err := kubeVersion(config)
	if err != nil {
		kubeVersion = ""
		klog.Warningf("Failed to get cluster k8s version from api server %s", err.Error())
	}
	c.KubeVersion = kubeVersion
	return c.KubeVersion
}

func kubeVersion(config *rest.Config) (string, error) {
	client, err := discovery.NewDiscoveryClientForConfig(config)
	if err != nil {
		return "", err
	}

	kubeVersion, err := client.ServerVersion()
	if err != nil {
		return "", err
	}

	if kubeVersion != nil {
		return kubeVersion.String(), nil
	}
	return "", errors.New("failed to get kubernetes version")
}
