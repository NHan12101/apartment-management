package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Room struct {
	ID              primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	RoomNumber      string              `bson:"room_number" json:"room_number"`
	Price           float64             `bson:"price" json:"price"`
	ElectricityRate float64             `bson:"electricity_rate" json:"electricity_rate"`
	WaterRate       float64             `bson:"water_rate" json:"water_rate"`
	Status          string              `bson:"status" json:"status"` // "vacant" or "occupied"
	TenantID        *primitive.ObjectID `bson:"tenant_id,omitempty" json:"tenant_id,omitempty"`
	ImageURL        string              `bson:"image_url" json:"image_url"`
}
