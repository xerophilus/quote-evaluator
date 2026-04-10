export interface GuideFAQ {
  question: string;
  answer: string;
}

export interface GuideSection {
  heading: string;
  level: 2 | 3;
  content: string; // HTML content
}

export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroDescription: string;
  sections: GuideSection[];
  faqs: GuideFAQ[];
  relatedGuides: string[];
  lastUpdated: string;
}

export const guidesData: Record<string, Guide> = {
  'kitchen-remodel-quote-breakdown': {
    slug: 'kitchen-remodel-quote-breakdown',
    title: 'Kitchen Remodel Quote Breakdown: What Every Line Item Should Cost',
    metaTitle: 'Kitchen Remodel Quote Breakdown (2025-2026) | What Every Line Item Costs',
    metaDescription: 'Understand every line item on your kitchen remodel quote. Real cost ranges for cabinets, countertops, labor, plumbing, and electrical — plus red flags to watch for.',
    heroDescription: 'A kitchen remodel is one of the biggest checks you\'ll ever write for your home. The average mid-range kitchen renovation runs $30,000–$75,000, and quotes can vary wildly between contractors. Here\'s how to read yours like a pro.',
    lastUpdated: '2025-12-15',
    relatedGuides: ['bathroom-renovation-red-flags', 'flooring-installation-cost-breakdown', 'plumbing-estimate-what-to-expect'],
    sections: [
      {
        heading: 'What a Typical Kitchen Remodel Actually Costs',
        level: 2,
        content: `<p>In 2025–2026, here's what you should expect to see on a properly itemized kitchen remodel quote:</p>
<ul>
<li><strong>Cabinets (30–35% of budget):</strong> Stock cabinets run $5,000–$12,000. Semi-custom hits $12,000–$25,000. Full custom can exceed $40,000. If your quote just says "cabinets" with a lump sum, ask for a breakdown by linear foot.</li>
<li><strong>Countertops (10–15%):</strong> Laminate runs $10–$40/sq ft installed. Quartz is $50–$120/sq ft. Granite lands at $40–$100/sq ft. Natural marble starts at $75/sq ft and climbs fast.</li>
<li><strong>Labor (20–35%):</strong> General contractor labor typically runs $50–$85/hour, but most quotes price this as a percentage of materials or a flat project fee. If labor exceeds 35% of the total, ask why.</li>
<li><strong>Appliances (10–20%):</strong> Budget packages run $3,000–$6,000. Mid-range lands at $6,000–$12,000. Pro-grade appliances can add $15,000–$30,000+.</li>
<li><strong>Plumbing (5–10%):</strong> Moving a sink or adding a dishwasher line typically costs $1,500–$4,000. A full re-pipe of the kitchen area can hit $5,000–$8,000.</li>
<li><strong>Electrical (5–10%):</strong> Updating wiring and adding outlets runs $2,000–$5,000. Adding under-cabinet lighting adds $1,000–$3,000.</li>
<li><strong>Flooring (5–7%):</strong> Typically $1,500–$5,000 for the kitchen area depending on material choice.</li>
</ul>`
      },
      {
        heading: 'Line Items That Should Be on Every Kitchen Quote',
        level: 2,
        content: `<p>A professional kitchen remodel quote should include all of these. If any are missing, you're likely going to see them appear as "change orders" later — and they won't be cheaper.</p>
<ul>
<li><strong>Demo and haul-away:</strong> $1,500–$4,000. This covers removing your existing cabinets, countertops, flooring, and disposal fees. Some contractors bury this cost; others lowball the quote by leaving it out entirely.</li>
<li><strong>Permits and inspections:</strong> $500–$2,000 depending on your municipality. If your contractor says "we don't need permits," that's a red flag — most kitchen remodels involving plumbing or electrical changes require them.</li>
<li><strong>Dumpster rental:</strong> $400–$800 for a 10-yard dumpster. Sometimes included in demo costs, sometimes separate.</li>
<li><strong>Backsplash:</strong> $800–$3,500 depending on material and complexity. Subway tile is budget-friendly; custom mosaic or slab backsplashes cost significantly more.</li>
<li><strong>Paint and finish work:</strong> $500–$2,000. Often overlooked in quotes, but someone has to patch, prime, and paint the walls after demo.</li>
</ul>`
      },
      {
        heading: 'Red Flags in Kitchen Remodel Quotes',
        level: 2,
        content: `<p>After reviewing thousands of kitchen remodel quotes, these are the patterns that consistently signal problems:</p>
<ul>
<li><strong>No itemized breakdown:</strong> A quote that just says "Kitchen Remodel — $45,000" is not a quote, it's a guess. Walk away.</li>
<li><strong>"Allowances" for everything:</strong> When a contractor lists "$5,000 allowance for countertops," they're shifting the risk to you. If the countertops actually cost $8,000, guess who pays the difference?</li>
<li><strong>No timeline:</strong> A professional contractor includes a project schedule. "6–8 weeks" is fine. No mention of timeline at all means they're juggling too many jobs.</li>
<li><strong>Suspiciously low numbers:</strong> If one quote is 40%+ below the others, the contractor is either cutting corners, planning to hit you with change orders, or won't finish the job.</li>
<li><strong>100% upfront payment:</strong> Standard payment schedules are 10–30% deposit, progress payments at milestones, and 10% held until final walkthrough. Anyone demanding more than 50% upfront is a risk.</li>
</ul>`
      },
      {
        heading: 'How to Compare Kitchen Remodel Quotes',
        level: 2,
        content: `<p>Get at least three quotes and compare them side by side. Here's what to look for:</p>
<ul>
<li><strong>Scope match:</strong> Make sure all three contractors are quoting the same work. One might include new flooring while another doesn't.</li>
<li><strong>Material specifications:</strong> "Quartz countertops" is too vague. Which brand? Which grade? A $60/sq ft quartz and a $110/sq ft quartz are not the same product.</li>
<li><strong>Labor rates:</strong> If one contractor's labor is significantly cheaper, check their license, insurance, and reviews. You get what you pay for.</li>
<li><strong>Warranty terms:</strong> Good contractors offer 1–2 year workmanship warranties. If there's no warranty mentioned, ask about it in writing.</li>
</ul>
<p>The lowest quote is rarely the best quote. Focus on value: fair pricing, clear communication, proper licensing, and a detailed scope of work.</p>`
      }
    ],
    faqs: [
      {
        question: 'How much does a kitchen remodel cost in 2025?',
        answer: 'A mid-range kitchen remodel costs $30,000–$75,000 in 2025. Minor cosmetic updates start around $15,000, while high-end full gut renovations can exceed $100,000. The final cost depends on your kitchen size, material choices, and whether you\'re moving plumbing or electrical.'
      },
      {
        question: 'What percentage should labor be on a kitchen remodel quote?',
        answer: 'Labor typically represents 20–35% of a kitchen remodel quote. If labor exceeds 35%, ask the contractor to explain why. Complex projects involving structural changes or custom work may justify higher labor costs.'
      },
      {
        question: 'Should I pay a kitchen contractor upfront?',
        answer: 'Never pay more than 30% upfront for a kitchen remodel. A standard payment schedule is 10–30% deposit, progress payments at defined milestones, and 10% withheld until the final walkthrough is complete and you\'re satisfied with the work.'
      },
      {
        question: 'How long does a kitchen remodel take?',
        answer: 'A typical mid-range kitchen remodel takes 6–12 weeks. Minor updates may take 3–4 weeks. Full gut renovations with structural changes can take 3–5 months. Your contractor should provide a written timeline with milestones.'
      }
    ]
  },

  'how-much-should-a-roof-replacement-cost': {
    slug: 'how-much-should-a-roof-replacement-cost',
    title: 'How Much Should a Roof Replacement Cost? A Complete Pricing Guide',
    metaTitle: 'Roof Replacement Cost Guide (2025-2026) | What You Should Actually Pay',
    metaDescription: 'Find out what a roof replacement should actually cost in 2025-2026. Real pricing per square for asphalt, metal, and tile — plus what to watch for in roofing quotes.',
    heroDescription: 'Roof replacement quotes are some of the most confusing estimates homeowners receive. Between "squares," underlayment specs, and flashing charges, it\'s hard to tell if you\'re getting a fair deal. Let\'s break down what you should actually be paying.',
    lastUpdated: '2025-12-15',
    relatedGuides: ['window-replacement-cost-guide', 'fence-installation-cost-guide', 'painting-contractor-quote-tips'],
    sections: [
      {
        heading: 'Roof Replacement Cost by Material',
        level: 2,
        content: `<p>Roofing is priced per "square" — a 10×10 foot area (100 sq ft). A typical home has 20–35 squares. Here's what you should expect to pay per square, fully installed, in 2025–2026:</p>
<ul>
<li><strong>3-tab asphalt shingles:</strong> $350–$550/square. The budget option with a 15–20 year lifespan. Fine for starter homes or rentals, but they look dated fast.</li>
<li><strong>Architectural asphalt shingles:</strong> $450–$750/square. The most popular choice for good reason — they last 25–30 years, look better, and handle wind better than 3-tab.</li>
<li><strong>Standing seam metal:</strong> $800–$1,400/square. Lasts 40–60 years, excellent in snow and wind. Higher upfront cost but often the best long-term value.</li>
<li><strong>Concrete tile:</strong> $800–$1,200/square. Popular in the Southwest. Heavy — your structure needs to support the weight. Lasts 50+ years.</li>
<li><strong>Cedar shake:</strong> $700–$1,100/square. Beautiful but high-maintenance. Requires regular treatment and has fire concerns in some areas.</li>
<li><strong>Slate:</strong> $1,500–$3,000/square. The premium option. Lasts 75–100+ years but requires specialized installers and structural support.</li>
</ul>
<p>For a typical 2,000 sq ft home (roughly 25 squares), a full architectural shingle replacement runs <strong>$11,000–$19,000</strong>. Metal roofing for the same home runs <strong>$20,000–$35,000</strong>.</p>`
      },
      {
        heading: 'What Should Be Included in a Roofing Quote',
        level: 2,
        content: `<p>A complete roofing quote should itemize all of these — not bundle them into one mysterious number:</p>
<ul>
<li><strong>Tear-off and disposal:</strong> $1,000–$3,000. Removing the old roof and disposing of debris. Some areas allow a second layer over existing shingles, but it's not ideal.</li>
<li><strong>Decking repair:</strong> Quoted per sheet of plywood at $75–$125/sheet. A good contractor will note they'll inspect decking after tear-off and charge for replacements as needed.</li>
<li><strong>Underlayment:</strong> $0.50–$1.50/sq ft. Synthetic underlayment is standard now and worth the upgrade over felt paper. Ice and water shield should be used at eaves and valleys.</li>
<li><strong>Flashing:</strong> $500–$1,500. Critical around chimneys, vents, skylights, and wall-to-roof transitions. Reusing old flashing is a common corner that gets cut.</li>
<li><strong>Ridge vent and ventilation:</strong> $400–$1,000. Proper attic ventilation extends roof life and reduces energy costs. If it's not on the quote, ask about it.</li>
<li><strong>Drip edge:</strong> $300–$600. Required by code in most jurisdictions. If it's missing from the quote, the contractor might not be pulling permits.</li>
<li><strong>Cleanup and haul-away:</strong> Should be included. Magnetic nail sweeps of your yard and driveway are standard practice.</li>
</ul>`
      },
      {
        heading: 'Red Flags in Roofing Quotes',
        level: 2,
        content: `<ul>
<li><strong>"Storm chaser" contractors:</strong> If someone knocks on your door after a storm offering a free inspection and an insurance claim, be cautious. Many are fly-by-night operations that do shoddy work and disappear.</li>
<li><strong>No manufacturer warranty registration:</strong> A good roofer installs shingles per the manufacturer's specs and registers the warranty. Ask if they're a certified installer for the brand they're using.</li>
<li><strong>Vague material specs:</strong> "Asphalt shingles" isn't enough. You need the manufacturer, product line, and color. The difference between CertainTeed Landmark and GAF Royal Sovereign is significant.</li>
<li><strong>No mention of permits:</strong> Most municipalities require permits for roof replacements. If your contractor doesn't pull permits, their work won't be inspected, and you could have issues selling your home.</li>
<li><strong>Extremely fast timeline:</strong> A residential roof replacement typically takes 1–3 days for a crew of 4–6. If someone quotes 4 hours, they're cutting corners.</li>
</ul>`
      },
      {
        heading: 'Questions to Ask Your Roofer Before Signing',
        level: 2,
        content: `<ul>
<li>Are you licensed and insured in this state? (Verify independently.)</li>
<li>Will you pull the permits, and are inspection costs included?</li>
<li>What happens if you find damaged decking after tear-off? What's the per-sheet charge?</li>
<li>What specific underlayment and flashing materials will you use?</li>
<li>What manufacturer warranty will I receive, and are you a certified installer?</li>
<li>What is your workmanship warranty, and is it in writing?</li>
<li>Who is the project lead, and how do I reach them during the job?</li>
</ul>
<p>A contractor who can't answer these clearly isn't someone you want on your roof.</p>`
      }
    ],
    faqs: [
      {
        question: 'How much does a roof replacement cost in 2025?',
        answer: 'A typical roof replacement costs $8,000–$19,000 for asphalt shingles on a standard single-family home. Metal roofing runs $20,000–$35,000. The exact cost depends on roof size, pitch, material, and your location.'
      },
      {
        question: 'How long does a roof replacement take?',
        answer: 'Most residential roof replacements take 1–3 days with a full crew. Complex roofs with multiple valleys, dormers, or steep pitches may take 3–5 days. Weather delays can extend the timeline.'
      },
      {
        question: 'Should I repair or replace my roof?',
        answer: 'If your roof is over 20 years old, has multiple leaks, or shows widespread damage, replacement is usually more cost-effective than repairs. If damage is localized to one area and the rest of the roof is in good shape, a repair ($300–$1,500) may suffice.'
      },
      {
        question: 'Can I put new shingles over old ones?',
        answer: 'While some areas allow a second layer of shingles, it\'s generally not recommended. Layering hides underlying damage, adds weight to your structure, voids some warranties, and makes future inspections harder. A full tear-off is worth the extra $1,000–$3,000.'
      }
    ]
  },

  'bathroom-renovation-red-flags': {
    slug: 'bathroom-renovation-red-flags',
    title: 'Bathroom Renovation Red Flags: What Bad Quotes Look Like',
    metaTitle: 'Bathroom Renovation Red Flags (2025) | Spot Bad Contractor Quotes',
    metaDescription: 'Learn to spot red flags in bathroom renovation quotes. We review what bad quotes look like, typical cost ranges, and how to protect yourself from overcharges.',
    heroDescription: 'Bathroom renovations are the #1 source of contractor disputes in residential remodeling. The combination of plumbing, electrical, tile, and waterproofing means there\'s a lot that can go wrong — and a lot of places for dishonest contractors to hide costs.',
    lastUpdated: '2025-12-15',
    relatedGuides: ['kitchen-remodel-quote-breakdown', 'plumbing-estimate-what-to-expect', 'flooring-installation-cost-breakdown'],
    sections: [
      {
        heading: 'What a Bathroom Renovation Should Cost',
        level: 2,
        content: `<p>Before you can spot a bad quote, you need to know the realistic range. In 2025–2026:</p>
<ul>
<li><strong>Powder room refresh (cosmetic only):</strong> $3,000–$8,000. New vanity, toilet, mirror, paint, and fixtures without moving plumbing.</li>
<li><strong>Standard full bathroom remodel:</strong> $15,000–$35,000. New tile, vanity, tub/shower, toilet, lighting, and fixtures.</li>
<li><strong>Primary bathroom renovation:</strong> $25,000–$60,000. Larger space, double vanity, walk-in shower, freestanding tub, heated floors.</li>
<li><strong>High-end/luxury bathroom:</strong> $50,000–$100,000+. Custom everything, premium materials, spa features, smart home integration.</li>
</ul>`
      },
      {
        heading: 'The 8 Biggest Red Flags in Bathroom Quotes',
        level: 2,
        content: `<p>These are the warning signs we see most often when reviewing bathroom renovation quotes:</p>`
      },
      {
        heading: '1. No Waterproofing Line Item',
        level: 3,
        content: `<p>This is the single biggest red flag. Waterproofing is the most critical part of any shower or tub surround installation. If your quote doesn't specifically mention a waterproofing membrane (like Kerdi, RedGard, or Hydroban), your contractor is either planning to skip it or doesn't understand proper bathroom construction.</p>
<p>Proper waterproofing adds $500–$1,500 to a bathroom quote. Skipping it leads to mold, rot, and a complete tearout within 3–5 years — a $10,000+ problem.</p>`
      },
      {
        heading: '2. Lump-Sum Tile Pricing',
        level: 3,
        content: `<p>Tile should be quoted per square foot, including material and labor separately. "Tile work — $6,000" tells you nothing. What you need to see:</p>
<ul>
<li>Tile material cost per sq ft ($3–$25+ depending on material)</li>
<li>Tile labor cost per sq ft ($8–$15 for standard, $15–$25 for complex patterns)</li>
<li>Backer board installation ($3–$5/sq ft)</li>
<li>Grout and thin-set materials ($200–$500)</li>
</ul>`
      },
      {
        heading: '3. No Mention of Cement Board or Backer Board',
        level: 3,
        content: `<p>Tile in wet areas must go on cement board (like Durock, Hardie, or Kerdi Board), never directly on drywall. If your quote mentions tile installation but not backer board, the contractor either forgot it or plans to take a shortcut that will fail.</p>`
      },
      {
        heading: '4. Plumbing "Allowance" Instead of Actual Pricing',
        level: 3,
        content: `<p>A "$2,000 plumbing allowance" is a red flag because it shifts cost risk to you. Instead, the quote should specify:</p>
<ul>
<li>Rough-in plumbing for new fixture locations: $1,500–$4,000</li>
<li>Fixture installation (each): $200–$500</li>
<li>Valve replacement: $150–$350 each</li>
<li>Moving drain locations: $500–$2,000 per drain</li>
</ul>`
      },
      {
        heading: '5. Missing Ventilation Upgrade',
        level: 3,
        content: `<p>Building codes require bathroom exhaust fans vented to the exterior. If your bathroom is being renovated and the existing fan is inadequate or vents into the attic, this should be addressed. A proper exhaust fan installation runs $250–$600. Ignoring it leads to moisture problems and mold.</p>`
      },
      {
        heading: '6. No Separate Line for Demolition',
        level: 3,
        content: `<p>Bathroom demo is messy, time-consuming, and generates a lot of waste. It should be a separate line item: $1,000–$3,000 depending on bathroom size and what's being removed. Contractors who don't list it separately often underestimate the work and rush through it.</p>`
      },
      {
        heading: '7. Unrealistic Timeline',
        level: 3,
        content: `<p>A standard full bathroom renovation takes 2–4 weeks. If a contractor promises 5 days for a full gut renovation, they're either bringing a massive crew (unlikely for a bathroom) or planning to cut corners on things like waterproofing cure times and grout setting.</p>`
      },
      {
        heading: '8. No Scope of Work Document',
        level: 3,
        content: `<p>The quote itself is not the contract. You need a detailed scope of work that specifies every material, finish, fixture model number, and inclusion/exclusion. Without it, "bathroom renovation" could mean very different things to you and your contractor.</p>`
      },
      {
        heading: 'Protecting Yourself on Bathroom Projects',
        level: 2,
        content: `<ul>
<li>Get 3 quotes minimum and compare scope, not just price</li>
<li>Ask to see the contractor's bathroom-specific portfolio — not just general remodeling</li>
<li>Verify their plumber is licensed (even if subcontracted)</li>
<li>Insist on a written warranty for waterproofing (minimum 5 years)</li>
<li>Never agree to more than 25% deposit</li>
<li>Include a clause requiring written approval for any change orders</li>
</ul>`
      }
    ],
    faqs: [
      {
        question: 'How much does a bathroom renovation cost in 2025?',
        answer: 'A standard full bathroom renovation costs $15,000–$35,000 in 2025. Cosmetic updates start around $3,000–$8,000, while luxury primary bathroom renovations can exceed $60,000. The biggest cost variables are tile selection, plumbing changes, and fixture quality.'
      },
      {
        question: 'What is the most expensive part of a bathroom remodel?',
        answer: 'Labor and tile work are typically the most expensive parts, together accounting for 40–60% of the total cost. Plumbing changes (moving drains or supply lines) are the biggest cost escalator — they can add $3,000–$8,000 to a project.'
      },
      {
        question: 'How do I know if my bathroom contractor is cutting corners?',
        answer: 'Key signs include: no waterproofing membrane in wet areas, tile installed directly on drywall, no exhaust fan or improper venting, using silicone caulk instead of proper waterproofing at transitions, and rushing through the project faster than industry standards allow.'
      },
      {
        question: 'Should I renovate my bathroom all at once or in phases?',
        answer: 'All at once is almost always more cost-effective. Plumbing and electrical work requires opening walls, so doing it in phases means paying for demolition and repair twice. The only exception is if your budget truly can\'t cover the full renovation — in that case, do cosmetic updates now and save the plumbing work for later.'
      }
    ]
  },

  'hvac-replacement-cost-guide': {
    slug: 'hvac-replacement-cost-guide',
    title: 'HVAC Replacement Cost Guide: What to Expect on Your Quote',
    metaTitle: 'HVAC Replacement Cost Guide (2025-2026) | Furnace & AC Pricing',
    metaDescription: 'What does HVAC replacement actually cost? Real pricing for furnaces, central AC, heat pumps, and mini-splits — plus how to read HVAC quotes and avoid overcharges.',
    heroDescription: 'HVAC replacements are often emergency purchases — your furnace dies in January or your AC quits in July. That urgency makes homeowners vulnerable to inflated quotes. Here\'s what fair pricing looks like so you can make smart decisions even under pressure.',
    lastUpdated: '2025-12-15',
    relatedGuides: ['window-replacement-cost-guide', 'how-much-should-a-roof-replacement-cost', 'plumbing-estimate-what-to-expect'],
    sections: [
      {
        heading: 'HVAC Replacement Costs by System Type',
        level: 2,
        content: `<p>These are fully installed prices including equipment, labor, and standard materials for 2025–2026:</p>
<ul>
<li><strong>Central air conditioner (2–5 ton):</strong> $4,500–$9,500. A straight AC replacement where the furnace stays. Includes the condenser unit, evaporator coil, refrigerant lines, and labor.</li>
<li><strong>Gas furnace:</strong> $3,500–$8,000. Standard 80% efficiency units start lower; 96%+ high-efficiency models with variable-speed blowers hit the higher end.</li>
<li><strong>AC + furnace combo:</strong> $7,000–$15,000. The most common replacement — both units at once. Bundling typically saves $1,000–$2,000 versus replacing separately.</li>
<li><strong>Heat pump (ducted):</strong> $5,500–$12,000. Increasingly popular as efficiency improves. Qualifies for federal tax credits (up to $2,000 under the Inflation Reduction Act through 2032).</li>
<li><strong>Ductless mini-split:</strong> $3,000–$5,000 per zone. Great for additions, converted garages, or homes without ductwork. Multi-zone systems run $8,000–$20,000.</li>
<li><strong>Full system with ductwork:</strong> $12,000–$25,000+. If your home needs new or significantly modified ductwork, add $3,000–$10,000 to any of the above prices.</li>
</ul>`
      },
      {
        heading: 'What a Good HVAC Quote Includes',
        level: 2,
        content: `<p>A legitimate HVAC quote should have all of these components — not just an equipment model and a total price:</p>
<ul>
<li><strong>Manual J load calculation:</strong> This determines the right system size for your home. If a contractor just eyeballs it or bases sizing on your old system, they may install the wrong size. Oversized systems short-cycle and waste energy; undersized ones can't keep up.</li>
<li><strong>Equipment specifications:</strong> Exact model numbers, SEER2 ratings (for AC/heat pumps), and AFUE ratings (for furnaces). Don't accept "14 SEER equivalent" — get the actual rated numbers.</li>
<li><strong>Thermostat:</strong> Is a new thermostat included? Smart thermostats ($150–$300 value) are often thrown in on higher-end installs.</li>
<li><strong>Ductwork assessment:</strong> At minimum, the contractor should inspect accessible ductwork and note any needed repairs or sealing. Leaky ducts waste 20–30% of your heating and cooling.</li>
<li><strong>Permits and inspections:</strong> Most HVAC replacements require permits. The quote should specify who pulls the permit and whether inspection fees are included.</li>
<li><strong>Warranty details:</strong> Both manufacturer warranty (usually 5–10 years on parts) and contractor workmanship warranty (should be at least 1 year, ideally 2–5).</li>
</ul>`
      },
      {
        heading: 'HVAC Quote Red Flags',
        level: 2,
        content: `<ul>
<li><strong>No load calculation:</strong> The biggest red flag. Sizing HVAC equipment without a Manual J calculation is like prescribing glasses without an eye exam. It's industry standard and takes 30–60 minutes. Skip any contractor who won't do one.</li>
<li><strong>Extreme urgency pressure:</strong> "This price is only good today" or "your system could be dangerous" without evidence. Yes, HVAC failures are urgent, but a good contractor gives you at least 24–48 hours to decide.</li>
<li><strong>Bottom-shelf equipment at premium prices:</strong> Some contractors install builder-grade equipment and charge premium prices. Check the model numbers — a quick search tells you the equipment tier.</li>
<li><strong>No mention of refrigerant line replacement:</strong> If you're replacing an old R-22 system with a new R-410A or R-454B system, the refrigerant lines should be replaced. Reusing old lines can cause premature system failure.</li>
<li><strong>Cash-only or large upfront deposits:</strong> Standard HVAC financing is widely available. Contractors demanding cash or more than 25% down may be uninsured or unlicensed.</li>
</ul>`
      },
      {
        heading: 'How to Save on HVAC Replacement',
        level: 2,
        content: `<ul>
<li><strong>Federal tax credits:</strong> Heat pumps qualify for up to $2,000 in federal tax credits. High-efficiency furnaces and central AC qualify for smaller credits. Check energystar.gov for current details.</li>
<li><strong>Utility rebates:</strong> Many utilities offer $200–$1,000+ rebates for high-efficiency installations. Ask your contractor and check your utility's website.</li>
<li><strong>Off-season installation:</strong> If you can plan ahead, scheduling installation in spring or fall (HVAC's slow season) can save 10–20%.</li>
<li><strong>Bundle replacements:</strong> Replacing AC and furnace together is cheaper than doing them separately.</li>
<li><strong>Get 3+ quotes:</strong> HVAC pricing varies dramatically between contractors — we routinely see $3,000–$5,000 differences for identical equipment and scope.</li>
</ul>`
      }
    ],
    faqs: [
      {
        question: 'How much does it cost to replace an HVAC system in 2025?',
        answer: 'A complete HVAC system replacement (AC + furnace) costs $7,000–$15,000 in 2025 for most homes. Heat pump systems run $5,500–$12,000. Costs vary by system size, efficiency rating, and whether ductwork needs modification.'
      },
      {
        question: 'How long does an HVAC installation take?',
        answer: 'A standard HVAC replacement takes 1 day for a straight swap. If ductwork modifications are needed, expect 2–3 days. Complete system installations with new ductwork can take 3–5 days.'
      },
      {
        question: 'Is a heat pump worth it over a traditional furnace?',
        answer: 'In most climates, heat pumps are now worth considering. Modern cold-climate heat pumps work efficiently down to -15°F. They qualify for up to $2,000 in federal tax credits and can reduce heating costs by 30–50% compared to gas furnaces. The upfront cost is higher, but the payback period is typically 5–8 years.'
      },
      {
        question: 'What SEER rating should I look for?',
        answer: 'As of 2023, the minimum SEER2 rating is 13.4 in northern states and 14.3 in southern states. For best efficiency, look for 16+ SEER2. Higher ratings cost more upfront but save on monthly energy bills. In hot climates where AC runs frequently, the payback on high-SEER equipment is faster.'
      }
    ]
  },

  'deck-building-cost-per-square-foot': {
    slug: 'deck-building-cost-per-square-foot',
    title: 'Deck Building Cost Per Square Foot: 2025-2026 Pricing Guide',
    metaTitle: 'Deck Building Cost Per Square Foot (2025-2026) | Complete Pricing',
    metaDescription: 'How much does a deck cost per square foot? Real pricing for pressure-treated, composite, and hardwood decks — plus what to look for in deck building quotes.',
    heroDescription: 'Decks are priced per square foot, but the range is enormous — from $15/sq ft for a basic ground-level pressure-treated deck to $75+/sq ft for an elevated composite deck with built-in features. Here\'s how to understand what your quote should actually look like.',
    lastUpdated: '2025-12-15',
    relatedGuides: ['fence-installation-cost-guide', 'painting-contractor-quote-tips', 'how-much-should-a-roof-replacement-cost'],
    sections: [
      {
        heading: 'Deck Cost Per Square Foot by Material',
        level: 2,
        content: `<p>These are fully installed costs including materials, labor, and standard hardware for 2025–2026:</p>
<ul>
<li><strong>Pressure-treated lumber:</strong> $20–$35/sq ft installed. The workhorse of residential decks. Lasts 15–20 years with proper maintenance (annual staining/sealing). Expect to spend $200–$400/year on upkeep.</li>
<li><strong>Cedar:</strong> $30–$50/sq ft installed. Naturally rot-resistant and beautiful. Lasts 15–25 years. Still needs periodic sealing but less chemical treatment than PT lumber.</li>
<li><strong>Standard composite (Trex Select, TimberTech Edge):</strong> $35–$55/sq ft installed. Low maintenance, 25-year warranty. The sweet spot for most homeowners. No staining or sealing required.</li>
<li><strong>Premium composite (Trex Transcend, TimberTech Pro):</strong> $45–$70/sq ft installed. Better color retention, more realistic wood grain, 25–50 year warranties.</li>
<li><strong>PVC decking (Azek, TimberTech Advanced):</strong> $50–$75/sq ft installed. The most durable option. Completely moisture-proof. Excellent for pool decks and coastal areas.</li>
<li><strong>Ipe (Brazilian hardwood):</strong> $55–$85/sq ft installed. Stunning natural beauty and incredible durability (40+ years). Very heavy and requires specialized installation.</li>
</ul>
<p>For a typical 300 sq ft deck, expect to pay <strong>$6,000–$10,500</strong> for pressure-treated lumber or <strong>$10,500–$16,500</strong> for standard composite.</p>`
      },
      {
        heading: 'Cost Factors Beyond the Decking Material',
        level: 2,
        content: `<p>The decking boards themselves are only part of the cost. These factors significantly impact your total:</p>
<ul>
<li><strong>Deck height:</strong> Ground-level decks are cheapest. Every foot of elevation adds cost for posts, bracing, and stairs. An elevated deck (4+ feet) can cost 50–100% more than ground-level.</li>
<li><strong>Substructure:</strong> Even composite decks need a wood frame (pressure-treated or steel). This runs $8–$15/sq ft and is often a separate line item.</li>
<li><strong>Footings and foundations:</strong> Concrete footings run $100–$300 each. A typical deck needs 6–12 footings. Helical piles ($200–$500 each) are faster but more expensive.</li>
<li><strong>Railings:</strong> $20–$60 per linear foot. Wood railings are cheapest; cable rail and glass panels are premium. A 300 sq ft deck might need 50+ linear feet of railing — that's $1,000–$3,000 on top of the deck cost.</li>
<li><strong>Stairs:</strong> $75–$200 per step. A set of 4 steps runs $300–$800. Long stairways for elevated decks can cost $2,000–$5,000.</li>
<li><strong>Permits:</strong> Most decks over 200 sq ft or 30 inches above grade require permits: $200–$800.</li>
</ul>`
      },
      {
        heading: 'Red Flags in Deck Building Quotes',
        level: 2,
        content: `<ul>
<li><strong>No mention of footings or foundation:</strong> Every deck needs a proper foundation. If the quote doesn't mention footings, the contractor may be planning to set posts on blocks or even directly on the ground — a code violation that leads to structural failure.</li>
<li><strong>No ledger board detail:</strong> How the deck attaches to your house is critical. The ledger board connection should include flashing to prevent water infiltration. This is the #1 cause of deck collapses.</li>
<li><strong>Undersized lumber:</strong> A quote specifying 2×6 joists on 24-inch centers for a deck that should have 2×8 or 2×10 joists on 16-inch centers is a structural problem. Ask what joist size and spacing they're using and why.</li>
<li><strong>"Materials included" without specifications:</strong> What brand of composite? What grade of pressure-treated lumber (#1 or #2)? What type of hardware (stainless, galvanized, or plain steel)? Vague material specs mean the contractor will use whatever's cheapest.</li>
<li><strong>No engineering for elevated decks:</strong> Decks over 4 feet high or attached to the house should have engineered drawings. If your contractor skips this, your deck may not meet code — and you'll discover that when you try to sell your house.</li>
</ul>`
      },
      {
        heading: 'Composite vs. Wood: The Real Math',
        level: 2,
        content: `<p>Homeowners often focus on upfront cost, but the total cost of ownership tells a different story:</p>
<p><strong>Pressure-treated wood (20-year lifecycle):</strong></p>
<ul>
<li>Installation: $7,500 (300 sq ft × $25/sq ft)</li>
<li>Annual staining/sealing: $300/year × 20 years = $6,000</li>
<li>Board replacements over 20 years: ~$1,500</li>
<li><strong>Total: ~$15,000</strong></li>
</ul>
<p><strong>Standard composite (25-year lifecycle):</strong></p>
<ul>
<li>Installation: $13,500 (300 sq ft × $45/sq ft)</li>
<li>Annual maintenance: $50/year × 25 years = $1,250 (just cleaning)</li>
<li><strong>Total: ~$14,750</strong></li>
</ul>
<p>Over the lifetime of the deck, composite often costs the same or less — with far less hassle.</p>`
      }
    ],
    faqs: [
      {
        question: 'How much does it cost to build a deck in 2025?',
        answer: 'A typical 300 sq ft deck costs $6,000–$10,500 in pressure-treated wood or $10,500–$21,000 in composite. Elevated decks, premium materials, and features like built-in seating or pergolas increase costs significantly.'
      },
      {
        question: 'Is composite decking worth the extra cost?',
        answer: 'For most homeowners, yes. While composite costs 50–100% more upfront, it requires no staining or sealing, lasts longer, and often costs the same or less over a 20–25 year period when maintenance costs are factored in.'
      },
      {
        question: 'Do I need a permit to build a deck?',
        answer: 'In most areas, yes — especially if the deck is over 200 sq ft, more than 30 inches above grade, or attached to the house. Permits typically cost $200–$800. Building without one can result in fines and complications when selling your home.'
      },
      {
        question: 'How long does it take to build a deck?',
        answer: 'A basic ground-level deck takes 2–4 days. Elevated decks with stairs and railings take 1–2 weeks. Complex multi-level designs with built-in features can take 2–4 weeks. Weather delays are common for outdoor projects.'
      }
    ]
  },

  'plumbing-estimate-what-to-expect': {
    slug: 'plumbing-estimate-what-to-expect',
    title: 'Plumbing Estimates: What to Expect and What to Question',
    metaTitle: 'Plumbing Estimate Guide (2025-2026) | What Fair Pricing Looks Like',
    metaDescription: 'Understand plumbing estimates before you sign. Real pricing for common plumbing jobs, how plumbers charge, and red flags that signal you\'re being overcharged.',
    heroDescription: 'Plumbing quotes are uniquely frustrating because the work is invisible — it\'s behind walls and under floors. Most homeowners have no idea if $3,000 for a water heater install is fair or outrageous (it\'s fair, by the way). Let\'s fix that.',
    lastUpdated: '2025-12-15',
    relatedGuides: ['bathroom-renovation-red-flags', 'kitchen-remodel-quote-breakdown', 'hvac-replacement-cost-guide'],
    sections: [
      {
        heading: 'How Plumbers Charge: The Three Models',
        level: 2,
        content: `<p>Understanding how your plumber prices work helps you evaluate whether a quote is fair:</p>
<ul>
<li><strong>Flat rate/fixed price:</strong> Most reputable plumbing companies use flat-rate pricing. You're quoted a set price for the job regardless of how long it takes. This is usually best for homeowners because there are no surprises. The trade-off is that flat rates build in a profit margin for the "worst case" scenario.</li>
<li><strong>Time and materials (T&M):</strong> You pay an hourly rate ($85–$175/hour) plus materials at cost or with a markup. This can be cheaper for simple jobs but risky for complex ones. If the plumber hits an unexpected problem, your bill keeps climbing.</li>
<li><strong>Service call + hourly:</strong> A trip charge ($75–$150) to show up, then hourly after that. Common for diagnostic visits and small repairs.</li>
</ul>
<p>Neither model is inherently better — but you should know which one your plumber is using before work begins.</p>`
      },
      {
        heading: 'Common Plumbing Job Costs in 2025–2026',
        level: 2,
        content: `<ul>
<li><strong>Water heater replacement (tank, 40–50 gal):</strong> $1,800–$3,500. Includes the unit, installation, and hauling away the old one. Gas units cost more to install than electric due to venting requirements.</li>
<li><strong>Tankless water heater installation:</strong> $3,000–$6,000. Higher upfront cost but lower operating costs. If switching from tank to tankless, expect additional costs for gas line upgrades and new venting.</li>
<li><strong>Sewer line repair (trenchless):</strong> $4,000–$12,000. Trenchless methods (pipe lining or pipe bursting) cost more than traditional dig-and-replace but save your yard. Traditional excavation runs $3,000–$8,000 but leaves a trench.</li>
<li><strong>Whole-house repipe (copper):</strong> $8,000–$16,000 for a typical 2,000 sq ft home. PEX repiping is cheaper: $5,000–$10,000.</li>
<li><strong>Drain cleaning:</strong> $150–$500. Simple snaking is on the low end; hydro-jetting (high-pressure cleaning) is $300–$500 but more thorough.</li>
<li><strong>Fixture installation (each):</strong> $200–$500 for a standard faucet, toilet, or disposal install. More for complex fixtures.</li>
<li><strong>Sump pump installation:</strong> $1,000–$3,000. Includes the pump, basin, check valve, and discharge line.</li>
<li><strong>Gas line installation:</strong> $500–$2,000 per line. Required for gas ranges, dryers, fireplaces, etc.</li>
</ul>`
      },
      {
        heading: 'Red Flags in Plumbing Estimates',
        level: 2,
        content: `<ul>
<li><strong>Diagnosis without inspection:</strong> A plumber who quotes a sewer line replacement without running a camera first is guessing. Camera inspections cost $150–$400 and are essential for accurate diagnosis.</li>
<li><strong>No permit mention on major work:</strong> Water heater replacements, repiping, sewer work, and gas line installations require permits in most jurisdictions. If your plumber doesn't mention permits, they may not be pulling them — which means no inspection and no code compliance.</li>
<li><strong>Massive markup on fixtures:</strong> Some plumbers mark up fixtures 100–200%. If a plumber quotes $800 for a toilet you can buy at Home Depot for $250, ask if you can supply your own fixtures. Some will agree; others won't — but you should know the markup.</li>
<li><strong>Emergency pricing without disclosure:</strong> Emergency/after-hours rates are typically 1.5–2× standard rates. This is normal, but it should be disclosed upfront. If a plumber charges emergency rates during normal business hours, push back.</li>
<li><strong>"While we're in there" upsells:</strong> A plumber who discovers $3,000 of additional work during a $500 repair should show you the problem and get written approval before proceeding. Never agree to verbal change orders.</li>
</ul>`
      },
      {
        heading: 'When to Get a Second Opinion',
        level: 2,
        content: `<p>These situations always warrant a second quote:</p>
<ul>
<li>Any job over $2,500</li>
<li>Sewer line replacement (always get a camera inspection and a second opinion)</li>
<li>Whole-house repiping</li>
<li>"Your water heater is about to fail" from a door-to-door salesperson</li>
<li>Any time a plumber finds thousands in additional work during a small repair</li>
</ul>
<p>The exception: active emergencies like burst pipes or sewage backups. In those cases, get the emergency handled and then get competitive quotes for the permanent repair.</p>`
      }
    ],
    faqs: [
      {
        question: 'How much does a plumber charge per hour in 2025?',
        answer: 'Plumbers charge $85–$175/hour in 2025, with most falling in the $100–$150 range. However, many plumbing companies use flat-rate pricing instead of hourly rates. Emergency and after-hours rates are typically 1.5–2× the standard rate.'
      },
      {
        question: 'How much does a water heater replacement cost?',
        answer: 'A standard tank water heater replacement costs $1,800–$3,500 installed in 2025. Tankless water heater installation runs $3,000–$6,000. The price includes the unit, labor, hauling away the old heater, and permits.'
      },
      {
        question: 'Should I repair or replace my water heater?',
        answer: 'If your water heater is over 10 years old and needs a repair costing more than $500, replacement is usually more cost-effective. If it\'s under 8 years old and the repair is under $500, repairing makes sense. Signs you need replacement: rust-colored water, rumbling noises, visible corrosion, or water around the base.'
      },
      {
        question: 'Why are plumbing quotes so different from each other?',
        answer: 'Plumbing quotes vary widely because of different pricing models (flat rate vs. hourly), fixture markup policies, overhead costs, and included services. A $2,000 quote might exclude permits while a $2,800 quote includes permits, warranty, and cleanup. Always compare scope, not just price.'
      }
    ]
  },

  'fence-installation-cost-guide': {
    slug: 'fence-installation-cost-guide',
    title: 'Fence Installation Cost Guide: What You\'ll Pay Per Linear Foot',
    metaTitle: 'Fence Installation Cost Guide (2025-2026) | Per-Foot Pricing',
    metaDescription: 'How much does fence installation cost per linear foot? Real pricing for wood, vinyl, chain link, and aluminum fencing — plus how to read fence quotes like a pro.',
    heroDescription: 'Fence quotes are straightforward — until they\'re not. The material cost per linear foot is easy to compare, but the real cost differences hide in post spacing, concrete footings, gate hardware, and site prep. Here\'s the full picture.',
    lastUpdated: '2025-12-15',
    relatedGuides: ['deck-building-cost-per-square-foot', 'painting-contractor-quote-tips', 'how-much-should-a-roof-replacement-cost'],
    sections: [
      {
        heading: 'Fence Installation Cost Per Linear Foot',
        level: 2,
        content: `<p>Fully installed pricing for 2025–2026, including materials, labor, post setting, and standard hardware:</p>
<ul>
<li><strong>Chain link (4 ft):</strong> $15–$30/linear ft. The budget option. Functional but offers limited privacy. Vinyl-coated chain link (black or green) costs $3–$5/ft more but looks much better.</li>
<li><strong>Pressure-treated wood (6 ft privacy):</strong> $25–$45/linear ft. The most popular residential fence. Stockade (flat-top) is cheapest; board-on-board and shadowbox styles cost a bit more. Needs staining every 2–3 years.</li>
<li><strong>Cedar (6 ft privacy):</strong> $30–$55/linear ft. Naturally rot-resistant. Weathers to a beautiful gray if left untreated, or can be stained to maintain color. Lasts 15–25 years.</li>
<li><strong>Vinyl/PVC (6 ft privacy):</strong> $35–$60/linear ft. Zero maintenance and long-lasting (20–30 years). Limited style options compared to wood. Can become brittle in extreme cold.</li>
<li><strong>Aluminum ornamental:</strong> $30–$55/linear ft. Great for front yards and pool enclosures. Doesn't rust. Offers zero privacy but excellent aesthetics.</li>
<li><strong>Wrought iron:</strong> $50–$100/linear ft. Premium curb appeal. Heavy and durable but requires periodic rust treatment.</li>
<li><strong>Composite fencing:</strong> $45–$70/linear ft. Low-maintenance like vinyl but with a more natural wood appearance. Growing in popularity.</li>
</ul>
<p>For a typical 150 linear foot backyard fence (6 ft privacy), expect <strong>$3,750–$6,750</strong> for pressure-treated wood or <strong>$5,250–$9,000</strong> for vinyl.</p>`
      },
      {
        heading: 'Hidden Costs in Fence Quotes',
        level: 2,
        content: `<p>These line items are where fence quotes diverge. Make sure you know what's included:</p>
<ul>
<li><strong>Old fence removal:</strong> $3–$8/linear ft. If you have an existing fence that needs to come down, this is often quoted separately. A 150-ft fence removal runs $450–$1,200.</li>
<li><strong>Gate(s):</strong> $200–$800 each depending on size and style. A standard 4-ft walk gate is $200–$400. A 6-ft double gate (for mower/vehicle access) runs $500–$800. Heavy-duty driveway gates cost $1,500–$5,000+.</li>
<li><strong>Post holes in difficult soil:</strong> Rocky or clay soil can double the labor for post setting. If your area has challenging soil, ask how the contractor handles it and whether there's a surcharge.</li>
<li><strong>Grading and land clearing:</strong> If your fence line runs through brush, slopes, or uneven terrain, site prep adds $2–$10/linear ft.</li>
<li><strong>Survey/property line verification:</strong> A professional survey costs $300–$800 but prevents the nightmare of building a fence on your neighbor's property. Many contractors require one.</li>
<li><strong>HOA compliance:</strong> If you have an HOA, confirm style, height, and setback requirements before signing. Rebuilding a non-compliant fence is entirely on you.</li>
</ul>`
      },
      {
        heading: 'Red Flags in Fence Quotes',
        level: 2,
        content: `<ul>
<li><strong>Post spacing over 8 feet:</strong> Standard fence post spacing is 6–8 feet on center. Some budget contractors space posts at 10 feet to save on materials. This leads to sagging and leaning within a few years.</li>
<li><strong>No concrete footings:</strong> Every fence post should be set in concrete, typically 2 bags per post. Posts set in packed dirt or gravel will shift and lean, especially in freeze-thaw climates. This is non-negotiable.</li>
<li><strong>Shallow post depth:</strong> Posts should be set at least 1/3 of their total length below grade. For a 6-ft fence with 8-ft posts, that means 24+ inches deep. In frost-prone areas, posts need to go below the frost line (36–48 inches in northern states).</li>
<li><strong>No mention of post material:</strong> Even on cedar or composite fences, the posts are usually pressure-treated pine (rated for ground contact). If the quote doesn't specify post material, ask. Using the wrong lumber underground leads to premature rot.</li>
<li><strong>Per-panel pricing with no total:</strong> Some contractors quote per panel to make the price seem low, then the total for 25+ panels is a shock. Always get a total price for the complete fence.</li>
</ul>`
      },
      {
        heading: 'Tips for Getting the Best Fence Quote',
        level: 2,
        content: `<ul>
<li><strong>Get a survey first:</strong> Knowing your exact property lines prevents disputes and lets contractors quote accurately.</li>
<li><strong>Consider off-season:</strong> Fence installers are busiest in spring and summer. Scheduling for late fall or winter can save 10–15% in many markets.</li>
<li><strong>Buy materials yourself?</strong> Some contractors allow you to supply materials. This can save 15–25% but means you're responsible for ordering the right quantities and quality.</li>
<li><strong>Check for utility lines:</strong> Call 811 (the national "Call Before You Dig" hotline) before any fence installation. It's free and prevents hitting buried gas, electric, or water lines.</li>
<li><strong>Negotiate gate placement:</strong> Fewer gates = lower cost. Plan gate locations carefully to avoid unnecessary gates while maintaining good access.</li>
</ul>`
      }
    ],
    faqs: [
      {
        question: 'How much does fence installation cost in 2025?',
        answer: 'Fence installation costs $25–$45/linear ft for pressure-treated wood privacy fencing and $35–$60/linear ft for vinyl in 2025. A typical 150-ft backyard fence runs $3,750–$9,000 depending on material. Chain link starts at $15–$30/linear ft for a budget option.'
      },
      {
        question: 'What is the cheapest fence to install?',
        answer: 'Chain link fencing is the cheapest at $15–$30/linear ft installed. For privacy fencing, pressure-treated wood stockade is most affordable at $25–$45/linear ft. However, factor in long-term maintenance costs — wood fences need staining every 2–3 years while vinyl is maintenance-free.'
      },
      {
        question: 'How long does fence installation take?',
        answer: 'A professional crew can install 100–150 linear feet of fence per day in good conditions. A typical backyard fence takes 1–2 days. Factors that slow installation include rocky soil, slopes, tree roots, and weather.'
      },
      {
        question: 'Do I need a permit for a fence?',
        answer: 'Most municipalities require permits for fences over 4–6 feet tall. Even shorter fences may need permits depending on setback requirements and your location. Permit costs are typically $50–$250. Check with your local building department before starting.'
      }
    ]
  },

  'painting-contractor-quote-tips': {
    slug: 'painting-contractor-quote-tips',
    title: 'Painting Contractor Quotes: How to Compare and What to Watch For',
    metaTitle: 'Painting Contractor Quote Tips (2025-2026) | Interior & Exterior Pricing',
    metaDescription: 'How to compare painting contractor quotes. Real pricing for interior and exterior painting, what prep work should cost, and signs of a lowball quote.',
    heroDescription: 'Painting quotes might seem simple, but the difference between a good paint job and a bad one isn\'t the paint — it\'s the prep work. A quote that skips proper preparation will save you money upfront and cost you twice as much when you repaint in 2 years instead of 7.',
    lastUpdated: '2025-12-15',
    relatedGuides: ['kitchen-remodel-quote-breakdown', 'deck-building-cost-per-square-foot', 'fence-installation-cost-guide'],
    sections: [
      {
        heading: 'Interior Painting Costs',
        level: 2,
        content: `<p>Interior painting is typically priced per square foot of wall area or per room. Here are 2025–2026 rates:</p>
<ul>
<li><strong>Per square foot:</strong> $2–$6/sq ft of wall area (not floor area). This includes two coats of quality paint and standard prep.</li>
<li><strong>Per room (average 12×12):</strong> $400–$800 for walls only. Add $150–$300 for the ceiling. Add $50–$100 per window/door for trim.</li>
<li><strong>Whole house interior (2,000 sq ft home):</strong> $4,000–$10,000. The wide range depends on ceiling height, number of colors, condition of existing surfaces, and trim/door painting.</li>
<li><strong>Cabinet painting:</strong> $3,000–$7,000 for a full kitchen. This is specialty work — don't let your wall painter do it unless they have cabinet-specific experience and equipment (HVLP sprayer, proper primers).</li>
</ul>
<p><strong>Paint quality matters.</strong> A gallon of contractor-grade paint costs $25–$35. Premium paint (Benjamin Moore Regal, Sherwin-Williams Emerald) costs $55–$80/gallon. The labor is the same either way, so skimping on paint saves very little while significantly reducing durability.</p>`
      },
      {
        heading: 'Exterior Painting Costs',
        level: 2,
        content: `<ul>
<li><strong>Average single-story home (1,500 sq ft):</strong> $3,000–$6,000</li>
<li><strong>Average two-story home (2,500 sq ft):</strong> $5,000–$10,000</li>
<li><strong>Large or complex homes:</strong> $8,000–$15,000+</li>
</ul>
<p>Exterior pricing includes more variables than interior:</p>
<ul>
<li><strong>Siding type:</strong> Smooth surfaces (vinyl, aluminum) paint faster than textured surfaces (stucco, brick, cedar shakes).</li>
<li><strong>Stories/height:</strong> Multi-story homes require scaffolding or lifts, adding $500–$2,000.</li>
<li><strong>Prep work intensity:</strong> A home with peeling paint needs scraping and priming. A home in good condition needs only light washing and spot-priming. Prep can account for 50–70% of the total labor on exterior work.</li>
<li><strong>Power washing:</strong> $200–$500. Should be done 1–2 days before painting to allow drying. Sometimes quoted separately.</li>
</ul>`
      },
      {
        heading: 'What Separates a Good Quote from a Bad One',
        level: 2,
        content: `<p>Here's exactly what to look for when comparing painting quotes:</p>
<ul>
<li><strong>Prep work detail:</strong> The quote should specify: filling holes/cracks, caulking gaps, sanding rough areas, priming bare spots, and protecting floors/furniture. If it just says "paint 3 bedrooms," ask what prep is included.</li>
<li><strong>Number of coats:</strong> Two coats is standard. One coat is never enough (despite what some contractors claim). If the quote says "one coat," it's not a professional quote.</li>
<li><strong>Paint brand and product line:</strong> "Latex paint" tells you nothing. The quote should specify the brand, product line, and sheen. This lets you price-check and ensures the contractor isn't downgrading after you sign.</li>
<li><strong>Surface preparation for different areas:</strong> Trim, doors, and cabinets need different prep than walls. If the quote treats everything the same, corners will be cut on the detail work.</li>
<li><strong>Furniture moving:</strong> Who moves the furniture? Most painters will shift furniture to the center and cover it, but some charge extra or expect you to do it.</li>
</ul>`
      },
      {
        heading: 'Painting Quote Red Flags',
        level: 2,
        content: `<ul>
<li><strong>Price is 40%+ below other quotes:</strong> Painting is labor-intensive. A quote significantly below market means the contractor is either skipping prep, using cheap paint, running uninsured, or paying workers under the table. You'll see the difference within a year.</li>
<li><strong>No mention of primer:</strong> New drywall, stains, and color changes require primer. Skipping it means poor adhesion and bleed-through. Primer adds $0.50–$1.00/sq ft but is essential for a lasting result.</li>
<li><strong>Spray-only without back-rolling:</strong> Spraying is fast but doesn't work paint into the surface texture. Professional painters spray AND back-roll for complete coverage. Spray-only saves time for the contractor but produces inferior results.</li>
<li><strong>No timeline or crew size:</strong> A 2,000 sq ft interior should take a 2–3 person crew about 3–5 days. If someone quotes 1 day, they're spraying everything without proper prep. If they quote 3 weeks, they're a one-person operation juggling multiple jobs.</li>
<li><strong>Vague "touch up" warranty:</strong> A good painter offers a 2-year workmanship warranty. "We'll come back and touch up" without specifics is meaningless.</li>
</ul>`
      }
    ],
    faqs: [
      {
        question: 'How much does it cost to paint the interior of a house in 2025?',
        answer: 'Interior painting costs $2–$6 per square foot of wall area in 2025. For a typical 2,000 sq ft home, expect to pay $4,000–$10,000 for a professional job including walls, ceilings, and trim with two coats of quality paint.'
      },
      {
        question: 'How much does exterior painting cost?',
        answer: 'Exterior painting costs $3,000–$6,000 for a single-story home and $5,000–$10,000 for a two-story home in 2025. Costs vary significantly based on siding condition, surface type, number of stories, and how much prep work is needed.'
      },
      {
        question: 'How often should you repaint your house?',
        answer: 'Interior walls last 5–10 years between repaints with quality paint. Exterior paint lasts 5–7 years in harsh climates and 7–10 years in mild climates. High-traffic areas like hallways and kids\' rooms may need repainting every 3–5 years.'
      },
      {
        question: 'Should I hire a painter or DIY?',
        answer: 'DIY makes sense for single rooms with simple walls. Hire a pro for exterior work, multi-room projects, high ceilings, detailed trim, or cabinet painting. Professionals are 3–5× faster, and the quality difference is significant — especially on prep work that affects how long the paint lasts.'
      }
    ]
  },

  'flooring-installation-cost-breakdown': {
    slug: 'flooring-installation-cost-breakdown',
    title: 'Flooring Installation Cost Breakdown: Material-by-Material Pricing',
    metaTitle: 'Flooring Installation Cost Breakdown (2025-2026) | Per Sq Ft Pricing',
    metaDescription: 'What does flooring installation actually cost per square foot? Real pricing for hardwood, LVP, tile, and carpet — plus what to look for in flooring quotes.',
    heroDescription: 'Flooring installation is one of the most competitive trades — which is good for homeowners. But that competition also means you\'ll see huge price ranges and tactics designed to win your business. Here\'s how to compare quotes and avoid common traps.',
    lastUpdated: '2025-12-15',
    relatedGuides: ['kitchen-remodel-quote-breakdown', 'bathroom-renovation-red-flags', 'painting-contractor-quote-tips'],
    sections: [
      {
        heading: 'Flooring Costs Per Square Foot (Installed)',
        level: 2,
        content: `<p>These are fully installed prices including materials, labor, underlayment, and basic transitions for 2025–2026:</p>
<ul>
<li><strong>Luxury vinyl plank (LVP):</strong> $5–$12/sq ft. The most popular flooring choice right now. Waterproof, durable, and available in realistic wood-look designs. Budget LVP ($5–$7) works fine for rentals; mid-range ($7–$10) is great for most homes; premium ($10–$12) rivals hardwood in appearance.</li>
<li><strong>Engineered hardwood:</strong> $8–$16/sq ft. Real wood top layer on a plywood core. More stable than solid hardwood in humid/dry environments. Can be refinished 1–3 times depending on the top layer thickness.</li>
<li><strong>Solid hardwood:</strong> $10–$20/sq ft. The classic choice. Red oak is most affordable; white oak, walnut, and hickory cost more. Can be refinished 5+ times over a 75–100 year lifespan. Not recommended for basements or below-grade spaces.</li>
<li><strong>Porcelain/ceramic tile:</strong> $8–$18/sq ft. The price range reflects simple 12×12 ceramic at the low end and large-format porcelain with complex patterns at the high end. Add $2–$4/sq ft for heated floor systems.</li>
<li><strong>Carpet:</strong> $3–$10/sq ft. Includes carpet, pad, and installation. Builder-grade carpet runs $3–$5; mid-range $5–$7; premium wool or high-density nylon $7–$10.</li>
<li><strong>Laminate:</strong> $4–$9/sq ft. Budget-friendly with decent aesthetics. Not waterproof (despite marketing claims for some brands). Being largely replaced by LVP in the market.</li>
<li><strong>Natural stone (marble, travertine):</strong> $15–$40/sq ft. Premium material for high-end spaces. Requires sealing and more maintenance than tile.</li>
</ul>`
      },
      {
        heading: 'Costs That Should Be on Your Flooring Quote',
        level: 2,
        content: `<p>Material and labor per square foot is just the starting point. These additional costs are where quotes differ significantly:</p>
<ul>
<li><strong>Old flooring removal:</strong> $1–$3/sq ft. Carpet removal is cheapest ($1–$1.50). Tile removal is most expensive ($2–$3) because of the mess and disposal weight. Hardwood removal falls in between.</li>
<li><strong>Subfloor preparation:</strong> $1–$3/sq ft. Leveling compounds, moisture barriers, plywood patches. If your subfloor isn't flat, skipping this step means your new floor will squeak, gap, and wear unevenly.</li>
<li><strong>Transitions and trim:</strong> $5–$15 per linear foot. Where flooring meets doorways, other rooms, or different floor heights. Costs add up fast if you have many doorways.</li>
<li><strong>Baseboard removal and reinstallation:</strong> $1–$2/linear ft. Some installers include this; others don't. New baseboards add $3–$6/linear ft.</li>
<li><strong>Furniture moving:</strong> Typically $100–$300 per room, or free if you move it yourself. Clarify upfront.</li>
<li><strong>Stairs:</strong> $75–$200 per step for hardwood or LVP. Stair installation is significantly more labor-intensive than flat floors. A full staircase (13 steps) adds $1,000–$2,600.</li>
</ul>`
      },
      {
        heading: 'Flooring Quote Red Flags',
        level: 2,
        content: `<ul>
<li><strong>"Free installation" offers:</strong> Big box stores advertise "free installation" but mark up the flooring material 30–50% to compensate. Calculate the total cost per square foot (material + install) and compare to standalone estimates.</li>
<li><strong>No subfloor assessment:</strong> A flooring installer who quotes without checking your subfloor condition is going to surprise you with additional charges once they start. A professional walks the space, checks for squeaks and level, and notes any issues in the quote.</li>
<li><strong>No acclimation mention for hardwood:</strong> Hardwood flooring must acclimate in your home for 3–7 days before installation. If your installer plans to install the same day the material is delivered, the wood will expand/contract after installation, causing gaps or buckling.</li>
<li><strong>Suspiciously low per-square-foot pricing:</strong> If someone quotes $3/sq ft installed for LVP, they're using the cheapest product available (often thin, rigid, and warps easily) or cutting corners on underlayment and prep.</li>
<li><strong>No waste factor:</strong> Proper flooring quotes include 10–15% extra material for cuts, waste, and pattern matching. If the quote is based on exact room measurements with zero waste, you'll be short on material mid-project — and that causes delays and lot number mismatches.</li>
</ul>`
      },
      {
        heading: 'Choosing the Right Flooring for Each Room',
        level: 2,
        content: `<p>Not every flooring material works everywhere. Here's what actually holds up:</p>
<ul>
<li><strong>Kitchens:</strong> LVP, tile, or engineered hardwood. Avoid solid hardwood (water damage risk) and carpet (obvious reasons).</li>
<li><strong>Bathrooms:</strong> Tile or LVP only. Never hardwood or laminate in full bathrooms.</li>
<li><strong>Basements:</strong> LVP or tile. Solid hardwood and laminate can't handle below-grade moisture.</li>
<li><strong>Bedrooms:</strong> Anything works. Carpet provides warmth and sound dampening; hardwood adds resale value.</li>
<li><strong>Living areas:</strong> Hardwood and LVP are most popular. Both handle traffic well and are easy to clean.</li>
<li><strong>Entryways:</strong> Tile or LVP for durability against wet shoes and heavy traffic.</li>
</ul>`
      }
    ],
    faqs: [
      {
        question: 'What is the most affordable flooring option in 2025?',
        answer: 'Carpet ($3–$10/sq ft installed) and laminate ($4–$9/sq ft installed) are the most affordable. However, luxury vinyl plank (LVP) at $5–$12/sq ft offers much better durability and water resistance, making it the best value for most homes.'
      },
      {
        question: 'How much does hardwood floor installation cost?',
        answer: 'Solid hardwood installation costs $10–$20/sq ft in 2025, including materials and labor. Engineered hardwood is slightly less at $8–$16/sq ft. For a typical 500 sq ft room, expect $5,000–$10,000 for solid hardwood or $4,000–$8,000 for engineered.'
      },
      {
        question: 'Is LVP better than hardwood?',
        answer: 'LVP is more practical in many situations — it\'s waterproof, more affordable, scratch-resistant, and easier to install. Hardwood adds more resale value, can be refinished multiple times, and lasts 75–100 years. For kitchens, bathrooms, and basements, LVP is the better choice. For living rooms and bedrooms, it\'s a matter of preference and budget.'
      },
      {
        question: 'How long does flooring installation take?',
        answer: 'A 500 sq ft room takes 1–2 days for LVP or carpet, 2–3 days for hardwood, and 2–4 days for tile. Whole-house flooring (1,500+ sq ft) typically takes 3–7 days depending on material. Add time for old floor removal and subfloor prep if needed.'
      }
    ]
  },

  'window-replacement-cost-guide': {
    slug: 'window-replacement-cost-guide',
    title: 'Window Replacement Cost Guide: What Each Window Should Cost',
    metaTitle: 'Window Replacement Cost Guide (2025-2026) | Per Window Pricing',
    metaDescription: 'How much should window replacement cost per window? Real pricing for vinyl, wood, and fiberglass windows — plus how to compare window company quotes.',
    heroDescription: 'Window replacement is one of the most aggressively sold home improvement projects. Between high-pressure sales tactics and wildly different pricing, it\'s hard to know what\'s fair. We\'ve reviewed thousands of window quotes — here\'s what you should actually be paying.',
    lastUpdated: '2025-12-15',
    relatedGuides: ['how-much-should-a-roof-replacement-cost', 'hvac-replacement-cost-guide', 'painting-contractor-quote-tips'],
    sections: [
      {
        heading: 'Window Replacement Cost Per Window',
        level: 2,
        content: `<p>These are fully installed prices per standard-sized double-hung window (roughly 36×60 inches) in 2025–2026:</p>
<ul>
<li><strong>Vinyl (builder grade):</strong> $350–$550/window. Basic vinyl from brands like Simonton or Ply Gem. Fine for rentals and budget-conscious projects. 15–20 year lifespan.</li>
<li><strong>Vinyl (mid-range):</strong> $550–$900/window. Better quality vinyl from Pella 250 Series, Andersen 100 Series, or Milgard. Better hardware, seals, and glass packages. 25–30 year lifespan.</li>
<li><strong>Vinyl (premium):</strong> $800–$1,200/window. Top-tier vinyl like Pella Lifestyle or Marvin Essential. Welded frames, superior weatherstripping, and triple-pane options.</li>
<li><strong>Fiberglass:</strong> $800–$1,500/window. Stronger and more dimensionally stable than vinyl. Brands like Marvin Elevate, Pella Impervia, and Andersen A-Series fiberglass. Excellent for extreme climates.</li>
<li><strong>Wood interior/aluminum clad exterior:</strong> $1,000–$1,800/window. Premium option from Andersen, Marvin, and Pella. Beautiful wood interior with weather-resistant exterior cladding. 30+ year lifespan.</li>
<li><strong>Full wood:</strong> $1,200–$2,500/window. Highest-end option for historic homes or luxury builds. Requires periodic maintenance. Marvin Ultimate and Pella Architect Series.</li>
</ul>
<p>For a typical home with 15–20 windows, expect <strong>$8,000–$13,500</strong> for mid-range vinyl or <strong>$15,000–$30,000</strong> for fiberglass/wood-clad.</p>`
      },
      {
        heading: 'What Drives Window Pricing Up',
        level: 2,
        content: `<ul>
<li><strong>Window size and type:</strong> Standard double-hung windows are cheapest. Picture windows, casements, bay/bow windows, and custom shapes cost 20–100% more.</li>
<li><strong>Glass packages:</strong> Standard dual-pane Low-E is baseline. Triple-pane adds $75–$150 per window. Impact-rated glass for hurricane zones adds $100–$300 per window.</li>
<li><strong>Full-frame vs. insert installation:</strong> Insert (or "pocket") installation fits the new window into the existing frame — it's faster and cheaper ($200–$400/window for labor). Full-frame installation removes the entire old window and frame — it costs more ($400–$700/window for labor) but allows for proper inspection and replacement of any rotted framing.</li>
<li><strong>Interior trim and finishing:</strong> After full-frame installation, interior trim needs to be replaced. $50–$150 per window for standard casing. If you want matching custom trim, it costs more.</li>
<li><strong>Lead paint:</strong> Homes built before 1978 may have lead paint around windows. Certified lead-safe practices add $100–$300 per window. This is required by EPA regulations — not optional.</li>
<li><strong>Second-story and hard-to-access windows:</strong> Add $50–$150 per window for scaffolding and additional labor.</li>
</ul>`
      },
      {
        heading: 'Window Replacement Red Flags',
        level: 2,
        content: `<ul>
<li><strong>High-pressure in-home sales:</strong> If a window company sends a "sales consultant" to your home for a 2-hour presentation and the price drops $5,000 if you "sign today," you're dealing with a high-pressure outfit. Their initial prices are inflated to make the "discount" seem huge. Companies like this often charge $1,500–$2,500 per window for the same quality you can get for $600–$900.</li>
<li><strong>Lifetime warranty claims:</strong> Read the fine print. Many "lifetime" window warranties only cover the glass seal (not the frame or hardware), are prorated after 10–20 years, and are non-transferable to new homeowners. Ask for the actual warranty document before signing.</li>
<li><strong>"Energy savings will pay for the windows":</strong> Window replacement does save energy, but the payback period is typically 15–25 years. Anyone claiming your new windows will "pay for themselves in 5 years" is exaggerating. Replace windows for comfort, aesthetics, and home value — not energy savings alone.</li>
<li><strong>No mention of installation method:</strong> A quote that doesn't specify insert vs. full-frame installation is incomplete. This is the biggest variable in both cost and quality. Always ask.</li>
<li><strong>Vinyl windows over $1,200 each:</strong> Unless they're custom-sized or triple-pane, vinyl windows should not cost over $1,200 installed. If a company is quoting $1,500+ for standard vinyl, they're overcharging.</li>
</ul>`
      },
      {
        heading: 'How to Compare Window Quotes Fairly',
        level: 2,
        content: `<ul>
<li><strong>Compare price per window, not total project cost:</strong> Quotes may cover different numbers of windows. Calculate the per-window price to compare apples to apples.</li>
<li><strong>Match the brand and product line:</strong> "Vinyl windows" isn't specific enough. Compare by exact product line (e.g., Pella 250 Series vs. Andersen 100 Series).</li>
<li><strong>Check glass specs:</strong> U-factor and Solar Heat Gain Coefficient (SHGC) matter for energy efficiency. Lower U-factor = better insulation. Ask for Energy Star certification details.</li>
<li><strong>Verify the installer:</strong> Who does the actual installation? Some companies use subcontractors who may not be held to the same standards. Ask if installers are W-2 employees or subcontracted.</li>
<li><strong>Ask about structural inspection:</strong> During full-frame installation, the contractor should inspect for water damage, mold, and rot around the window openings. If they find issues, how is that priced?</li>
</ul>`
      }
    ],
    faqs: [
      {
        question: 'How much does window replacement cost in 2025?',
        answer: 'Window replacement costs $550–$900 per window for mid-range vinyl and $800–$1,500 for fiberglass in 2025. A whole-house replacement (15–20 windows) typically runs $8,000–$18,000 for vinyl or $12,000–$30,000 for premium options.'
      },
      {
        question: 'Is it worth replacing all windows at once?',
        answer: 'Yes, for most homeowners. Replacing all windows at once is 10–20% cheaper per window than doing them in batches because of reduced setup, travel, and ordering costs. It also ensures consistent appearance and performance throughout your home.'
      },
      {
        question: 'How long do replacement windows last?',
        answer: 'Vinyl windows last 20–30 years. Fiberglass windows last 30–40 years. Wood-clad windows last 30+ years with proper maintenance. The glass seal (which prevents fogging between panes) typically lasts 15–25 years regardless of frame material.'
      },
      {
        question: 'Should I get vinyl or fiberglass windows?',
        answer: 'Vinyl is the best value for most homes — it\'s affordable, low-maintenance, and performs well in moderate climates. Fiberglass is worth the premium if you live in an extreme climate (very hot, very cold, or coastal), want a slimmer frame profile, or plan to stay in the home long-term. Fiberglass is also stronger and doesn\'t warp.'
      }
    ]
  }
};

export const allGuideSlugs = Object.keys(guidesData);

export function getGuide(slug: string): Guide | undefined {
  return guidesData[slug];
}

export function getAllGuides(): Guide[] {
  return Object.values(guidesData);
}
