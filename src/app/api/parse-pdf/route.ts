import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      // Try pdf-parse with proper serverless configuration
      const pdfParse = (await import('pdf-parse')).default;
      
      // Parse the PDF buffer directly with options for serverless environment
      const data = await pdfParse(buffer, {
        // Limit pages for performance in serverless environment
        max: 50
      });
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }
      
      console.log('PDF parsed successfully:', {
        pages: data.numpages,
        textLength: data.text.length,
        firstChars: data.text.substring(0, 100)
      });
      
      return NextResponse.json({ 
        text: data.text.trim(),
        success: true,
        info: {
          pages: data.numpages,
          textLength: data.text.length
        }
      });

    } catch (pdfError) {
      console.error('PDF parsing error details:', {
        error: pdfError,
        message: pdfError instanceof Error ? pdfError.message : 'Unknown error',
        bufferSize: buffer.length
      });
      console.error('PDF parsing error:', pdfError);
      
      // More specific error handling
      if (pdfError instanceof Error) {
        if (pdfError.message.includes('Invalid PDF')) {
          return NextResponse.json({
            error: 'This PDF file appears to be corrupted or invalid.',
            success: false,
            suggestion: 'Please try with a different PDF file or copy and paste the text content.',
            alternativeAction: 'copy-paste-text'
          }, { status: 200 });
        }
        
        if (pdfError.message.includes('password') || pdfError.message.includes('encrypted')) {
          return NextResponse.json({
            error: 'This PDF is password-protected or encrypted.',
            success: false,
            suggestion: 'Please unlock the PDF first or copy and paste the text content.',
            alternativeAction: 'copy-paste-text'
          }, { status: 200 });
        }
      }
      
      // Fallback message for other errors
      return NextResponse.json({
        error: 'Could not extract text from this PDF.',
        success: false,
        suggestion: 'This might be a scanned PDF or image-based PDF. Please copy and paste the text content from your PDF into the text area below.',
        alternativeAction: 'copy-paste-text'
      }, { status: 200 });
    }

  } catch (error) {
    console.error('PDF parsing error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to parse PDF. ';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        errorMessage += 'The PDF file appears to be corrupted or invalid.';
      } else if (error.message.includes('Password')) {
        errorMessage += 'The PDF is password-protected.';
      } else {
        errorMessage += 'This might be a scanned PDF or image-based PDF that doesn\'t contain extractable text.';
      }
    } else {
      errorMessage += 'Please try copying and pasting the text content instead.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false,
        suggestion: 'You can copy and paste the text content from your PDF into the text area instead of uploading the file.'
      },
      { status: 500 }
    );
  }
} 