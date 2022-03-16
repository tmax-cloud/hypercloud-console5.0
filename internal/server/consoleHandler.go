package server

import (
	kitlog "github.com/go-kit/log"
)

type consoleHandler struct {


	logger kitlog.Logger
}

//func (c *consoleHandler) router() chi.Router {
//	r := chi.NewRouter()
//
//	r.Route("/")
//
//
//}
