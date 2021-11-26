package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"regexp"
)

func authenticate(c *gin.Context) bool {
	server := _getServer(c)

	rgx := regexp.MustCompile(`(?m)^c\d{1,2}s\d$`)
	if !rgx.MatchString(server) {
		c.String(400, "Invalid server")
		return false
	}

	typ := c.Param("type")
	if typ != "police" && typ != "medical" {
		c.String(400, "Invalid type")
		return false
	}

	username, password, ok := c.Request.BasicAuth()

	if ok {
		pw := os.Getenv(server + "_" + typ + "_pw")

		if username == server && pw == password {
			return true
		}

		_rejectAuth(c)
		return false
	} else {
		_rejectAuth(c)
		return false
	}
}

func _getServer(c *gin.Context) string {
	return c.Param("server")
}

func _rejectAuth(c *gin.Context) {
	c.Header("WWW-Authenticate", "Basic realm=\"restricted\", charset=\"UTF-8\"")

	c.String(http.StatusUnauthorized, "Authorization required")
}
