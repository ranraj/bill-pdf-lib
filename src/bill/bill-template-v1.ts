import jsPDF from 'jspdf';
import { Company, InvoiceContent, Customer, BillItems, GroupedItems, Bill } from './bill.model';
import font from '../font/font';
import { CurrencyPipe, CurrencyType, getCgstOrSgstAmount } from './currency.service';


export class BillTemplateV1 {
  pageWidth = 0;
  pageHeight = 0;
  fontName = "ITF Rupee";
  lineCursor = pageConfig.margin.top;
  currencyPipe = new CurrencyPipe();
  
  constructor(private doc: jsPDF) {
    this.pageWidth = doc.internal.pageSize.getWidth();
    this.pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  }
  //Main section drawer
  initialDraw(){
    this.drawTitle();
    this.addFont();   
  }
  drawCompanyAndCustomerDetails(company?: Company, customer?: Company){
    this.drawCompanyDetails(company)        
    this.drawCustomerDetails(customer)        
    this.drawCompanyAndCustomerSeperationLine();    
  }
  drawInvoiceBasicDetails(props: Bill) {
    let currentLine = this.increaseLineCursor(2);
    this.doc.text('Invoice No.: ', invoicePanel.invoice, currentLine);
    this.doc.text('e-Way Bill No.: ', invoicePanel.eway, currentLine);
    this.doc.text('Dated: ', invoicePanel.date, currentLine);
    currentLine = this.increaseLineCursor()
    this.textBold(`${props.invoice?.num}`, invoicePanel.invoice, currentLine);
    this.textBold(`${props.invoice?.invEwayBillNo}`, invoicePanel.eway, currentLine);
    this.textBold(`${props.invoice?.invGenDate}`, invoicePanel.date, currentLine);
  }
  drawProductItemsPanel(billContent: InvoiceContent){
      // Product Items Table
      let prodcutItemStartPoint = this.drawOrderItemsTableHeader();        
      this.drawOrderItemsTableContent(billContent.billItems,billContent.currencyType);            
      let prodcutItemEndPoint = this.drawTaxInformation(billContent);        
      this.drawProductItemsTableVerticalLines(prodcutItemStartPoint,prodcutItemEndPoint);    
      this.drawAmountChargeableInWords(billContent);
  }
  drawHsnTable(footerStartLine: number, billContent: InvoiceContent){
    let hsnTableStartPoint = this.getLineCursor();
    let cgstStartLine = hsnTableStartPoint+ pageConfig.lineHeight;
    let hsnEndpoint = footerStartLine - (pageConfig.lineHeight * 2);
    this.drawHsnTableHeader(billContent,hsnTableStartPoint);    
    this.drawHsnTableBody(billContent);
    
    // Declaration    
    this.setLineCursor(footerStartLine);    
    this.drawLineCurrentCursor();
        
    // //HSN table outline        
    this.drawHsnTableOutline(hsnEndpoint,hsnTableStartPoint);
    // //HSN Table CGST horizontal line
    this.drawHsnTableCgstVerticalLines(cgstStartLine,hsnEndpoint);                       
  }
  drawDeclarationPanleContent(footerStartLine: number, companyDisplayName?: string) {
    let footerLines = Array.from(Array(4).keys()).map(v => footerStartLine + ( (v+1) * pageConfig.lineHeight));    
    if(companyDisplayName == undefined) {return;}
    this.doc.setFontSize(10);
    let footerLine1 = footerLines[0];
    let footerLine2 = footerLines[1];
    let footerLine3 = footerLines[2];
    let footerLine4 = footerLines[3];
    this.doc.text('Declaration:', pageConfig.margin.left + pageConfig.padding, footerLine1);
    this.doc.line(pageConfig.margin.left + pageConfig.padding, footerLine1 + pageConfig.padding, pageConfig.margin.left + 20, footerLine1 + pageConfig.padding)
    this.doc.text('We declare that this invoice shows the actual price of the', pageConfig.margin.left + pageConfig.padding, footerLine2);
    this.doc.text('goods described and that all particulars are true and correct.', pageConfig.margin.left + pageConfig.padding, footerLine3);

    this.textBold(`for ${companyDisplayName}`, edgePosition.right - pageConfig.padding, footerLine1, 'right');
    this.doc.text('Authorised Signatory', edgePosition.right - pageConfig.padding, footerLine4, { align: 'right' });
    this.setLineCursor(footerLine4);
  }

  drawFooterBottom(footerStartLine: number){
    this.drawMargins(footerStartLine);
    this.drawComputerGeneratedInfor();
  }
  // Sub sections drawer
  private drawTitle() {
    // Set title
    this.doc.setFontSize(18);
    this.doc.setTextColor(40, 40, 40);
    this.doc.text('Tax Invoice', 105, 20, { align: 'center' });
  }
  private addFont() {
    this.doc.addFileToVFS('ITF Rupee-normal.ttf', font);
    this.doc.addFont('ITF Rupee-normal.ttf', 'ITF Rupee', 'normal');
    this.doc.setFont(this.fontName);
    this.doc.setFontSize(12);
  }
  private drawCompanyDetails(company?: Company) {
    if (company == undefined) {
      return;
    }
    this.doc.setFontSize(10);
    this.textBold(company?.name ?? 'Your Company Name', pageConfig.margin.left + pageConfig.padding, this.increaseLineCursor());    
    this.doc.setTextColor(0, 0, 0);
    let companyAddress = [    
    'Email :  ' + company.email,  
    company?.addressFirstLine ?? 'Address firstline',
    company?.addressSecondLine ?? 'Address secondline',
    company?.city ?? '',
    'GSTIN/UIN: ' + company?.gstNo,
    'State Name:' + company?.state + `, Code: ${company.stateCode}`,
    `Postal code: ${company?.postalCode}`,
    ];
    companyAddress.forEach((line, index) => this.doc.text(line, pageConfig.margin.left + pageConfig.padding, this.increaseLineCursor()));
    this.drawLineCurrentCursor();
  }
  private drawCompanyAndCustomerSeperationLine() {
    this.doc.line(edgePosition.mid, this.withPadding(pageConfig.margin.top), edgePosition.mid, this.withPaddingTimes(this.getLineCursor(),4));
  }
  private drawCustomerDetails(customer?: Customer) {
    if (customer == undefined) {
      return;
    }
    this.setLineCursor(pageConfig.margin.top);
    this.doc.setFontSize(10);
    this.doc.setTextColor(billTemplateColors.brightBlue);
    this.doc.text('Buyer (Bill to)', pageConfig.margin.left + 100 + pageConfig.padding, this.increaseLineCursor());
    this.doc.setTextColor(0, 0, 0);
    this.textBold(customer?.name ?? 'Customer name', pageConfig.margin.left + 100 + pageConfig.padding, this.increaseLineCursor())
    let customerAddress = [            
      customer?.addressFirstLine ?? 'Address firstline',
      customer?.addressSecondLine ?? 'Address secondline',
      customer?.city ?? '',
      'GSTIN/UIN: ' + customer?.gstNo ?? '',
      `State Name: ${customer?.state} , Code: ${customer?.stateCode}`,
      `Postal code: ${customer?.postalCode}`
    ];
    customerAddress.forEach((line, index) => this.doc.text(line, pageConfig.margin.left + 100 + pageConfig.padding, this.increaseLineCursor()));
    
  }

  
  private drawOrderItemsTableHeader(): number {
    this.increaseLineCursorAndDrawLine(2);
    let tableHeaders = [
    { name: "Sl.No", position: productItemsTableColumnPosition.sno },
    { name: "Products", position: productItemsTableColumnPosition.product },
    { name: "HSN/SAC", position: productItemsTableColumnPosition.hsn },
    { name: "Rate", position: productItemsTableColumnPosition.rate },
    { name: "Quantity", position: productItemsTableColumnPosition.quantity },
    { name: "Tax", position: productItemsTableColumnPosition.tax },
    { name: "Amount", position: productItemsTableColumnPosition.amount }]
    this.doc.setFillColor(billTemplateColors.brightBlue);
    this.doc.rect(pageConfig.margin.left, this.getLineCursor(), pageConfig.margin.left + 180, pageConfig.lineHeight + 2, "F");
    this.increaseLineCursor(1);
    tableHeaders.forEach(header => this.doc.text(header.name, this.withPadding(header.position), this.getLineCursor()));
    this.drawLineCurrentCursor();
    return this.getLineCursor();
  }

  private drawOrderItemsTableContent(orderItems: BillItems[], currencyType: CurrencyType) {
    let currentLine = this.increaseLineCursor();
    orderItems.forEach((item, index) => {
      this.textBold((index + 1).toString(), productItemsTableColumnPosition.sno + pageConfig.padding, currentLine);
      this.textBold(item.product?.name ?? '', productItemsTableColumnPosition.product + pageConfig.padding, currentLine);
      this.textBold(item.product?.hsnCode ?? '', productItemsTableColumnPosition.hsn + pageConfig.padding, currentLine);
      this.doc.text(this.currencyPipe.transform(item.unitPrice, currencyType) ?? '', productItemsTableColumnPosition.rate + pageConfig.padding, currentLine);
      this.textBold(item.quantity.toString(), productItemsTableColumnPosition.quantity + pageConfig.padding, currentLine);
      this.doc.text(this.currencyPipe.transform(item.taxValue, currencyType) ?? '', productItemsTableColumnPosition.tax + pageConfig.padding, currentLine);
      this.doc.text(this.currencyPipe.transform(item.total, currencyType) ?? '', productItemsTableColumnPosition.amountContent, currentLine, { align: 'right' });
      //doc.line(margin.left, currentLine + horizontalLineSpace, pageWidth - margin.left, currentLine + horizontalLineSpace);
      currentLine = this.increaseLineCursor();
    });
  }

  private drawTaxInformation(taxInforPanelData: InvoiceContent) {
    let prodcutItemEndPoint = this.getLineCursor();
    if (taxInforPanelData.isGst) {
      if (taxInforPanelData.isIgst) {
        this.drawWithIgstTaxInfo(taxInforPanelData);
        prodcutItemEndPoint = this.getLineCursor();
      } else {
        this.drawWithCgstSgstTaxInfo(taxInforPanelData)

        prodcutItemEndPoint = this.getLineCursor();
      }
    } else {
      this.drawWithoutTaxInfo(taxInforPanelData);
      prodcutItemEndPoint = this.getLineCursor();
    }
    return prodcutItemEndPoint;
  }
  private drawWithIgstTaxInfo(taxInforPanelData: InvoiceContent) {
    this.increaseLineCursor(Math.abs(taxInforPanelData.itemsLength - 10));
    this.doc.line(productItemsTableColumnPosition.hsn, this.getLineCursor(), edgePosition.right, this.getLineCursor())

    this.textBold(`IGST :`, productItemsTableColumnPosition.amountLabel-2, this.increaseLineCursor(), 'center');
    this.doc.text(`${taxInforPanelData.igst}`, productItemsTableColumnPosition.amountContent, this.getLineCursor(), { align: 'right' });
    this.drawLineCurrentCursor();

    this.textBold(`Total :`, productItemsTableColumnPosition.amountLabel, this.increaseLineCursor(), 'right' );
    this.doc.text(`${taxInforPanelData.total}`, productItemsTableColumnPosition.amountContent, this.getLineCursor(), { align: 'right' });
    this.drawLineCurrentCursor();
  }
  private drawWithCgstSgstTaxInfo(taxInforPanelData: InvoiceContent) {
    this.increaseLineCursor(Math.abs(taxInforPanelData.itemsLength - 9));
    this.doc.line(productItemsTableColumnPosition.hsn, this.getLineCursor(), edgePosition.right, this.getLineCursor());

    this.textBold(`CGST : `, productItemsTableColumnPosition.amountLabel, this.increaseLineCursor(), 'right');
    this.doc.text(`${taxInforPanelData.cgst}`, productItemsTableColumnPosition.amountContent, this.getLineCursor(), { align: 'right' });
    this.textBold(`SGST : `, productItemsTableColumnPosition.amountLabel, this.increaseLineCursor(), 'right');
    this.doc.text(`${taxInforPanelData.sgst}`, productItemsTableColumnPosition.amountContent, this.getLineCursor(), { align: 'right' });
    this.drawLineCurrentCursor();

    this.textBold(`Total : `, productItemsTableColumnPosition.amountLabel, this.increaseLineCursor(),'right');
    this.doc.text(`${taxInforPanelData.total}`, productItemsTableColumnPosition.amountContent, this.getLineCursor(), { align: 'right' });
    this.drawLineCurrentCursor();
  }
  private drawWithoutTaxInfo(taxInforPanelData: InvoiceContent) {
    this.increaseLineCursor(Math.abs(taxInforPanelData.itemsLength - 9));
    this.drawLineCurrentCursor();

    this.textBold(`Total : `, productItemsTableColumnPosition.amountLabel, this.increaseLineCursor(), 'right');
    this.doc.text(`${taxInforPanelData.total}`, productItemsTableColumnPosition.amountContent, this.getLineCursor(), { align: 'right' });
    this.drawLineCurrentCursor();
  }
  private drawProductItemsTableVerticalLines(y1: number, y2: number) {
    y1 = this.withPadding(y1);
    y2 = this.withPadding(y2);
    this.doc.line(productItemsTableColumnPosition.product, y1, productItemsTableColumnPosition.product, y2)
    this.doc.line(productItemsTableColumnPosition.hsn, y1, productItemsTableColumnPosition.hsn, y2);
    this.doc.line(productItemsTableColumnPosition.rate, y1, productItemsTableColumnPosition.rate, y2);
    this.doc.line(productItemsTableColumnPosition.quantity, y1, productItemsTableColumnPosition.quantity, y2);
    this.doc.line(productItemsTableColumnPosition.tax, y1, productItemsTableColumnPosition.tax, y2);
    this.doc.line(productItemsTableColumnPosition.amount, y1, productItemsTableColumnPosition.amount, y2);
  }

  private drawAmountChargeableInWords(taxInforPanelData: InvoiceContent) {
    this.doc.text("Amount Chargeable (in words)", pageConfig.margin.left + pageConfig.padding, this.increaseLineCursor(2));
    this.textBold(taxInforPanelData.amountInWords, pageConfig.margin.left + pageConfig.padding, this.increaseLineCursor());
  }
  private drawHsnTableHeader(billContent: InvoiceContent, y: number) {
    y = this.withPadding(y);
    this.doc.line(edgePosition.left, y, edgePosition.right, y);

    //HSN Table header    
    this.doc.text('HSN/SAC', pageConfig.margin.left + pageConfig.padding, this.increaseLineCursor());
    this.doc.text('Taxable', pageConfig.margin.left + hsnTableHeaderPosition.hsn, this.getLineCursor());
    if(billContent.isGst && billContent.isIgst){
      this.doc.text('IGST', pageConfig.margin.left + hsnTableHeaderPosition.cgst, this.getLineCursor());      
    }else{
      this.doc.text('CGST', pageConfig.margin.left + hsnTableHeaderPosition.cgst, this.getLineCursor());
      this.doc.text('SGST/UTGST', pageConfig.margin.left + hsnTableHeaderPosition.sgst, this.getLineCursor());
    }
    this.doc.text('Total', pageConfig.margin.left + hsnTableHeaderPosition.total, this.getLineCursor());
    
    this.doc.line(hsnTablePosition.taxableValue, this.getLineCursor() + 2, edgePosition.right, this.getLineCursor() + 2);

    this.doc.text('Value', pageConfig.margin.left + hsnTableHeaderPosition.hsn, this.increaseLineCursor());
    
    if(billContent.isGst && billContent.isIgst){
      this.doc.text('Rate', pageConfig.margin.left + hsnTableHeaderPosition.rate1, this.getLineCursor());
      this.doc.text('Amount', pageConfig.margin.left + hsnTableHeaderPosition.amount1, this.getLineCursor());
    }else{
      this.doc.text('Rate', pageConfig.margin.left + hsnTableHeaderPosition.rate1, this.getLineCursor());
      this.doc.text('Amount', pageConfig.margin.left + hsnTableHeaderPosition.amount1, this.getLineCursor());
      this.doc.text('Rate', pageConfig.margin.left + hsnTableHeaderPosition.rate2, this.getLineCursor());
      this.doc.text('Amount', pageConfig.margin.left + hsnTableHeaderPosition.amount2, this.getLineCursor());
    }
    
    this.doc.text('Tax Amount', pageConfig.margin.left + hsnTableHeaderPosition.taxAmount, this.getLineCursor());
    this.doc.line(edgePosition.left, this.getLineCursor() + 2, edgePosition.right, this.getLineCursor() + 2);
  }
  private drawHsnTableBody(billContent: InvoiceContent){
    this.drawHsnTableContent(billContent);    
    this.drawHsnTableTotalContent(billContent,billContent.currencyType);    
    this.drawTaxAmountInWordsPanel(billContent.taxAmountInWords)
  }
  private drawHsnTableContent(billContent: InvoiceContent) {
    let hsnGroups = this.groupByHsnCode(billContent.billItems);
    let hsnCount = 0;    
    for (let key in hsnGroups) {
      let orderItems = hsnGroups[key];
      this.doc.text(key, pageConfig.margin.left + pageConfig.padding, this.increaseLineCursor());
      this.doc.text(`${this.currencyPipe.transform(orderItems.taxableAmount, billContent.currencyType)}`, pageConfig.margin.left + hsnTableHeaderPosition.hsn, this.getLineCursor());
      if(billContent.isGst && billContent.isIgst){
        this.doc.text(`${orderItems.taxPercentage}%`, pageConfig.margin.left + hsnTableHeaderPosition.rate1, this.getLineCursor());
        this.doc.text(`${this.currencyPipe.transform(orderItems.totalTaxAmount, billContent.currencyType)}`, pageConfig.margin.left + hsnTableHeaderPosition.amount1, this.getLineCursor());      
      }else{
        this.doc.text(`${orderItems.taxPercentage / 2}%`, pageConfig.margin.left + hsnTableHeaderPosition.rate1, this.getLineCursor());
      this.doc.text(`${this.currencyPipe.transform(getCgstOrSgstAmount(orderItems.totalTaxAmount), billContent.currencyType)}`, pageConfig.margin.left + hsnTableHeaderPosition.amount1, this.getLineCursor());
      this.doc.text(`${orderItems.taxPercentage / 2}%`, pageConfig.margin.left + hsnTableHeaderPosition.rate2, this.getLineCursor());
      this.doc.text(`${this.currencyPipe.transform(getCgstOrSgstAmount(orderItems.totalTaxAmount), billContent.currencyType)}`, pageConfig.margin.left + hsnTableHeaderPosition.amount2, this.getLineCursor());
      }
      
      this.doc.text(`${this.currencyPipe.transform(orderItems.totalTaxAmount, billContent.currencyType)}`, pageConfig.margin.left + hsnTableHeaderPosition.total, this.getLineCursor());
      this.doc.line(edgePosition.left, this.getLineCursor() + 2, edgePosition.right, this.getLineCursor() + 2);
      hsnCount++;
    }
    if (hsnCount == 2) {
      this.increaseLineCursor(1)
    } else {
      this.increaseLineCursor(1)
    }
  }
  private drawHsnTableTotalContent(billContent: InvoiceContent, currencyType: CurrencyType) {
    this.doc.text('Total', hsnTablePosition.hsnSeperater - pageConfig.padding, this.getLineCursor(), { align: 'right' });
    this.doc.text(`${billContent.taxableAmount}`, pageConfig.margin.left + hsnTableHeaderPosition.hsn, this.getLineCursor());
    if(billContent.isGst && billContent.isIgst){
      this.doc.text(`${billContent.igst}`, pageConfig.margin.left + hsnTableHeaderPosition.amount1, this.getLineCursor());      
    }else{
      this.doc.text(`${billContent.cgst}`, pageConfig.margin.left + hsnTableHeaderPosition.amount1, this.getLineCursor());
      this.doc.text(`${billContent.sgst}`, pageConfig.margin.left + hsnTableHeaderPosition.amount2, this.getLineCursor());
    }    
    this.doc.text(`${this.currencyPipe.transform(billContent.taxAmount, currencyType)}`, pageConfig.margin.left + hsnTableHeaderPosition.total, this.getLineCursor());
    this.drawLineCurrentCursor();
  }
  private drawTaxAmountInWordsPanel(taxAmountInWords: string) {
    this.doc.text("Tax Amount (in words)", pageConfig.margin.left + pageConfig.padding, this.increaseLineCursor());
    this.textBold(taxAmountInWords, pageConfig.margin.left + pageConfig.padding, this.increaseLineCursor());
  }
  private drawHsnTableOutline(hsnEndpoint: number, hsnTableStartPoint: number) {    
    this.doc.line(hsnTablePosition.hsnSeperater, this.withPadding(hsnTableStartPoint), hsnTablePosition.hsnSeperater, hsnEndpoint + 1);
    this.doc.line(hsnTablePosition.taxableValue, this.withPadding(hsnTableStartPoint), hsnTablePosition.taxableValue, hsnEndpoint + 1);
    this.doc.line(hsnTablePosition.sgst, this.withPadding(hsnTableStartPoint), hsnTablePosition.sgst, hsnEndpoint + 1);
    this.doc.line(hsnTablePosition.total, this.withPadding(hsnTableStartPoint), hsnTablePosition.total, hsnEndpoint + 1);    
  }
  
  private drawHsnTableCgstVerticalLines(cgstStartLine: number, hsnEndpoint: number) {
    this.doc.line(hsnTableHeaderPosition.cgstSeperater, this.withPadding(cgstStartLine), hsnTableHeaderPosition.cgstSeperater, hsnEndpoint + 1);
    this.doc.line(hsnTableHeaderPosition.sgstSeperater, this.withPadding(cgstStartLine), hsnTableHeaderPosition.sgstSeperater, hsnEndpoint + 1);
  }
  private drawMargins(footerStartLine: number) {
    //Top margin
    let y = pageConfig.margin.top + pageConfig.horizontalLineSpace;
    this.doc.line(pageConfig.margin.left, y, this.pageWidth - pageConfig.margin.left, y);
    //Footer table midpoint - Vertical line
    let footerEndPoint = this.withPadding(this.getLineCursor());
    this.doc.line(edgePosition.mid, footerStartLine + 2, edgePosition.mid, footerEndPoint);
    // Left margin
    this.doc.line(edgePosition.left, pageConfig.margin.top + 2, edgePosition.left, footerEndPoint);
    //Right margin
    this.doc.line(edgePosition.right, pageConfig.margin.top + 2, edgePosition.right, footerEndPoint);
    //Draw bottom margin
    this.drawLineCurrentCursor();
  }
  private drawComputerGeneratedInfor() {
    this.doc.text('This is a Computer Generated Invoice', 80, this.increaseLineCursor());
  }

  // Utility methods
  private withPadding(position: number) {
    return position + pageConfig.padding;
  }
  private withPaddingTimes(position: number, times: number) {
    return position + (times * pageConfig.padding);
  }
  private textBold(text: string, x: number, y: number, align: any = "left") {
    //this.doc.setFont(this.fontName,'bold');
    this.doc.text(text, x, y, { align: align });
    //this.doc.setFont(this.fontName, 'normal');
  }
  private increaseLineCursor(lineNo: number = 1) {
    return this.lineCursor = this.lineCursor + (pageConfig.lineHeight * lineNo);
  }
  private getLineCursor() {
    return this.lineCursor;
  }
  private drawLineCurrentCursor() {
    this.doc.line(pageConfig.margin.left, this.getLineCursor() + pageConfig.horizontalLineSpace, this.pageWidth - pageConfig.margin.left, this.getLineCursor() + pageConfig.horizontalLineSpace);
  }
  private increaseLineCursorAndDrawLine(times: number) {
    this.increaseLineCursor(times);
    this.drawLineCurrentCursor();
  }
  private setLineCursor(lineNumber: number) {
    this.lineCursor = lineNumber;
  }
  private groupByHsnCode(orderItems: BillItems[]): { [key: string]: GroupedItems } {
    return orderItems.reduce((acc, item) => {
      if (item.product?.hsnCode != undefined) {
        if (!acc[item.product?.hsnCode]) {
          acc[item.product.hsnCode] = { items: [], totalTaxAmount: 0, taxPercentage: item.product?.taxPercentage ?? 0, taxableAmount: 0 };
        }
        acc[item.product?.hsnCode].items.push(item);
        acc[item.product?.hsnCode].totalTaxAmount += item.taxValue ?? 0;
        acc[item.product?.hsnCode].taxableAmount += item.quantity * item.unitPrice ?? 0;
      }
      return acc;
    }, {} as { [key: string]: GroupedItems });
  }
  preProcess(bill:Bill): Bill {
    let invContent = bill.invoice.invContent;
    invContent.cgst= this.currencyPipe.transform(invContent.cgst,invContent.currencyType);
    invContent.sgst= this.currencyPipe.transform(invContent.sgst,invContent.currencyType);
    invContent.igst= this.currencyPipe.transform(invContent.igst,invContent.currencyType);
    invContent.total= this.currencyPipe.transform(invContent.total,invContent.currencyType);
    invContent.taxableAmount= this.currencyPipe.transform(invContent.taxableAmount,invContent.currencyType);
        
    //bill.invoice.invContent = transformedBillContent;
    return bill;
  }
}

export const billTemplateColors = {
  navyBlue: "#1A1A60",
  darkGray: "#4A4A4A",
  white: "#FFFFFF",
  lightGray: "#D3D3D3",
  brightBlue: "#007BFF",
  teal: "#008080",
}

export const pageConfig = {
  margin: { top: 30, left: 10 },
  lineHeight: 6,
  horizontalLineSpace: 2,
  padding: 2,
}
const invoicePanel = {
  invoice: 12,
  eway: 40,
  date: 90
}
const productItemsTableColumnPosition = {
  sno: pageConfig.margin.left,
  product: pageConfig.margin.left + 10,
  hsn: pageConfig.margin.left + 65,
  rate: pageConfig.margin.left + 85,
  quantity: pageConfig.margin.left + 110,
  tax: pageConfig.margin.left + 130,
  amount: pageConfig.margin.left + 160,
  amountContent: pageConfig.margin.left + 190 - pageConfig.padding,
  amountLabel: pageConfig.margin.left + 80,
};

export const edgePosition = {
  left: 10,
  mid: 110,
  right: 200,
}
const hsnTablePosition = {
  start: pageConfig.margin.left,
  hsnSeperater: pageConfig.margin.left + 60,
  taxableValue: pageConfig.margin.left + 85,
  cgst: pageConfig.margin.left + 110,
  sgst: pageConfig.margin.left + 120,
  total: pageConfig.margin.left + 160,
}

const hsnTableHeaderPosition = {
  start: pageConfig.margin.left + 40,
  hsn: pageConfig.margin.left + 55,
  taxableValue: pageConfig.margin.left + 90,
  cgst: pageConfig.margin.left + 90,
  cgstSeperater: pageConfig.margin.left + 100,
  rate1: pageConfig.margin.left + 80,
  amount1: pageConfig.margin.left + 95,
  rate2: pageConfig.margin.left + 115,
  amount2: pageConfig.margin.left + 135,
  sgst: pageConfig.margin.left + 120,
  sgstSeperater: pageConfig.margin.left + 140,
  total: pageConfig.margin.left + 160,
  taxAmount: pageConfig.margin.left + 155
}