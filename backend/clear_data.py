from database.connection import SessionLocal, engine
from models.base import Base
from models.vendors import Vendor
from models.product import Product

# Ensure all tables exist (including products, which is new)
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    deleted_products = db.query(Product).delete()
    deleted_vendors = db.query(Vendor).delete()
    db.commit()
    print(f"🗑️ Deleted {deleted_products} products and {deleted_vendors} vendors.")
except Exception as e:
    db.rollback()
    print(f"❌ Error: {e}")
finally:
    db.close()