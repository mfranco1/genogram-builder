import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const exportToPng = async (element: HTMLElement, fileName: string = 'genogram') => {
  try {
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2, // Higher quality
      backgroundColor: '#ffffff',
    });
    
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    return false;
  }
};

export const exportToPdf = async (element: HTMLElement, fileName: string = 'genogram') => {
  try {
    // First export to PNG with high quality
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });
    
    // Calculate dimensions to maintain aspect ratio on A4
    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = dataUrl;
    });
    
    const pdf = new jsPDF({
      orientation: img.width > img.height ? 'l' : 'p',
      unit: 'mm',
    });
    
    // Calculate dimensions to fit the page with margins
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // 10mm margin
    const maxWidth = pageWidth - 2 * margin;
    const maxHeight = pageHeight - 2 * margin;
    
    let imgWidth = img.width / 3.78; // Convert from pixels to mm (96dpi)
    let imgHeight = img.height / 3.78;
    
    // Maintain aspect ratio
    if (imgWidth > maxWidth) {
      const ratio = maxWidth / imgWidth;
      imgWidth = maxWidth;
      imgHeight = imgHeight * ratio;
    }
    
    if (imgHeight > maxHeight) {
      const ratio = maxHeight / imgHeight;
      imgHeight = maxHeight;
      imgWidth = imgWidth * ratio;
    }
    
    // Center the image on the page
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;
    
    pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save(`${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};
