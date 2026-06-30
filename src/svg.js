// ============================================================================
// SVG UTILITIES — Parse, validate, render
// ============================================================================

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
      const supportsTexture = el.getAttribute('data-texture') === 'true';
      zones.push({
        id,
        type: 'text',
        label: label.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        defaultValue,
        defaultColor,
        tagName: el.tagName.toLowerCase(),
        supportsTexture
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
