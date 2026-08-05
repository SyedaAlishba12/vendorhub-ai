from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import vendor_routes, product_routes

app = FastAPI(title="VendorHub AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vendor_routes.router)
app.include_router(product_routes.router)


@app.get("/")
def root():
    return {
        "message": "VendorHub AI Backend is working!"
    }