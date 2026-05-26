'use client';

import { CheckCircle, AlertTriangle, XCircle, Shield } from 'lucide-react';

// This component can be used to generate the HTML version of the checklist
// For PDF generation, we'll use a server-side solution or convert this HTML to PDF

export default function ContractorChecklistPDF() {
  const redFlags = [
    {
      category: "Before Signing",
      items: [
        "❌ No written contract or estimate",
        "❌ Demands full payment upfront",
        "❌ Door-to-door solicitation (unsolicited)",
        "❌ Pressure to sign 'today only' deals",
        "❌ No business license or insurance proof"
      ]
    },
    {
      category: "Pricing Red Flags", 
      items: [
        "❌ Estimate significantly higher/lower than others",
        "❌ No itemized breakdown of costs",
        "❌ Vague descriptions like 'miscellaneous charges'",
        "❌ Hidden fees not disclosed upfront",
        "❌ Price changes dramatically during project"
      ]
    },
    {
      category: "Communication Issues",
      items: [
        "❌ No permanent business address",
        "❌ Only cell phone contact (no office number)", 
        "❌ Poor communication or late responses",
        "❌ Cannot provide local references",
        "❌ Avoids direct questions about work/materials"
      ]
    },
    {
      category: "Work Quality Concerns",
      items: [
        "❌ No permits pulled when required",
        "❌ Substandard or unknown material brands",
        "❌ Unrealistic timeline promises",
        "❌ No warranty or guarantee offered",
        "❌ Previous work looks unprofessional"
      ]
    }
  ];

  const greenFlags = [
    "✅ Licensed, bonded, and insured",
    "✅ Provides detailed written estimates",
    "✅ Has permanent business location",
    "✅ Offers reasonable payment schedule",
    "✅ Pulls proper permits",
    "✅ Provides local references",
    "✅ Clear timeline and communication",
    "✅ Offers warranty on work",
    "✅ Uses quality materials/brands",
    "✅ Professional appearance and behavior"
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-gray-900" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contractor Red Flags Checklist
          </h1>
          <p className="text-lg text-gray-600">
            Your Complete Guide to Avoiding Bad Contractors
          </p>
          <p className="text-sm text-blue-600 font-semibold">
            From QuoteEvaluator.com - Save Thousands on Your Next Project
          </p>
        </div>
        
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-left">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="font-semibold text-red-800">
              Critical Warning: 73% of homeowners overpay contractors by $3,000+ due to these red flags
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">How to Use This Checklist</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-gray-700 mb-2">
            <strong>Before hiring any contractor:</strong>
          </p>
          <ol className="list-decimal list-inside text-gray-700 space-y-1">
            <li>Review their quote against ALL red flags below</li>
            <li>If you spot 3+ red flags → <strong>DO NOT HIRE</strong></li>
            <li>If you spot 1-2 red flags → Get 2 more quotes for comparison</li>
            <li>Look for green flags (positive indicators) to confirm good contractors</li>
          </ol>
        </div>
      </div>

      {/* Red Flags Sections */}
      {redFlags.map((section, index) => (
        <div key={index} className="mb-6">
          <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            {section.category}
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <ul className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="text-gray-700 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* Green Flags */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Green Flags: What Good Contractors DO
        </h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {greenFlags.map((flag, index) => (
              <div key={index} className="text-gray-700 text-sm">
                {flag}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Action Plan */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          If You've Already Hired a Bad Contractor
        </h3>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <ol className="list-decimal list-inside text-gray-700 space-y-2 text-sm">
            <li><strong>STOP all payments</strong> immediately</li>
            <li>Document everything (photos, emails, contracts)</li>
            <li>Contact your state's contractor licensing board</li>
            <li>File complaints with Better Business Bureau</li>
            <li>Consult with a construction attorney if needed</li>
            <li>Contact your homeowner's insurance if damage occurred</li>
          </ol>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <div className="bg-blue-600 text-white rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">Get Professional Quote Analysis</h3>
          <p className="mb-4">
            Don't trust your instincts alone. Get AI-powered analysis of any contractor quote 
            and spot hidden red flags before signing.
          </p>
          <div className="flex justify-center items-center space-x-4 text-sm">
            <span>✓ Red flag detection</span>
            <span>✓ Cost analysis</span> 
            <span>✓ Negotiation tips</span>
          </div>
          <p className="mt-4 text-sm opacity-90">
            QuoteEvaluator.com - Trusted by thousands of homeowners
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>© 2025 QuoteEvaluator.com - This checklist is for educational purposes.</p>
        <p>Always consult with legal professionals for specific situations.</p>
      </div>
    </div>
  );
}