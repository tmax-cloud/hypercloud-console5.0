package server

import (
	"console/internal/console"
	"console/pkg/hypercloud/proxy"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	kitlog "github.com/go-kit/log"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"net/http"
)

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

type Server struct {
	App

	// Proxy // A client with the correct TLS setup for communicating with the API server.
	K8sProxyConfig *proxy.Config
	K8sClient      *http.Client

	Logger kitlog.Logger

	router chi.Router
}

// New returns a new HTTP server.
func New(console console.Console, logger kitlog.Logger) *Server {

	s := &Server{
		Console: console,
		Logger:  logger,
	}

	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Logger)
	// Basic CORS
	// for more ideas, see: https://developer.github.com/v3/#cross-origin-resource-sharing
	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Route("/api/console", func(r chi.Router) {
		r.Get("/test", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(500)
			w.Write([]byte("hi?"))
		}))
	})

	r.Method("GET", "/metrics", promhttp.Handler())

	s.router = r
	return s
}

func (s Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}
