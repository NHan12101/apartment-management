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
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetInvoices(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := config.InvoiceCol.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var invoices []models.Invoice = []models.Invoice{}
	if err := cursor.All(ctx, &invoices); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, invoices)
}

func GetLatestRoomInvoice(c *gin.Context) {
	roomIDStr := c.Param("roomId")
	roomObjID, err := primitive.ObjectIDFromHex(roomIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Phòng không hợp lệ"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := options.FindOne().SetSort(bson.M{"created_at": -1})
	var lastInvoice models.Invoice
	err = config.InvoiceCol.FindOne(ctx, bson.M{"room_id": roomObjID}, opts).Decode(&lastInvoice)
	
	var room models.Room
	roomErr := config.RoomCol.FindOne(ctx, bson.M{"_id": roomObjID}).Decode(&room)
	if roomErr != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy thông tin phòng trọ"})
		return
	}

	response := gin.H{
		"elec_old":         0,
		"water_old":        0,
		"electricity_rate": room.ElectricityRate,
		"water_rate":       room.WaterRate,
		"room_price":       room.Price,
	}

	if err == nil {
		response["elec_old"] = lastInvoice.ElecNew
		response["water_old"] = lastInvoice.WaterNew
	}

	c.JSON(http.StatusOK, response)
}

func CreateInvoice(c *gin.Context) {
	var req struct {
		RoomID   string  `json:"room_id"`
		Month    int     `json:"month"`
		Year     int     `json:"year"`
		ElecOld  float64 `json:"elec_old"`
		ElecNew  float64 `json:"elec_new"`
		WaterOld float64 `json:"water_old"`
		WaterNew float64 `json:"water_new"`
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

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var room models.Room
	err = config.RoomCol.FindOne(ctx, bson.M{"_id": roomObjID}).Decode(&room)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy phòng trọ"})
		return
	}

	elecUsage := req.ElecNew - req.ElecOld
	if elecUsage < 0 {
		elecUsage = 0
	}
	waterUsage := req.WaterNew - req.WaterOld
	if waterUsage < 0 {
		waterUsage = 0
	}

	elecCost := elecUsage * room.ElectricityRate
	waterCost := waterUsage * room.WaterRate
	total := room.Price + elecCost + waterCost

	invoice := models.Invoice{
		ID:              primitive.NewObjectID(),
		RoomID:          roomObjID,
		RoomNumber:      room.RoomNumber,
		Month:           req.Month,
		Year:            req.Year,
		RoomPrice:       room.Price,
		ElecOld:         req.ElecOld,
		ElecNew:         req.ElecNew,
		ElecUsage:       elecUsage,
		ElectricityRate: room.ElectricityRate,
		ElecCost:        elecCost,
		WaterOld:        req.WaterOld,
		WaterNew:        req.WaterNew,
		WaterUsage:      waterUsage,
		WaterRate:       room.WaterRate,
		WaterCost:       waterCost,
		Total:           total,
		IsPaid:          false,
		CreatedAt:       time.Now(),
	}

	_, err = config.InvoiceCol.InsertOne(ctx, invoice)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, invoice)
}

func ToggleInvoicePaid(c *gin.Context) {
	idStr := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Hóa đơn không hợp lệ"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var invoice models.Invoice
	err = config.InvoiceCol.FindOne(ctx, bson.M{"_id": objID}).Decode(&invoice)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy hóa đơn"})
		return
	}

	update := bson.M{"$set": bson.M{"is_paid": !invoice.IsPaid}}
	_, err = config.InvoiceCol.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Thay đổi trạng thái hóa đơn thành công"})
}

func DeleteInvoice(c *gin.Context) {
	idStr := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Hóa đơn không hợp lệ"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = config.InvoiceCol.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Xóa hóa đơn thành công"})
}
