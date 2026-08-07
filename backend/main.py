from fastapi import FastAPI

from routes.authRoutes import router as auth_router
from routes.vendorRoutes import router as vendor_router
from routes.ProductRoutes import router as product_router
from routes.InventoryRoutes import router as inventory_router
from routes.OrderRoutes import router as order_router
from routes.AIRecommendationRoutes import (
    router as ai_recommendation_router,
)


app = FastAPI(
    title="VendorHub AI API",
    version="0.1.0",
)


app.include_router(auth_router)
app.include_router(vendor_router)
app.include_router(product_router)
app.include_router(inventory_router)
app.include_router(order_router)
app.include_router(ai_recommendation_router)


@app.get("/")
def root():

    return {
        "message": "VendorHub AI Backend is working!"
    }