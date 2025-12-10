import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for tracking
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const source = url.searchParams.get('source');
    const format = url.searchParams.get('format') || 'html';

    // Track checklist download
    console.log('Checklist downloaded:', { email, source, timestamp: new Date().toISOString() });

    if (format === 'pdf') {
      // For PDF generation, you would use a library like puppeteer or @react-pdf/renderer
      // For now, we'll return HTML that can be easily converted to PDF
      return new NextResponse(
        'PDF generation not implemented yet. Use format=html for HTML version.',
        { status: 501 }
      );
    }

    // Generate HTML content for the checklist
    const checklistHTML = generateChecklistHTML();
    
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contractor Red Flags Checklist - QuoteEvaluator.com</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f9fafb;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
            z-index: 1000;
        }
        .print-button:hover {
            background: #2563eb;
        }
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; margin: 0; }
            .print-button { display: none; }
        }
        
        /* Custom styles for the checklist */
        .bg-red-50 { background-color: #fef2f2; }
        .bg-green-50 { background-color: #f0fdf4; }
        .bg-blue-50 { background-color: #eff6ff; }
        .bg-orange-50 { background-color: #fff7ed; }
        .bg-blue-600 { background-color: #2563eb; }
        
        .border { border: 1px solid #e5e7eb; }
        .border-red-200 { border-color: #fecaca; }
        .border-green-200 { border-color: #bbf7d0; }
        .border-blue-200 { border-color: #bfdbfe; }
        .border-orange-200 { border-color: #fed7aa; }
        .border-l-4 { border-left: 4px solid; }
        .border-red-500 { border-color: #ef4444; }
        
        .rounded-lg { border-radius: 8px; }
        .p-4 { padding: 16px; }
        .p-6 { padding: 24px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .mt-4 { margin-top: 16px; }
        .mt-8 { margin-top: 32px; }
        .pt-4 { padding-top: 16px; }
        
        .text-center { text-align: center; }
        .text-left { text-left: left; }
        .text-sm { font-size: 14px; }
        .text-lg { font-size: 18px; }
        .text-xl { font-size: 20px; }
        .text-3xl { font-size: 30px; }
        
        .font-bold { font-weight: bold; }
        .font-semibold { font-weight: 600; }
        
        .text-gray-500 { color: #6b7280; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-700 { color: #374151; }
        .text-gray-900 { color: #111827; }
        .text-red-800 { color: #991b1b; }
        .text-green-800 { color: #166534; }
        .text-blue-600 { color: #2563eb; }
        .text-orange-800 { color: #9a3412; }
        .text-white { color: white; }
        
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .gap-2 { gap: 8px; }
        
        .space-y-1 > * + * { margin-top: 4px; }
        .space-y-2 > * + * { margin-top: 8px; }
        .space-x-4 > * + * { margin-left: 16px; }
        
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        
        .list-decimal { list-style-type: decimal; }
        .list-inside { list-style-position: inside; }
        
        @media (min-width: 768px) {
            .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ Print Checklist</button>
    <div class="container">
        ${checklistHTML}
    </div>
    
    <script>
        // Track checklist view
        if (typeof gtag !== 'undefined') {
            gtag('event', 'checklist_viewed', {
                'event_category': 'lead_magnet',
                'event_label': '${source || 'direct'}',
                'email': '${email || 'unknown'}'
            });
        }
        
        // Track print button clicks
        document.querySelector('.print-button').addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'checklist_printed', {
                    'event_category': 'lead_magnet',
                    'event_label': '${source || 'direct'}',
                    'email': '${email || 'unknown'}'
                });
            }
        });
    </script>
</body>
</html>`;

    return new NextResponse(fullHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'inline; filename="contractor-red-flags-checklist.html"'
      }
    });

  } catch (error) {
    console.error('Checklist generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate checklist' },
      { status: 500 }
    );
  }
}

function generateChecklistHTML(): string {
  return `
    <div class="container">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 30px; font-weight: bold; color: #111827; margin-bottom: 8px;">
          Contractor Red Flags Checklist
        </h1>
        <p style="font-size: 18px; color: #4b5563; margin-bottom: 4px;">
          Your Complete Guide to Avoiding Bad Contractors
        </p>
        <p style="font-size: 14px; color: #2563eb; font-weight: 600;">
          From QuoteEvaluator.com - Save Thousands on Your Next Project
        </p>
        
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mt-4" style="text-align: left;">
          <p style="color: #991b1b; font-weight: 600; margin: 0;">
            ⚠️ Critical Warning: 73% of homeowners overpay contractors by $3,000+ due to these red flags
          </p>
        </div>
      </div>

      <!-- Introduction -->
      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">How to Use This Checklist</h2>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p style="color: #374151; margin-bottom: 8px; font-weight: bold;">
            Before hiring any contractor:
          </p>
          <ol style="list-style-type: decimal; list-style-position: inside; color: #374151; margin: 0; padding: 0;">
            <li style="margin-bottom: 4px;">Review their quote against ALL red flags below</li>
            <li style="margin-bottom: 4px;">If you spot 3+ red flags → <strong>DO NOT HIRE</strong></li>
            <li style="margin-bottom: 4px;">If you spot 1-2 red flags → Get 2 more quotes for comparison</li>
            <li>Look for green flags (positive indicators) to confirm good contractors</li>
          </ol>
        </div>
      </div>

      <!-- Red Flags: Before Signing -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 18px; font-weight: bold; color: #991b1b; margin-bottom: 12px;">
          ❌ Before Signing
        </h3>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <ul style="margin: 0; padding: 0; list-style: none;">
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ No written contract or estimate</li>
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ Demands full payment upfront</li>
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ Door-to-door solicitation (unsolicited)</li>
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ Pressure to sign 'today only' deals</li>
            <li style="color: #374151; font-size: 14px;">❌ No business license or insurance proof</li>
          </ul>
        </div>
      </div>

      <!-- Red Flags: Pricing -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 18px; font-weight: bold; color: #991b1b; margin-bottom: 12px;">
          ❌ Pricing Red Flags
        </h3>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <ul style="margin: 0; padding: 0; list-style: none;">
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ Estimate significantly higher/lower than others</li>
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ No itemized breakdown of costs</li>
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ Vague descriptions like 'miscellaneous charges'</li>
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ Hidden fees not disclosed upfront</li>
            <li style="color: #374151; font-size: 14px;">❌ Price changes dramatically during project</li>
          </ul>
        </div>
      </div>

      <!-- Red Flags: Communication -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 18px; font-weight: bold; color: #991b1b; margin-bottom: 12px;">
          ❌ Communication Issues
        </h3>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <ul style="margin: 0; padding: 0; list-style: none;">
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ No permanent business address</li>
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ Only cell phone contact (no office number)</li>
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ Poor communication or late responses</li>
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ Cannot provide local references</li>
            <li style="color: #374151; font-size: 14px;">❌ Avoids direct questions about work/materials</li>
          </ul>
        </div>
      </div>

      <!-- Red Flags: Work Quality -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 18px; font-weight: bold; color: #991b1b; margin-bottom: 12px;">
          ❌ Work Quality Concerns
        </h3>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <ul style="margin: 0; padding: 0; list-style: none;">
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ No permits pulled when required</li>
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ Substandard or unknown material brands</li>
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ Unrealistic timeline promises</li>
            <li style="color: #374151; font-size: 14px; margin-bottom: 8px;">❌ No warranty or guarantee offered</li>
            <li style="color: #374151; font-size: 14px;">❌ Previous work looks unprofessional</li>
          </ul>
        </div>
      </div>

      <!-- Green Flags -->
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 18px; font-weight: bold; color: #166534; margin-bottom: 12px;">
          ✅ Green Flags: What Good Contractors DO
        </h3>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            <div style="color: #374151; font-size: 14px;">✅ Licensed, bonded, and insured</div>
            <div style="color: #374151; font-size: 14px;">✅ Provides detailed written estimates</div>
            <div style="color: #374151; font-size: 14px;">✅ Has permanent business location</div>
            <div style="color: #374151; font-size: 14px;">✅ Offers reasonable payment schedule</div>
            <div style="color: #374151; font-size: 14px;">✅ Pulls proper permits</div>
            <div style="color: #374151; font-size: 14px;">✅ Provides local references</div>
            <div style="color: #374151; font-size: 14px;">✅ Clear timeline and communication</div>
            <div style="color: #374151; font-size: 14px;">✅ Offers warranty on work</div>
            <div style="color: #374151; font-size: 14px;">✅ Uses quality materials/brands</div>
            <div style="color: #374151; font-size: 14px;">✅ Professional appearance and behavior</div>
          </div>
        </div>
      </div>

      <!-- Emergency Action Plan -->
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 18px; font-weight: bold; color: #9a3412; margin-bottom: 12px;">
          🚨 If You've Already Hired a Bad Contractor
        </h3>
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <ol style="list-style-type: decimal; list-style-position: inside; color: #374151; margin: 0; padding: 0;">
            <li style="font-size: 14px; margin-bottom: 8px;"><strong>STOP all payments</strong> immediately</li>
            <li style="font-size: 14px; margin-bottom: 8px;">Document everything (photos, emails, contracts)</li>
            <li style="font-size: 14px; margin-bottom: 8px;">Contact your state's contractor licensing board</li>
            <li style="font-size: 14px; margin-bottom: 8px;">File complaints with Better Business Bureau</li>
            <li style="font-size: 14px; margin-bottom: 8px;">Consult with a construction attorney if needed</li>
            <li style="font-size: 14px;">Contact your homeowner's insurance if damage occurred</li>
          </ol>
        </div>
      </div>

      <!-- Call to Action -->
      <div style="text-align: center;">
        <div class="bg-blue-600" style="color: white; border-radius: 8px; padding: 24px;">
          <h3 style="font-size: 20px; font-weight: bold; margin: 0 0 8px 0;">Get Professional Quote Analysis</h3>
          <p style="margin: 0 0 16px 0;">
            Don't trust your instincts alone. Get AI-powered analysis of any contractor quote 
            and spot hidden red flags before signing.
          </p>
          <div style="display: flex; justify-content: center; align-items: center; gap: 16px; font-size: 14px; margin-bottom: 16px;">
            <span>✓ Red flag detection</span>
            <span>✓ Cost analysis</span> 
            <span>✓ Negotiation tips</span>
          </div>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">
            QuoteEvaluator.com - Used by 10,000+ homeowners
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
        <p style="margin: 0 0 4px 0;">© 2024 QuoteEvaluator.com - This checklist is for educational purposes.</p>
        <p style="margin: 0;">Always consult with legal professionals for specific situations.</p>
      </div>
    </div>
  `;
}