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

func Register(c *gin.Context) {
	var req struct {
		Email           string `json:"email"`
		Phone           string `json:"phone"`
		Password        string `json:"password"`
		ConfirmPassword string `json:"confirm_password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu yêu cầu không hợp lệ: " + err.Error()})
		return
	}

	if req.Email == "" || req.Phone == "" || req.Password == "" || req.ConfirmPassword == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vui lòng nhập đầy đủ tất cả các trường"})
		return
	}

	if req.Password != req.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Xác nhận mật khẩu không khớp"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if email already exists
	var existingUser models.User
	err := config.UserCol.FindOne(ctx, bson.M{"email": req.Email}).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email này đã được đăng ký tài khoản"})
		return
	}

	// Create new user, name defaults to email temporarily
	newUser := models.User{
		ID:       primitive.NewObjectID(),
		Username: req.Email,
		Email:    req.Email,
		Password: config.HashPassword(req.Password),
		Name:     req.Email, // default name to email
		Phone:    req.Phone,
		Role:     "tenant",
	}

	_, err = config.UserCol.InsertOne(ctx, newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi hệ thống khi lưu tài khoản: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Đăng ký thành công!",
		"user": gin.H{
			"id":       newUser.ID.Hex(),
			"username": newUser.Username,
			"email":    newUser.Email,
			"name":     newUser.Name,
			"phone":    newUser.Phone,
			"role":     newUser.Role,
		},
	})
}

func Login(c *gin.Context) {
	var req struct {
		Username string `json:"username"` // can be username or email
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu yêu cầu không hợp lệ: " + err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	// Match either username or email
	err := config.UserCol.FindOne(ctx, bson.M{
		"$or": []bson.M{
			{"username": req.Username},
			{"email": req.Username},
		},
	}).Decode(&user)
	
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tài khoản hoặc mật khẩu không chính xác"})
		return
	}

	hashedInput := config.HashPassword(req.Password)
	if user.Password != hashedInput {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tài khoản hoặc mật khẩu không chính xác"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Đăng nhập thành công!",
		"user": gin.H{
			"id":       user.ID.Hex(),
			"username": user.Username,
			"email":    user.Email,
			"name":     user.Name,
			"phone":    user.Phone,
			"role":     user.Role,
		},
	})
}

func UpdateProfile(c *gin.Context) {
	var req struct {
		ID       string `json:"id"`
		Name     string `json:"name"`
		Phone    string `json:"phone"`
		Password string `json:"password"` // optional password update
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	objID, err := primitive.ObjectIDFromHex(req.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID người dùng không hợp lệ"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	updateData := bson.M{
		"name":  req.Name,
		"phone": req.Phone,
	}

	if req.Password != "" {
		updateData["password"] = config.HashPassword(req.Password)
	}

	_, err = config.UserCol.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": updateData})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể cập nhật hồ sơ: " + err.Error()})
		return
	}

	var updatedUser models.User
	err = config.UserCol.FindOne(ctx, bson.M{"_id": objID}).Decode(&updatedUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi lấy thông tin sau cập nhật"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Cập nhật tài khoản thành công!",
		"user": gin.H{
			"id":       updatedUser.ID.Hex(),
			"username": updatedUser.Username,
			"email":    updatedUser.Email,
			"name":     updatedUser.Name,
			"phone":    updatedUser.Phone,
			"role":     updatedUser.Role,
		},
	})
}
