package main

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"os"
	"regexp"
	"time"
)

type DutyTimeResponse struct {
	Status bool            `json:"status"`
	Data   []DutyHourEntry `json:"data"`
}

type DutyHourEntry struct {
	Id        int64                  `json:"character_id"`
	FirstName string                 `json:"first_name"`
	LastName  string                 `json:"last_name"`
	DutyTime  map[string]interface{} `json:"on_duty_time"`
}

type DutyHourResult struct {
	Id        int64       `json:"id"`
	FirstName string      `json:"firstName"`
	LastName  string      `json:"lastName"`
	DutyTime  interface{} `json:"onDutyTime"`
}

func getOPFWData(server, job string) ([]DutyHourResult, error) {
	token := os.Getenv(server + "_token")

	if token == "" {
		return nil, errors.New("missing base or token")
	}

	c := &http.Client{
		Timeout: 10 * time.Second,
	}

	switch job {
	case "police":
		job = "Law Enforcement"
	case "medical":
		job = "Medical"
	default:
		return nil, errors.New("invalid job")
	}

	rgx := regexp.MustCompile(`(?mi)^(c\d{1,2})`)
	match := rgx.FindString(server)

	req, _ := http.NewRequest("GET", "https://rest.opfw.net/"+match+"/characters/job~"+job+"/duty,data", nil)

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

	if !duty.Status {
		return nil, errors.New("rest api responded with status false")
	}

	result := make([]DutyHourResult, len(duty.Data))
	for i, entry := range duty.Data {
		result[i] = DutyHourResult{
			Id:        entry.Id,
			FirstName: entry.FirstName,
			LastName:  entry.LastName,
			DutyTime:  entry.DutyTime[job],
		}
	}

	return result, nil
}
