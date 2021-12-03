package main

import "github.com/gin-gonic/gin"

func api(c *gin.Context) {
	if !authenticate(c) {
		return
	}

	server := _getServer(c)
	typ := c.Param("type")

	data, err := getOPFWData(server)
	if err != nil || data.StatusCode != 200 {
		if err != nil {
			log.WarningE(err)
		} else if data.Message != nil {
			log.Warning(*data.Message)
		}

		c.AbortWithStatusJSON(500, map[string]interface{}{
			"status":  false,
			"message": "Failed to get data",
		})
		return
	}

	if typ == "police" {
		c.JSON(200, map[string]interface{}{
			"status": true,
			"result": data.Data.Police,
		})
	} else if typ == "medical" {
		c.JSON(200, map[string]interface{}{
			"status": true,
			"result": data.Data.Medical,
		})
	} else {
		c.AbortWithStatusJSON(500, map[string]interface{}{
			"status":  false,
			"message": "Something went wrong",
		})
	}
}
