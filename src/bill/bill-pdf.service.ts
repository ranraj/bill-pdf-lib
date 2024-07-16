import jsPDF from 'jspdf';
import { BillTemplateV1} from './bill-template-v1';
import { Company, Bill } from './bill.model';
import { CurrencyPipe, DatePipe, GSTType } from './currency.service';
import { ToWords } from 'to-words';
import path from 'path';

const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      // can be used to override defaults for the selected locale
      name: 'Rupee',
      plural: 'Rupees',
      symbol: '₹',
      fractionalUnit: {
        name: 'Paisa',
        plural: 'Paise',
        symbol: '',
      },
    },
  },
});

export class BillPdfService {  
  private datePipe = new DatePipe();
  private currencyPipe = new CurrencyPipe();
  private billHelper : BillTemplateV1;
  
  constructor() {       
    this.billHelper = new BillTemplateV1(new jsPDF());  
  }
  
  formatDate(date: Date) {
    return this.datePipe.transform(date, 'dd-MM-yyyy');
  }

  //Verification functions
  isGst(isGst: boolean = true) {
    return isGst;
  }
  isCgstSgst(company: Company) {
    if (company === undefined) { return false; }
    return company.gstType === GSTType.CGST_SGST;
  }
  isIgst(isGst: boolean = false) {
    return isGst;
  }

   

  jsPdfInvoiceV1(props: Bill) {
        
    // Tax Information    
    let billContent = props.invoice.invContent;
    // Section 0 # Add font and Draw title
    const doc = new jsPDF('p', 'mm', 'a4');
    let v1Template = new BillTemplateV1(doc);                         
    v1Template.initialDraw();
    //Section 1 # Customer & Company
    v1Template.drawCompanyAndCustomerDetails(props.company,props.customer);
    //Section 2 # Invoice basic details
    v1Template.drawInvoiceBasicDetails(props);
    //Section 3 # Product details
    v1Template.drawProductItemsPanel(billContent);
    //Section 4 # Draw HSN table    
    let footerStartLine = v1Template.pageHeight - 50;    
    v1Template.drawHsnTable(footerStartLine,billContent);    
    //Section 5 # Draw company & declaration    
    v1Template.drawDeclarationPanleContent(footerStartLine,props.company?.name)                    
    //Section 6 # Draw footer info and margins
    v1Template.drawFooterBottom(footerStartLine);
    // Save the PDF
    const pdfPath = path.join(__dirname, props.fileName);
    doc.save(pdfPath);
    return pdfPath;
  }
  toWords() {
    return toWords;
  }
}

