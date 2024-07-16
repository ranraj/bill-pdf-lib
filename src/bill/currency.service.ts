import { format } from 'date-fns';

export enum CurrencyType {
  INR = "INR",
  USD = "USD",
}
export const currencySymbol = (currency?: CurrencyType) => {
  if (CurrencyType.INR.valueOf() == currency?.valueOf()) {
      return "₹";
  } else {
      return "$"
  }
}
export const dateFormat = 'dd-MM-yyyy';
export const percentageOf = (amount: number, percentage: number) => {
  return (amount / 100) * percentage;
}
export const round = (num: number, fractionDigits: number): number => {
  return Number(num.toFixed(fractionDigits));
}
export const currencyTypes = Object.values(CurrencyType);

export const getCgstOrSgstAmount = (taxAmount: number) => {
  return round(taxAmount / 2,2);
}

export class CurrencyPipe { 
  transform(val: any, currencyType: string) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(Number(val));
  }
}
export class DatePipe {
  transform(date: Date, dateFormat: string) {
    return format(date, dateFormat);
  }
}
export enum GSTType {
  IGST,
  CGST_SGST,
}

export enum OrderTypes {
  SALE = "SALE",
  QUOTE = "PURCHASE"    
}