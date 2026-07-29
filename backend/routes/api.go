package routes

import (
	"apartment-backend/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api")
	{
		// Auth
		api.POST("/register", controllers.Register)
		api.POST("/login", controllers.Login)
		api.PUT("/users/profile", controllers.UpdateProfile)

		// Rooms
		api.GET("/rooms", controllers.GetRooms)
		api.POST("/rooms", controllers.CreateRoom)
		api.PUT("/rooms/:id", controllers.UpdateRoom)
		api.DELETE("/rooms/:id", controllers.DeleteRoom)
		api.POST("/rooms/rent", controllers.RentRoom)

		// Tenants
		api.GET("/tenants", controllers.GetTenants)
		api.POST("/tenants/checkout/:id", controllers.CheckoutTenant)
		api.DELETE("/tenants/:id", controllers.DeleteTenant)

		// Invoices
		api.GET("/invoices", controllers.GetInvoices)
		api.GET("/invoices/room/:roomId/latest", controllers.GetLatestRoomInvoice)
		api.POST("/invoices", controllers.CreateInvoice)
		api.PUT("/invoices/toggle-paid/:id", controllers.ToggleInvoicePaid)
		api.DELETE("/invoices/:id", controllers.DeleteInvoice)
	}

	return r
}
