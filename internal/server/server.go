package server

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	kitlog "github.com/go-kit/log"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"net/http"
)

type Server struct {

	// handler for static asset, index.html
	//console *console.Console
	// handler for kubernetes proxy

	Logger kitlog.Logger

	router chi.Router
}

// New returns a new HTTP server.
func New() *Server {
	s := &Server{
		//console: &console.Console{},
		Logger:  nil,
		router:  nil,
	}

	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Logger)
	r.Use(accessControl)

	r.Route("/api/console", func(r chi.Router) {
		r.Get("/test",http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(500)
			w.Write([]byte("hi?"))
		}))
	})

	r.Method("GET","/metrics",promhttp.Handler())

	s.router = r
	return s
}

func (s Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w,r)
}

func accessControl(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, X-CSRF-Token, Accept, Authorization")

		if r.Method == "OPTIONS" {
			return
		}

		h.ServeHTTP(w, r)
	})
}

