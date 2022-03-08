package server

import (
	"context"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/gorilla/mux"

	kitlog "github.com/go-kit/log"
	"net/http"
)

type Server struct {
	// proxy
	Static staticHandler
	Logger kitlog.Logger

	router chi.Router
}

func New(logger kitlog.Logger) *Server {
	s := &Server{
		Logger: logger,
	}

	r := chi.NewRouter()

	r.Use(accessControl)
	r.Use(middleware.Recoverer)

	r.Get("/")
	r.Handle("/test", http.StripPrefix("/test", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("bye"))
	})))
	//r.Get("/",)
	r.Route("/api", func(r chi.Router) {

	})

	s.router = r

	return s
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

func accessControl(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type")

		if r.Method == "OPTIONS" {
			return
		}

		next.ServeHTTP(w, r)
	})
}
