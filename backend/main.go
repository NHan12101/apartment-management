package main

import (
	"apartment-backend/config"
	"apartment-backend/routes"
	"log"
)

func main() {
	// 1. Connect to Database
	config.ConnectDB()

	// 2. Setup router & routes mapping
	r := routes.SetupRouter()

	// 3. Start Server
	log.Println("Server is running on port 8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Server failed to run:", err)
	}
}
