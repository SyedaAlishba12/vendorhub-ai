import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import models  # ← This will run models/__init__.py and load all models

# Import routers
from routes.dashboardRoutes import router as dashboard_router
from routes.pdfRoutes import router as pdf_router
from routes.orderRoutes import router as order_router
from routes.documentRoutes import router as doc_router  
from routes.reviewRoutes import router as review_router 
from routes.adminReviewRoutes import router as admin_router
from routes.rfqRoutes import router as rfq_router
from routes.pricingRoutes import router as pricing_router
from routes.adminPlanRoutes import router as admin_plan_router



load_dotenv()

app = FastAPI(
    title="VendorHub AI API",
    description="B2B Procurement Platform with AI",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard_router)
app.include_router(pdf_router)
app.include_router(order_router)
app.include_router(doc_router)
app.include_router(review_router)
app.include_router(admin_router)
app.include_router(rfq_router)
app.include_router(pricing_router)
app.include_router(admin_plan_router)


@app.get("/")
def root():
    return {
        "message": "VendorHub AI Backend is running!",
        "version": "1.0.0",
        "endpoints": {
            "dashboard": "/api/dashboard/buyer",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "vendorhub-ai"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)