// utils/pdfUtils.js
import jsPDF from "jspdf";
import { format } from "date-fns";
import { getUserTotalsForToken, getTokens } from "./tokenUtils";

export const generateOrderPDF = (tokenId) => {
  const pdf = new jsPDF();
  const tokens = getTokens();
  const tokenInfo = tokens[tokenId];
  const userTotals = getUserTotalsForToken(tokenId);

  if (!tokenInfo) {
    throw new Error("Token not found");
  }

  // Header
  pdf.setFontSize(20);
  pdf.setFont(undefined, "bold");
  pdf.text("Restaurant Order Summary", 20, 20);

  // Token Info
  pdf.setFontSize(12);
  pdf.setFont(undefined, "normal");
  pdf.text(`Token ID: ${tokenId}`, 20, 35);
  pdf.text(`Description: ${tokenInfo.description || "N/A"}`, 20, 45);
  pdf.text(
    `Created: ${format(new Date(tokenInfo.createdAt), "dd/MM/yyyy HH:mm")}`,
    20,
    55
  );
  pdf.text(`Total Orders: ${tokenInfo.totalOrders}`, 20, 65);

  // Calculate overall total
  const overallTotal = Object.values(userTotals).reduce(
    (sum, user) => sum + user.total,
    0
  );
  pdf.text(`Overall Total: ₹${overallTotal}`, 20, 75);

  // Line separator
  pdf.line(20, 85, 190, 85);

  let yPosition = 100;

  // Individual user breakdowns
  pdf.setFontSize(14);
  pdf.setFont(undefined, "bold");
  pdf.text("Individual Order Breakdown:", 20, yPosition);
  yPosition += 15;

  Object.entries(userTotals).forEach(([userName, userData]) => {
    // Check if we need a new page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // User header
    pdf.setFontSize(12);
    pdf.setFont(undefined, "bold");
    pdf.text(`${userName} - Total: ₹${userData.total}`, 20, yPosition);
    yPosition += 10;

    // User orders
    pdf.setFont(undefined, "normal");
    pdf.setFontSize(10);

    userData.orders.forEach((order) => {
      order.items.forEach((item) => {
        const itemText = `${item.name} (${
          item.size !== "default" ? item.size : "Regular"
        }) x${item.quantity} - ₹${item.price * item.quantity}`;
        pdf.text(itemText, 25, yPosition);
        yPosition += 7;

        // Check if we need a new page
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
      });

      // Order timestamp
      pdf.setFontSize(8);
      pdf.text(
        `Ordered: ${format(new Date(order.timestamp), "dd/MM/yyyy HH:mm")}`,
        25,
        yPosition
      );
      yPosition += 10;

      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
    });

    yPosition += 5; // Extra space between users
  });

  // Summary section
  if (yPosition > 220) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.line(20, yPosition, 190, yPosition);
  yPosition += 15;

  pdf.setFontSize(14);
  pdf.setFont(undefined, "bold");
  pdf.text("Payment Summary:", 20, yPosition);
  yPosition += 15;

  pdf.setFontSize(11);
  pdf.setFont(undefined, "normal");

  Object.entries(userTotals).forEach(([userName, userData]) => {
    pdf.text(`${userName}: ₹${userData.total}`, 25, yPosition);
    yPosition += 8;
  });

  yPosition += 10;
  pdf.setFont(undefined, "bold");
  pdf.text(`Total Amount: ₹${overallTotal}`, 25, yPosition);

  // Footer
  yPosition += 20;
  pdf.setFontSize(8);
  pdf.setFont(undefined, "normal");
  pdf.text(
    `Generated on: ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}`,
    20,
    yPosition
  );

  return pdf;
};

export const downloadOrderPDF = (tokenId) => {
  try {
    const pdf = generateOrderPDF(tokenId);
    pdf.save(`order-summary-${tokenId}-${format(new Date(), "ddMMyyyy")}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
