# FREIGHT DECAL Texture Image Fill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let each FREIGHT DECAL text field be filled with a swappable background-image texture (default = texture on both body & outline; pick a colour = solid body, texture kept on the outline).

**Architecture:** Extract the two pure SVG functions (`parseSvgZones`, `applyCustomization`) plus the new texture data into a no-JSX module `src/svg.js` so they can be unit-tested with vitest/jsdom. Texture is rendered by replacing each tagged `<text>` with a `<mask>` (body+stroke), a full-canvas `<image>` clipped by that mask, an optional solid-colour overlay (colour mode), and a thin contour. A single shared `<image>` coordinate space (0 0 W H) keeps the texture seamless across all lines.

**Tech Stack:** React 18, Vite 5, Tailwind 3, lucide-react. Tests: vitest + jsdom.

## Global Constraints

- All new SVG logic lives in `src/svg.js` (plain JS, no JSX, no React import) so vitest can import it without the React plugin.
- Texture opt-in convention: attribute `data-texture="true"` on a `<text>` element. Only templates with ≥1 such field expose texture UI.
- Texture sources are embedded data-URIs (`data:image/svg+xml,...`) → exported SVG is self-contained. No external URLs.
- One texture per decal (state key `__texture` = preset id; empty/absent = no texture = legacy behaviour).
- Per-field mode state key `text-{id}__mode` = `'image' | 'color'`, default `'image'`.
- Do NOT modify other templates' behaviour. Empty/absent `__texture` must render byte-compatibly with today's output.
- Canvas size read from the SVG root `viewBox` (FREIGHT = `0 0 600 400`), never hard-coded.
- Existing state keys unchanged: `text-{id}` (content), `text-{id}__color` (colour), `zone-{id}` (fill).

---

### Task 1: Extract SVG utils into `src/svg.js` + set up vitest

Move `parseSvgZones` and `applyCustomization` verbatim out of `App.jsx` into a new plain-JS module, import them back, and lock current behaviour with a baseline test. No behaviour change.

**Files:**
- Create: `src/svg.js`
- Create: `vitest.config.js`
- Create: `test/svg.test.js`
- Modify: `src/App.jsx` (remove the two function defs ~lines 221-294; add import)
- Modify: `package.json` (add `test` script + devDeps)

**Interfaces:**
- Produces: `export function parseSvgZones(svgString)` → `{ zones, error, svgString }`; `export function applyCustomization(svgString, customization)` → `string`. Both identical to current behaviour.

- [ ] **Step 1: Install test deps**

Run: `npm install -D vitest jsdom`
Expected: packages added, no errors.

- [ ] **Step 2: Add test script to `package.json`**

In the `"scripts"` block add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.js`**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

- [ ] **Step 4: Create `src/svg.js` with the two functions moved verbatim**

Copy the EXACT current bodies of `parseSvgZones` (App.jsx ~221-269) and `applyCustomization` (App.jsx ~271-294) into this file, prefixing each with `export`:

```js
// ============================================================================
// SVG UTILITIES — Parse, validate, render
// ============================================================================

export function parseSvgZones(svgString) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) return { error: 'Invalid SVG syntax', zones: [] };

    const svgEl = doc.querySelector('svg');
    if (!svgEl) return { error: 'No <svg> root element found', zones: [] };

    const zones = [];
    const elements = doc.querySelectorAll('[id^="zone-"]');

    elements.forEach((el) => {
      const id = el.getAttribute('id');
      const fill = el.getAttribute('fill') || '#000000';
      const dataLabel = el.getAttribute('data-label');
      const label = dataLabel || id.replace('zone-', '').replace(/-/g, ' ');
      zones.push({
        id,
        type: 'color',
        label: label.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        defaultColor: fill,
        tagName: el.tagName.toLowerCase()
      });
    });

    const textElements = doc.querySelectorAll('[id^="text-"]');
    textElements.forEach((el) => {
      const id = el.getAttribute('id');
      const dataLabel = el.getAttribute('data-label');
      const label = dataLabel || id.replace('text-', '').replace(/-/g, ' ');
      const defaultValue = el.getAttribute('data-default') || el.textContent || '';
      const defaultColor = el.getAttribute('fill') || '#000000';
      zones.push({
        id,
        type: 'text',
        label: label.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        defaultValue,
        defaultColor,
        tagName: el.tagName.toLowerCase()
      });
    });

    return { zones, error: null, svgString };
  } catch (e) {
    return { zones: [], error: e.message };
  }
}

export function applyCustomization(svgString, customization) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    Object.entries(customization).forEach(([key, value]) => {
      if (key.endsWith('__color')) {
        const textId = key.slice(0, -7);
        const el = doc.getElementById(textId);
        if (el) el.setAttribute('fill', value);
        return;
      }
      const el = doc.getElementById(key);
      if (!el) return;
      if (key.startsWith('text-')) {
        el.textContent = value;
      } else {
        el.setAttribute('fill', value);
      }
    });
    return new XMLSerializer().serializeToString(doc.documentElement);
  } catch (e) {
    return svgString;
  }
}
```

- [ ] **Step 5: Update `App.jsx` to import instead of define**

Remove the local `parseSvgZones` and `applyCustomization` definitions (the whole block from the `// SVG UTILITIES` comment through the end of `applyCustomization`). Keep the `SvgPreview` component. Add an import near the top of `App.jsx` (after the lucide-react import):

```jsx
import { parseSvgZones, applyCustomization } from './svg.js';
```

- [ ] **Step 6: Write baseline test locking current behaviour**

Create `test/svg.test.js`:

```js
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
```

- [ ] **Step 7: Run tests — expect PASS**

Run: `npm test`
Expected: 3 tests pass.

- [ ] **Step 8: Verify the app still runs unchanged**

Run: `npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 9: Commit**

```bash
git add src/svg.js src/App.jsx vitest.config.js test/svg.test.js package.json package-lock.json
git commit -m "refactor: extract SVG utils to src/svg.js + add vitest baseline"
```

---

### Task 2: `parseSvgZones` reports `supportsTexture`

**Files:**
- Modify: `src/svg.js` (text-zone loop)
- Test: `test/svg.test.js`

**Interfaces:**
- Produces: each text zone object gains `supportsTexture: boolean` (`true` when the `<text>` has `data-texture="true"`).

- [ ] **Step 1: Write the failing test**

Append to `test/svg.test.js`:

```js
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
```

- [ ] **Step 2: Run it — expect FAIL**

Run: `npm test`
Expected: FAIL — `supportsTexture` is `undefined` (not `true`/`false`).

- [ ] **Step 3: Implement**

In `src/svg.js`, inside the `textElements.forEach` loop, add before `zones.push`:

```js
const supportsTexture = el.getAttribute('data-texture') === 'true';
```

and add `supportsTexture` to the pushed object:

```js
      zones.push({
        id,
        type: 'text',
        label: label.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        defaultValue,
        defaultColor,
        tagName: el.tagName.toLowerCase(),
        supportsTexture
      });
```

- [ ] **Step 4: Run it — expect PASS**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/svg.js test/svg.test.js
git commit -m "feat: parseSvgZones reports supportsTexture from data-texture attr"
```

---

### Task 3: `applyCustomization` renders texture (presets + mask/image/overlay/contour)

This is the core. Adds `TEXTURE_PRESETS` + helpers, and a second pass in `applyCustomization` that replaces each `data-texture="true"` text node when a texture is selected.

**Files:**
- Modify: `src/svg.js`
- Test: `test/svg.test.js`

**Interfaces:**
- Produces: `export const TEXTURE_PRESETS = [{ id, name, dataURI }]` (≥1 entry).
- `applyCustomization` reads `customization.__texture` (preset id) and per-field `customization['text-{id}__mode']` (`'image'|'color'`, default `'image'`) and `customization['text-{id}__color']`.

- [ ] **Step 1: Write the failing tests**

Append to `test/svg.test.js`:

```js
import { TEXTURE_PRESETS } from '../src/svg.js';

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
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npm test`
Expected: FAIL — `TEXTURE_PRESETS` undefined / no `<mask>` produced.

- [ ] **Step 3: Add presets + helpers at the top of `src/svg.js`**

```js
const SVG_NS = 'http://www.w3.org/2000/svg';

// Attributes that position/style a glyph; copied to every cloned text layer.
const POS_ATTRS = [
  'x', 'y', 'text-anchor', 'dominant-baseline',
  'font-family', 'font-size', 'font-weight', 'letter-spacing'
];

const svgDataURI = (svg) => 'data:image/svg+xml,' + encodeURIComponent(svg);

// Tileable diamond-plate texture (600x400, internal <pattern>). PLACEHOLDER —
// swap dataURI for real Drive images later; nothing else changes.
function plateSVG(base, light, dark) {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'>`
    + `<defs><pattern id='p' width='60' height='60' patternUnits='userSpaceOnUse'>`
    + `<rect width='60' height='60' fill='${base}'/>`
    + `<g fill='none' stroke='${dark}' stroke-width='5' stroke-linecap='round'>`
    + `<path d='M4 22 L18 8'/><path d='M18 8 L32 22'/><path d='M34 38 L48 52'/><path d='M48 52 L62 38'/></g>`
    + `<g fill='none' stroke='${light}' stroke-width='1.6' stroke-linecap='round'>`
    + `<path d='M4 20 L18 6'/><path d='M18 6 L32 20'/><path d='M34 36 L48 50'/><path d='M48 50 L62 36'/></g>`
    + `</pattern></defs><rect width='600' height='400' fill='url(#p)'/></svg>`;
}

export const TEXTURE_PRESETS = [
  { id: 'tex-silver', name: 'Silver Plate',  dataURI: svgDataURI(plateSVG('#aeb4ba', '#eef1f3', '#5f656b')) },
  { id: 'tex-carbon', name: 'Carbon',        dataURI: svgDataURI(plateSVG('#3a3d42', '#6b7178', '#141518')) },
  { id: 'tex-gold',   name: 'Brushed Gold',  dataURI: svgDataURI(plateSVG('#c9a14a', '#f3e3b0', '#7a5e1f')) },
];

function cloneTextLayer(doc, src, content, attrs) {
  const t = doc.createElementNS(SVG_NS, 'text');
  POS_ATTRS.forEach((a) => {
    const v = src.getAttribute(a);
    if (v != null) t.setAttribute(a, v);
  });
  Object.entries(attrs).forEach(([k, v]) => t.setAttribute(k, v));
  t.textContent = content;
  return t;
}

function getOrCreateDefs(doc, svgEl) {
  let defs = svgEl.querySelector('defs');
  if (!defs) {
    defs = doc.createElementNS(SVG_NS, 'defs');
    svgEl.insertBefore(defs, svgEl.firstChild);
  }
  return defs;
}

function applyTextureToField(doc, defs, textEl, dataURI, mode, color, canvasW, canvasH) {
  const id = textEl.getAttribute('id');
  const content = textEl.textContent;
  const w = textEl.getAttribute('stroke-width') || '4';
  const maskId = `tex-mask-${id}`;

  const mask = doc.createElementNS(SVG_NS, 'mask');
  mask.setAttribute('id', maskId);
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  mask.appendChild(cloneTextLayer(doc, textEl, content, {
    fill: '#fff', stroke: '#fff', 'stroke-width': w,
    'paint-order': 'stroke', 'stroke-linejoin': 'round'
  }));
  defs.appendChild(mask);

  const image = doc.createElementNS(SVG_NS, 'image');
  image.setAttribute('href', dataURI);
  image.setAttribute('x', '0');
  image.setAttribute('y', '0');
  image.setAttribute('width', String(canvasW));
  image.setAttribute('height', String(canvasH));
  image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  image.setAttribute('mask', `url(#${maskId})`);

  const layers = [image];
  if (mode === 'color') {
    layers.push(cloneTextLayer(doc, textEl, content, { fill: color }));
  }
  layers.push(cloneTextLayer(doc, textEl, content, {
    fill: 'none', stroke: '#0a0a0a', 'stroke-width': '1.2',
    'paint-order': 'stroke', 'stroke-linejoin': 'round'
  }));

  const parent = textEl.parentNode;
  layers.forEach((node) => parent.insertBefore(node, textEl));
  parent.removeChild(textEl);
}
```

- [ ] **Step 4: Replace `applyCustomization` body with the two-pass version**

```js
export function applyCustomization(svgString, customization) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return svgString;

    // Pass 1: content, text colour, zone fills (skip __-prefixed globals & __mode)
    Object.entries(customization).forEach(([key, value]) => {
      if (key.startsWith('__')) return;
      if (key.endsWith('__mode')) return;
      if (key.endsWith('__color')) {
        const textId = key.slice(0, -7);
        const el = doc.getElementById(textId);
        if (el) el.setAttribute('fill', value);
        return;
      }
      const el = doc.getElementById(key);
      if (!el) return;
      if (key.startsWith('text-')) {
        el.textContent = value;
      } else {
        el.setAttribute('fill', value);
      }
    });

    // Pass 2: texture fill for data-texture fields when a texture is selected
    const preset = customization.__texture
      ? TEXTURE_PRESETS.find((p) => p.id === customization.__texture)
      : null;
    if (preset && preset.dataURI) {
      const vb = (svgEl.getAttribute('viewBox') || '0 0 600 400').trim().split(/\s+/);
      const canvasW = parseFloat(vb[2]) || 600;
      const canvasH = parseFloat(vb[3]) || 400;
      const defs = getOrCreateDefs(doc, svgEl);
      Array.from(doc.querySelectorAll('text[data-texture="true"]')).forEach((textEl) => {
        const fid = textEl.getAttribute('id');
        const mode = customization[`${fid}__mode`] || 'image';
        const color = customization[`${fid}__color`] || textEl.getAttribute('fill') || '#0a0a0a';
        applyTextureToField(doc, defs, textEl, preset.dataURI, mode, color, canvasW, canvasH);
      });
    }

    return new XMLSerializer().serializeToString(doc.documentElement);
  } catch (e) {
    return svgString;
  }
}
```

- [ ] **Step 5: Run — expect PASS**

Run: `npm test`
Expected: all texture tests pass; baseline tests still pass.

- [ ] **Step 6: Commit**

```bash
git add src/svg.js test/svg.test.js
git commit -m "feat: applyCustomization renders texture fill (mask/image/overlay/contour)"
```

---

### Task 4: Tag FREIGHT DECAL text fields with `data-texture="true"`

**Files:**
- Modify: `src/App.jsx` (the `tpl-freight-decal` `svgContent`, ~lines 105-135)
- Test: `test/svg.test.js`

**Interfaces:**
- Consumes: `parseSvgZones` from Task 2.

- [ ] **Step 1: Write the failing test**

Append to `test/svg.test.js`:

```js
import { SAMPLE_TEMPLATES } from '../src/App.jsx';
```

> NOTE: if importing `App.jsx` pulls JSX that vitest can't parse without the React plugin, SKIP this import-based test and instead assert against an inline copy is NOT acceptable. Instead move `SAMPLE_TEMPLATES` to `src/templates.js` first (see Step 1a). Prefer Step 1a.

- [ ] **Step 1a: Move template/palette data to `src/templates.js` (enables import + keeps App.jsx lean)**

Create `src/templates.js`, move the `SAMPLE_TEMPLATES` and `COLOR_PALETTE` arrays verbatim out of `App.jsx`, prefix each with `export const`. In `App.jsx` replace the two definitions with:

```jsx
import { SAMPLE_TEMPLATES, COLOR_PALETTE } from './templates.js';
```

Then add this test to `test/svg.test.js`:

```js
import { SAMPLE_TEMPLATES } from '../src/templates.js';

describe('FREIGHT DECAL texture fields', () => {
  it('all 6 text fields opt into texture', () => {
    const freight = SAMPLE_TEMPLATES.find(t => t.id === 'tpl-freight-decal');
    const { zones } = parseSvgZones(freight.svgContent);
    const textZones = zones.filter(z => z.type === 'text');
    expect(textZones.length).toBe(6);
    expect(textZones.every(z => z.supportsTexture)).toBe(true);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npm test`
Expected: FAIL — `supportsTexture` is `false` for FREIGHT fields (attr not yet added).

- [ ] **Step 3: Add `data-texture="true"` to each FREIGHT `<text>`**

In `src/templates.js`, in the `tpl-freight-decal` `svgContent`, add `data-texture="true"` to all six text elements: `text-company-name`, `text-city`, `text-mc`, `text-usdot`, `text-vin`, `text-fire-tag`. Example for the first:

```
<text id="text-company-name" data-texture="true" data-label="Company Name" data-default="FREIGHT SOLUTIONS, LLC"
  x="300" y="80" text-anchor="middle" dominant-baseline="middle"
  font-family="Bebas Neue, sans-serif" font-size="38" font-weight="700"
  fill="#0a0a0a" stroke="#c9a14a" stroke-width="6"
  paint-order="stroke" stroke-linejoin="round" letter-spacing="2">FREIGHT SOLUTIONS, LLC</text>
```

Apply the same `data-texture="true"` insertion to the other five `<text>` elements.

- [ ] **Step 4: Run — expect PASS**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/templates.js src/App.jsx test/svg.test.js
git commit -m "feat: enable texture on all FREIGHT DECAL text fields"
```

---

### Task 5: Initialise texture state on template select & reset

**Files:**
- Modify: `src/App.jsx` (`selectTemplate`, ~lines 361-371)
- Modify: `src/App.jsx` (`Customizer.reset`, ~lines 752-759)
- Modify: `src/App.jsx` (import `TEXTURE_PRESETS`)

**Interfaces:**
- Consumes: `TEXTURE_PRESETS`, `parseSvgZones` (with `supportsTexture`).
- Produces: initial `customization` includes `__texture` (first preset id when template supports texture) and `text-{id}__mode='image'` for each texture field.

- [ ] **Step 1: Import the presets in `App.jsx`**

Update the svg import:

```jsx
import { parseSvgZones, applyCustomization, TEXTURE_PRESETS } from './svg.js';
```

- [ ] **Step 2: Extend `selectTemplate` init**

Replace the `zones.forEach(...)` init block in `selectTemplate` with:

```jsx
    const { zones } = parseSvgZones(template.svgContent);
    let templateHasTexture = false;
    zones.forEach((z) => {
      initial[z.id] = z.type === 'text' ? z.defaultValue : z.defaultColor;
      if (z.type === 'text') {
        initial[z.id + '__color'] = z.defaultColor;
        if (z.supportsTexture) {
          initial[z.id + '__mode'] = 'image';
          templateHasTexture = true;
        }
      }
    });
    if (templateHasTexture) initial.__texture = TEXTURE_PRESETS[0]?.id || '';
```

- [ ] **Step 3: Mirror the same init in `Customizer.reset`**

Replace the `reset()` body in `Customizer` with:

```jsx
  function reset() {
    const initial = {};
    let templateHasTexture = false;
    zones.forEach((z) => {
      initial[z.id] = z.type === 'text' ? z.defaultValue : z.defaultColor;
      if (z.type === 'text') {
        initial[z.id + '__color'] = z.defaultColor;
        if (z.supportsTexture) {
          initial[z.id + '__mode'] = 'image';
          templateHasTexture = true;
        }
      }
    });
    if (templateHasTexture) initial.__texture = TEXTURE_PRESETS[0]?.id || '';
    setCustomization(initial);
  }
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: initialise texture + per-field mode state on select/reset"
```

---

### Task 6: Texture picker panel in the Customizer

**Files:**
- Modify: `src/App.jsx` (`Customizer` — add panel + handler; import `ImageIcon` from lucide)

**Interfaces:**
- Consumes: `TEXTURE_PRESETS`, `customization.__texture`, `setCustomization`.
- Produces: a `TexturePanel` component rendered only when the template has texture fields; clicking a swatch sets `__texture`; "NONE" sets `''`.

- [ ] **Step 1: Add `Image as ImageIcon` to the lucide-react import** in `App.jsx`:

```jsx
import {
  ChevronLeft, ShoppingCart, Upload, Layers, Palette, Check, X,
  Plus, Trash2, RefreshCw, Download, FileCode, Tag, DollarSign,
  Zap, AlertCircle, Search, Grid3x3, Wrench, Eye, Code as CodeIcon,
  Settings, ArrowRight, Sparkles, Box, Hash, Activity, Type, Image as ImageIcon
} from 'lucide-react';
```

- [ ] **Step 2: Compute texture flags in `Customizer`**

After `const { zones } = parseSvgZones(template.svgContent);` add:

```jsx
  const templateHasTexture = zones.some((z) => z.supportsTexture);
  const activeTexture = customization.__texture || '';
  const setTexture = (id) =>
    setCustomization((prev) => ({ ...prev, __texture: id }));
```

- [ ] **Step 3: Add the `TexturePanel` component** (place above `function ZoneControl`):

```jsx
function TexturePanel({ presets, active, onSelect }) {
  return (
    <div className="border border-zinc-900">
      <div className="px-4 py-3 border-b border-zinc-900 flex items-center gap-2">
        <ImageIcon size={13} className="text-amber-400" />
        <span className="text-[11px] font-mono tracking-widest text-zinc-300">BACKGROUND TEXTURE</span>
      </div>
      <div className="p-4 grid grid-cols-4 gap-2">
        <button
          onClick={() => onSelect('')}
          className={`aspect-square border flex items-center justify-center text-[9px] font-mono tracking-widest transition-all ${
            active === ''
              ? 'border-amber-400 text-amber-400 bg-amber-400/5'
              : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
          }`}
        >
          NONE
        </button>
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            title={p.name}
            className={`aspect-square border bg-cover bg-center transition-all ${
              active === p.id
                ? 'border-amber-400 ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950'
                : 'border-zinc-800 hover:border-zinc-600'
            }`}
            style={{ backgroundImage: `url("${p.dataURI}")` }}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Render the panel** in the controls column, immediately before the `{/* Zone Editor */}` block:

```jsx
          {templateHasTexture && (
            <TexturePanel
              presets={TEXTURE_PRESETS}
              active={activeTexture}
              onSelect={setTexture}
            />
          )}
```

- [ ] **Step 5: Verify build + visually confirm panel appears**

Run: `npm run build`
Expected: build succeeds. (Visual check happens in Task 8.)

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add BACKGROUND TEXTURE picker panel to customizer"
```

---

### Task 7: `IMAGE | COLOR` toggle in `TextZoneControl`

**Files:**
- Modify: `src/App.jsx` (`Customizer` — pass new props to `TextZoneControl`)
- Modify: `src/App.jsx` (`TextZoneControl` — toggle + conditional colour section)

**Interfaces:**
- Consumes (new props on `TextZoneControl`): `textureActive: boolean`, `mode: 'image'|'color'`, `onModeChange: (m) => void`.
- Behaviour: when `textureActive` is true, show the toggle; hide the colour section while `mode === 'image'`. When `textureActive` is false, render exactly as today.

- [ ] **Step 1: Pass props where `TextZoneControl` is rendered** (in `Customizer`'s zone map). Replace the existing `<TextZoneControl .../>` usage with:

```jsx
                  <TextZoneControl
                    key={z.id}
                    zone={z}
                    current={customization[z.id]}
                    currentColor={customization[z.id + '__color']}
                    onChange={(v) => setZoneColor(z.id, v)}
                    onColorChange={(c) => setCustomization(prev => ({ ...prev, [z.id + '__color']: c }))}
                    active={activeZone === z.id}
                    onActivate={() => setActiveZone(z.id)}
                    textureActive={!!activeTexture && z.supportsTexture}
                    mode={customization[z.id + '__mode'] || 'image'}
                    onModeChange={(m) => setCustomization(prev => ({ ...prev, [z.id + '__mode']: m }))}
                  />
```

- [ ] **Step 2: Update the `TextZoneControl` signature**

```jsx
function TextZoneControl({ zone, current, currentColor, onChange, onColorChange, active, onActivate, textureActive, mode, onModeChange }) {
```

- [ ] **Step 3: Insert the mode toggle** right after the header `</div>` (just before the `{/* Text input */}` block):

```jsx
      {textureActive && (
        <div className="mb-3">
          <div className="text-[9px] font-mono text-zinc-600 tracking-widest mb-1">FILL</div>
          <div className="grid grid-cols-2 gap-1.5">
            {['image', 'color'].map((m) => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                className={`px-2 py-1.5 text-[10px] font-mono tracking-widest border transition-all flex items-center justify-center gap-1.5 ${
                  mode === m
                    ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                    : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                {m === 'image' ? <ImageIcon size={11} /> : <Palette size={11} />}
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
```

- [ ] **Step 4: Gate the colour section** so it hides in image mode. Wrap the existing `{/* Colour section — always visible */}` `<div>` block:

```jsx
      {(!textureActive || mode === 'color') && (
        <div>
          {/* ...existing colour header + presets/custom hex block, unchanged... */}
        </div>
      )}
```

(The inner content is the current colour block verbatim; only the wrapping condition is added.)

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "feat: per-field IMAGE|COLOR toggle in text zone control"
```

---

### Task 8: Visual verification in the browser

**Files:** none (manual verification of the running app).

- [ ] **Step 1: Start dev server**

Run: `npm run dev`
Expected: serves at `http://localhost:5173/`.

- [ ] **Step 2: Open FREIGHT DECAL → Customize.** Confirm:
  - Default render: all text shows the **silver diamond-plate texture** on body + outline; texture is continuous/aligned across all lines.
  - "BACKGROUND TEXTURE" panel shows NONE + 3 swatches; switching to Carbon/Gold updates all text live.

- [ ] **Step 3: Per-field colour.** On `MC Number`, toggle `COLOR`, pick red. Confirm body turns red while the **outline keeps the texture**; other fields stay textured. Toggle back to `IMAGE` → returns to full texture.

- [ ] **Step 4: NONE.** Set texture to NONE. Confirm every field reverts to the original gold-stroke look and toggles disappear (legacy behaviour intact).

- [ ] **Step 5: Other templates unaffected.** Open OWNER DECAL → confirm no texture panel/toggle appears and it renders as before.

- [ ] **Step 6: Cart export.** Add to cart → GENERATE PRINT FILES → confirm the output SVG renders identically (texture is embedded/self-contained).

- [ ] **Step 7: Commit (if any tweak files changed during verification)**

```bash
git add -A
git commit -m "chore: verify texture fill end-to-end"
```

---

## Self-Review

**Spec coverage:**
- §1 two states (image / colour-keeps-border) → Task 3 (overlay logic) + Task 8 §3 ✓
- §1 seamless full-canvas image → Task 3 `applyTextureToField` image at 0,0,W,H ✓
- §2 all 6 fields, per-field toggle → Task 4 + Task 7 ✓
- §3 mask/image/overlay/contour markup → Task 3 ✓
- §4 data model `__texture`, `__mode`, kept `__color` → Tasks 3 & 5 ✓
- §5 `data-texture` convention + `supportsTexture` → Task 2 ✓
- §6 base64/data-URI presets, self-contained → Task 3 (`svgDataURI`) + Task 8 §6 ✓
- §7 texture panel + IMAGE|COLOR toggle → Tasks 6 & 7 ✓
- §8 export self-contained → Task 3 + Task 8 §6 ✓
- §10 unique mask ids / DOM order / position-attr copy / small payload → `cloneTextLayer` copies POS_ATTRS, `maskId` per field, in-place replace ✓

**Placeholder scan:** No TBD/TODO. Placeholder *textures* are intentional + isolated to `TEXTURE_PRESETS[].dataURI` (swap-only). ✓

**Type consistency:** `parseSvgZones` → `supportsTexture` used in Tasks 4-7. `TEXTURE_PRESETS` shape `{id,name,dataURI}` consistent across svg.js/Customizer/TexturePanel. State keys `__texture`, `text-{id}__mode`, `text-{id}__color` identical in svg.js pass-2 and App.jsx init/handlers. `applyTextureToField` signature matches its single call site. ✓

**Note on Task 4:** templates moved to `src/templates.js` so vitest can import `SAMPLE_TEMPLATES` without the React/JSX plugin — same reasoning as extracting `src/svg.js`.
