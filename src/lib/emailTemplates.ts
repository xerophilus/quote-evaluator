export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

interface EmailData {
  email: string;
  firstName?: string;
  checklistUrl?: string;
  discountCode?: string;
  discountPercent?: number;
  baseUrl?: string;
}

// Email 1: Welcome email with checklist (sent immediately)
export function getWelcomeEmail(data: EmailData): EmailTemplate {
  const { email, firstName = 'Friend', checklistUrl, discountCode = '20OFF', discountPercent = 20, baseUrl = 'https://quoteevaluator.com' } = data;

  return {
    subject: "🎁 Your FREE Contractor Red Flags Checklist (Save $3,000+)",
    
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your FREE Contractor Checklist</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Welcome to QuoteEvaluator!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your contractor protection starts now</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 30px 20px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Hi ${firstName},
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Thank you for downloading our <strong>FREE Contractor Red Flags Checklist</strong>! 
                You're now armed with the knowledge to avoid the costly mistakes that trap 73% of homeowners.
            </p>
            
            <!-- Checklist Download Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${checklistUrl || baseUrl + '/api/contractor-checklist'}" 
                   style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    📄 Download Your Checklist Now
                </a>
            </div>
            
            <!-- Value Proposition -->
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0 0 10px 0; color: #991b1b;">⚠️ Did You Know?</h3>
                <p style="margin: 0; color: #7f1d1d;">
                    The average homeowner overpays contractors by <strong>$3,200</strong> due to hidden fees, 
                    overcharges, and poor negotiations. This checklist has helped thousands avoid these traps.
                </p>
            </div>
            
            <!-- Special Offer -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px;">🎁 Special Welcome Offer</h3>
                <p style="margin: 0 0 15px 0; font-size: 16px;">
                    Get <strong>${discountPercent}% OFF</strong> your first professional quote analysis
                </p>
                <p style="margin: 0 0 20px 0; font-size: 14px; opacity: 0.9;">
                    Use code: <strong>${discountCode}</strong> (expires in 7 days)
                </p>
                <a href="${baseUrl}/?discount=${discountCode}" 
                   style="display: inline-block; background-color: white; color: #059669; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Analyze My Quote Now →
                </a>
            </div>
            
            <!-- What's Next -->
            <div style="margin: 30px 0;">
                <h3 style="color: #374151; margin-bottom: 15px;">What happens next?</h3>
                <ul style="color: #6b7280; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Download and review your checklist before meeting any contractors</li>
                    <li style="margin-bottom: 8px;">I'll send you a real case study of someone who saved $3,000+ (tomorrow)</li>
                    <li style="margin-bottom: 8px;">Get professional analysis of your quotes with our AI-powered tool</li>
                </ul>
            </div>
            
            <p style="font-size: 16px; color: #374151; margin-top: 30px;">
                Best regards,<br>
                The QuoteEvaluator Team
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0 0 10px 0;">
                You received this email because you signed up for our contractor protection checklist.
            </p>
            <p style="margin: 0;">
                <a href="#" style="color: #6b7280;">Unsubscribe</a> | 
                <a href="${baseUrl}" style="color: #6b7280;">QuoteEvaluator.com</a>
            </p>
        </div>
    </div>
</body>
</html>`,

    textContent: `
Hi ${firstName},

Thank you for downloading our FREE Contractor Red Flags Checklist!

You're now armed with the knowledge to avoid the costly mistakes that trap 73% of homeowners.

DOWNLOAD YOUR CHECKLIST:
${checklistUrl || baseUrl + '/api/contractor-checklist'}

DID YOU KNOW?
The average homeowner overpays contractors by $3,200 due to hidden fees, overcharges, and poor negotiations. This checklist has helped thousands avoid these traps.

SPECIAL WELCOME OFFER:
Get ${discountPercent}% OFF your first professional quote analysis
Use code: ${discountCode} (expires in 7 days)

Analyze your quote now: ${baseUrl}/?discount=${discountCode}

What happens next?
• Download and review your checklist before meeting any contractors
• I'll send you a real case study of someone who saved $3,000+ (tomorrow)
• Get professional analysis of your quotes with our AI-powered tool

Best regards,
The QuoteEvaluator Team

---
You received this email because you signed up for our contractor protection checklist.
Unsubscribe: [link] | QuoteEvaluator.com
`
  };
}

// Email 2: Case study email (sent 24 hours later)
export function getCaseStudyEmail(data: EmailData): EmailTemplate {
  const { email, firstName = 'Friend', baseUrl = 'https://quoteevaluator.com', discountCode = '20OFF' } = data;

  return {
    subject: "📊 How Sarah Saved $4,247 on Her Kitchen Remodel (Real Case Study)",
    
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Real Customer Success Story</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 25px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">💰 Real Customer Success Story</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">How our analysis saved $4,247</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 30px 20px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Hi ${firstName},
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Yesterday I shared your contractor red flags checklist. Today, I want to show you exactly how 
                it works in real life with <strong>Sarah from Portland</strong>.
            </p>
            
            <!-- Case Study Box -->
            <div style="border: 2px solid #d1fae5; background-color: #ecfdf5; padding: 25px; border-radius: 12px; margin: 25px 0;">
                <h3 style="color: #065f46; margin: 0 0 20px 0;">📋 Sarah's Kitchen Remodel Quote Analysis</h3>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="color: #374151; margin: 0 0 15px 0;">The Original Quote: $18,500</h4>
                    <p style="color: #6b7280; margin: 0 0 10px 0;">✗ Vague line items like "installation fees"</p>
                    <p style="color: #6b7280; margin: 0 0 10px 0;">✗ 50% payment required upfront</p>
                    <p style="color: #6b7280; margin: 0 0 10px 0;">✗ No material specifications listed</p>
                    <p style="color: #6b7280; margin: 0;">✗ "Miscellaneous charges: $2,400"</p>
                </div>
                
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #991b1b; font-weight: bold;">
                        🚨 Red Flags Detected: 7 out of 20
                    </p>
                    <p style="margin: 5px 0 0 0; color: #7f1d1d; font-size: 14px;">
                        High risk of overcharges and poor workmanship
                    </p>
                </div>
                
                <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px;">
                    <h4 style="color: #1e40af; margin: 0 0 10px 0;">Our Recommendations Saved Sarah:</h4>
                    <p style="color: #1e3a8a; margin: 0 0 8px 0;">💰 $2,400 in "miscellaneous" overcharges removed</p>
                    <p style="color: #1e3a8a; margin: 0 0 8px 0;">💰 $1,200 by negotiating material costs</p>
                    <p style="color: #1e3a8a; margin: 0 0 8px 0;">💰 $647 in avoided change orders</p>
                    <p style="color: #1e3a8a; margin: 0; font-weight: bold; font-size: 18px;">Total Saved: $4,247</p>
                </div>
            </div>
            
            <!-- Sarah's Testimonial -->
            <div style="background-color: #f8fafc; border-left: 4px solid #8b5cf6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #5b21b6; font-style: italic; margin: 0 0 10px 0; font-size: 16px;">
                    "I almost signed that original contract! The QuoteEvaluator analysis opened my eyes to 
                    so many hidden costs and red flags. Best $4.99 I've ever spent."
                </p>
                <p style="color: #6b7280; margin: 0; font-size: 14px;">
                    – Sarah M., Portland, OR
                </p>
            </div>
            
            <p style="font-size: 16px; color: #374151; margin: 25px 0;">
                Sarah used the same checklist you downloaded, but she also got our professional AI analysis 
                to spot the hidden overcharges that could have cost her thousands.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #374151; margin-bottom: 15px;">
                    <strong>Ready to protect yourself like Sarah did?</strong>
                </p>
                <a href="${baseUrl}/?discount=${discountCode}" 
                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Get My Quote Analyzed (20% OFF)
                </a>
                <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">
                    Code ${discountCode} expires in 5 days
                </p>
            </div>
            
            <p style="font-size: 16px; color: #374151; margin-top: 30px;">
                Don't let contractors take advantage of you,<br>
                The QuoteEvaluator Team
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0 0 10px 0;">
                You're receiving this because you requested our contractor protection guide.
            </p>
            <p style="margin: 0;">
                <a href="#" style="color: #6b7280;">Unsubscribe</a> | 
                <a href="${baseUrl}" style="color: #6b7280;">QuoteEvaluator.com</a>
            </p>
        </div>
    </div>
</body>
</html>`,

    textContent: `
Hi ${firstName},

Yesterday I shared your contractor red flags checklist. Today, I want to show you exactly how it works in real life with Sarah from Portland.

SARAH'S KITCHEN REMODEL SUCCESS STORY

The Original Quote: $18,500
✗ Vague line items like "installation fees"
✗ 50% payment required upfront  
✗ No material specifications listed
✗ "Miscellaneous charges: $2,400"

🚨 RED FLAGS DETECTED: 7 out of 20
High risk of overcharges and poor workmanship

OUR RECOMMENDATIONS SAVED SARAH:
💰 $2,400 in "miscellaneous" overcharges removed
💰 $1,200 by negotiating material costs  
💰 $647 in avoided change orders
TOTAL SAVED: $4,247

"I almost signed that original contract! The QuoteEvaluator analysis opened my eyes to so many hidden costs and red flags. Best $4.99 I've ever spent."
– Sarah M., Portland, OR

Sarah used the same checklist you downloaded, but she also got our professional AI analysis to spot the hidden overcharges that could have cost her thousands.

Ready to protect yourself like Sarah did?

Get My Quote Analyzed (20% OFF): ${baseUrl}/?discount=${discountCode}
Code ${discountCode} expires in 5 days

Don't let contractors take advantage of you,
The QuoteEvaluator Team

---
Unsubscribe: [link] | QuoteEvaluator.com
`
  };
}

// Email 3: Final discount email (sent 72 hours later)
export function getFinalDiscountEmail(data: EmailData): EmailTemplate {
  const { email, firstName = 'Friend', baseUrl = 'https://quoteevaluator.com', discountCode = '20OFF' } = data;

  return {
    subject: "⏰ Your 20% OFF expires tonight (Final reminder)",
    
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Final Discount Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        
        <!-- Urgent Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px;">⏰ Final Hours: 20% OFF Expires Tonight</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Don't miss your chance to save on quote analysis</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 25px 20px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Hi ${firstName},
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                This is your <strong>final reminder</strong> – your 20% discount expires at midnight tonight.
            </p>
            
            <!-- Urgency Box -->
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #fca5a5; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
                <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px;">⏰ Less Than 12 Hours Left</h3>
                <p style="color: #991b1b; margin: 0 0 15px 0; font-size: 14px;">
                    Code <strong>${discountCode}</strong> expires tonight at 11:59 PM
                </p>
                <div style="background-color: white; padding: 15px; border-radius: 6px; border: 1px solid #f87171;">
                    <p style="margin: 0; color: #dc2626; font-weight: bold; font-size: 16px;">
                        Save $1.00 on every quote analysis
                    </p>
                </div>
            </div>
            
            <!-- Value Reminder -->
            <div style="margin: 25px 0;">
                <h3 style="color: #374151; margin-bottom: 15px;">Quick Reminder: What You Get</h3>
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
                    <p style="color: #4b5563; margin: 0 0 8px 0;">✓ <strong>AI-powered red flag detection</strong></p>
                    <p style="color: #4b5563; margin: 0 0 8px 0;">✓ <strong>Hidden cost analysis</strong></p>
                    <p style="color: #4b5563; margin: 0 0 8px 0;">✓ <strong>Negotiation talking points</strong></p>
                    <p style="color: #4b5563; margin: 0 0 8px 0;">✓ <strong>Fair price assessment</strong></p>
                    <p style="color: #4b5563; margin: 0;">✓ <strong>Professional analysis report</strong></p>
                </div>
            </div>
            
            <!-- Social Proof -->
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                <p style="color: #059669; margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
                    Join thousands of protected homeowners
                </p>
                <p style="color: #047857; margin: 0; font-size: 14px;">
                    Average savings: $3,200 per project
                </p>
            </div>
            
            <!-- Final CTA -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/?discount=${discountCode}&utm_source=email&utm_campaign=final_discount" 
                   style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 18px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                    🔒 Claim 20% OFF Before Midnight
                </a>
                <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">
                    Code: ${discountCode} | Expires: Tonight at 11:59 PM
                </p>
            </div>
            
            <!-- Alternative Options -->
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="color: #374151; margin: 0 0 15px 0; font-weight: bold;">
                    Not ready to analyze a quote yet?
                </p>
                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                    • Keep your discount code for when you need it
                </p>
                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                    • Forward this to friends/family planning projects
                </p>
                <p style="color: #6b7280; margin: 0; font-size: 14px;">
                    • Bookmark QuoteEvaluator.com for future use
                </p>
            </div>
            
            <p style="font-size: 16px; color: #374151; margin-top: 25px;">
                Don't let this opportunity slip away,<br>
                The QuoteEvaluator Team
            </p>
            
            <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                P.S. After tonight, you'll pay the full $4.99 price. Save $1.00 while you still can!
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0 0 10px 0;">
                Final reminder about your limited-time discount.
            </p>
            <p style="margin: 0;">
                <a href="#" style="color: #6b7280;">Unsubscribe</a> | 
                <a href="${baseUrl}" style="color: #6b7280;">QuoteEvaluator.com</a>
            </p>
        </div>
    </div>
</body>
</html>`,

    textContent: `
Hi ${firstName},

This is your FINAL REMINDER – your 20% discount expires at midnight tonight.

⏰ LESS THAN 12 HOURS LEFT
Code ${discountCode} expires tonight at 11:59 PM
Save $1.00 on every quote analysis

QUICK REMINDER: WHAT YOU GET
✓ AI-powered red flag detection
✓ Hidden cost analysis  
✓ Negotiation talking points
✓ Fair price assessment
✓ Professional analysis report

JOIN THOUSANDS OF PROTECTED HOMEOWNERS
Average savings: $3,200 per project

Claim 20% OFF Before Midnight: ${baseUrl}/?discount=${discountCode}

NOT READY TO ANALYZE A QUOTE YET?
• Keep your discount code for when you need it
• Forward this to friends/family planning projects  
• Bookmark QuoteEvaluator.com for future use

Don't let this opportunity slip away,
The QuoteEvaluator Team

P.S. After tonight, you'll pay the full $4.99 price. Save $1.00 while you still can!

---
Unsubscribe: [link] | QuoteEvaluator.com
`
  };
}