import logging
from models.product import Product
from models.vendors import Vendor

logger = logging.getLogger("Seeder")


def seed_products(db):
    existing = db.query(Product).count()
    if existing > 0:
        logger.info("Products already seeded, skipping.")
        return

    def vendor_id(name):
        v = db.query(Vendor).filter(Vendor.company_name == name).first()
        if not v:
            logger.error(f"❌ Vendor not found: {name}")
            return None
        return v.id

    products_data = [
        ("Karachi Textile Mills", "Cotton Round-Neck T-Shirt", "Apparel",
         "100% cotton, screen-printable, export quality.", 1.5, 3.0, 1000, 20, 50000),
        ("Karachi Textile Mills", "Cotton Polo Shirt", "Apparel",
         "Pique cotton polo, custom branding available.", 2.5, 4.5, 500, 18, 30000),
        ("Karachi Textile Mills", "Denim Jeans (Men)", "Apparel",
         "Stretch denim, multiple washes available.", 4.0, 8.0, 800, 25, 20000),

        ("Lahore Leather Works", "Men's Leather Jacket", "Leather & Apparel",
         "Genuine cowhide leather, custom sizing.", 35.0, 70.0, 100, 30, 5000),
        ("Lahore Leather Works", "Leather Messenger Bag", "Leather & Apparel",
         "Handstitched leather bag with brass hardware.", 20.0, 45.0, 200, 25, 8000),

        ("Faisalabad Fabric Co.", "Cotton Twill Fabric", "Textile",
         "Medium-weight twill, dyeable, per meter.", 1.2, 2.0, 5000, 15, 200000),
        ("Faisalabad Fabric Co.", "Poly-Cotton Blend Fabric", "Textile",
         "60/40 poly-cotton blend for workwear.", 1.0, 1.8, 5000, 15, 150000),

        ("Istanbul Steel Works", "Stainless Steel Pipe (ISO Certified)", "Metal & Steel",
         "304-grade stainless steel pipe, various diameters.", 25.0, 60.0, 500, 15, 10000),
        ("Istanbul Steel Works", "Stainless Steel Sheet", "Metal & Steel",
         "Cold-rolled stainless sheet, 1-3mm thickness.", 40.0, 90.0, 200, 20, 6000),

        ("Ankara Metal Fabricators", "Custom Steel Bracket", "Metal & Steel",
         "CNC-cut steel brackets, custom specs.", 3.0, 8.0, 1000, 12, 25000),
        ("Ankara Metal Fabricators", "Sheet Metal Enclosure", "Metal & Steel",
         "Powder-coated enclosure for industrial equipment.", 15.0, 35.0, 300, 18, 4000),

        ("Shenzhen Solar Tech", "Solar Inverter 5kW", "Renewable Energy",
         "Grid-tie solar inverter with monitoring app.", 300.0, 450.0, 50, 20, 3000),
        ("Shenzhen Solar Tech", "Monocrystalline Solar Panel 400W", "Renewable Energy",
         "High-efficiency solar panel, 25-year warranty.", 90.0, 130.0, 100, 25, 8000),

        ("Guangzhou Electronics Ltd.", "Bluetooth Wireless Earbuds", "Electronics",
         "TWS earbuds with charging case, custom branding.", 3.5, 7.0, 500, 10, 100000),
        ("Guangzhou Electronics Ltd.", "USB-C Fast Charger 65W", "Electronics",
         "GaN fast charger, multi-region plug options.", 4.0, 8.5, 500, 12, 80000),

        ("Yiwu Household Goods Co.", "Stainless Steel Cookware Set", "Household Goods",
         "5-piece cookware set with non-stick coating.", 12.0, 22.0, 300, 20, 15000),
        ("Yiwu Household Goods Co.", "Plastic Storage Container Set", "Household Goods",
         "Airtight food storage containers, BPA-free.", 2.0, 5.0, 1000, 15, 40000),

        ("Dhaka Garments Export", "Men's Formal Shirt", "Apparel",
         "Cotton-blend formal shirt, wrinkle-resistant.", 3.0, 5.5, 1000, 22, 60000),
        ("Ho Chi Minh Furniture Co.", "Rattan Outdoor Chair", "Furniture",
         "Weather-resistant rattan chair with cushion.", 25.0, 55.0, 100, 35, 3000),
        ("Mumbai Spice Exports", "Whole Black Peppercorns (Bulk)", "Food & Agriculture",
         "Premium grade black pepper, export packaging.", 3.0, 6.0, 1000, 15, 50000),
    ]

    products = []
    for name, product_name, category, desc, pmin, pmax, moq, lead, stock in products_data:
        vid = vendor_id(name)
        if vid is None:
            continue
        products.append(
            Product(
                vendor_id=vid,
                name=product_name,
                category=category,
                description=desc,
                price_min=pmin,
                price_max=pmax,
                moq=moq,
                lead_time_days=lead,
                stock_available=stock,
            )
        )

    db.add_all(products)
    db.commit()
    logger.info(f"✅ Seeded {len(products)} products.")