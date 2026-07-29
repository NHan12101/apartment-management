package controllers

import (
	"context"
	"net/http"
	"time"

	"apartment-backend/config"
	"apartment-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetRooms(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := config.RoomCol.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var rooms []models.Room = []models.Room{}
	if err := cursor.All(ctx, &rooms); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	type RoomWithTenant struct {
		models.Room `bson:",inline"`
		TenantName  string `json:"tenant_name"`
		TenantPhone string `json:"tenant_phone"`
	}

	var response []RoomWithTenant = []RoomWithTenant{}
	for _, room := range rooms {
		item := RoomWithTenant{Room: room}
		if room.Status == "occupied" && room.TenantID != nil {
			var tenant models.Tenant
			err := config.TenantCol.FindOne(ctx, bson.M{"_id": room.TenantID}).Decode(&tenant)
			if err == nil {
				item.TenantName = tenant.Name
				item.TenantPhone = tenant.Phone
			}
		}
		response = append(response, item)
	}

	c.JSON(http.StatusOK, response)
}

func CreateRoom(c *gin.Context) {
	var room models.Room
	if err := c.ShouldBindJSON(&room); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	room.ID = primitive.NewObjectID()
	room.Status = "vacant"
	room.TenantID = nil

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := config.RoomCol.InsertOne(ctx, room)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, room)
}

func UpdateRoom(c *gin.Context) {
	idStr := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Phòng không hợp lệ"})
		return
	}

	var req struct {
		RoomNumber      string  `json:"room_number"`
		Price           float64 `json:"price"`
		ElectricityRate float64 `json:"electricity_rate"`
		WaterRate       float64 `json:"water_rate"`
		ImageURL        string  `json:"image_url"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"room_number":      req.RoomNumber,
			"price":            req.Price,
			"electricity_rate": req.ElectricityRate,
			"water_rate":       req.WaterRate,
			"image_url":        req.ImageURL,
		},
	}

	_, err = config.RoomCol.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật phòng thành công"})
}

func DeleteRoom(c *gin.Context) {
	idStr := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Phòng không hợp lệ"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var room models.Room
	err = config.RoomCol.FindOne(ctx, bson.M{"_id": objID}).Decode(&room)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy phòng"})
		return
	}

	if room.Status == "occupied" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Không thể xóa phòng đang có người ở"})
		return
	}

	_, err = config.RoomCol.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Xóa phòng thành công"})
}

func RentRoom(c *gin.Context) {
	var req struct {
		RoomID    string  `json:"room_id"`
		Name      string  `json:"name"`
		Phone     string  `json:"phone"`
		Identity  string  `json:"identity"`
		Deposit   float64 `json:"deposit"`
		StartDate string  `json:"start_date"` // YYYY-MM-DD
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	roomObjID, err := primitive.ObjectIDFromHex(req.RoomID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Phòng không hợp lệ"})
		return
	}

	parsedTime, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		parsedTime = time.Now()
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	tenant := models.Tenant{
		ID:        primitive.NewObjectID(),
		Name:      req.Name,
		Phone:     req.Phone,
		Identity:  req.Identity,
		RoomID:    roomObjID,
		Deposit:   req.Deposit,
		StartDate: parsedTime,
		Status:    "active",
	}

	_, err = config.TenantCol.InsertOne(ctx, tenant)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể thêm khách thuê: " + err.Error()})
		return
	}

	update := bson.M{
		"$set": bson.M{
			"status":    "occupied",
			"tenant_id": tenant.ID,
		},
	}

	_, err = config.RoomCol.UpdateOne(ctx, bson.M{"_id": roomObjID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể cập nhật phòng: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Đăng ký thuê phòng thành công", "tenant_id": tenant.ID.Hex()})
}
