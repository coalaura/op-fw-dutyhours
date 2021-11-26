package main

import (
	"github.com/subosito/gotenv"
)

func loadENV() error {
	return gotenv.Load(".env")
}
