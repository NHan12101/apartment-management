package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Tenant struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name" json:"name"`
	Phone     string             `bson:"phone" json:"phone"`
	Identity  string             `bson:"identity" json:"identity"`
	RoomID    primitive.ObjectID `bson:"room_id" json:"room_id"`
	Deposit   float64            `bson:"deposit" json:"deposit"`
	StartDate time.Time          `bson:"start_date" json:"start_date"`
	Status    string             `bson:"status" json:"status"` // "active" or "inactive"
}
