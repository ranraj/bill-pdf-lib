import { GState } from "jspdf";
import { generatePdf } from "../src";
import { Bill } from "../src/bill/bill.model";
import { CurrencyType, GSTType } from "../src/bill/currency.service";
import fs from 'fs';

export const exampleInvoice: Bill = {
    invoice: {
        invEwayBillNo: '12345',
        label: 'Invoice #1',
        num: 1,
        invDate: '2023-07-01',
        invGenDate: '2023-07-02',
        gstType: GSTType.CGST_SGST,
        invContent: {
            cgst: '50',
            sgst: '50',
            igst: null,
            isIgst: false,
            total: '1000',
            taxableAmount: '900',
            amountInWords: 'Nine Hundred',
            itemsLength: 1,
            isGst: true,
            taxAmount: 100,
            taxAmountInWords: 'One Hundred',
            billItems: [{
                id: '1',
                orderId: '1',
                product: {
                    name: 'Product 1',
                    hsnCode: 'HSN001',
                    taxPercentage: 10,
                },
                unitPrice: 100,
                quantity: 10,
                total: 1000,
                taxValue: 100,
            }],
            currencyType: CurrencyType.INR,
        }
    },
    outputType: {
        Save: 'save',
        DataUriString: 'dataUriString',
        DataUri: 'dataUri',
        DataUrlNewWindow: 'dataUrlNewWindow',
        Blob: 'blob',
        ArrayBuffer: 'arrayBuffer',
    },
    returnJsPDFDocObject: true,
    fileName: 'invoice.pdf',
    company: {
        name: 'Example Company',
        email: 'example@company.com',
        phoneNumber: '1234567890',
        addressFirstLine: '123 Street',
        addressSecondLine: 'Suite 456',
        city: 'Cityname',
        gstNo: 'GST12345',
        state: 'StateName',
        stateCode: 'ST',
        postalCode: '123456',
    },
    customer: {
        name: 'Customer Name',
        email: 'customer@domain.com',
        phoneNumber: '0987654321',
        addressFirstLine: '456 Avenue',
        addressSecondLine: 'Apt 789',
        city: 'AnotherCity',
        gstNo: 'GST67890',
        state: 'AnotherState',
        stateCode: 'AS',
        postalCode: '654321',
    }    
};

describe('Sample Test', () => {
    it('should generate pdf', () => {
        let filePath = generatePdf(exampleInvoice);
        expect(fs.existsSync(filePath)).toBe(true);
        fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting PDF:', err);
            }
        });
    });
});
