def calculate_match_breakdown(vendor) -> dict:
    rating_score = round((vendor.rating / 5) * 40, 1) if vendor.rating else 0.0
    verified_score = 20.0 if vendor.is_verified else 0.0
    certification_score = 20.0 if vendor.certification else 0.0

    if vendor.response_time_hours is None:
        response_score = 0.0
    elif vendor.response_time_hours <= 4:
        response_score = 20.0
    elif vendor.response_time_hours <= 8:
        response_score = 15.0
    elif vendor.response_time_hours <= 12:
        response_score = 10.0
    else:
        response_score = 5.0

    total = round(min(rating_score + verified_score + certification_score + response_score, 100), 1)

    return {
        "total": total,
        "quality_score": rating_score,
        "verification_score": verified_score,
        "certification_score": certification_score,
        "delivery_speed_score": response_score,
    }


def calculate_match_score(vendor) -> float:
    return calculate_match_breakdown(vendor)["total"]
