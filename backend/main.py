from fastapi import FastAPI

app = FastAPI(title="VendorHub AI API")


@app.get("/")
def root():
    return {
        "message": "VendorHub AI Backend is working!"
    }