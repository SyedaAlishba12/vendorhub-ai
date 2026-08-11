import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.pdfRoutes import router as pdf_router
from routes.orderRoutes import router as order_router
from routes.documentRoutes import router as doc_router
from routes.reviewRoutes import router as review_router
from routes.adminReviewRoutes import router as admin_router
from routes.aiRoutes import router as ai_router

from routes import (
    vendor_routes,
    product_routes,
    quote_routes,
    category_routes,
    auth_routes,
)


load_dotenv()


app = FastAPI(
    title="VendorHub AI API",
    description="B2B Procurement Platform with AI",
    version="1.0.0",
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Existing project routes
app.include_router(pdf_router)
app.include_router(order_router)
app.include_router(doc_router)
app.include_router(review_router)
app.include_router(admin_router)


# Vendor/Product branch routes
##app.include_router(auth_routes.router)
app.include_router(vendor_routes.router)
app.include_router(product_routes.router)
app.include_router(quote_routes.router)
app.include_router(category_routes.router)
app.include_router(category_routes.cert_router)
app.include_router(ai_router)


@app.get("/")
def root():
    return {
        "message": "VendorHub AI API is working!",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "vendorhub-ai",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
    )