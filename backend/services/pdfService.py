import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class PDFService:
    @staticmethod
    def generate_pdf(title: str, content: list) -> bytes:
        """
        Generic helper to construct a PDF document in memory and return binary bytes.
        Used by team members for RFQs, Comparison Reports, and Risk Reports.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        story = []

        # Header
        title_style = ParagraphStyle(
            'HeaderTitle',
            parent=styles['Heading1'],
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#1E293B"),
            spaceAfter=12
        )
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 12))

        # Dynamic Content
        for item in content:
            if isinstance(item, str):
                story.append(Paragraph(item, styles['Normal']))
                story.append(Spacer(1, 8))
            else:
                story.append(item)
                story.append(Spacer(1, 8))

        doc.build(story)
        pdf_value = buffer.getvalue()
        buffer.close()
        return pdf_value

    @staticmethod
    def generate_invoice_pdf(invoice_data: dict) -> bytes:
        """
        Standardized PDF Generator for Order Invoices (Module 12 - Zainab).
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        story = []

        # Invoice Title
        story.append(Paragraph("<b>VENDORHUB AI - OFFICIAL INVOICE</b>", styles['Heading1']))
        story.append(Spacer(1, 10))

        # Meta Info
        invoice_number = invoice_data.get("invoice_number", "N/A")
        order_id = invoice_data.get("order_id", "N/A")
        date = invoice_data.get("date", "N/A")
        
        meta_info = f"<b>Invoice Number:</b> {invoice_number}<br/><b>Order ID:</b> {order_id}<br/><b>Date:</b> {date}"
        story.append(Paragraph(meta_info, styles['Normal']))
        story.append(Spacer(1, 15))

        # Table Setup
        items = invoice_data.get("items", [])
        table_data = [["Item Description", "Qty", "Unit Price", "Total"]]
        
        for item in items:
            table_data.append([
                item.get("description", "Product Item"),
                str(item.get("quantity", 1)),
                f"${item.get('unit_price', 0):.2f}",
                f"${item.get('total', 0):.2f}"
            ])

        total_amount = invoice_data.get("total_amount", 0.0)
        table_data.append(["", "", "Grand Total:", f"${total_amount:.2f}"])

        # Table Styling
        pdf_table = Table(table_data, colWidths=[240, 60, 100, 100])
        pdf_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ]))

        story.append(pdf_table)
        doc.build(story)
        
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes