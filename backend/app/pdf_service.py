"""PDF generation service for analysis reports."""
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib import colors
from io import BytesIO
from typing import Dict, Any
from datetime import datetime


class PDFExportService:
    """Generate PDF reports for repository analysis."""

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._add_custom_styles()

    def _add_custom_styles(self):
        """Add custom paragraph styles."""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#0ea5e9'),
            spaceAfter=30,
            alignment=1  # center
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e293b'),
            spaceAfter=12,
            spaceBefore=12
        ))

    def generate_analysis_pdf(self, analysis_data: Dict[str, Any], repo_name: str) -> bytes:
        """Generate PDF from analysis data."""
        pdf_buffer = BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
        elements = []

        # Title
        elements.append(Paragraph("GitHub Repository Analysis Report", self.styles['CustomTitle']))
        elements.append(Spacer(1, 0.3 * inch))

        # Repository Info
        repo = analysis_data.get('repository', {})
        elements.append(Paragraph("Repository Information", self.styles['CustomHeading']))
        
        repo_table_data = [
            ['Repository Name', repo.get('name', 'N/A')],
            ['Owner', repo.get('owner', 'N/A')],
            ['URL', repo.get('url', 'N/A')],
            ['Description', repo.get('description', 'N/A')],
            ['Language', repo.get('language', 'N/A')],
            ['Created At', repo.get('createdAt', 'N/A')],
        ]
        
        repo_table = Table(repo_table_data, colWidths=[2*inch, 4*inch])
        repo_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        elements.append(repo_table)
        elements.append(Spacer(1, 0.2 * inch))

        # Statistics
        elements.append(Paragraph("Repository Statistics", self.styles['CustomHeading']))
        
        stats_data = [
            ['Metric', 'Value'],
            ['Stars', str(repo.get('stars', 0))],
            ['Forks', str(repo.get('forks', 0))],
            ['Open Issues', str(repo.get('openIssues', 0))],
            ['Total Commits', str(analysis_data.get('commits', {}).get('total', 0))],
            ['Contributors', str(analysis_data.get('contributors', {}).get('total', 0))],
        ]
        
        stats_table = Table(stats_data, colWidths=[2*inch, 2*inch])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0ea5e9')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        elements.append(stats_table)
        elements.append(Spacer(1, 0.2 * inch))

        # Languages
        languages = analysis_data.get('languages', {})
        if languages:
            elements.append(Paragraph("Language Distribution", self.styles['CustomHeading']))
            lang_data = [['Language', 'Bytes']]
            for lang, bytes_count in languages.items():
                lang_data.append([lang, f"{bytes_count:,}"])
            
            lang_table = Table(lang_data, colWidths=[2*inch, 2*inch])
            lang_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            elements.append(lang_table)
            elements.append(Spacer(1, 0.2 * inch))

        # Top Contributors
        contributors = analysis_data.get('contributors', {}).get('topContributors', [])
        if contributors:
            elements.append(Paragraph("Top Contributors", self.styles['CustomHeading']))
            contrib_data = [['Contributor', 'Contributions']]
            for contrib in contributors[:10]:
                contrib_data.append([contrib.get('login', 'N/A'), str(contrib.get('contributions', 0))])
            
            contrib_table = Table(contrib_data, colWidths=[2*inch, 2*inch])
            contrib_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f59e0b')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            elements.append(contrib_table)
            elements.append(Spacer(1, 0.2 * inch))

        # AI Insights
        ai_insights = analysis_data.get('ai_insights', {})
        if ai_insights.get('summary'):
            elements.append(PageBreak())
            elements.append(Paragraph("AI-Generated Summary", self.styles['CustomHeading']))
            elements.append(Paragraph(ai_insights['summary'], self.styles['Normal']))
            elements.append(Spacer(1, 0.2 * inch))

        if ai_insights.get('onboarding_guide'):
            elements.append(Paragraph("Onboarding Guide", self.styles['CustomHeading']))
            elements.append(Paragraph(ai_insights['onboarding_guide'], self.styles['Normal']))

        # Footer
        elements.append(Spacer(1, 0.3 * inch))
        footer_text = f"Report generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        elements.append(Paragraph(footer_text, self.styles['Normal']))

        # Build PDF
        doc.build(elements)
        pdf_buffer.seek(0)
        return pdf_buffer.getvalue()


# Global instance
pdf_export_service = PDFExportService()
