package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/RoderickXii/Food-Forager/internal/db"
	"github.com/RoderickXii/Food-Forager/internal/models"
	"github.com/RoderickXii/Food-Forager/utils"
)

func HandleLoginPost(w http.ResponseWriter, r *http.Request) {
	fmt.Println("in Login Handler")
	var client models.User

	err := json.NewDecoder(r.Body).Decode(&client)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if client.Username == "" || client.Password == "" {
		http.Error(w, "Missing User or Password", http.StatusBadRequest)
		return
	}
	// fmt.Println("client:", client)

	// Check if the user exists in the database
	user, err := db.GetUser(client.Username)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Check if the password is correct
	err = utils.ComparePassword(user.Password, client.Password)
	if err != nil {
		http.Error(w, "Invalid Password", http.StatusUnauthorized)
		return
	}

	sessionToken := utils.GenerateToken(32)
	csrfToken := utils.GenerateToken(32)

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    sessionToken,
		Expires:  time.Now().Add(1 * time.Minute),
		HttpOnly: true,
	})

    http.SetCookie(w, &http.Cookie{
        Name: "csuf_token",
        Value: csrfToken,
        Expires:  time.Now().Add(1 * time.Minute),
		HttpOnly: false,
    })

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := map[string]string{"message": "Login successful"}
	json.NewEncoder(w).Encode(response)

	fmt.Println("finished login")
}
