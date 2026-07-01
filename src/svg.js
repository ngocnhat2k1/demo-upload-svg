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
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Unique suffix per applyCustomization / preview build. SvgPreview inlines every
// SVG (incl. all cart items) into ONE document via dangerouslySetInnerHTML, so
// def ids (filter/pattern/mask) MUST be unique per render or `url(#id)` resolves
// to the first match and colours/scale bleed across items.
let __idCounter = 0;
const nextSuffix = () => (++__idCounter).toString(36);

// ----------------------------------------------------------------------------
// MOTIF LIBRARY
// Each motif is a transparent silhouette (opaque = motif, transparent = gaps).
// Colour is irrelevant — the tint filter recolours by ALPHA — but must be
// opaque. Motifs are authored on a 100×100 tile designed to repeat seamlessly.
// Bundled as inline SVG data URIs (no binary assets); user uploads are PNG.
// Both flow through the identical alpha-tint pipeline.
// ----------------------------------------------------------------------------
const motif = (inner) =>
  svgDataURI(`<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'>${inner}</svg>`);

// Staggered interlocking diamonds (echoes the old diamond-plate default).
const M_DIAMOND =
  `<g fill='#111'>`
  + `<path d='M50 27 72 50 50 73 28 50Z'/>`
  + `<path d='M0 -23 23 0 0 23 -23 0Z'/><path d='M100 -23 123 0 100 23 77 0Z'/>`
  + `<path d='M0 77 23 100 0 123 -23 100Z'/><path d='M100 77 123 100 100 123 77 100Z'/>`
  + `</g>`;
// 2×2 basket of rounded squares → carbon-fibre weave.
const M_CARBON =
  `<g fill='#111'><rect x='3' y='3' width='44' height='44' rx='9'/>`
  + `<rect x='53' y='53' width='44' height='44' rx='9'/></g>`;
// Hexagon outline grid.
const M_HEX =
  `<path d='M50 10 84 30 84 70 50 90 16 70 16 30Z' fill='none' stroke='#111'`
  + ` stroke-width='9' stroke-linejoin='round'/>`;
// Staggered dot grid.
const M_DOTS =
  `<g fill='#111'><circle cx='50' cy='50' r='15'/>`
  + `<circle cx='0' cy='0' r='15'/><circle cx='100' cy='0' r='15'/>`
  + `<circle cx='0' cy='100' r='15'/><circle cx='100' cy='100' r='15'/></g>`;
// Thin mesh grid.
const M_GRID =
  `<g fill='#111'><rect x='0' y='0' width='100' height='7'/>`
  + `<rect x='0' y='0' width='7' height='100'/></g>`;

export const MOTIF_LIBRARY = [
  { id: 'm-diamond', name: 'Diamond Plate', dataURI: motif(M_DIAMOND) },
  { id: 'm-carbon',  name: 'Carbon Weave',  dataURI: motif(M_CARBON) },
  { id: 'm-hex',     name: 'Hexagon',       dataURI: motif(M_HEX) },
  { id: 'm-dots',    name: 'Dots',          dataURI: motif(M_DOTS) },
  { id: 'm-grid',    name: 'Grid',          dataURI: motif(M_GRID) },
];

// Defaults for a newly-textured template.
export const DEFAULT_MOTIF_COLOR = '#aeb4ba'; // silver
export const DEFAULT_BG_COLOR = '';           // '' = transparent backing
export const DEFAULT_OUTLINE_COLOR = '#c9a14a'; // gold viền; '' = no outline
export const DEFAULT_SCALE = 1;
const BASE_TILE = 8;                           // canvas units at scale 1 (fine grain)
const OUTLINE_COLOR = '#0a0a0a';               // fallback inner fill when a field has none

// ----------------------------------------------------------------------------
// Builders
// ----------------------------------------------------------------------------

// Flat-tint a transparent silhouette to any solid colour using its alpha:
// feFlood paints the region, feComposite(in, SourceAlpha) clips it to the motif.
function buildTintFilter(doc, defs, id, color) {
  const filter = doc.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', id);
  // Slight padding avoids hairline seams where anti-aliased alpha meets the edge.
  filter.setAttribute('x', '-5%');
  filter.setAttribute('y', '-5%');
  filter.setAttribute('width', '110%');
  filter.setAttribute('height', '110%');
  const flood = doc.createElementNS(SVG_NS, 'feFlood');
  flood.setAttribute('flood-color', color);
  flood.setAttribute('result', 'flood');
  const comp = doc.createElementNS(SVG_NS, 'feComposite');
  comp.setAttribute('in', 'flood');
  comp.setAttribute('in2', 'SourceAlpha');
  comp.setAttribute('operator', 'in');
  filter.appendChild(flood);
  filter.appendChild(comp);
  defs.appendChild(filter);
}

// Tileable 2-tone motif: optional backing rect + tinted motif image, tiled in
// user space so the phase is identical across every glyph (seamless alignment).
function buildMotifPattern(doc, defs, id, filterId, dataURI, bgColor, tile) {
  const pattern = doc.createElementNS(SVG_NS, 'pattern');
  pattern.setAttribute('id', id);
  pattern.setAttribute('patternUnits', 'userSpaceOnUse');
  pattern.setAttribute('width', String(tile));
  pattern.setAttribute('height', String(tile));
  if (bgColor) {
    const rect = doc.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('width', String(tile));
    rect.setAttribute('height', String(tile));
    rect.setAttribute('fill', bgColor);
    pattern.appendChild(rect);
  }
  const image = doc.createElementNS(SVG_NS, 'image');
  image.setAttribute('href', dataURI);
  image.setAttribute('x', '0');
  image.setAttribute('y', '0');
  image.setAttribute('width', String(tile));
  image.setAttribute('height', String(tile));
  image.setAttribute('preserveAspectRatio', 'none');
  image.setAttribute('filter', `url(#${filterId})`);
  pattern.appendChild(image);
  defs.appendChild(pattern);
}

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

// Fill one text field's glyph (body + border, width W) with the shared motif
// pattern via a text-shaped mask. COLOR mode overlays a solid interior; a thin
// contour keeps edges crisp. Layer order (bottom→top): pattern, colour, contour.
function applyTextureToField(doc, defs, textEl, mode, color, outlineColor, canvasW, canvasH, suffix, patternId) {
  const id = textEl.getAttribute('id');
  if (!id) return;
  const content = textEl.textContent;
  // Preserve the field's ORIGINAL outline (viền) and inner fill (nền) so the
  // letter keeps its exact shape/weight; the plate only fills the interior.
  const origStroke = textEl.getAttribute('stroke') || 'none';
  const origStrokeW = textEl.getAttribute('stroke-width') || '0';
  const origFill = textEl.getAttribute('fill') || OUTLINE_COLOR;
  // Outline colour:
  //   undefined → keep the field's original outline (interior-only plate);
  //   ''        → transparent outline: the plate extends over the outline area
  //               too (mask widened by the stroke width; the ring's backing uses
  //               the inner fill so motif gaps stay solid);
  //   hex       → override the outline colour (interior-only plate).
  let stroke, maskStroke;
  if (outlineColor === undefined) { stroke = origStroke; maskStroke = '0'; }
  else if (outlineColor === '') { stroke = origFill; maskStroke = origStrokeW; }
  else { stroke = outlineColor; maskStroke = '0'; }
  const maskId = `tex-mask-${id}-${suffix}`;

  // Mask = glyph interior (+ outline width when the outline is transparent, so
  // the plate covers it). Anchored to user space so tiles align across fields.
  const maskAttrs = { fill: '#fff' };
  if (maskStroke !== '0') {
    maskAttrs.stroke = '#fff';
    maskAttrs['stroke-width'] = maskStroke;
    maskAttrs['paint-order'] = 'stroke';
    maskAttrs['stroke-linejoin'] = 'round';
  }
  const mask = doc.createElementNS(SVG_NS, 'mask');
  mask.setAttribute('id', maskId);
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  mask.appendChild(cloneTextLayer(doc, textEl, content, maskAttrs));
  defs.appendChild(mask);

  const layers = [];

  // 1) Original outlined letter: keeps the outline + a solid inner fill so the
  //    letter reads and the plate's transparent gaps show a colour, not the page.
  layers.push(cloneTextLayer(doc, textEl, content, {
    fill: origFill, stroke, 'stroke-width': origStrokeW,
    'paint-order': 'stroke', 'stroke-linejoin': 'round'
  }));

  // 2) Plate over the interior.
  const fillRect = doc.createElementNS(SVG_NS, 'rect');
  fillRect.setAttribute('x', '0');
  fillRect.setAttribute('y', '0');
  fillRect.setAttribute('width', String(canvasW));
  fillRect.setAttribute('height', String(canvasH));
  fillRect.setAttribute('fill', `url(#${patternId})`);
  fillRect.setAttribute('mask', `url(#${maskId})`);
  layers.push(fillRect);

  // 3) COLOR mode: solid interior over the plate (outline + fill still show).
  if (mode === 'color') {
    layers.push(cloneTextLayer(doc, textEl, content, { fill: color }));
  }

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

    // Pass 2: recolourable 2-tone motif fill for data-texture fields.
    // Active only when a motif is selected AND its data URI is present.
    const patternData = customization.__texPatternData;
    if (customization.__texture && patternData) {
      const vb = (svgEl.getAttribute('viewBox') || '0 0 600 400').trim().split(/\s+/);
      const canvasW = parseFloat(vb[2]) || 600;
      const canvasH = parseFloat(vb[3]) || 400;
      const defs = getOrCreateDefs(doc, svgEl);

      const suffix = nextSuffix();
      const filterId = `tex-tint-${suffix}`;
      const patternId = `tex-fill-${suffix}`;
      const motifColor = customization.__texMotifColor || DEFAULT_MOTIF_COLOR;
      const bgColor = customization.__texBgColor || '';
      const scale = clamp(parseFloat(customization.__texScale) || DEFAULT_SCALE, 0.5, 3);
      const tile = Math.max(4, Math.round(BASE_TILE * scale));

      buildTintFilter(doc, defs, filterId, motifColor);
      buildMotifPattern(doc, defs, patternId, filterId, patternData, bgColor, tile);

      const outlineColor = customization.__texOutlineColor; // undefined = keep original
      Array.from(doc.querySelectorAll('text[data-texture="true"]')).forEach((textEl) => {
        const fid = textEl.getAttribute('id');
        const mode = customization[`${fid}__mode`] || 'image';
        const color = customization[`${fid}__color`] || textEl.getAttribute('fill') || '#0a0a0a';
        applyTextureToField(doc, defs, textEl, mode, color, outlineColor, canvasW, canvasH, suffix, patternId);
      });
    }

    return new XMLSerializer().serializeToString(doc.documentElement);
  } catch (e) {
    return svgString;
  }
}
