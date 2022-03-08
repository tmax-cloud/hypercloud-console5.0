package main

import (
	"console/config"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/go-kit/kit/log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

const (
	//defaultPort	= "9000"
	defaultAddress = "http://0.0.0.0:9000"
)

func main() {
	var logger log.Logger
	logger = log.NewLogfmtLogger(log.NewSyncWriter(os.Stderr))
	logger = log.With(logger, "ts", log.DefaultTimestampUTC)

	cfg, err := config.NewConfig()
	if err != nil {

	}
	fmt.Printf("%v \n", cfg)

	r := chi.NewRouter()

	errs := make(chan error, 2)
	go func() {
		logger.Log("transport", "http", "address", defaultAddress, "msg", "listening")
		errs <- http.ListenAndServe(defaultAddress, r)
	}()
	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, syscall.SIGINT)
		errs <- fmt.Errorf("%s", <-c)
	}()

	logger.Log("terminated", <-errs)
}
