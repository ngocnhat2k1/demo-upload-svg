import { describe, it, expect } from 'vitest';
import { parseSvgZones, applyCustomization } from '../src/svg.js';

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
