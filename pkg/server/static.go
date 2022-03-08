package server

import (
	"github.com/go-chi/chi/v5"
	"net/http"
)

type staticHandler struct {
}

func (h *staticHandler) router() chi.Router {
	r := chi.NewRouter()

	r.Get("/static/", http.FileServer(http.Dir("")))
}
