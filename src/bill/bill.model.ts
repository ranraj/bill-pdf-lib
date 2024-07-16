import { CurrencyType, GSTType } from "./currency.service";

export interface Company {
    name?: string;
    email?: string;
    phoneNumber?: string;
    addressFirstLine?: string;
    addressSecondLine?: string;
    city?: string;
    gstNo?: string;
    state?: string;
    stateCode?: string;
    postalCode? : string;  
    gstType?: GSTType;
}
export interface Customer {
  name?: string;
  email?: string;
  phoneNumber?: string;
  addressFirstLine?: string;
  addressSecondLine?: string;
  city?: string;
  gstNo?: string;
  state?: string;
  stateCode?: string;
  postalCode?: string;  
}
export interface BillItems{
  id?: string;    
  orderId?: string;
  product?: {
    name?: string;
    hsnCode?: string;
    taxPercentage?: number;
  }; 
  unitPrice : number;
  quantity : number;
  total? : number;
  taxValue?: number; 
}
export interface InvoiceContent{
    cgst: string | null;
    sgst: string | null;
    igst: string | null;
    isIgst: boolean;
    total: string | null;
    taxableAmount: string | null;
    amountInWords: string;
    itemsLength: number;
    isGst: boolean;
    taxAmount: number;
    taxAmountInWords: string;
    billItems: BillItems[],
    currencyType: CurrencyType;
}
export interface Bill{
  invoice: {
    invEwayBillNo?: string;
    label?: string;
    num?: number;
    invDate?: string;
    invGenDate?: string;
    invContent: InvoiceContent, 
  },   
   outputType: {
    Save: string;
    DataUriString: string;
    DataUri: string;
    DataUrlNewWindow: string;
    Blob: string;
    ArrayBuffer: string;
  } | string;
  returnJsPDFDocObject?: boolean;
  fileName: string;
  company: Company,
  customer: Customer,  
}
export interface GroupedItems {
  items: BillItems[];
  taxableAmount: number;
  totalTaxAmount: number;
  taxPercentage: number;
}