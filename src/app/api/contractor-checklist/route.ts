import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const source = url.searchParams.get('source');
    const format = url.searchParams.get('format') || 'html';

    console.log('Checklist downloaded:', { email, source, timestamp: new Date().toISOString() });

    if (format === 'pdf') {
      return new NextResponse(
        'PDF generation not implemented yet. Use format=html for HTML version (print to PDF from your browser).',
        { status: 501 }
      );
    }

    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Contractor Quote Protection Guide — QuoteEvaluator.com</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f3f4f6;
            color: #111827;
        }
        .container {
            max-width: 820px;
            margin: 0 auto;
            background: white;
            padding: 48px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 22px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            z-index: 1000;
        }
        .print-button:hover { background: #1d4ed8; }

        h1 { font-size: 32px; font-weight: 800; margin: 0 0 8px; color: #0f172a; line-height: 1.2; }
        h2 { font-size: 22px; font-weight: 700; margin: 40px 0 16px; color: #0f172a; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
        h3 { font-size: 17px; font-weight: 700; margin: 24px 0 10px; color: #0f172a; }
        h4 { font-size: 15px; font-weight: 700; margin: 16px 0 8px; color: #374151; }
        p { margin: 0 0 12px; color: #374151; font-size: 15px; }
        ul, ol { margin: 0 0 14px; padding-left: 22px; color: #374151; }
        li { margin-bottom: 6px; font-size: 14px; }

        .hero {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 40px;
            border-radius: 10px;
            margin-bottom: 32px;
            text-align: center;
        }
        .hero h1 { color: white; font-size: 30px; }
        .hero .subtitle { font-size: 17px; opacity: 0.95; margin: 8px 0 0; }
        .hero .tagline { font-size: 13px; opacity: 0.85; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px; }

        .callout { padding: 18px 22px; border-radius: 8px; margin: 16px 0; border-left: 4px solid; font-size: 14px; }
        .callout-info { background: #eff6ff; border-color: #3b82f6; color: #1e3a8a; }
        .callout-warn { background: #fef3c7; border-color: #f59e0b; color: #78350f; }
        .callout-danger { background: #fef2f2; border-color: #ef4444; color: #7f1d1d; }
        .callout-good { background: #f0fdf4; border-color: #10b981; color: #064e3b; }

        table { width: 100%; border-collapse: collapse; margin: 14px 0 20px; font-size: 14px; }
        th { background: #f3f4f6; text-align: left; padding: 10px 12px; font-weight: 700; color: #111827; border-bottom: 2px solid #e5e7eb; }
        td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; vertical-align: top; }
        tr:last-child td { border-bottom: none; }

        .qa-block { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; margin-bottom: 16px; }
        .qa-block .q { font-weight: 700; color: #0f172a; margin-bottom: 10px; font-size: 15px; }
        .qa-block .answers { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; }
        .qa-block .good { background: #ecfdf5; border-left: 3px solid #10b981; padding: 10px 12px; border-radius: 4px; font-size: 13px; color: #064e3b; }
        .qa-block .bad { background: #fef2f2; border-left: 3px solid #ef4444; padding: 10px 12px; border-radius: 4px; font-size: 13px; color: #7f1d1d; }
        .qa-block .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }

        .worksheet { border: 1px solid #d1d5db; border-radius: 8px; padding: 20px; background: #fafafa; margin: 14px 0 20px; }
        .worksheet-row { display: grid; grid-template-columns: 1fr 130px; gap: 14px; align-items: center; padding: 10px 0; border-bottom: 1px dashed #d1d5db; font-size: 14px; }
        .worksheet-row:last-child { border-bottom: none; }
        .worksheet .scale { color: #6b7280; font-size: 12px; text-align: right; }
        .worksheet-total { margin-top: 14px; padding-top: 14px; border-top: 2px solid #374151; font-weight: 700; display: flex; justify-content: space-between; font-size: 15px; }

        .clause { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 18px; margin-bottom: 12px; }
        .clause .clause-title { font-weight: 700; color: #78350f; font-size: 14px; margin-bottom: 6px; }
        .clause .clause-text { font-size: 13px; color: #57534e; font-style: italic; }

        .project-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px 22px; margin-bottom: 16px; background: white; }
        .project-card h3 { margin-top: 0; color: #1e40af; }

        .payment-schedule { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 14px 0 20px; }
        .payment-step { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 14px 10px; text-align: center; }
        .payment-step .pct { font-size: 22px; font-weight: 800; color: #1e40af; }
        .payment-step .label { font-size: 11px; color: #1e3a8a; margin-top: 4px; font-weight: 600; }

        .cta {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            margin: 40px 0 20px;
        }
        .cta h2 { color: white; border: none; margin-top: 0; }
        .cta p { color: rgba(255,255,255,0.95); font-size: 16px; }
        .cta a { display: inline-block; background: white; color: #1e40af; padding: 14px 32px; border-radius: 8px; font-weight: 700; text-decoration: none; margin-top: 12px; font-size: 15px; }

        .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
        .footer a { color: #2563eb; text-decoration: none; }

        .toc { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px 24px; margin-bottom: 32px; }
        .toc h3 { margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
        .toc ol { margin: 0; padding-left: 22px; }
        .toc li { font-size: 14px; color: #374151; margin-bottom: 4px; }

        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; padding: 20px; border-radius: 0; }
            .print-button { display: none; }
            .cta { break-inside: avoid; }
            .qa-block, .project-card, .worksheet { break-inside: avoid; }
            h2 { break-after: avoid; }
            h3 { break-after: avoid; }
        }

        @media (max-width: 720px) {
            .container { padding: 24px; }
            .qa-block .answers { grid-template-columns: 1fr; }
            .payment-schedule { grid-template-columns: repeat(2, 1fr); }
            .worksheet-row { grid-template-columns: 1fr; gap: 4px; }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">Print or Save as PDF</button>
    <div class="container">

        <div class="hero">
            <h1>The Contractor Quote Protection Guide</h1>
            <p class="subtitle">Benchmarks, scripts, and worksheets used by people who review contractor quotes for a living</p>
            <p class="tagline">QuoteEvaluator.com &middot; Updated for 2025&ndash;2026</p>
        </div>

        <div class="callout callout-info">
            <strong>Why this guide exists:</strong> Most homeowners hire a contractor once every 5&ndash;10 years. Your contractor does this every day. That information asymmetry costs the average homeowner thousands of dollars per project. This guide closes the gap with real numbers, real scripts, and a scoring system you can actually use.
        </div>

        <div class="toc">
            <h3>What&rsquo;s Inside</h3>
            <ol>
                <li>Fair price benchmarks for every major project (2025&ndash;2026 data)</li>
                <li>The 10 questions to ask before signing any contract</li>
                <li>Contractor scoring worksheet (score them from 1&ndash;5 on 10 criteria)</li>
                <li>The standard payment schedule you should insist on</li>
                <li>7 contract clauses homeowners should demand in writing</li>
                <li>Project-specific red flag sheets (kitchen, bath, roof, HVAC, windows)</li>
                <li>What to do if you&rsquo;ve already hired someone bad</li>
            </ol>
        </div>

        <h2>1. Fair Price Benchmarks</h2>
        <p>Before comparing quotes, you need to know the realistic range. These are 2025&ndash;2026 US pricing averages for fully installed projects with mid-range materials. Regional variation of &plusmn;15&ndash;25% is normal.</p>

        <table>
            <thead>
                <tr>
                    <th>Project</th>
                    <th>Typical Range</th>
                    <th>Labor % of Total</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Kitchen remodel (mid-range)</td><td>$30,000&ndash;$75,000</td><td>20&ndash;35%</td></tr>
                <tr><td>Full bathroom renovation</td><td>$15,000&ndash;$35,000</td><td>40&ndash;60%</td></tr>
                <tr><td>Roof replacement (architectural shingles, 2,000 sq ft home)</td><td>$11,000&ndash;$19,000</td><td>40&ndash;55%</td></tr>
                <tr><td>HVAC full replacement (AC + furnace)</td><td>$7,000&ndash;$15,000</td><td>30&ndash;45%</td></tr>
                <tr><td>Window replacement (per window, vinyl mid-range)</td><td>$550&ndash;$900</td><td>35&ndash;50%</td></tr>
                <tr><td>Deck (300 sq ft, pressure-treated)</td><td>$6,000&ndash;$10,500</td><td>50&ndash;65%</td></tr>
                <tr><td>Deck (300 sq ft, composite)</td><td>$10,500&ndash;$16,500</td><td>45&ndash;55%</td></tr>
                <tr><td>Interior painting (2,000 sq ft home)</td><td>$4,000&ndash;$10,000</td><td>70&ndash;85%</td></tr>
                <tr><td>Exterior painting (two-story)</td><td>$5,000&ndash;$10,000</td><td>75&ndash;85%</td></tr>
                <tr><td>Hardwood flooring (installed, per sq ft)</td><td>$10&ndash;$20</td><td>35&ndash;50%</td></tr>
                <tr><td>LVP flooring (installed, per sq ft)</td><td>$5&ndash;$12</td><td>30&ndash;45%</td></tr>
                <tr><td>Fence (6 ft privacy, per linear ft, wood)</td><td>$25&ndash;$45</td><td>45&ndash;60%</td></tr>
                <tr><td>Water heater replacement (tank, 40&ndash;50 gal)</td><td>$1,800&ndash;$3,500</td><td>40&ndash;55%</td></tr>
                <tr><td>Sewer line repair (trenchless)</td><td>$4,000&ndash;$12,000</td><td>35&ndash;50%</td></tr>
            </tbody>
        </table>

        <div class="callout callout-warn">
            <strong>How to use this table:</strong> If you get three quotes and one is <em>40%+ below</em> the others, that contractor is either cutting corners, planning to hit you with change orders, or won&rsquo;t finish the job. If one is <em>30%+ above</em> the others without a clear reason, they&rsquo;re banking on you not knowing the market.
        </div>

        <h2>2. The 10 Questions To Ask Before Signing</h2>
        <p>Ask these in person and write down the answers. A professional contractor welcomes these questions. Anyone who brushes them off is telling you exactly who they are.</p>

        <div class="qa-block">
            <div class="q">1. &ldquo;Are you licensed in this state, and what&rsquo;s your license number?&rdquo;</div>
            <p>Then verify it yourself at your state&rsquo;s contractor licensing board website. Do not skip this step.</p>
            <div class="answers">
                <div class="good"><span class="label">Good Answer</span>Gives you the number without hesitation and offers to send their insurance certificate too.</div>
                <div class="bad"><span class="label">Red Flag</span>&ldquo;I&rsquo;ve been doing this for 20 years, I don&rsquo;t need a license,&rdquo; or changes the subject.</div>
            </div>
        </div>

        <div class="qa-block">
            <div class="q">2. &ldquo;Who is your general liability insurer, and what&rsquo;s the coverage amount?&rdquo;</div>
            <p>Request a COI (certificate of insurance) naming you as an additional insured.</p>
            <div class="answers">
                <div class="good"><span class="label">Good Answer</span>Provides a COI within 24 hours. Minimum $1M general liability is standard for residential work.</div>
                <div class="bad"><span class="label">Red Flag</span>&ldquo;My insurance is private, I can&rsquo;t share it,&rdquo; or promises it later but never delivers.</div>
            </div>
        </div>

        <div class="qa-block">
            <div class="q">3. &ldquo;Will you pull the permits? Are permit costs included in the quote?&rdquo;</div>
            <p>Contractors who skip permits are gambling with your home&rsquo;s resale value and insurance coverage.</p>
            <div class="answers">
                <div class="good"><span class="label">Good Answer</span>&ldquo;Yes, I pull all permits and the cost is itemized as $XXX in the quote.&rdquo;</div>
                <div class="bad"><span class="label">Red Flag</span>&ldquo;We don&rsquo;t need permits for this,&rdquo; or asks you to pull the permit in your name (called &ldquo;homeowner permits&rdquo; &mdash; shifts liability to you).</div>
            </div>
        </div>

        <div class="qa-block">
            <div class="q">4. &ldquo;Can you provide three references from projects you&rsquo;ve completed in the last 12 months?&rdquo;</div>
            <p>Old references mean nothing. You want recent work. Actually call the references.</p>
            <div class="answers">
                <div class="good"><span class="label">Good Answer</span>Provides names, phone numbers, and addresses (so you can drive by). Encourages you to call them.</div>
                <div class="bad"><span class="label">Red Flag</span>Only gives you out-of-state references, old references, or says &ldquo;my customers don&rsquo;t want to be bothered.&rdquo;</div>
            </div>
        </div>

        <div class="qa-block">
            <div class="q">5. &ldquo;Is the crew doing the work your employees, or subcontractors?&rdquo;</div>
            <p>Either is fine, but you need to know. Subcontractors often mean lien exposure unless lien waivers are obtained.</p>
            <div class="answers">
                <div class="good"><span class="label">Good Answer</span>Clearly identifies which trades are in-house vs. subbed, and commits to providing lien waivers at each payment.</div>
                <div class="bad"><span class="label">Red Flag</span>&ldquo;Don&rsquo;t worry about that&rdquo; or can&rsquo;t name the subs they&rsquo;re using.</div>
            </div>
        </div>

        <div class="qa-block">
            <div class="q">6. &ldquo;What&rsquo;s your payment schedule?&rdquo;</div>
            <p>A fair payment schedule ties payments to milestones, not time.</p>
            <div class="answers">
                <div class="good"><span class="label">Good Answer</span>10% deposit, progress payments tied to specific milestones, 10% retainage withheld until final walkthrough.</div>
                <div class="bad"><span class="label">Red Flag</span>50%+ upfront, or &ldquo;half now, half when I&rsquo;m done.&rdquo; Never pay a contractor half their fee before they start.</div>
            </div>
        </div>

        <div class="qa-block">
            <div class="q">7. &ldquo;What happens if you find unexpected problems during the job?&rdquo;</div>
            <p>This is the #1 source of disputes. Nail down the change order process before work starts.</p>
            <div class="answers">
                <div class="good"><span class="label">Good Answer</span>&ldquo;I stop work, show you the problem, give you a written change order with cost and timeline impact, and wait for your signed approval before continuing.&rdquo;</div>
                <div class="bad"><span class="label">Red Flag</span>&ldquo;We&rsquo;ll sort it out when it comes up&rdquo; or verbal change order process.</div>
            </div>
        </div>

        <div class="qa-block">
            <div class="q">8. &ldquo;What specific brands and product lines will you use?&rdquo;</div>
            <p>Vague material specs are how contractors downgrade after you sign. Get model numbers.</p>
            <div class="answers">
                <div class="good"><span class="label">Good Answer</span>Gives you exact brands, product lines, and model numbers (e.g., &ldquo;Andersen 100 Series&rdquo; not &ldquo;vinyl windows&rdquo;).</div>
                <div class="bad"><span class="label">Red Flag</span>&ldquo;Industry standard materials&rdquo; or &ldquo;whatever&rsquo;s in stock.&rdquo; Generic language = generic materials.</div>
            </div>
        </div>

        <div class="qa-block">
            <div class="q">9. &ldquo;What warranty do you provide on your workmanship, and is it in writing?&rdquo;</div>
            <p>Manufacturer warranties cover products. Workmanship warranties cover the installation &mdash; which is where most problems live.</p>
            <div class="answers">
                <div class="good"><span class="label">Good Answer</span>1&ndash;2 years minimum on workmanship, in writing, with clear terms.</div>
                <div class="bad"><span class="label">Red Flag</span>&ldquo;I stand behind my work&rdquo; with nothing in writing, or passes you off to the manufacturer warranty only.</div>
            </div>
        </div>

        <div class="qa-block">
            <div class="q">10. &ldquo;What&rsquo;s the written project timeline with start and completion dates?&rdquo;</div>
            <p>A contractor juggling too many jobs will avoid committing to dates. Insist on them in the contract.</p>
            <div class="answers">
                <div class="good"><span class="label">Good Answer</span>Provides start date, substantial completion date, and delay provisions in the written contract.</div>
                <div class="bad"><span class="label">Red Flag</span>&ldquo;Hard to say, depends on the weather,&rdquo; or refuses to put dates in writing.</div>
            </div>
        </div>

        <h2>3. Contractor Scoring Worksheet</h2>
        <p>After interviewing each contractor, score them 1&ndash;5 on these 10 criteria. Anything below 35/50 is a pass. Print this page for each contractor you&rsquo;re considering.</p>

        <div class="worksheet">
            <div class="worksheet-row"><span>1. License and insurance verified independently</span><span class="scale">1 2 3 4 5</span></div>
            <div class="worksheet-row"><span>2. Written, itemized quote with material specifications</span><span class="scale">1 2 3 4 5</span></div>
            <div class="worksheet-row"><span>3. Quote matches fair price benchmarks for this project</span><span class="scale">1 2 3 4 5</span></div>
            <div class="worksheet-row"><span>4. Provided references from the last 12 months</span><span class="scale">1 2 3 4 5</span></div>
            <div class="worksheet-row"><span>5. Willing to pull all permits and include inspection fees</span><span class="scale">1 2 3 4 5</span></div>
            <div class="worksheet-row"><span>6. Fair payment schedule (&le;30% deposit, milestone-based)</span><span class="scale">1 2 3 4 5</span></div>
            <div class="worksheet-row"><span>7. Written change order process before work begins</span><span class="scale">1 2 3 4 5</span></div>
            <div class="worksheet-row"><span>8. Written workmanship warranty (1+ years)</span><span class="scale">1 2 3 4 5</span></div>
            <div class="worksheet-row"><span>9. Written timeline with start and completion dates</span><span class="scale">1 2 3 4 5</span></div>
            <div class="worksheet-row"><span>10. Communication: prompt responses, clear answers</span><span class="scale">1 2 3 4 5</span></div>
            <div class="worksheet-total"><span>Total Score</span><span>____ / 50</span></div>
        </div>

        <div class="callout callout-info">
            <strong>Scoring guide:</strong> 45&ndash;50 = hire with confidence. 40&ndash;44 = solid choice, verify weak spots. 35&ndash;39 = proceed carefully, get another quote for comparison. Below 35 = pass, keep looking.
        </div>

        <h2>4. The Standard Payment Schedule</h2>
        <p>For any project over $5,000, this is the payment structure you should insist on. It protects you from contractor cash-grab walk-offs and gives you leverage until the work is truly complete.</p>

        <div class="payment-schedule">
            <div class="payment-step"><div class="pct">10%</div><div class="label">Deposit at signing</div></div>
            <div class="payment-step"><div class="pct">30%</div><div class="label">Materials delivered</div></div>
            <div class="payment-step"><div class="pct">30%</div><div class="label">Mid-project milestone</div></div>
            <div class="payment-step"><div class="pct">20%</div><div class="label">Substantial completion</div></div>
            <div class="payment-step"><div class="pct">10%</div><div class="label">Final walkthrough</div></div>
        </div>

        <div class="callout callout-danger">
            <strong>Never do this:</strong> Pay more than 30% before materials are on-site. Pay in cash. Pay by wire transfer. Release the final 10% before you&rsquo;ve done a thorough walkthrough and all punch-list items are resolved in writing. Your final retainage is the <em>only</em> leverage you have once work begins.
        </div>

        <h2>5. Contract Clauses You Should Demand</h2>
        <p>Every one of these belongs in your written contract. Copy this language or send it to your contractor and ask them to incorporate it.</p>

        <div class="clause">
            <div class="clause-title">1. Change Order Clause</div>
            <div class="clause-text">&ldquo;No change order shall be binding unless documented in writing, signed by both parties, and includes the specific cost impact and timeline adjustment. Verbal change orders are not authorized.&rdquo;</div>
        </div>

        <div class="clause">
            <div class="clause-title">2. Lien Waiver Clause</div>
            <div class="clause-text">&ldquo;Contractor shall provide conditional lien waivers from all subcontractors and suppliers with each progress payment, and unconditional lien waivers prior to final payment.&rdquo;</div>
        </div>

        <div class="clause">
            <div class="clause-title">3. Retainage Clause</div>
            <div class="clause-text">&ldquo;Owner shall withhold 10% retainage until: (a) all punch-list items are complete; (b) final inspection has passed; (c) all lien waivers have been received; (d) owner has conducted and signed off on a final walkthrough.&rdquo;</div>
        </div>

        <div class="clause">
            <div class="clause-title">4. Materials Specification Clause</div>
            <div class="clause-text">&ldquo;Contractor shall use the exact brands, product lines, and model numbers specified in the attached materials list. Any substitution requires written owner approval and shall not reduce the contract price unless the substitute is lower cost.&rdquo;</div>
        </div>

        <div class="clause">
            <div class="clause-title">5. Workmanship Warranty Clause</div>
            <div class="clause-text">&ldquo;Contractor warrants all workmanship for a period of [1&ndash;2] years from substantial completion. Warranty claims shall be remedied at contractor&rsquo;s expense within 30 days of written notice.&rdquo;</div>
        </div>

        <div class="clause">
            <div class="clause-title">6. Cleanup and Site Protection Clause</div>
            <div class="clause-text">&ldquo;Contractor is responsible for daily cleanup, protection of existing surfaces (floors, furniture, landscaping), and final debris removal including haul-away. Dumpster costs are included in the contract price.&rdquo;</div>
        </div>

        <div class="clause">
            <div class="clause-title">7. Delay and Liquidated Damages Clause</div>
            <div class="clause-text">&ldquo;Substantial completion shall occur no later than [date]. For each day of delay beyond that date not caused by owner or force majeure, contractor shall credit owner $[50&ndash;200] per day against the final payment.&rdquo;</div>
        </div>

        <h2>6. Project-Specific Red Flag Sheets</h2>
        <p>Different projects have different failure modes. Here&rsquo;s what to watch for on the most common home improvements.</p>

        <div class="project-card">
            <h3>Kitchen Remodel</h3>
            <ul>
                <li>Lump-sum cabinet pricing with no linear foot or per-cabinet breakdown</li>
                <li>&ldquo;Allowances&rdquo; for countertops, tile, or fixtures that shift cost risk to you</li>
                <li>No demo and haul-away line item (or hidden inside labor)</li>
                <li>No mention of permits for electrical or plumbing changes</li>
                <li>Labor above 35% of total without explanation</li>
            </ul>
        </div>

        <div class="project-card">
            <h3>Bathroom Renovation</h3>
            <ul>
                <li><strong>No waterproofing line item</strong> (Kerdi, RedGard, Hydroban, or equivalent) &mdash; biggest red flag in bathroom work</li>
                <li>Tile installation without cement/backer board listed separately</li>
                <li>No exhaust fan upgrade or ventilation to exterior</li>
                <li>Plumbing &ldquo;allowance&rdquo; instead of itemized rough-in and fixture install</li>
                <li>Unrealistic 5&ndash;7 day timeline for a full gut renovation</li>
            </ul>
        </div>

        <div class="project-card">
            <h3>Roof Replacement</h3>
            <ul>
                <li>Door-to-door &ldquo;storm chaser&rdquo; contractors soliciting after weather events</li>
                <li>Vague shingle specs &mdash; you need brand, product line, and color</li>
                <li>No decking repair rate specified (should be $75&ndash;$125 per plywood sheet)</li>
                <li>Not a certified installer for the shingle manufacturer (voids warranty)</li>
                <li>No mention of ice and water shield at eaves and valleys</li>
                <li>Missing drip edge line item (required by code in most jurisdictions)</li>
            </ul>
        </div>

        <div class="project-card">
            <h3>HVAC Replacement</h3>
            <ul>
                <li><strong>No Manual J load calculation</strong> &mdash; sizing by &ldquo;what you had before&rdquo; is industry malpractice</li>
                <li>Equipment listed without exact model numbers, SEER2 ratings, or AFUE ratings</li>
                <li>Reusing old refrigerant lines when switching refrigerant types</li>
                <li>No ductwork inspection or mention of sealing</li>
                <li>&ldquo;This price is only good today&rdquo; high-pressure tactics</li>
            </ul>
        </div>

        <div class="project-card">
            <h3>Window Replacement</h3>
            <ul>
                <li>In-home sales presentations with huge &ldquo;today only&rdquo; discounts (the discounted price is still inflated)</li>
                <li>No specification of insert vs. full-frame installation</li>
                <li>Generic &ldquo;vinyl windows&rdquo; with no brand or product line</li>
                <li>No U-factor or SHGC ratings listed</li>
                <li>Vinyl windows quoted above $1,200 each (overpriced unless custom or triple-pane)</li>
                <li>&ldquo;Lifetime warranty&rdquo; claims without the actual warranty document attached</li>
            </ul>
        </div>

        <h2>7. If You&rsquo;ve Already Hired a Bad Contractor</h2>
        <p>If you&rsquo;re reading this after signing and the project is already going sideways, here&rsquo;s a concrete action plan in the order you should take the steps.</p>

        <ol>
            <li><strong>Stop paying.</strong> Do not release any additional funds until the situation is assessed. Your remaining payments are your only leverage.</li>
            <li><strong>Document everything.</strong> Photos and video of the current state. Copies of all contracts, change orders, emails, and text messages. A written timeline of what was promised vs. what happened.</li>
            <li><strong>Send a written demand letter.</strong> Certified mail, return receipt. Specify the contract terms they&rsquo;ve violated, what you want fixed, and a deadline (typically 10&ndash;14 days).</li>
            <li><strong>File with your state contractor licensing board.</strong> Every state has one. Search &ldquo;[your state] contractor license complaint.&rdquo; Licensing boards take complaints seriously because contractors need their license to keep working.</li>
            <li><strong>File with the Better Business Bureau and your state Attorney General&rsquo;s consumer protection division.</strong> These create a public record and often trigger contractor response.</li>
            <li><strong>If the contractor has subs on the job, get lien waivers before paying anyone else.</strong> Unpaid subs can place a mechanic&rsquo;s lien on your home even if you paid the general contractor.</li>
            <li><strong>Consult a construction attorney.</strong> Initial consultations are often free or $150&ndash;$350. For projects over $25,000, this is money well spent. Many will send a demand letter on letterhead for a flat fee.</li>
            <li><strong>Check your homeowner&rsquo;s insurance.</strong> Some policies cover damage caused by negligent contractors. Worth a call.</li>
            <li><strong>Small claims court.</strong> For disputes under your state&rsquo;s small claims limit (usually $5,000&ndash;$15,000), you can file without an attorney. Filing fees are typically $30&ndash;$100.</li>
        </ol>

        <div class="callout callout-good">
            <strong>Key insight:</strong> Most bad contractor situations are resolved at step 3 or 4. The demand letter and licensing board complaint are usually enough to get a negligent contractor to fix their work or refund your money. Don&rsquo;t skip straight to lawyers &mdash; the paper trail you build in steps 1&ndash;4 is what wins cases later if it does escalate.
        </div>

        <div class="cta">
            <h2>Got a quote you want a second opinion on?</h2>
            <p>Upload your contractor quote and our AI will break down every line item, flag red flags against these benchmarks, and tell you whether the pricing is fair for your area. It takes 60 seconds and it&rsquo;s free.</p>
            <a href="https://quoteevaluator.com">Analyze My Quote &rarr;</a>
        </div>

        <div class="callout callout-info">
            <strong>Want to go deeper on a specific project?</strong> We publish detailed cost guides for every major home improvement at <a href="https://quoteevaluator.com/guides" style="color: #1e40af;">quoteevaluator.com/guides</a> &mdash; kitchens, bathrooms, roofing, HVAC, decks, flooring, windows, fences, painting, and plumbing.
        </div>

        <div class="footer">
            <p>&copy; 2026 QuoteEvaluator.com &middot; Benchmarks updated for 2025&ndash;2026 US market pricing.</p>
            <p>This guide is for educational purposes. Always consult with licensed professionals for specific legal or construction situations.</p>
        </div>

    </div>

    <script>
        if (typeof gtag !== 'undefined') {
            gtag('event', 'checklist_viewed', {
                'event_category': 'lead_magnet',
                'event_label': '${source || 'direct'}',
                'email': '${email || 'unknown'}'
            });
        }

        var printBtn = document.querySelector('.print-button');
        if (printBtn) {
            printBtn.addEventListener('click', function() {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'checklist_printed', {
                        'event_category': 'lead_magnet',
                        'event_label': '${source || 'direct'}',
                        'email': '${email || 'unknown'}'
                    });
                }
            });
        }
    </script>
</body>
</html>`;

    return new NextResponse(fullHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'inline; filename="contractor-quote-protection-guide.html"'
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
