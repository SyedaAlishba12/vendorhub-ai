from sqlalchemy.orm import Session

from models.Product import Product


class AIRecommendationService:

    @staticmethod
    def get_recommendations(db: Session):

        products = db.query(Product).all()

        recommendations = []

        for product in products:

            score = 0.0

            # -------------------------
            # Rating score
            # -------------------------
            rating = getattr(product, "rating", None)

            if rating is not None:
                score += float(rating) * 20

            # -------------------------
            # Sales score
            # -------------------------
            sales_count = getattr(product, "sales_count", None)

            if sales_count is not None:
                score += float(sales_count)

            # -------------------------
            # Price score
            # Cheaper products get
            # a small recommendation boost
            # -------------------------
            if product.price is not None:
                price = float(product.price)

                score += max(
                    0,
                    1000 - price
                ) / 50

            # -------------------------
            # Recommendation object
            # -------------------------
            recommendations.append(
                {
                    "product_id": product.id,
                    "product_name": product.name,
                    "category": product.category or "General",
                    "price": float(product.price),
                    "score": round(score, 2),
                }
            )

        # -------------------------
        # Highest score first
        # -------------------------
        recommendations.sort(
            key=lambda item: item["score"],
            reverse=True,
        )

        # Return top 10
        return recommendations[:10]