package main

import (
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"os"
	"text/template"
	"time"
)

// Exercise defines a single exercise with rep count.
type Exercise struct {
	Name string `json:"Name"`
	Reps int `json:"Reps"`
}

// Set defines a group of Exercises for a given day.
type Set struct {
	Date string `json:"Date"`
	Exercises []Exercise `json:"Exercises"`
}

func main() {
	http.HandleFunc("/", handleHome)

	http.HandleFunc("/service-worker.js", sendSW)

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("defaulting to port %s", port)
	}

	log.Printf("listening on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
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
	tmpl.Execute(w, getSet())
}

func getSet() Set {
	data := Set{
		Date: getDateString(),
		Exercises: []Exercise{
			getPushUpExercise(),
			getSitUpExercise(),
			getJumpingJackExercise(),
		},
	}
	return data
}

func getPushUpExercise() Exercise {
	return Exercise{
		Name: "Push Ups",
		Reps: getWeekNum(),
	}
}

func getSitUpExercise() Exercise {
	return Exercise{
		Name: "Sit Ups",
		Reps: getWeekNum(),
	}
}

func getJumpingJackExercise() Exercise {
	return Exercise{
		Name: "Jumping Jacks",
		Reps: getDayNum(),
	}
}

func getWeekNum() int {
	return int(math.Ceil(float64(getDayNum()) / 7.0))

}

func getDayNum() int {
	return time.Now().YearDay()
}

func getDateString() string {
	return time.Now().Format("2006-01-02")
}
