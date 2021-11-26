package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/mattn/go-colorable"
	"gitlab.com/milan44/logger-v2"
)

var (
	log = logger_v2.NewColored()
)

func main() {
	log.Info("Reading .env...")
	log.MustPanic(loadENV())

	gin.SetMode(gin.ReleaseMode)

	gin.DefaultWriter = colorable.NewColorableStdout()
	gin.ForceConsoleColor()

	r := gin.New()

	r.Use(gin.Recovery())
	r.Use(log.Middleware())

	r.Use(cors.New(cors.Config{
		AllowOrigins:    []string{"https://dev.opfw.net", "http://localhost"},
		AllowMethods:    []string{"GET", "OPTIONS"},
		AllowWebSockets: false,
	}))

	r.GET("/duty/:server/:type", func(c *gin.Context) {
		if !authenticate(c) {
			return
		}

		c.File("static/index.html")
	})

	r.GET("/duty/:server/:type/api", api)

	r.GET("/duty/main.js", func(c *gin.Context) {
		c.File("static/main.js")
	})
	r.GET("/duty/main.css", func(c *gin.Context) {
		c.File("static/main.css")
	})

	log.Info("Server started!")

	log.MustPanic(r.Run(":7000"))
}
