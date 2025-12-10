import mammoth from 'mammoth';

export interface ParsedFile {
  text: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export class FileParser {
  /**
   * Parse a file and extract text content
   */
  static async parseFile(file: File): Promise<ParsedFile> {
    try {
      const fileType = file.type;
      const fileName = file.name;
      const fileSize = file.size;

      let text = '';

      switch (fileType) {
        case 'application/pdf':
          text = await this.parsePDF(file);
          break;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          text = await this.parseWord(file);
          break;
        case 'text/plain':
          text = await this.parseText(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      return {
        text: text.trim(),
        fileName,
        fileSize,
        fileType
      };
    } catch (error) {
      console.error('File parsing error:', error);
      throw new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse PDF file and extract text content
   * Note: PDF parsing is handled server-side due to Node.js dependencies
   */
  private static async parsePDF(file: File): Promise<string> {
    try {
      // Send PDF to server for parsing since pdf-parse only works in Node.js
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        // Handle the specific case where we want to guide users to copy-paste
        if (result.alternativeAction === 'copy-paste-text') {
          throw new Error(`PDF_COPY_PASTE_NEEDED: ${result.suggestion}`);
        }
        throw new Error(result.error + (result.suggestion ? ` ${result.suggestion}` : ''));
      }
      
      return result.text;
    } catch (error) {
      console.error('PDF parsing error:', error);
      
      if (error instanceof Error && error.message.includes('PDF_COPY_PASTE_NEEDED')) {
        throw error; // Re-throw the specific error from the server
      }
      
      throw new Error(`PDF parsing is temporarily unavailable. Please copy and paste the text content from your PDF, or upload a DOC, DOCX, or TXT file instead.`);
    }
  }



  /**
   * Parse Word document (DOC/DOCX)
   */
  private static async parseWord(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      throw new Error(`Word document parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse plain text file
   */
  private static async parseText(file: File): Promise<string> {
    try {
      const text = await file.text();
      return text;
    } catch (error) {
      throw new Error(`Text file parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate file before parsing
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // Check file type
    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported file type: ${file.type}. Please upload a PDF, DOC, DOCX, or TXT file, or copy and paste the text content.`
      };
    }

    // Special handling for PDF files - warn users upfront
    if (file.type === 'application/pdf') {
      return {
        isValid: true,
        error: undefined
      };
    }

    return { isValid: true };
  }

  /**
   * Clean and format extracted text
   */
  static cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract key information from quote text
   */
  static extractQuoteInfo(text: string): {
    totalAmount?: number;
    lineItems: string[];
    contractorName?: string;
    date?: string;
  } {
    const cleanedText = this.cleanText(text);
    const lines = cleanedText.split('\n').filter(line => line.trim());

    // Try to find total amount (look for currency patterns)
    const totalAmountMatch = cleanedText.match(/(?:total|amount|sum|balance|due)[\s:]*\$?([\d,]+\.?\d*)/i);
    const totalAmount = totalAmountMatch ? parseFloat(totalAmountMatch[1].replace(/,/g, '')) : undefined;

    // Try to find contractor name (common patterns)
    const contractorMatch = cleanedText.match(/(?:from|by|contractor|company)[\s:]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const contractorName = contractorMatch ? contractorMatch[1] : undefined;

    // Try to find date
    const dateMatch = cleanedText.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    const date = dateMatch ? dateMatch[1] : undefined;

    // Extract line items (lines with dollar amounts)
    const lineItems = lines.filter(line => 
      /\$\d+/.test(line) && 
      line.length > 10 && 
      !line.toLowerCase().includes('total')
    );

    return {
      totalAmount,
      lineItems,
      contractorName,
      date
    };
  }
} 