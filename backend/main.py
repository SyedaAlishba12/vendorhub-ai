from fastapi import FastAPI

from backend.routes.messageRoutes import router as message_router

app = FastAPI(title="VendorHub AI API")

app.include_router(message_router)


@app.get("/")
def root():
    return {
        "message": "VendorHub AI Backend is working!"
    }