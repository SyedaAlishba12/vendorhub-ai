import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()


# ============================================================
# MODEL REGISTRATION
# ============================================================

from models.user import User
from models.vendors import Vendor
from models.Buyer import Buyer, Dashboard
from models.RFQ import RFQ, RFQStatus
from models.SavedVendor import SavedVendor
from models.RecentSearch import RecentSearch

from models.quote import Quote
from models.product import Product
from models.category import ProductCategory, CertificationType
from models.Document import DocumentDB
from models.PricingPlan import PricingPlan
from models.Subscription import Subscription
from models.RFQVendor import RFQVendor

# ============================================================
# EXISTING / AI / COMMUNICATION ROUTES
# ============================================================

from routes.messageRoutes import router as message_router
from routes.riskRoutes import router as risk_router
from routes.pdfRoutes import router as pdf_router
from routes.orderRoutes import router as order_router
from routes.documentRoutes import router as doc_router
from routes.reviewRoutes import router as review_router
from routes.adminReviewRoutes import router as admin_router
from routes.fraudRoutes import router as fraud_router
from routes.negotiationRoutes import router as negotiation_router
from routes.integrationsRoutes import router as integrations_router
from routes.aiRoutes import router as ai_router


# ============================================================
# BUYER / RFQ / PRICING ROUTES
# ============================================================

from routes.dashboardRoutes import router as dashboard_router
from routes.rfqRoutes import router as rfq_router
from routes.pricingRoutes import router as pricing_router
from routes.adminPlanRoutes import router as admin_plan_router
from routes.paymentRoutes import router as payment_router
from routes.mapsRoutes import router as maps_router
from routes.vendorRFQRoutes import router as vendor_rfq_router



# ============================================================
# VENDOR / PRODUCT ROUTES
# ============================================================

from routes import (
    vendor_routes,
    product_routes,
    quote_routes,
    category_routes,
    auth_routes,
)

# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="VendorHub AI API",
    description="B2B Procurement Platform with AI",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# INCLUDE ROUTERS
# ============================================================

# ------------------------------------------------------------
# Buyer Dashboard / RFQ / Pricing
# ------------------------------------------------------------

app.include_router(dashboard_router)
app.include_router(rfq_router)
app.include_router(pricing_router)
app.include_router(admin_plan_router)


# ------------------------------------------------------------
# Messaging / Risk / Fraud / Negotiation / Integrations
# ------------------------------------------------------------

app.include_router(message_router)
app.include_router(risk_router)
app.include_router(fraud_router)
app.include_router(negotiation_router)
app.include_router(integrations_router)
app.include_router(payment_router)
app.include_router(maps_router)



# ------------------------------------------------------------
# Existing Project Routes
# ------------------------------------------------------------

app.include_router(pdf_router)
app.include_router(order_router)
app.include_router(doc_router)
app.include_router(review_router)
app.include_router(admin_router)


# ------------------------------------------------------------
# Vendor / Product / Quote / Category
# ------------------------------------------------------------

app.include_router(vendor_routes.router)
app.include_router(product_routes.router)
app.include_router(quote_routes.router)
app.include_router(category_routes.router)
app.include_router(category_routes.cert_router)
# ------------------------------------------------------------
# Vendor Dashboard
# ------------------------------------------------------------

app.include_router(vendor_rfq_router)



# ------------------------------------------------------------
# AI
# ------------------------------------------------------------

app.include_router(ai_router)

app.include_router(auth_routes.router)
# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "VendorHub AI Backend is running!",
        "version": "1.0.0",
        "endpoints": {
            "dashboard": "/api/dashboard/buyer",
            "health": "/health",
        },
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "vendorhub-ai",
    }


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
    )