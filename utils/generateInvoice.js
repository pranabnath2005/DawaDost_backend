import jsPDF from "jspdf";
import "jspdf-autotable";

const generateInvoice = ({
  user,
  orderItems,
  totalAmount,
  paymentMethod,
  orderId
}) => {
  const doc = new jsPDF();

  // 📌 Company Name
  doc.setFontSize(16);
  doc.text("Dawa Dost", 15, 20);

  doc.setFontSize(10);
  doc.text("support@dawadost.com", 50, 26);

  // 📌 Invoice Title
  doc.setFontSize(14);
  doc.text("INVOICE", 160, 20);

  // 📌 User Details
  doc.setFontSize(10);
  doc.text(`Invoice ID: ${orderId}`, 15, 50);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 56);

  doc.text(`Name: ${user.name}`, 15, 66);
  doc.text(`Email: ${user.email}`, 15, 72);
  doc.text(`Phone: ${user.phone}`, 15, 78);
  doc.text(`Address: ${user.address}`, 15, 84);
  doc.text(`Payment Method: ${paymentMethod}`, 15, 90);

  // 📌 Order Table
  const tableData = orderItems.map((item, index) => [
    index + 1,
    item.name,
    item.quantity,
    `₹${item.price}`,
    `₹${item.quantity * item.price}`
  ]);

  doc.autoTable({
    startY: 100,
    head: [["#", "Product", "Qty", "Price", "Total"]],
    body: tableData
  });

  // 📌 Grand Total
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Grand Total: ₹${totalAmount}`, 140, finalY);

  // 📌 Dynamic File Name
  const fileName = `${user.name}_${user.phone}_Invoice.pdf`;

  // 📥 Download
  doc.save(fileName);
};

export default generateInvoice;
