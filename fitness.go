package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"os"
	"text/template"
	"time"

	"github.com/gorilla/mux"
)

// Exercise defines a single exercise with rep count.
type Exercise struct {
	Name string `json:"Name"`
	Reps int    `json:"Reps"`
}

// Set defines a group of Exercises for a given day.
type Set struct {
	Date      string     `json:"Date"`
	Exercises []Exercise `json:"Exercises"`
}

func main() {
	myRouter := mux.NewRouter().StrictSlash(true)
	myRouter.HandleFunc("/", handleHome)
	myRouter.HandleFunc("/set/{year:[0-9]{4}}/{month:[0-9]{1,2}}/{day:[0-9]{1,2}}", returnSet)
	myRouter.HandleFunc("/service-worker.js", sendSW)

	myRouter.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("defaulting to port %s", port)
	}

	log.Printf("listening on port %s", port)
	if err := http.ListenAndServe(":"+port, myRouter); err != nil {
		log.Fatal("server encountered error", err)
	}
}

func sendSW(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadFile("service-worker.js")
	if err != nil {
		http.Error(w, "Couldn't read file", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
	w.Write(data)
}

func handleHome(w http.ResponseWriter, r *http.Request) {
	log.Println("serving home")
	tmpl := template.Must(template.ParseFiles("home.html"))
	tmpl.Execute(w, getSet(time.Now()))
}

func getSet(t time.Time) Set {
	data := Set{
		Date: getDateString(t),
		Exercises: []Exercise{
			getPushUpExercise(t),
			getSitUpExercise(t),
			getJumpingJackExercise(t),
		},
	}
	return data
}

func getPushUpExercise(t time.Time) Exercise {
	return Exercise{
		Name: "Push Ups",
		Reps: getWeekNum(t),
	}
}

func getSitUpExercise(t time.Time) Exercise {
	return Exercise{
		Name: "Sit Ups",
		Reps: getWeekNum(t),
	}
}

func getJumpingJackExercise(t time.Time) Exercise {
	return Exercise{
		Name: "Jumping Jacks",
		Reps: getDayNum(t),
	}
}

func getWeekNum(t time.Time) int {
	return int(math.Ceil(float64(getDayNum(t)) / 7.0))

}

func getDayNum(t time.Time) int {
	return t.YearDay()
}

func getDateString(t time.Time) string {
	return t.Format("2006-01-02")
}

func getDate(year string, month string, day string) (time.Time, error) {
	return time.Parse("2006-01-02", fmt.Sprintf("%s-%s-%s", year, month, day))
}

func returnSet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	year, month, day := vars["year"], vars["month"], vars["day"]
	requestDate, err := getDate(year, month, day)
	if err != nil {
		http.Error(w, "Error parsing date", http.StatusInternalServerError)
	}

	log.Printf("Date: %s", getDateString(requestDate))
	json.NewEncoder(w).Encode(getSet(requestDate))
}
