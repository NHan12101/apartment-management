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

func GetTenants(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := config.TenantCol.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var tenants []models.Tenant = []models.Tenant{}
	if err := cursor.All(ctx, &tenants); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	type TenantWithRoom struct {
		models.Tenant `bson:",inline"`
		RoomNumber    string `json:"room_number"`
	}

	var response []TenantWithRoom = []TenantWithRoom{}
	for _, tenant := range tenants {
		item := TenantWithRoom{Tenant: tenant}
		var room models.Room
		err := config.RoomCol.FindOne(ctx, bson.M{"_id": tenant.RoomID}).Decode(&room)
		if err == nil {
			item.RoomNumber = room.RoomNumber
		}
		response = append(response, item)
	}

	c.JSON(http.StatusOK, response)
}

func CheckoutTenant(c *gin.Context) {
	idStr := c.Param("id")
	tenantObjID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Khách thuê không hợp lệ"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var tenant models.Tenant
	err = config.TenantCol.FindOne(ctx, bson.M{"_id": tenantObjID}).Decode(&tenant)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy khách thuê"})
		return
	}

	_, err = config.TenantCol.UpdateOne(ctx, bson.M{"_id": tenantObjID}, bson.M{"$set": bson.M{"status": "inactive"}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể cập nhật khách thuê: " + err.Error()})
		return
	}

	update := bson.M{
		"$set": bson.M{
			"status":    "vacant",
			"tenant_id": nil,
		},
	}
	_, err = config.RoomCol.UpdateOne(ctx, bson.M{"_id": tenant.RoomID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể cập nhật phòng trọ: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Trả phòng thành công"})
}

func DeleteTenant(c *gin.Context) {
	idStr := c.Param("id")
	tenantObjID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Khách thuê không hợp lệ"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var tenant models.Tenant
	err = config.TenantCol.FindOne(ctx, bson.M{"_id": tenantObjID}).Decode(&tenant)
	if err == nil && tenant.Status == "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vui lòng trả phòng cho khách trước khi xóa hợp đồng"})
		return
	}

	_, err = config.TenantCol.DeleteOne(ctx, bson.M{"_id": tenantObjID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Xóa lịch sử khách thuê thành công"})
}
