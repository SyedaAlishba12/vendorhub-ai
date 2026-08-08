import uuid
from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from fastapi.responses import HTMLResponse

from models.Review import ReviewDB
from models.ReviewReport import ReviewReportDB
from models.Order import Order

class AdminReviewController:

    @staticmethod
    async def get_reported_reviews(db: AsyncSession):
        stmt = (
            select(ReviewReportDB)
            .options(selectinload(ReviewReportDB.review))
            .where(ReviewReportDB.status == "PENDING")
        )
        result = await db.execute(stmt)
        reports = result.scalars().all()
        return reports

    @staticmethod
    async def moderate_review(db: AsyncSession, review_id: str, action: str, admin_notes: str = ""):
        action_upper = action.upper()
    
        # 1. Fetch Review safely with String ID matching
        stmt = select(ReviewDB).where(ReviewDB.id == str(review_id))
        result = await db.execute(stmt)
        review = result.scalar_one_or_none()

        # Fallback check if ID format mismatch exists
        if not review:
            stmt_all = select(ReviewDB)
            res_all = await db.execute(stmt_all)
            all_reviews = res_all.scalars().all()
            review = next((r for r in all_reviews if str(r.id) == str(review_id)), None)

        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        # 2. Fetch associated reports for this review
        report_stmt = select(ReviewReportDB).where(ReviewReportDB.review_id == str(review_id))
        report_res = await db.execute(report_stmt)
        reports = report_res.scalars().all()

        # 3. Handle Actions (APPROVE or REMOVE/REJECT)
        if action_upper in ["APPROVE", "RESOLVED_APPROVED"]:
            review.is_reported = False
            for rep in reports:
                rep.status = "RESOLVED_APPROVED"
                if hasattr(rep, 'admin_notes'):
                    rep.admin_notes = admin_notes

        elif action_upper in ["REMOVE", "REJECT", "RESOLVED_REJECTED"]:
            review.is_reported = False
            review.status = "REMOVED"
            for rep in reports:
                rep.status = "RESOLVED_REJECTED"
                if hasattr(rep, 'admin_notes'):
                    rep.admin_notes = admin_notes

        await db.commit()
        return {"message": f"Review {action.lower()}d successfully", "review_id": review_id}

    @staticmethod
    async def get_moderation_history(db: AsyncSession):
        stmt = (
            select(ReviewReportDB)
            .where(ReviewReportDB.status != "PENDING")
            .order_by(ReviewReportDB.created_at.desc())
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_order_reports(db: AsyncSession):
        stmt = select(Order)
        result = await db.execute(stmt)
        orders = result.scalars().all()
        
        total_orders = len(orders)
        cancelled = len([o for o in orders if getattr(o, 'status', '') == 'CANCELLED'])
        disputed = len([o for o in orders if getattr(o, 'has_dispute', False) or getattr(o, 'status', '') == 'CANCELLED'])

        return {
            "total_orders": total_orders,
            "cancelled_orders": cancelled,
            "disputed_orders": disputed,
            "orders": orders[:20]
        }

    @staticmethod
    async def get_disputes(db: AsyncSession):
        stmt = select(Order)
        result = await db.execute(stmt)
        orders = result.scalars().all()

        formatted_disputes = []
        for order in orders:
            is_disputed = getattr(order, 'has_dispute', False)
            status = getattr(order, 'status', '')
            
            # Show orders that are either flagged as dispute OR cancelled
            if is_disputed or status == "CANCELLED":
                formatted_disputes.append({
                    "id": str(getattr(order, 'id', '')),
                    "order_id": str(getattr(order, 'id', '')),
                    "buyer_id": str(getattr(order, 'buyer_id', 'BUY-USER')),
                    "reason": (
                        getattr(order, 'dispute_reason', None) or 
                        getattr(order, 'cancellation_reason', None) or 
                        getattr(order, 'notes', None) or 
                        "Cancellation / Dispute claim filed."
                    ),
                    "dispute_status": "OPEN_DISPUTE" if is_disputed else "CANCELLED_CLAIM",
                    "status": status or "CANCELLED"
                })
        return formatted_disputes

    @staticmethod
    async def export_pdf_report(db: AsyncSession):
        orders_stmt = select(Order)
        orders_res = await db.execute(orders_stmt)
        orders = orders_res.scalars().all()

        reports_stmt = select(ReviewReportDB)
        reports_res = await db.execute(reports_stmt)
        reports = reports_res.scalars().all()

        html_content = f"""
        <html>
            <head>
                <title>VendorHub_AI_Platform_Report_{datetime.now().strftime('%Y%m%d')}</title>
                <style>
                    body {{ font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }}
                    h1 {{ color: #4F46E5; margin-bottom: 5px; }}
                    .date {{ color: #64748b; font-size: 14px; margin-bottom: 25px; }}
                    .stats {{ background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px; }}
                    table {{ width: 100%; border-collapse: collapse; margin-top: 15px; }}
                    th, td {{ border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 14px; }}
                    th {{ background-color: #f1f5f9; font-weight: bold; }}
                    @media print {{
                        body {{ padding: 0; }}
                    }}
                </style>
            </head>
            <body>
                <h1>VendorHub AI Platform Report</h1>
                <div class="date">Generated On: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</div>
                
                <div class="stats">
                    <h3>Summary Statistics</h3>
                    <p><strong>Total System Orders:</strong> {len(orders)}</p>
                    <p><strong>Disputed Orders:</strong> {len([o for o in orders if getattr(o, 'has_dispute', False)])}</p>
                    <p><strong>Total Review Reports:</strong> {len(reports)}</p>
                </div>

                <h2>Moderation Audit Logs</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Report ID</th>
                            <th>Review ID</th>
                            <th>Reported By</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {"".join([f"<tr><td>{r.id}</td><td>{r.review_id}</td><td>{r.reported_by}</td><td>{r.status}</td></tr>" for r in reports])}
                    </tbody>
                </table>

                <script>
                    window.onload = function() {{
                        window.print();
                    }}
                </script>
            </body>
        </html>
        """
        return HTMLResponse(content=html_content, status_code=200)