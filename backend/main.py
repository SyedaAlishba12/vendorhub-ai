import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

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
from routes.paymentRoutes import router as payment_router
from routes.mapsRoutes import router as maps_router

load_dotenv()

app = FastAPI(title="VendorHub AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standard Route Mounting
app.include_router(message_router)
app.include_router(risk_router)
app.include_router(pdf_router)
app.include_router(order_router)
app.include_router(doc_router)
app.include_router(review_router)
app.include_router(admin_router)
app.include_router(fraud_router)
app.include_router(negotiation_router)
app.include_router(integrations_router)
app.include_router(payment_router)
app.include_router(maps_router)

@app.get("/")
def root():
    return {
        "message": "VendorHub AI Backend is working!"
    }