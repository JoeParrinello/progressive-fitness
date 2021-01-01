package main

import (
	"log"
	"net/http"
	"os"
	"text/template"
	"time"
)

type exercise struct {
	Name string
	Reps int
}

type pageData struct {
	DateString string
	WeekNum    int
	DayNum     int
	Exercises  []exercise
}

func main() {
	http.HandleFunc("/", handleHome)

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

func handleHome(w http.ResponseWriter, r *http.Request) {
	log.Println("serving home")
	tmpl := template.Must(template.ParseFiles("home.html"))
	tmpl.Execute(w, getPageData())
}

func getPageData() pageData {
	data := pageData{
		DateString: getDateString(),
		WeekNum:    getWeekNum(),
		DayNum:     getDayNum(),
		Exercises: []exercise{
			getPushUpExercise(),
			getSitUpExercise(),
			getJumpingJackExercise(),
		},
	}
	return data
}

func getPushUpExercise() exercise {
	return exercise{
		Name: "Push Ups",
		Reps: getWeekNum(),
	}
}

func getSitUpExercise() exercise {
	return exercise{
		Name: "Sit Ups",
		Reps: getWeekNum(),
	}
}

func getJumpingJackExercise() exercise {
	return exercise{
		Name: "Jumping Jacks",
		Reps: getDayNum(),
	}
}

func getWeekNum() int {
	return (getDayNum() / 7) + 1
}

func getDayNum() int {
	return time.Now().YearDay()
}

func getDateString() string {
	return time.Now().Format("Mon, Jan 02")
}
