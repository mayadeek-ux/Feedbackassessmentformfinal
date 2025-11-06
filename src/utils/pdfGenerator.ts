import jsPDF from 'jspdf';
import { Section, DEFAULT_ASSESSOR_SECTIONS, DEFAULT_ADMIN_SECTIONS } from './manualSections';

// Convert emojis to basic ASCII text that works in all PDFs
function sanitizeText(text: string): string {
  if (!text) return '';
  
  let clean = text;
  
  // Convert emojis to basic ASCII letters/words only
  const emojiMap: Record<string, string> = {
    // Security & Access
    '🔐': '[LOCK] ',
    '🔓': '[UNLOCK] ',
    '🔒': '[SECURE] ',
    
    // Books & Documentation  
    '📘': '',
    '📗': '',
    '📙': '',
    '📕': '',
    '📖': '',
    '📚': '',
    
    // Navigation & Direction
    '🧭': '',
    '→': ' > ',
    '←': ' < ',
    '↑': ' ^ ',
    '↓': ' v ',
    '➡️': ' > ',
    '⬅️': ' < ',
    
    // Data & Analytics
    '📊': '[CHART] ',
    '📈': '[UP] ',
    '📉': '[DOWN] ',
    '📑': '[REPORT] ',
    
    // People & Users
    '👤': '[USER] ',
    '👥': '[TEAM] ',
    '🏢': '[ORG] ',
    
    // Actions & Status
    '⏸️': '[PAUSE] ',
    '📥': '[DOWNLOAD] ',
    '📤': '[UPLOAD] ',
    '✓': '[DONE] ',
    '✔': '[DONE] ',
    '✅': '[DONE] ',
    '❌': '[NO] ',
    '⚠️': '[ALERT] ',
    '⚠': '[ALERT] ',
    '⚡': '[FAST] ',
    '💡': '[TIP] ',
    
    // Status Indicators
    '🟢': '[GOOD] ',
    '🟡': '[WARN] ',
    '🔴': '[STOP] ',
    '🔵': '[INFO] ',
    '🟠': '[WARN] ',
    '🟣': '[NOTE] ',
    '⚫': '[DOT] ',
    '⚪': '[DOT] ',
    '🟤': '[DOT] ',
    
    // Numbers in circles
    '⓵': '(1) ',
    '⓶': '(2) ',
    '⓷': '(3) ',
    '⓸': '(4) ',
    '⓹': '(5) ',
    
    // Misc
    '📋': '[LIST] ',
    '🎯': '[TARGET] ',
    '✨': '[STAR] ',
    '🚀': '[GO] ',
    '⭐': '[STAR] ',
    '💼': '[WORK] ',
    '🔔': '[BELL] ',
    '🎓': '[LEARN] ',
    '🔍': '[FIND] ',
    '🖊️': '[EDIT] ',
    '🖊': '[EDIT] ',
    '💬': '[CHAT] ',
    '📝': '[NOTE] ',
    '🏆': '[WIN] ',
    '🎨': '[ART] ',
    '⚙️': '[SET] ',
    '⚙': '[SET] ',
    '🌟': '[STAR] ',
    '💪': '[STRONG] ',
    '🤝': '[TEAM] ',
    '🧩': '[PART] ',
    '🎭': '[ACT] ',
    '🗂️': '[FILE] ',
    '🗂': '[FILE] ',
    '📌': '[PIN] ',
    '🔗': '[LINK] ',
    '🆕': '[NEW] ',
    '🆗': '[OK] ',
    '🆙': '[UP] ',
  };
  
  // Replace emojis with basic ASCII text
  Object.entries(emojiMap).forEach(([emoji, replacement]) => {
    clean = clean.split(emoji).join(replacement);
  });
  
  // Remove any remaining emojis and special Unicode
  clean = clean.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  clean = clean.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
  clean = clean.replace(/[\u{1F680}-\u{1F6FF}]/gu, '');
  clean = clean.replace(/[\u{2600}-\u{26FF}]/gu, '');
  clean = clean.replace(/[\u{2700}-\u{27BF}]/gu, '');
  clean = clean.replace(/[\u{1F900}-\u{1F9FF}]/gu, '');
  clean = clean.replace(/[\u{1FA00}-\u{1FA6F}]/gu, '');
  clean = clean.replace(/[\u{1FA70}-\u{1FAFF}]/gu, '');
  clean = clean.replace(/[\u{FE00}-\u{FE0F}]/gu, '');
  clean = clean.replace(/[\u0080-\uFFFF]/gu, ''); // Remove all extended ASCII/Unicode
  
  // Clean up multiple spaces
  clean = clean.replace(/  +/g, ' ');
  
  return clean;
}

// Get default sections based on type
function getDefaultSections(type: 'assessor' | 'admin'): Section[] {
  return type === 'assessor' ? DEFAULT_ASSESSOR_SECTIONS : DEFAULT_ADMIN_SECTIONS;
}

// Load sections from localStorage
function loadSectionsFromStorage(type: 'assessor' | 'admin'): Section[] {
  const key = type === 'assessor' ? 'pdf_assessor_sections' : 'pdf_admin_sections';
  
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log(`Loaded ${parsed.length} sections from localStorage for ${type}`);
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse saved sections:', e);
  }
  
  const defaults = getDefaultSections(type);
  console.log(`Using ${defaults.length} default sections for ${type}`);
  return defaults;
}

class SimplePDFGenerator {
  private doc: jsPDF;
  private y: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private contentWidth: number;
  
  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - (this.margin * 2);
  }
  
  private checkSpace(needed: number): void {
    if (this.y + needed > this.pageHeight - 20) {
      this.doc.addPage();
      this.y = this.margin;
    }
  }
  
  private drawText(text: string, x: number, fontSize: number, fontStyle: string = 'normal', color: number[] = [0, 0, 0]): void {
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', fontStyle);
    this.doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    const lineHeight = fontSize * 0.5;
    
    lines.forEach((line: string) => {
      this.checkSpace(lineHeight);
      this.doc.text(line, x, this.y);
      this.y += lineHeight;
    });
  }
  
  public renderHeader(content: string, level: number = 1): void {
    const fontSize = level === 1 ? 24 : 18;
    const spacing = level === 1 ? 10 : 8;
    
    this.y += spacing;
    this.checkSpace(fontSize + spacing);
    
    const clean = sanitizeText(content);
    this.drawText(clean, this.margin, fontSize, 'bold', [127, 29, 29]);
    
    this.y += 6;
  }
  
  public renderSubheader(content: string, level: number = 2): void {
    const fontSize = level === 2 ? 16 : 14;
    const spacing = 6;
    
    this.y += spacing;
    this.checkSpace(fontSize + spacing);
    
    const clean = sanitizeText(content);
    this.drawText(clean, this.margin, fontSize, 'bold', [17, 24, 39]);
    
    this.y += 4;
  }
  
  public renderParagraph(content: string): void {
    this.checkSpace(15);
    
    const clean = sanitizeText(content);
    this.drawText(clean, this.margin, 11, 'normal', [55, 65, 81]);
    
    this.y += 3;
  }
  
  public renderList(title: string, items: string[]): void {
    if (title) {
      this.checkSpace(12);
      const clean = sanitizeText(title);
      this.drawText(clean, this.margin, 11, 'bold', [0, 0, 0]);
    }
    
    if (items && items.length > 0) {
      items.forEach(item => {
        this.checkSpace(10);
        
        const clean = sanitizeText(item);
        const lines = this.doc.splitTextToSize(clean, this.contentWidth - 10);
        
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(55, 65, 81);
        
        lines.forEach((line: string, idx: number) => {
          if (idx === 0) {
            // Check if line already has a bracketed tag
            const hasTag = /^\[.*?\]/.test(line.trim());
            if (!hasTag) {
              // Use simple dash for bullets
              this.doc.text('-', this.margin + 2, this.y);
            }
            this.doc.text(line, this.margin + 7, this.y);
          } else {
            this.checkSpace(5.5);
            this.doc.text(line, this.margin + 7, this.y);
          }
          this.y += 5.5;
        });
      });
      
      this.y += 2;
    }
  }
  
  public renderNumberedList(title: string, items: string[]): void {
    if (title) {
      this.checkSpace(12);
      const clean = sanitizeText(title);
      this.drawText(clean, this.margin, 11, 'bold', [0, 0, 0]);
    }
    
    if (items && items.length > 0) {
      items.forEach((item, index) => {
        this.checkSpace(10);
        
        const clean = sanitizeText(item);
        const lines = this.doc.splitTextToSize(clean, this.contentWidth - 12);
        
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(55, 65, 81);
        
        lines.forEach((line: string, idx: number) => {
          if (idx === 0) {
            const num = (index + 1) + '.';
            this.doc.text(num, this.margin + 2, this.y);
            this.doc.text(line, this.margin + 10, this.y);
          } else {
            this.checkSpace(5.5);
            this.doc.text(line, this.margin + 10, this.y);
          }
          this.y += 5.5;
        });
      });
      
      this.y += 2;
    }
  }
  
  public renderDivider(): void {
    this.y += 6;
    this.checkSpace(8);
    
    this.doc.setDrawColor(209, 213, 219);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
    
    this.y += 6;
  }
  
  public renderCallout(content: string, style: string = 'info'): void {
    const colors: Record<string, { bg: number[], border: number[], text: number[] }> = {
      info: { bg: [219, 234, 254], border: [191, 219, 254], text: [30, 58, 138] },
      warning: { bg: [254, 249, 195], border: [254, 240, 138], text: [113, 63, 18] },
      success: { bg: [220, 252, 231], border: [187, 247, 208], text: [21, 128, 61] },
      error: { bg: [254, 226, 226], border: [254, 202, 202], text: [153, 27, 27] }
    };
    
    const color = colors[style] || colors.info;
    const clean = sanitizeText(content);
    
    this.doc.setFontSize(11);
    const lines = this.doc.splitTextToSize(clean, this.contentWidth - 12);
    const boxHeight = (lines.length * 5.5) + 12;
    
    this.checkSpace(boxHeight + 4);
    
    // Background
    this.doc.setFillColor(color.bg[0], color.bg[1], color.bg[2]);
    this.doc.roundedRect(this.margin, this.y, this.contentWidth, boxHeight, 2, 2, 'F');
    
    // Left border
    this.doc.setFillColor(color.border[0], color.border[1], color.border[2]);
    this.doc.rect(this.margin, this.y, 2, boxHeight, 'F');
    
    // Text
    this.y += 8;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(color.text[0], color.text[1], color.text[2]);
    
    lines.forEach((line: string) => {
      this.doc.text(line, this.margin + 6, this.y);
      this.y += 5.5;
    });
    
    this.y += 6;
  }
  
  public renderTableOfContents(title: string, allSections: Section[]): void {
    const headers = allSections.filter(s => s.type === 'header' && s.level === 1);
    const boxHeight = 40 + (headers.length * 6);
    
    this.checkSpace(boxHeight + 10);
    
    // Box background
    this.doc.setFillColor(239, 246, 255);
    this.doc.setDrawColor(191, 219, 254);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(this.margin, this.y, this.contentWidth, boxHeight, 3, 3, 'FD');
    
    // Title
    this.y += 12;
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 58, 138);
    this.doc.text(sanitizeText(title), this.margin + 8, this.y);
    
    this.y += 10;
    
    // Items
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(30, 64, 175);
    
    headers.forEach(header => {
      const itemClean = sanitizeText(header.content);
      this.doc.text('  ' + itemClean, this.margin + 8, this.y);
      this.y += 6;
    });
    
    this.y += 8;
  }
  
  public generate(sections: Section[]): jsPDF {
    console.log(`Generating PDF with ${sections.length} sections`);
    
    sections.forEach((section, index) => {
      console.log(`Rendering section ${index + 1}/${sections.length}: ${section.type} - ${section.content?.substring(0, 30)}`);
      
      try {
        switch (section.type) {
          case 'header':
            this.renderHeader(section.content, section.level || 1);
            break;
          case 'subheader':
            this.renderSubheader(section.content, section.level || 2);
            break;
          case 'paragraph':
            this.renderParagraph(section.content);
            break;
          case 'list':
            this.renderList(section.content, section.items || []);
            break;
          case 'numbered-list':
            this.renderNumberedList(section.content, section.items || []);
            break;
          case 'divider':
            this.renderDivider();
            break;
          case 'callout':
            this.renderCallout(section.content, section.style || 'info');
            break;
          case 'table-of-contents':
            this.renderTableOfContents(section.content, sections);
            break;
          default:
            console.warn(`Unknown section type: ${section.type}`);
        }
      } catch (error) {
        console.error(`Error rendering section ${index}:`, error);
      }
    });
    
    console.log('PDF generation complete');
    return this.doc;
  }
}

export async function downloadManualAsPDF(type: 'assessor' | 'admin') {
  try {
    const sections = loadSectionsFromStorage(type);
    console.log(`Starting PDF generation for ${type} manual with ${sections.length} sections`);
    
    const generator = new SimplePDFGenerator();
    const doc = generator.generate(sections);
    
    const filename = type === 'assessor' 
      ? 'Assessor_User_Manual.pdf'
      : 'Administrator_User_Manual.pdf';
    
    doc.save(filename);
    console.log(`PDF saved as ${filename}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF manual');
  }
}

export async function generateAssessorManualPDF() {
  const sections = loadSectionsFromStorage('assessor');
  const generator = new SimplePDFGenerator();
  return generator.generate(sections);
}

export async function generateAdminManualPDF() {
  const sections = loadSectionsFromStorage('admin');
  const generator = new SimplePDFGenerator();
  return generator.generate(sections);
}
