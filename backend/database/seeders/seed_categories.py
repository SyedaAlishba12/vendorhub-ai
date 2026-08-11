import logging
from sqlalchemy import select
from models.category import ProductCategory, CertificationType

logger = logging.getLogger("Seeder")


async def seed_categories(db):
    result = await db.execute(select(ProductCategory))
    if result.scalars().first():
        logger.info("Categories already seeded, skipping.")
        return

    parents = {}
    parent_names = ["Apparel", "Metal & Steel", "Electronics", "Renewable Energy", "Furniture", "Food & Agriculture"]
    for name in parent_names:
        cat = ProductCategory(name=name)
        db.add(cat)
        parents[name] = cat
    await db.flush()

    sub_categories = [
        ("T-Shirts & Polos", "Apparel"),
        ("Formal Wear", "Apparel"),
        ("Denim", "Apparel"),
        ("Pipes & Sheets", "Metal & Steel"),
        ("Fabricated Parts", "Metal & Steel"),
        ("Solar Inverters", "Renewable Energy"),
        ("Solar Panels", "Renewable Energy"),
        ("Wearables & Audio", "Electronics"),
        ("Chargers & Accessories", "Electronics"),
        ("Outdoor Furniture", "Furniture"),
        ("Spices", "Food & Agriculture"),
    ]
    for name, parent_name in sub_categories:
        db.add(ProductCategory(name=name, parent_id=parents[parent_name].id))

    cert_types = [
        ("ISO 9001", "Quality management systems"),
        ("ISO 14001", "Environmental management systems"),
        ("OEKO-TEX", "Textile safety certification"),
        ("CE", "European conformity marking"),
        ("RoHS", "Restriction of hazardous substances"),
        ("FSSAI", "Indian food safety certification"),
        ("BSCI", "Business social compliance"),
        ("FSC Certified", "Forest Stewardship Council"),
    ]
    for name, desc in cert_types:
        db.add(CertificationType(name=name, description=desc))

    await db.commit()
    logger.info(f"✅ Seeded {len(parent_names) + len(sub_categories)} categories and {len(cert_types)} certification types.")