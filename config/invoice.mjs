import Order from '../models/orderModel.mjs';
import path from 'path';
import PDFDocument from 'pdfkit';
import fs from 'fs';

export function generateInvoicePDF(invoice) {
    const invoicePath = path.join('invoices', `invoice-${invoice.invoice_nr}.pdf`);
    const doc = new PDFDocument({ margin: 50 });

    // Generate PDF content using helper functions
    generateHeader(doc);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);

    // Save the PDF to a file
    doc.end();
    doc.pipe(fs.createWriteStream(invoicePath));

    return invoicePath; // Return the path to the generated PDF
}

// PDF generation helper functions
function generateHeader(doc) {
    doc.image('logo.png', 50, 45, { width: 50 })
        .fillColor('#444444')
        .fontSize(20)
        .text('ACME Inc.', 110, 57)
        .fontSize(10)
        .text('123 Main Street', 200, 65, { align: 'right' })
        .text('New York, NY, 10025', 200, 80, { align: 'right' })
        .moveDown();
}

function generateCustomerInformation(doc, invoice) {
    doc.fillColor('#444444')
        .fontSize(20)
        .text(`Invoice`, 50, 160);

    const customerInformationTop = 200;

    doc.fontSize(10)
        .text('Invoice Number:', 50, customerInformationTop)
        .text(invoice.invoice_nr, 150, customerInformationTop)
        .text('Invoice Date:', 50, customerInformationTop + 15)
        .text(new Date().toLocaleDateString(), 150, customerInformationTop + 15)
        .text('Billing Address:', 50, customerInformationTop + 30)
        .text(invoice.shipping.name, 150, customerInformationTop + 30)
        .text(invoice.shipping.address, 150, customerInformationTop + 45)
        .text(`${invoice.shipping.city}, ${invoice.shipping.state}, ${invoice.shipping.country}`, 150, customerInformationTop + 60)
        .moveDown();
}

function generateInvoiceTable(doc, invoice) {
    let i;
    const invoiceTableTop = 330;

    doc.fontSize(10);

    // Table headers
    doc.text('Item', 50, invoiceTableTop)
        .text('Description', 150, invoiceTableTop)
        .text('Quantity', 280, invoiceTableTop, { width: 90, align: 'right' })
        .text('Amount', 370, invoiceTableTop, { width: 90, align: 'right' });

    // Table rows
    for (i = 0; i < invoice.items.length; i++) {
        const item = invoice.items[i];
        const y = invoiceTableTop + 25 + (i * 20);
        doc.text(item.item, 50, y)
            .text(item.description, 150, y)
            .text(item.quantity, 280, y, { width: 90, align: 'right' })
            .text(item.amount, 370, y, { width: 90, align: 'right' });
    }
}

function generateFooter(doc) {
    doc.fontSize(10).text('Thank you for your business!', 50, 780, { align: 'center', width: 500 });
}









// import Order from '../models/orderSchema.js';
// import easyinvoice from 'easyinvoice';
// import fs from 'fs';
// import { Readable } from 'stream';
// import User from '../models/userSchema.js';

// export const invoice = async (req, res) => {
//     try {
//         const id = req.query.id;
//         const result = await Order.findOne({ _id: id });
//         console.log("Resultt", result);
//         const userData = await User.findOne({ _id: result.userId });
//         console.log("User:", userData);

//         const address = result.address;
//         let total1 = 0;
//         for (let i = 0; i < result.product.length; i++) {
//             total1 += result.product[i].price * result.product[i].quantity;
//         }

//         console.log(total1);

//         const order = {
//             id: id,
//             total: result.totalPrice,
//             discount: total1 - result.totalPrice,
//             date: result.createdOn,
//             paymentMethod: result.payment,
//             orderStatus: result.status,
//             name: address[0].name,
//             number: address[0].phone,
//             pincode: address[0].pincode,
//             town: address[0].landMark,
//             state: address[0].state,
//             items: result.product,
//         };

//         console.log(order.items.length, "order.dis");

//         const products = order.items.map((product) => ({
//             description: product.name,
//             quantity: parseInt(product.quantity),
//             price: product.price,
//             "tax-rate": 0,
//         }));

//         console.log("products=>>", products);
//         const isoDateString = order.date;
//         const isoDate = new Date(isoDateString);
//         const options = { year: "numeric", month: "long", day: "numeric" };
//         const formattedDate = isoDate.toLocaleDateString("en-US", options);
//         const subtotal = products.reduce((acc, product) => acc + (product.price * product.quantity), 0);
//         const total = order.total;

//         const data = {
//             customize: {},
//             images: {
//                 background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
//             },
//             sender: {
//                 company: "Elegent eCommerce",
//                 address: "Kundannoor PO,Ernakulam",
//                 city: "Kochi",
//                 country: "India",
//             },
//             client: {
//                 company: "Customer Address",
//                 address: order.state,
//                 city: order.town,
//                 zip: order.pincode,
//             },
//             information: {
//                 number: order.id,
//                 date: formattedDate,
//             },
//             products: products,
//             discount: order.discount,
//             subtotal: subtotal,
//             total: total,
//             data: "This is dataaaa",
//             "bottom-notice": "Happy shopping and visit Elegent again",
//         };

//         const pdfResult = await easyinvoice.createInvoice(data);

//         const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");
//         res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
//         res.setHeader("Content-Type", "application/pdf");
//         const pdfStream = new Readable();
//         pdfStream.push(pdfBuffer);
//         pdfStream.push(null);

//         pdfStream.pipe(res);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
