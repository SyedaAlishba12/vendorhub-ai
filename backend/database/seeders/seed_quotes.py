import logging
from sqlalchemy import select
from models.quote import Quote
from models.vendors import Vendor
from models.product import Product

logger = logging.getLogger("Seeder")


async def seed_quotes(db):
    result = await db.execute(select(Quote))
    existing = result.scalars().first()
    if existing:
        logger.info("Quotes already seeded, skipping.")
        return

    async def get_vendor(name):
        r = await db.execute(select(Vendor).where(Vendor.company_name == name))
        return r.scalars().first()

    async def get_product(name):
        r = await db.execute(select(Product).where(Product.name == name))
        return r.scalars().first()

    karachi = await get_vendor("Karachi Textile Mills")
    faisalabad = await get_vendor("Faisalabad Fabric Co.")
    dhaka = await get_vendor("Dhaka Garments Export")
    lahore = await get_vendor("Lahore Leather Works")

    istanbul = await get_vendor("Istanbul Steel Works")
    ankara = await get_vendor("Ankara Metal Fabricators")
    hamburg = await get_vendor("Hamburg Industrial Supplies")
    bangalore = await get_vendor("Bangalore Auto Parts Ltd.")

    shenzhen = await get_vendor("Shenzhen Solar Tech")
    guangzhou = await get_vendor("Guangzhou Electronics Ltd.")
    yiwu = await get_vendor("Yiwu Household Goods Co.")
    dubai = await get_vendor("Dubai Trading & Logistics")

    tshirt = await get_product("Cotton Round-Neck T-Shirt")
    shirt = await get_product("Men's Formal Shirt")
    twill = await get_product("Cotton Twill Fabric")
    jacket = await get_product("Men's Leather Jacket")

    steel_pipe = await get_product("Stainless Steel Pipe (ISO Certified)")
    steel_sheet = await get_product("Stainless Steel Sheet")
    bracket = await get_product("Custom Steel Bracket")
    enclosure = await get_product("Sheet Metal Enclosure")

    inverter = await get_product("Solar Inverter 5kW")
    panel = await get_product("Monocrystalline Solar Panel 400W")
    earbuds = await get_product("Bluetooth Wireless Earbuds")
    cookware = await get_product("Stainless Steel Cookware Set")

    quotes_data = [
        # RFQ-9021: Cotton T-Shirts / Apparel
        (karachi, tshirt, "RFQ-9021", 2.20, 1000, 20, "30% advance, 70% on shipment", 0, "Includes screen printing setup."),
        (faisalabad, tshirt, "RFQ-9021", 2.05, 1500, 18, "LC at sight", 0, "Fabric sourced in-house, faster lead time."),
        (dhaka, shirt, "RFQ-9021", 4.10, 1000, 22, "50% advance, 50% on shipment", 0, "Bulk discount available above 5000 units."),
        (lahore, jacket, "RFQ-9021", 42.0, 200, 28, "40% advance, 60% before shipment", 12, "Alternate premium option, higher price point."),
        (karachi, twill, "RFQ-9021", 1.60, 3000, 15, "T/T 100% before shipment", 0, "Raw fabric only, no stitching included."),

        # RFQ-8812: Stainless Steel Pipes (ISO)
        (istanbul, steel_pipe, "RFQ-8812", 42.0, 500, 15, "30% advance, LC balance", 12, "304-grade, ISO 9001 certified."),
        (ankara, steel_sheet, "RFQ-8812", 55.0, 300, 18, "50% advance, 50% on delivery", 6, "Custom cut sizes available."),
        (ankara, bracket, "RFQ-8812", 6.5, 1000, 12, "30% advance, 70% on shipment", 3, "CNC precision cut, quick turnaround."),
        (hamburg, enclosure, "RFQ-8812", 28.0, 300, 25, "Net 30 after delivery", 24, "Premium German manufacturing, longer lead time."),
        (bangalore, bracket, "RFQ-8812", 5.8, 1200, 20, "LC at sight", 6, "Lowest price option in this batch."),

        # RFQ-8740: Solar Inverters / Electronics
        (shenzhen, inverter, "RFQ-8740", 380.0, 50, 20, "T/T 100% before shipment", 24, "Includes remote monitoring app license."),
        (shenzhen, panel, "RFQ-8740", 110.0, 100, 22, "30% advance, 70% before shipment", 300, "25-year panel warranty (300 months)."),
        (guangzhou, earbuds, "RFQ-8740", 5.20, 500, 10, "30% advance, 70% before shipment", 6, "Alternate electronics option for comparison."),
        (yiwu, cookware, "RFQ-8740", 16.0, 300, 20, "50% advance, 50% before shipment", 12, "Unrelated category included for comparison test."),
        (dubai, inverter, "RFQ-8740", 410.0, 30, 15, "100% advance", 12, "Trading company, faster delivery via existing stock."),
    ]

    quotes = []
    for vendor, product, rfq_ref, price, moq, delivery, terms, warranty, notes in quotes_data:
        if vendor and product:
            quotes.append(Quote(
                vendor_id=vendor.id,
                product_id=product.id,
                rfq_reference=rfq_ref,
                price=price,
                moq=moq,
                delivery_days=delivery,
                payment_terms=terms,
                warranty_months=warranty,
                notes=notes,
            ))

    db.add_all(quotes)
    await db.commit()
    logger.info(f"✅ Seeded {len(quotes)} quotes.")