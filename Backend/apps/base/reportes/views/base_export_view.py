from rest_framework.views import APIView
from rest_framework.renderers import StaticHTMLRenderer

from apps.base.reportes.constantes import REPORT_FORMAT_CSV, REPORT_FORMAT_EXCEL, REPORT_FORMAT_PDF


class BaseExportView(APIView):
    renderer_classes = [StaticHTMLRenderer]

    def get_exporter(self, report_format):
        if report_format == REPORT_FORMAT_CSV:
            from apps.base.reportes.exports.csv import CsvExporter
            return CsvExporter()
        elif report_format == REPORT_FORMAT_EXCEL:
            try:
                from apps.base.reportes.exports.exel import ExcelExporter
                return ExcelExporter()
            except ImportError:
                raise ValueError("El exportador Excel requiere 'openpyxl', que no está instalado.")
        elif report_format == REPORT_FORMAT_PDF:
            from apps.base.reportes.exports.pdf import PdfExporter
            return PdfExporter()
        else:
            raise ValueError(f"Formato no soportado: {report_format}")