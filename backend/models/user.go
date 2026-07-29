package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username string             `bson:"username" json:"username"`
	Email    string             `bson:"email" json:"email"`
	Password string             `bson:"password" json:"password"`
	Name     string             `bson:"name" json:"name"`
	Phone    string             `bson:"phone" json:"phone"`
	Role     string             `bson:"role" json:"role"` // "admin" or "tenant"
}
