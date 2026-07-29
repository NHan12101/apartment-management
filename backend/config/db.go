package config

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	Client     *mongo.Client
	DB         *mongo.Database
	RoomCol    *mongo.Collection
	TenantCol  *mongo.Collection
	InvoiceCol *mongo.Collection
	UserCol    *mongo.Collection
)

// HashPassword computes the SHA256 hash of a string to store/verify passwords securely
func HashPassword(password string) string {
	hasher := sha256.New()
	hasher.Write([]byte(password))
	return hex.EncodeToString(hasher.Sum(nil))
}

func ConnectDB() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var err error
	Client, err = mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	DB = Client.Database("apartment_management")
	RoomCol = DB.Collection("rooms")
	TenantCol = DB.Collection("tenants")
	InvoiceCol = DB.Collection("invoices")
	UserCol = DB.Collection("users")

	log.Println("Connected to MongoDB successfully!")

	// Seed default Admin if no users exist
	count, err := UserCol.CountDocuments(ctx, bson.M{})
	if err == nil && count == 0 {
		adminPassHash := HashPassword("admin")
		admin := bson.M{
			"username": "admin",
			"password": adminPassHash,
			"name":     "Quản trị viên",
			"phone":    "admin",
			"role":     "admin",
		}
		_, err := UserCol.InsertOne(ctx, admin)
		if err == nil {
			log.Println("Default admin account seeded successfully (admin/admin).")
		} else {
			log.Println("Failed to seed default admin:", err)
		}
	}
}
