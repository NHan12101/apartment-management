package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Invoice struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	RoomID          primitive.ObjectID `bson:"room_id" json:"room_id"`
	RoomNumber      string             `bson:"room_number" json:"room_number"`
	Month           int                `bson:"month" json:"month"`
	Year            int                `bson:"year" json:"year"`
	RoomPrice       float64            `bson:"room_price" json:"room_price"`
	ElecOld         float64            `bson:"elec_old" json:"elec_old"`
	ElecNew         float64            `bson:"elec_new" json:"elec_new"`
	ElecUsage       float64            `bson:"elec_usage" json:"elec_usage"`
	ElectricityRate float64            `bson:"electricity_rate" json:"electricity_rate"`
	ElecCost        float64            `bson:"elec_cost" json:"elec_cost"`
	WaterOld        float64            `bson:"water_old" json:"water_old"`
	WaterNew        float64            `bson:"water_new" json:"water_new"`
	WaterUsage      float64            `bson:"water_usage" json:"water_usage"`
	WaterRate       float64            `bson:"water_rate" json:"water_rate"`
	WaterCost       float64            `bson:"water_cost" json:"water_cost"`
	Total           float64            `bson:"total" json:"total"`
	IsPaid          bool               `bson:"is_paid" json:"is_paid"`
	CreatedAt       time.Time          `bson:"created_at" json:"created_at"`
}
