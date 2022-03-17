package server

type ConsoleProxy struct {
}

// Proxy
// A client with the correct TLS setup for communicating with the API server.
K8sProxyConfig *proxy.Config
K8sClient      *http.Client
