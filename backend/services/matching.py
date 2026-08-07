def calculate_match_score(vendor) -> float:
    # Quality/Reviews (40%)
    rating_score = (vendor.rating / 5) * 40 if vendor.rating else 0

    # Verification (20%)
    verified_score = 20 if vendor.is_verified else 0

    # Certification (20%)
    certification_score = 20 if vendor.certification else 0

    # Delivery Speed (20%) — faster response = higher score
    if vendor.response_time_hours is None:
        response_score = 0
    elif vendor.response_time_hours <= 4:
        response_score = 20
    elif vendor.response_time_hours <= 8:
        response_score = 15
    elif vendor.response_time_hours <= 12:
        response_score = 10
    else:
        response_score = 5

    total = rating_score + verified_score + certification_score + response_score
    return round(min(total, 100), 1)