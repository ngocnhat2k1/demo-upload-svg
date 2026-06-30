import { describe, it, expect } from 'vitest';
import { parseSvgZones, applyCustomization, TEXTURE_PRESETS } from '../src/svg.js';

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

describe('applyCustomization texture', () => {
  const SVG = `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
    <text id="text-a" data-texture="true" x="300" y="80" text-anchor="middle"
          fill="#000" stroke="#c9a14a" stroke-width="6">HELLO</text>
  </svg>`;

  it('exposes at least one preset with a data URI', () => {
    expect(TEXTURE_PRESETS.length).toBeGreaterThan(0);
    expect(TEXTURE_PRESETS[0].dataURI).toMatch(/^data:image\/svg\+xml,/);
  });

  it('image mode: masked image + contour, no solid colour overlay', () => {
    const out = applyCustomization(SVG, {
      'text-a': 'HELLO', 'text-a__color': '#0a0a0a',
      'text-a__mode': 'image', __texture: TEXTURE_PRESETS[0].id,
    });
    expect(out).toContain('tex-mask-text-a');
    expect(out).toContain('<image');
    expect(out).toContain('mask="url(#tex-mask-text-a)"');
    expect(out).toContain('stroke-width="1.2"'); // contour
  });

  it('colour mode: adds a solid colour overlay over the texture', () => {
    const out = applyCustomization(SVG, {
      'text-a': 'HELLO', 'text-a__color': '#ff0000',
      'text-a__mode': 'color', __texture: TEXTURE_PRESETS[0].id,
    });
    expect(out).toContain('<image');
    expect(out).toContain('fill="#ff0000"');
  });

  it('no texture selected: no mask/image (legacy behaviour)', () => {
    const out = applyCustomization(SVG, { 'text-a': 'HELLO', __texture: '' });
    expect(out).not.toContain('<mask');
    expect(out).not.toContain('<image');
  });

  it('texture set but field lacks data-texture: untouched', () => {
    const plain = `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <text id="text-z" x="10" y="10" fill="#000">Z</text></svg>`;
    const out = applyCustomization(plain, { __texture: TEXTURE_PRESETS[0].id });
    expect(out).not.toContain('<mask');
  });
});
