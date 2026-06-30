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
