package main

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"os"
	"time"
)

type DutyTimeResponse struct {
	StatusCode int64 `json:"statusCode"`
	Data       *struct {
		Police  []DutyHourEntry `json:"Law Enforcement"`
		Medical []DutyHourEntry `json:"Medical"`
	} `json:"data"`
	Message *string `json:"message,omitempty"`
}

type DutyHourEntry struct {
	Id        int64       `json:"id"`
	FirstName string      `json:"firstName"`
	LastName  string      `json:"lastName"`
	DutyTime  interface{} `json:"onDutyTime"`
}

func getOPFWData(server string) (*DutyTimeResponse, error) {
	url := os.Getenv(server + "_base")
	token := os.Getenv(server + "_token")

	if url == "" || token == "" {
		return nil, errors.New("missing base or token")
	}

	c := &http.Client{
		Timeout: 10 * time.Second,
	}

	req, _ := http.NewRequest("GET", url+"/op-framework/dutyTime.json", nil)

	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := c.Do(req)
	if err != nil {
		return nil, err
	}

	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var duty DutyTimeResponse
	err = json.Unmarshal(b, &duty)
	if err != nil {
		return nil, err
	}

	return &duty, nil
}
