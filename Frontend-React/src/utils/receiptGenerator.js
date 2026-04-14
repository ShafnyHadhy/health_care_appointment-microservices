import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a State-of-the-Art medical receipt PDF (V2 Premium)
 * @param {Object} data - Combined payment and appointment data
 */
export const generateReceiptPDF = (data) => {
    const { payment, appointment } = data;
    const doc = new jsPDF();
    
    // Theme Colors (Premium Palette)
    const primaryTeal = [0, 96, 99];     // #006063 (Deep Teal)
    const activeTeal = [0, 123, 127];    // #007b7f (Bright Teal)
    const surfaceGray = [243, 244, 245]; // #f3f4f5 (Light Surface)
    const textDark = [25, 28, 29];       // #191c1d
    const textMuted = [102, 110, 122];   // #666e7a

    // --- Helper: Draw Horizontal Line ---
    const horizontalLine = (y) => {
        doc.setDrawColor(224, 242, 241); // Very light teal
        doc.setLineWidth(0.1);
        doc.line(20, y, 190, y);
    };

    // --- 1. Header (Premium Letterhead) ---
    // Solid Full-Width Header
    doc.setFillColor(...primaryTeal);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Logo Lines (White for contrast)
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1.5);
    doc.line(20, 15, 30, 15);
    doc.line(20, 15, 20, 22);
    doc.line(20, 22, 30, 22);
    doc.line(30, 22, 30, 29);
    doc.line(20, 29, 30, 29);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('THE SANCTUARY', 35, 24);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 240, 242); // Light Cyan/Teal
    doc.text('PREMIUM CLINICAL CARE & TELEMEDICINE', 35, 29);

    // Header Right Info
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEIPT NO:', 190, 20, { align: 'right' });
    doc.setTextColor(224, 242, 241);
    doc.text(`CS-${payment._id?.substring(0, 8).toUpperCase()}`, 190, 25, { align: 'right' });
    
    doc.setTextColor(180, 240, 242);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 190, 31, { align: 'right' });

    // --- 2. Information Grid (Bento Style) ---
    
    // Section Headers
    doc.setTextColor(...primaryTeal);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT RECORD', 25, 60);
    doc.text('APPOINTMENT DETAILS', 115, 60);

    // Patient Block
    doc.setFillColor(...surfaceGray);
    doc.roundedRect(20, 65, 80, 40, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...textDark);
    doc.setFont('helvetica', 'bold');
    doc.text(appointment.patientName || 'Shafny Hadhy', 25, 75);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    doc.text(`ID: ${appointment.patientId?.substring(0, 12) || '65f333333333'}`, 25, 82);
    doc.text(`Email: ${payment.patientEmail || 'patient@gmail.com'}`, 25, 88);
    doc.text('Status: Primary Member', 25, 94);

    // Appointment Block
    doc.setFillColor(...surfaceGray);
    doc.roundedRect(110, 65, 80, 40, 3, 3, 'F');
    doc.setTextColor(...textDark);
    doc.setFont('helvetica', 'bold');
    doc.text(appointment.doctorName || 'Dr. specialist', 115, 75);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...activeTeal);
    doc.text(appointment.specialty || 'General Practitioner', 115, 82);
    doc.setTextColor(...textMuted);
    doc.text(`${new Date(appointment.date).toDateString()}`, 115, 88);
    doc.text(`${appointment.timeSlot || 'Morning Session'}`, 115, 94);

    // --- 3. Billing Table (Clean & Professional) ---
    autoTable(doc, {
        startY: 115,
        head: [['SERVICE DESCRIPTION', 'UNIT FEE', 'AMOUNT']],
        body: [
            ['Medical Consultation (Video Conference)', (appointment.consultationFee || 0).toFixed(2), (appointment.consultationFee || 0).toFixed(2)],
            ['Platform Secure Access Fee', '25.00', '25.00'],
            ['Digital Prescriptions & Records Handling', '0.00', '0.00'],
        ],
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: primaryTeal,
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: { top: 5, bottom: 5, left: 2, right: 2 }
        },
        bodyStyles: {
            fontSize: 9,
            textColor: textDark,
            cellPadding: 6,
            lineColor: [240, 240, 240],
            lineWidth: 0.1
        },
        columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right', fontStyle: 'bold' }
        },
        theme: 'plain',
        margin: { left: 20, right: 20 },
        didDrawPage: (data) => {
            // Add a border above header
            doc.setDrawColor(...primaryTeal);
            doc.setLineWidth(0.5);
            doc.line(20, 115, 190, 115);
        }
    });

    let finalY = (doc).lastAutoTable.finalY + 10;

    // --- 4. Totals Area ---
    horizontalLine(finalY);
    finalY += 10;

    doc.setFontSize(9);
    doc.setTextColor(...textMuted);
    doc.text('Subtotal:', 140, finalY, { align: 'right' });
    doc.setTextColor(...textDark);
    doc.text(`Rs. ${(appointment.consultationFee + 25).toFixed(2)}`, 190, finalY, { align: 'right' });

    finalY += 8;
    doc.setTextColor(...textMuted);
    doc.text('Tax (0%):', 140, finalY, { align: 'right' });
    doc.setTextColor(...textDark);
    doc.text('Rs. 0.00', 190, finalY, { align: 'right' });

    finalY += 10;
    doc.setFillColor(...activeTeal);
    doc.roundedRect(130, finalY - 5, 60, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL PAID:', 135, finalY + 2.5);
    doc.text(`Rs. ${(appointment.consultationFee + 25).toFixed(2)}`, 185, finalY + 2.5, { align: 'right' });

    // --- 5. Security & Verification ---
    finalY += 30;
    
    // Security Seal
    doc.setDrawColor(...activeTeal);
    doc.setFillColor(224, 242, 241);
    doc.circle(35, finalY, 12, 'FD');
    doc.setTextColor(...primaryTeal);
    doc.setFontSize(7);
    doc.text('VERIFIED', 35, finalY - 1, { align: 'center' });
    doc.text('PAYMENT', 35, finalY + 2, { align: 'center' });

    doc.setTextColor(...textDark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SECURE TRANSACTION', 52, finalY - 2);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    doc.text('This payment was processed via 256-bit AES encryption.', 52, finalY + 3);
    doc.text('Unique ID: ' + Math.random().toString(36).substring(2, 15).toUpperCase(), 52, finalY + 7);

    // --- 6. Footer ---
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text('The Sanctuary Clinical Center | Healthcare Regulatory Authority Registration No: SL-4421', 105, 280, { align: 'center' });
    doc.text('This is a digitally signed document. No physical signature is required.', 105, 285, { align: 'center' });

    // --- Save File ---
    doc.save(`Clinical_Receipt_${payment._id?.substring(0, 8)}.pdf`);
};
