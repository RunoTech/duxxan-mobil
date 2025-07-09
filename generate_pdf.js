const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDF() {
    console.log('PDF oluşturuluyor...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // HTML dosyasını yükle
    const htmlPath = path.join(__dirname, 'DUXXAN_System_Presentation.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
    });
    
    // PDF seçenekleri
    const pdfOptions = {
        path: 'DUXXAN_System_Presentation.pdf',
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
        }
    };
    
    // PDF oluştur
    await page.pdf(pdfOptions);
    
    await browser.close();
    
    console.log('✅ PDF başarıyla oluşturuldu: DUXXAN_System_Presentation.pdf');
}

// Eğer puppeteer yoksa alternatif mesaj
if (require.resolve('puppeteer')) {
    generatePDF().catch(console.error);
} else {
    console.log('Puppeteer bulunamadı. Manuel olarak HTML dosyasını tarayıcıda açıp Print > Save as PDF seçeneğini kullanabilirsiniz.');
    console.log('HTML dosyası: DUXXAN_System_Presentation.html');
}