import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { PortfolioContent } from '../types';

/**
 * Downloads a high-quality, valid, standard PDF resume for Hrishu Sinha.
 * First tries downloading the pre-rendered PDF from public/, with a dynamic client-side fallback.
 */
export async function downloadResumePdf(content: PortfolioContent) {
  try {
    const response = await fetch('/Hrishu_Sinha_Resume.pdf', { method: 'GET', cache: 'no-cache' });
    if (response.ok) {
      const blob = await response.blob();
      if (blob.size > 500) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Hrishu_Sinha_Resume.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
    }
  } catch {
    // Fall back to client generation
  }

  // Generate on-the-fly with pdf-lib as a guaranteed fallback
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const { width, height } = page.getSize();
    let y = height - 50;

    page.drawText(content.name || 'HRISHU SINHA', {
      x: 50,
      y,
      size: 24,
      font: fontBold,
      color: rgb(0.08, 0.08, 0.12),
    });
    y -= 22;

    page.drawText('B.Tech CSE (AI & ML) | Creative Developer & Motion Designer', {
      x: 50,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.95, 0.42, 0.05),
    });
    y -= 16;

    page.drawText(`${content.contact.location || 'Assam, India'}  |  ${content.contact.email || 'hrishusinha674@gmail.com'}  |  ${content.contact.phone || '+91 9394500884'}`, {
      x: 50,
      y,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.48),
    });
    y -= 14;

    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.9),
    });
    y -= 22;

    const drawSectionHeader = (title: string) => {
      page.drawText(title.toUpperCase(), {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.12, 0.12, 0.18),
      });
      y -= 4;
      page.drawLine({
        start: { x: 50, y },
        end: { x: width - 50, y },
        thickness: 0.75,
        color: rgb(0.9, 0.9, 0.94),
      });
      y -= 14;
    };

    const drawBullet = (text: string) => {
      page.drawText('•', { x: 52, y, size: 8, font: fontRegular, color: rgb(0.95, 0.42, 0.05) });
      page.drawText(text, { x: 62, y, size: 9, font: fontRegular, color: rgb(0.25, 0.25, 0.3) });
      y -= 13;
    };

    // 1. Executive Profile
    drawSectionHeader('Executive Profile');
    const profileLines = [
      'B.Tech Computer Science & Engineering undergraduate (2024-2028) specializing in Artificial',
      'Intelligence & Machine Learning (AI & ML), with an intensive trajectory across Web Development,',
      'UI/UX Engineering, Cinematic Video Editing, and Motion Design.',
      'Driven by an ethos of building intelligent software paired with striking visual craftsmanship.'
    ];
    profileLines.forEach(line => {
      page.drawText(line, { x: 50, y, size: 9.2, font: fontRegular, color: rgb(0.25, 0.25, 0.3) });
      y -= 13;
    });
    y -= 10;

    // 2. Education
    drawSectionHeader('Education');
    page.drawText('Bachelor of Technology (B.Tech) - Computer Science & Engineering', {
      x: 50,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.15),
    });
    page.drawText('2024 - 2028', {
      x: width - 120,
      y,
      size: 9.5,
      font: fontBold,
      color: rgb(0.95, 0.42, 0.05),
    });
    y -= 14;
    page.drawText('Specialization: Artificial Intelligence & Machine Learning (AI & ML)', {
      x: 50,
      y,
      size: 9,
      font: fontOblique,
      color: rgb(0.35, 0.35, 0.42),
    });
    y -= 12;
    page.drawText('Core Foundations: Neural Networks, Machine Learning, Data Structures & Algorithms, Computational Math.', {
      x: 50,
      y,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.45, 0.45, 0.5),
    });
    y -= 18;

    // 3. Technical & Creative Competencies
    drawSectionHeader('Technical & Creative Competencies');
    const skills = [
      { cat: 'Core CS, AI & ML:', desc: 'Python, C++, Java, Machine Learning, Neural Networks, Data Structures & Algorithms' },
      { cat: 'Web & UI/UX Development:', desc: 'HTML5, CSS3, Tailwind CSS, Modern JavaScript, TypeScript, Responsive Prototyping' },
      { cat: 'Video Editing & Motion Design:', desc: 'Adobe Premiere Pro, After Effects, Kinetic Typography, Visual Effects, Color Grading' },
      { cat: 'Tooling & Workflow:', desc: 'Git, GitHub, VS Code, Visual Studio, Vite, Modern CLI & Build Pipelines' }
    ];

    skills.forEach(s => {
      page.drawText(s.cat, { x: 50, y, size: 9, font: fontBold, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(s.desc, { x: 215, y, size: 8.8, font: fontRegular, color: rgb(0.3, 0.3, 0.38) });
      y -= 14;
    });
    y -= 10;

    // 4. Experience & Work
    drawSectionHeader('Engineering & Creative Work');
    page.drawText('Independent Creative Developer & UI/UX Designer', {
      x: 50,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.15),
    });
    page.drawText('2025 - Present', {
      x: width - 120,
      y,
      size: 9.5,
      font: fontBold,
      color: rgb(0.95, 0.42, 0.05),
    });
    y -= 14;
    drawBullet('Engineered interactive, responsive web applications with modern physics, shaders, and scroll choreography.');
    drawBullet('Designed end-to-end UI/UX systems prioritizing spatial math, typographic hierarchy, and clean modern aesthetics.');
    drawBullet('Developed full-stack prototypes integrating artificial intelligence and machine learning concepts.');
    y -= 6;

    page.drawText('Motion Designer & Video Editor', {
      x: 50,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.15),
    });
    page.drawText('2025 - Present', {
      x: width - 120,
      y,
      size: 9.5,
      font: fontBold,
      color: rgb(0.95, 0.42, 0.05),
    });
    y -= 14;
    drawBullet('Authored cinematic video edits and dynamic timeline post-production with Premiere Pro and After Effects.');
    drawBullet('Created custom motion graphics, synchronized visual effects, sound design, and color grading.');
    y -= 18;

    page.drawText('Available for Summer/Fall Internships & High-Impact Freelance Contracts', {
      x: 50,
      y,
      size: 8.5,
      font: fontOblique,
      color: rgb(0.5, 0.5, 0.58),
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Hrishu_Sinha_Resume.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('PDF generation error:', err);
  }
}
