import { Bill } from "./bill/bill.model";
import { BillPdfService } from './bill/bill-pdf.service';

const billPdfService = new BillPdfService();

export const generatePdf = (bill: Bill) => {
    return billPdfService.jsPdfInvoiceV1(bill);
};
  