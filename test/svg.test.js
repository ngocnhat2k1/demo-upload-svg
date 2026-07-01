import { describe, it, expect } from 'vitest';
import { parseSvgZones, applyCustomization, MOTIF_LIBRARY } from '../src/svg.js';
import { SAMPLE_TEMPLATES } from '../src/templates.js';

const SAMPLE = `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" fill="#000000" id="zone-bg" data-label="Background"/>
  <text id="text-a" data-label="Title" data-default="HELLO" x="300" y="80"
        text-anchor="middle" fill="#ffffff">HELLO</text>
</svg>`;

describe('parseSvgZones (baseline)', () => {
  it('detects a colour zone and a text zone', () => {
    const { zones, error } = parseSvgZones(SAMPLE);
    expect(error).toBeNull();
    expect(zones.find(z => z.id === 'zone-bg').type).toBe('color');
    expect(zones.find(z => z.id === 'text-a').type).toBe('text');
  });
});

describe('applyCustomization (baseline)', () => {
  it('replaces text content and zone fill', () => {
    const out = applyCustomization(SAMPLE, { 'text-a': 'WORLD', 'zone-bg': '#ff0000' });
    expect(out).toContain('>WORLD<');
    expect(out).toContain('fill="#ff0000"');
  });

  it('applies text colour via __color key', () => {
    const out = applyCustomization(SAMPLE, { 'text-a__color': '#00ff00' });
    expect(out).toContain('fill="#00ff00"');
  });
});

describe('parseSvgZones supportsTexture', () => {
  const SVG = `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
    <text id="text-a" data-texture="true" fill="#000">A</text>
    <text id="text-b" fill="#000">B</text>
  </svg>`;

  it('flags only text with data-texture="true"', () => {
    const { zones } = parseSvgZones(SVG);
    expect(zones.find(z => z.id === 'text-a').supportsTexture).toBe(true);
    expect(zones.find(z => z.id === 'text-b').supportsTexture).toBe(false);
  });
});

describe('applyCustomization motif texture', () => {
  const SVG = `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
    <text id="text-a" data-texture="true" x="300" y="80" text-anchor="middle"
          fill="#000" stroke="#c9a14a" stroke-width="6">HELLO</text>
  </svg>`;

  // Selecting a motif stores both its id and its data URI (self-contained export).
  const tex = (extra) => ({
    __texture: MOTIF_LIBRARY[0].id,
    __texPatternData: MOTIF_LIBRARY[0].dataURI,
    ...extra,
  });

  it('exposes a motif library where each entry has a data URI', () => {
    expect(MOTIF_LIBRARY.length).toBeGreaterThan(0);
    MOTIF_LIBRARY.forEach((m) => {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.dataURI).toMatch(/^data:image\/svg\+xml,/);
    });
  });

  it('image mode: builds tint filter + tiled pattern + masked pattern fill + contour', () => {
    const out = applyCustomization(SVG, tex({
      'text-a': 'HELLO', 'text-a__color': '#0a0a0a', 'text-a__mode': 'image',
    }));
    // tint filter
    expect(out).toContain('<filter');
    expect(out).toContain('feFlood');
    expect(out).toContain('SourceAlpha');
    // tiled pattern in user space
    expect(out).toContain('<pattern');
    expect(out).toContain('patternUnits="userSpaceOnUse"');
    // glyph is masked (namespaced id) and filled by the pattern
    expect(out).toMatch(/mask="url\(#tex-mask-text-a-[^)]+\)"/);
    expect(out).toMatch(/fill="url\(#tex-fill-[^)]+\)"/);
    // the field's original outline (viền) is preserved
    expect(out).toContain('stroke="#c9a14a"');
  });

  it('outline colour: overrides via __texOutlineColor; transparent lets the plate fill the outline', () => {
    const over = applyCustomization(SVG, tex({ 'text-a__mode': 'image', __texOutlineColor: '#00ff00' }));
    expect(over).toContain('stroke="#00ff00"');
    expect(over).not.toContain('stroke="#c9a14a"'); // original gold replaced
    expect(over).not.toContain('stroke="#fff"');    // interior-only mask (no outline coverage)
    // Transparent outline → mask widens to cover the stroke area with the plate.
    const clear = applyCustomization(SVG, tex({ 'text-a__mode': 'image', __texOutlineColor: '' }));
    expect(clear).toContain('stroke="#fff"');       // mask now covers the outline
    expect(clear).not.toContain('stroke="#00ff00"');
  });

  it('colour mode: adds a solid colour overlay over the pattern', () => {
    const out = applyCustomization(SVG, tex({
      'text-a': 'HELLO', 'text-a__color': '#ff00aa', 'text-a__mode': 'color',
    }));
    expect(out).toContain('<pattern');
    expect(out).toContain('fill="#ff00aa"');
  });

  it('backing rect present when __texBgColor set, absent when transparent', () => {
    const withBg = applyCustomization(SVG, tex({ 'text-a__mode': 'image', __texBgColor: '#123456' }));
    expect(withBg).toContain('fill="#123456"');
    const noBg = applyCustomization(SVG, tex({ 'text-a__mode': 'image', __texBgColor: '' }));
    expect(noBg).not.toContain('#123456');
    expect(noBg).toContain('<pattern'); // pattern still built, just no backing
  });

  it('scale is reflected in the pattern tile size', () => {
    const s1 = applyCustomization(SVG, tex({ 'text-a__mode': 'image', __texScale: 1 }));
    expect(s1).toContain('width="8"'); // BASE_TILE * 1
    const s2 = applyCustomization(SVG, tex({ 'text-a__mode': 'image', __texScale: 2 }));
    expect(s2).toContain('width="16"'); // BASE_TILE * 2
  });

  it('embeds the motif data URI exactly (self-contained export)', () => {
    const out = applyCustomization(SVG, tex({ 'text-a__mode': 'image' }));
    expect(out).toContain(MOTIF_LIBRARY[0].dataURI);
  });

  it('generates unique def ids per call (no cross-item bleed in shared DOM)', () => {
    const cfg = tex({ 'text-a__mode': 'image' });
    const a = applyCustomization(SVG, cfg);
    const b = applyCustomization(SVG, cfg);
    const idA = a.match(/tex-fill-([a-z0-9]+)/)[1];
    const idB = b.match(/tex-fill-([a-z0-9]+)/)[1];
    expect(idA).not.toBe(idB);
  });

  it('no motif selected: legacy behaviour (no mask/pattern/filter)', () => {
    const out = applyCustomization(SVG, { 'text-a': 'HELLO', __texture: '' });
    expect(out).not.toContain('<mask');
    expect(out).not.toContain('<pattern');
    expect(out).not.toContain('<filter');
  });

  it('motif id set but data missing: falls back to legacy (no broken href)', () => {
    const out = applyCustomization(SVG, { 'text-a': 'HELLO', __texture: MOTIF_LIBRARY[0].id });
    expect(out).not.toContain('<mask');
    expect(out).not.toContain('<pattern');
  });

  it('texture active but field lacks data-texture: field untouched', () => {
    const plain = `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <text id="text-z" x="10" y="10" fill="#000">Z</text></svg>`;
    const out = applyCustomization(plain, tex({}));
    expect(out).not.toContain('<mask');
  });
});

describe('FREIGHT DECAL texture fields', () => {
  it('all 6 text fields opt into texture', () => {
    const freight = SAMPLE_TEMPLATES.find(t => t.id === 'tpl-freight-decal');
    const { zones } = parseSvgZones(freight.svgContent);
    const textZones = zones.filter(z => z.type === 'text');
    expect(textZones.length).toBe(6);
    expect(textZones.every(z => z.supportsTexture)).toBe(true);
  });
});
