// ============================================================================
// SAMPLE TEMPLATES — Pre-loaded SVG designs with zone naming convention
// ============================================================================

export const SAMPLE_TEMPLATES = [
  {
    id: 'tpl-velocity-stripes',
    name: 'VELOCITY STRIPES',
    category: 'Racing',
    basePrice: 89,
    description: 'High-speed racing stripe pattern. Perfect for sports cars and trucks. 3 customizable color zones for primary brand integration.',
    svgContent: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
<rect width="600" height="400" fill="#0a0a0a" id="zone-bg" data-label="Background"/>
<g opacity="0.15">
  <path d="M 0 0 L 600 0 L 600 1 L 0 1 Z" fill="#525252"/>
  <path d="M 0 100 L 600 100 L 600 101 L 0 101 Z" fill="#525252"/>
  <path d="M 0 200 L 600 200 L 600 201 L 0 201 Z" fill="#525252"/>
  <path d="M 0 300 L 600 300 L 600 301 L 0 301 Z" fill="#525252"/>
</g>
<path d="M 0 80 L 600 40 L 600 130 L 0 170 Z" fill="#dc2626" id="zone-primary" data-label="Primary Stripe"/>
<path d="M 0 195 L 600 155 L 600 220 L 0 260 Z" fill="#f59e0b" id="zone-mid" data-label="Mid Stripe"/>
<path d="M 0 285 L 600 245 L 600 310 L 0 350 Z" fill="#fbbf24" id="zone-accent" data-label="Accent Stripe"/>
</svg>`
  },
  {
    id: 'tpl-apex-flame',
    name: 'APEX FLAME',
    category: 'Decal',
    basePrice: 65,
    description: 'Aggressive flame decal for hood or side panels. Two-tone gradient effect through dual color zones.',
    svgContent: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
<rect width="600" height="400" fill="#1a1a1a" id="zone-bg" data-label="Background"/>
<path d="M 60 220 Q 110 110 195 165 Q 240 90 295 145 Q 335 75 395 155 Q 445 100 495 180 Q 545 140 555 215 Q 540 285 490 245 Q 440 320 390 270 Q 335 340 290 280 Q 240 325 195 260 Q 110 305 60 220 Z" fill="#ef4444" id="zone-flame-outer" data-label="Outer Flame"/>
<path d="M 110 215 Q 150 150 210 185 Q 245 135 285 170 Q 320 125 365 175 Q 410 145 450 200 Q 480 175 485 215 Q 475 245 445 215 Q 410 270 365 235 Q 320 285 285 240 Q 245 275 210 230 Q 150 260 110 215 Z" fill="#fbbf24" id="zone-flame-inner" data-label="Inner Flame"/>
</svg>`
  },
  {
    id: 'tpl-geometric-wave',
    name: 'GEOMETRIC WAVE',
    category: 'Pattern',
    basePrice: 110,
    description: 'Modern geometric wave pattern with 4 customizable zones. Ideal for full-side panel applications.',
    svgContent: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
<rect width="600" height="400" fill="#0a0a0a" id="zone-bg" data-label="Background"/>
<path d="M 0 0 L 220 0 L 110 210 L 0 110 Z" fill="#0ea5e9" id="zone-shape-1" data-label="Top Left Shape"/>
<path d="M 220 0 L 600 0 L 510 160 L 260 110 Z" fill="#06b6d4" id="zone-shape-2" data-label="Top Right Shape"/>
<path d="M 0 260 L 210 200 L 360 400 L 0 400 Z" fill="#f97316" id="zone-shape-3" data-label="Bottom Left Shape"/>
<path d="M 360 260 L 600 210 L 600 400 L 410 400 Z" fill="#eab308" id="zone-shape-4" data-label="Bottom Right Shape"/>
</svg>`
  },
  {
    id: 'tpl-tribal-edge',
    name: 'TRIBAL EDGE',
    category: 'Decal',
    basePrice: 75,
    description: 'Sharp angular tribal pattern. Bold statement piece for hood or quarter panels.',
    svgContent: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
<rect width="600" height="400" fill="#1a1a1a" id="zone-bg" data-label="Background"/>
<path d="M 50 200 L 150 100 L 250 180 L 350 80 L 450 160 L 550 60 L 550 140 L 450 240 L 350 160 L 250 260 L 150 180 L 50 280 Z" fill="#10b981" id="zone-tribal-top" data-label="Top Tribal"/>
<path d="M 50 220 L 150 320 L 250 240 L 350 340 L 450 260 L 550 360 L 550 280 L 450 380 L 350 300 L 250 380 L 150 300 L 50 380 Z" fill="#84cc16" id="zone-tribal-bottom" data-label="Bottom Tribal"/>
<circle cx="300" cy="200" r="42" fill="#fbbf24" id="zone-center" data-label="Center Accent"/>
</svg>`
  },
  {
    id: 'tpl-owners-decal',
    name: 'OWNER DECAL',
    category: 'Decal',
    basePrice: 55,
    description: 'Personalised owner decal with name and plate number. Two colour zones plus two editable text fields for full customisation.',
    svgContent: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
<rect width="600" height="400" fill="#0a0a0a" id="zone-bg" data-label="Background"/>
<rect x="40" y="60" width="520" height="280" rx="8" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
<rect x="160" y="290" width="280" height="28" rx="4" fill="#fbbf24" id="zone-plate-bg" data-label="Plate Background"/>
<text id="text-plate" data-label="Plate Number" data-default="WF-0000"
  x="300" y="311" text-anchor="middle" dominant-baseline="middle"
  font-family="JetBrains Mono, monospace" font-size="15" font-weight="700"
  fill="#0a0a0a" letter-spacing="3">WF-0000</text>
<text id="text-owner-name" data-label="Owner Name" data-default="YOUR NAME"
  x="300" y="195" text-anchor="middle" dominant-baseline="middle"
  font-family="Bebas Neue, sans-serif" font-size="52" fill="#fafafa" letter-spacing="4">YOUR NAME</text>
<line x1="160" y1="240" x2="440" y2="240" stroke="#3f3f46" stroke-width="1"/>
<text x="300" y="265" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#71717a" letter-spacing="4">CUSTOM VEHICLE DECAL</text>
</svg>`
  },
  {
    id: 'tpl-freight-decal',
    name: 'FREIGHT DECAL',
    category: 'Decal',
    basePrice: 95,
    description: 'Commercial truck DOT compliance decal. Six editable text fields (company, city, MC, USDOT, VIN, fire tag) with bold outlined typography. Demonstrates path-style outline using native <text> + stroke + paint-order.',
    svgContent: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
<rect width="600" height="400" fill="#fafafa" id="zone-bg" data-label="Background"/>
<g transform="translate(470,55)" opacity="0.85">
  <path d="M -10 0 L 50 0 L 60 -10 L 80 5 L 60 20 L 50 12 L -10 12 Z" fill="#c9a14a" stroke="#0a0a0a" stroke-width="1.5"/>
  <path d="M 30 -22 L 36 -4 L 54 -2 L 40 8 L 46 26 L 30 16 L 14 26 L 20 8 L 6 -2 L 24 -4 Z" fill="#c9a14a" stroke="#0a0a0a" stroke-width="1.5"/>
</g>
<text id="text-company-name" data-texture="true" data-label="Company Name" data-default="FREIGHT SOLUTIONS, LLC"
  x="300" y="80" text-anchor="middle" dominant-baseline="middle"
  font-family="Bebas Neue, sans-serif" font-size="38" font-weight="700"
  fill="#0a0a0a" stroke="#c9a14a" stroke-width="6"
  paint-order="stroke" stroke-linejoin="round" letter-spacing="2">FREIGHT SOLUTIONS, LLC</text>
<text id="text-city" data-texture="true" data-label="City" data-default="HOUSTON, TX"
  x="300" y="120" text-anchor="middle" dominant-baseline="middle"
  font-family="Bebas Neue, sans-serif" font-size="18" font-weight="700"
  fill="#0a0a0a" stroke="#c9a14a" stroke-width="3.5"
  paint-order="stroke" stroke-linejoin="round" letter-spacing="4">HOUSTON, TX</text>
<text id="text-mc" data-texture="true" data-label="MC Number" data-default="MC 747394"
  x="300" y="175" text-anchor="middle" dominant-baseline="middle"
  font-family="JetBrains Mono, monospace" font-size="24" font-weight="700"
  fill="#0a0a0a" stroke="#c9a14a" stroke-width="5"
  paint-order="stroke" stroke-linejoin="round">MC 747394</text>
<text id="text-usdot" data-texture="true" data-label="USDOT Number" data-default="USDOT 2149161"
  x="300" y="220" text-anchor="middle" dominant-baseline="middle"
  font-family="JetBrains Mono, monospace" font-size="24" font-weight="700"
  fill="#0a0a0a" stroke="#c9a14a" stroke-width="5"
  paint-order="stroke" stroke-linejoin="round">USDOT 2149161</text>
<text id="text-vin" data-texture="true" data-label="VIN" data-default="VIN 1HGCM82633A123456"
  x="300" y="260" text-anchor="middle" dominant-baseline="middle"
  font-family="JetBrains Mono, monospace" font-size="14" font-weight="700"
  fill="#0a0a0a" stroke="#c9a14a" stroke-width="3"
  paint-order="stroke" stroke-linejoin="round">VIN 1HGCM82633A123456</text>
<rect x="150" y="330" width="300" height="28" rx="2" fill="#0a0a0a"/>
<g transform="translate(166,344)"><rect x="-6" y="-9" width="12" height="18" rx="1" fill="#dc2626"/><rect x="-3" y="-12" width="6" height="4" fill="#0a0a0a"/></g>
<text id="text-fire-tag" data-texture="true" data-label="Fire Tag" data-default="FIRE EXTINGUISHER INSIDE"
  x="305" y="349" text-anchor="middle" dominant-baseline="middle"
  font-family="DM Sans, sans-serif" font-size="12" font-weight="700"
  fill="#fafafa" letter-spacing="2">FIRE EXTINGUISHER INSIDE</text>
</svg>`
  },
  {
    id: 'tpl-jersey-pro',
    name: 'JERSEY PRO',
    category: 'Apparel',
    basePrice: 120,
    description: 'Pro-style sports jersey back. Editable player name and big-format number with outlined typography. Two color zones for jersey base and accent stripes.',
    svgContent: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
<rect width="600" height="400" fill="#09090b"/>
<path d="M 180 60 L 230 40 L 250 70 L 350 70 L 370 40 L 420 60 L 460 110 L 440 130 L 440 360 L 160 360 L 160 130 L 140 110 Z" fill="#1d4ed8" id="zone-jersey" data-label="Jersey Base"/>
<rect x="160" y="150" width="280" height="8" fill="#fafafa" id="zone-stripes" data-label="Accent Stripes"/>
<rect x="160" y="340" width="280" height="6" fill="#fafafa"/>
<text id="text-player-name" data-label="Player Name" data-default="RODRIGUEZ"
  x="300" y="135" text-anchor="middle" dominant-baseline="middle"
  font-family="Bebas Neue, sans-serif" font-size="32" font-weight="700"
  fill="#fafafa" letter-spacing="6">RODRIGUEZ</text>
<text id="text-player-number" data-label="Number" data-default="23"
  x="300" y="260" text-anchor="middle" dominant-baseline="middle"
  font-family="Bebas Neue, sans-serif" font-size="170" font-weight="700"
  fill="#fafafa" stroke="#c9a14a" stroke-width="7"
  paint-order="stroke" stroke-linejoin="round">23</text>
</svg>`
  },
  {
    id: 'tpl-event-poster',
    name: 'EVENT POSTER',
    category: 'Pattern',
    basePrice: 70,
    description: 'Concert / event poster layout. Title, date, venue, and tagline all editable. Two color zones for background and accent bar.',
    svgContent: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
<rect width="600" height="400" fill="#0a0a0a" id="zone-bg" data-label="Background"/>
<g opacity="0.08">
  <path d="M 0 60 L 600 60" stroke="#fafafa" stroke-width="1"/>
  <path d="M 0 120 L 600 120" stroke="#fafafa" stroke-width="1"/>
  <path d="M 0 180 L 600 180" stroke="#fafafa" stroke-width="1"/>
  <path d="M 0 240 L 600 240" stroke="#fafafa" stroke-width="1"/>
  <path d="M 0 300 L 600 300" stroke="#fafafa" stroke-width="1"/>
</g>
<rect x="40" y="80" width="8" height="240" fill="#dc2626" id="zone-accent" data-label="Accent Bar"/>
<text id="text-event-title" data-label="Event Title" data-default="MIDNIGHT VECTOR"
  x="80" y="170" font-family="Bebas Neue, sans-serif" font-size="64" font-weight="700"
  fill="#fafafa" letter-spacing="3">MIDNIGHT VECTOR</text>
<text id="text-event-date" data-label="Date" data-default="FRI · 06 JUN 2026"
  x="80" y="210" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700"
  fill="#fbbf24" letter-spacing="4">FRI · 06 JUN 2026</text>
<text id="text-event-venue" data-label="Venue" data-default="THE FORGE · DOWNTOWN"
  x="80" y="248" font-family="DM Sans, sans-serif" font-size="16" font-weight="700"
  fill="#fafafa" letter-spacing="3">THE FORGE · DOWNTOWN</text>
<text id="text-event-tagline" data-label="Tagline" data-default="LIVE / ONE NIGHT ONLY"
  x="80" y="290" font-family="JetBrains Mono, monospace" font-size="12" font-weight="500"
  fill="#a1a1aa" letter-spacing="6">LIVE / ONE NIGHT ONLY</text>
<text x="80" y="350" font-family="JetBrains Mono, monospace" font-size="9"
  fill="#52525b" letter-spacing="4">WRAPFORGE · TEMPLATE · POSTER-001</text>
</svg>`
  }
];

// ============================================================================
// COLOR PALETTE — Inspired by automotive vinyl wrap colors
// ============================================================================

export const COLOR_PALETTE = [
  { name: 'Jet Black', hex: '#0a0a0a' },
  { name: 'Snow White', hex: '#fafafa' },
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Burnt Orange', hex: '#ea580c' },
  { name: 'Solar Yellow', hex: '#fbbf24' },
  { name: 'Lime Green', hex: '#84cc16' },
  { name: 'Forest Green', hex: '#059669' },
  { name: 'Sky Blue', hex: '#0ea5e9' },
  { name: 'Royal Blue', hex: '#1d4ed8' },
  { name: 'Deep Purple', hex: '#7c3aed' },
  { name: 'Hot Pink', hex: '#ec4899' },
  { name: 'Steel Gray', hex: '#475569' },
  { name: 'Chrome Silver', hex: '#cbd5e1' },
  { name: 'Coffee Brown', hex: '#78350f' },
  { name: 'Neon Cyan', hex: '#22d3ee' },
  { name: 'Acid Green', hex: '#a3e635' }
];
