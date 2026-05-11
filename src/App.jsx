import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronLeft, ShoppingCart, Upload, Layers, Palette, Check, X,
  Plus, Trash2, RefreshCw, Download, FileCode, Tag, DollarSign,
  Zap, AlertCircle, Search, Grid3x3, Wrench, Eye, Code as CodeIcon,
  Settings, ArrowRight, Sparkles, Box, Hash, Activity
} from 'lucide-react';

// ============================================================================
// SAMPLE TEMPLATES — Pre-loaded SVG designs with zone naming convention
// ============================================================================

const SAMPLE_TEMPLATES = [
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
  }
];

// ============================================================================
// COLOR PALETTE — Inspired by automotive vinyl wrap colors
// ============================================================================

const COLOR_PALETTE = [
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

// ============================================================================
// SVG UTILITIES — Parse, validate, render
// ============================================================================

function parseSvgZones(svgString) {
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

    return { zones, error: null, svgString };
  } catch (e) {
    return { zones: [], error: e.message };
  }
}

function applyCustomization(svgString, customization) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    Object.entries(customization).forEach(([zoneId, color]) => {
      const el = doc.getElementById(zoneId);
      if (el) el.setAttribute('fill', color);
    });
    return new XMLSerializer().serializeToString(doc.documentElement);
  } catch (e) {
    return svgString;
  }
}

// Inline-render an SVG safely
function SvgPreview({ svg, className = '' }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  const [view, setView] = useState('showroom');
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [customization, setCustomization] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Load templates from persistent storage
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (typeof window !== 'undefined' && window.storage) {
          try {
            const result = await window.storage.get('templates_db');
            if (alive && result && result.value) {
              setTemplates(JSON.parse(result.value));
              setLoading(false);
              return;
            }
          } catch (e) {
            // Key doesn't exist
          }
          await window.storage.set('templates_db', JSON.stringify(SAMPLE_TEMPLATES));
        }
      } catch (e) {}
      if (alive) {
        setTemplates(SAMPLE_TEMPLATES);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  async function persistTemplates(newTemplates) {
    setTemplates(newTemplates);
    try {
      if (typeof window !== 'undefined' && window.storage) {
        await window.storage.set('templates_db', JSON.stringify(newTemplates));
      }
    } catch (e) {}
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  }

  function selectTemplate(template) {
    setCurrentTemplate(template);
    const initial = {};
    const { zones } = parseSvgZones(template.svgContent);
    zones.forEach((z) => (initial[z.id] = z.defaultColor));
    setCustomization(initial);
    setView('customize');
  }

  function addToCart() {
    const finalSvg = applyCustomization(currentTemplate.svgContent, customization);
    const item = {
      id: `order-${Date.now()}`,
      template: currentTemplate,
      customization: { ...customization },
      finalSvg,
      timestamp: Date.now()
    };
    setCart([...cart, item]);
    showToast('Added to cart');
    setView('cart');
  }

  function removeFromCart(id) {
    setCart(cart.filter((i) => i.id !== id));
  }

  async function deleteTemplate(id) {
    const next = templates.filter((t) => t.id !== id);
    await persistTemplates(next);
    showToast('Template removed');
  }

  async function addTemplate(t) {
    const next = [...templates, t];
    await persistTemplates(next);
    showToast('Template uploaded');
  }

  async function resetToSamples() {
    await persistTemplates(SAMPLE_TEMPLATES);
    showToast('Reset to defaults');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-amber-400 font-mono text-xs tracking-[0.3em] animate-pulse">
          INITIALIZING WRAPFORGE
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;700&family=DM+Sans:wght@400;500;700&display=swap');
        body, html, #root { font-family: 'DM Sans', system-ui, sans-serif; background: #09090b; }
        .font-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.04em; }
        .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .scanline-overlay {
          position: relative;
        }
        .scanline-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.0) 0px,
            rgba(255,255,255,0.0) 3px,
            rgba(255,255,255,0.012) 3px,
            rgba(255,255,255,0.012) 4px
          );
          pointer-events: none;
        }
        .corner-cut {
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
        }
        .glow-amber { box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.2), 0 0 24px -4px rgba(251, 191, 36, 0.4); }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>

      <TopNav view={view} setView={setView} cartCount={cart.length} />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        {view === 'showroom' && (
          <Showroom templates={templates} onSelect={selectTemplate} onResetSamples={resetToSamples} />
        )}
        {view === 'customize' && currentTemplate && (
          <Customizer
            template={currentTemplate}
            customization={customization}
            setCustomization={setCustomization}
            onAddToCart={addToCart}
            onBack={() => setView('showroom')}
          />
        )}
        {view === 'cart' && (
          <CartView items={cart} onRemove={removeFromCart} onContinue={() => setView('showroom')} />
        )}
        {view === 'studio' && (
          <Studio
            templates={templates}
            onAdd={addTemplate}
            onDelete={deleteTemplate}
            showToast={showToast}
          />
        )}
      </main>

      <footer className="border-t border-zinc-900 mt-20 py-6 px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono tracking-widest text-zinc-600">
          <div>WRAPFORGE · DEMO BUILD · v0.1.0</div>
          <div className="flex items-center gap-4">
            <span>SVG-NATIVE</span>
            <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
            <span>AUTO-DETECT ZONES</span>
            <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
            <span>VECTOR OUTPUT</span>
          </div>
        </div>
      </footer>

      {toast && <Toast {...toast} />}
    </div>
  );
}

// ============================================================================
// TOP NAV
// ============================================================================

function TopNav({ view, setView, cartCount }) {
  const tabs = [
    { id: 'showroom', label: 'SHOWROOM', icon: Grid3x3 },
    { id: 'studio', label: 'STUDIO', icon: Wrench }
  ];
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setView('showroom')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-7 h-7 bg-amber-400 flex items-center justify-center text-zinc-950 corner-cut">
              <Zap size={16} strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl text-zinc-100 group-hover:text-amber-400 transition-colors">
              WRAPFORGE
            </span>
          </button>
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setView(t.id)}
                className={`px-4 py-2 text-xs font-mono tracking-widest transition-all flex items-center gap-2 ${
                  view === t.id
                    ? 'text-amber-400'
                    : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                <t.icon size={13} />
                {t.label}
                {view === t.id && <span className="w-1 h-1 bg-amber-400 rounded-full"></span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('cart')}
            className={`relative px-3 py-2 text-xs font-mono tracking-widest transition-all flex items-center gap-2 border ${
              view === 'cart'
                ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                : 'border-zinc-800 text-zinc-300 hover:border-zinc-700'
            }`}
          >
            <ShoppingCart size={13} />
            <span>CART</span>
            {cartCount > 0 && (
              <span className="bg-amber-400 text-zinc-950 px-1.5 py-0.5 text-[10px] font-bold ml-1">
                {String(cartCount).padStart(2, '0')}
              </span>
            )}
          </button>
        </div>
      </div>
      {/* Mobile tabs */}
      <div className="md:hidden flex border-t border-zinc-900">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`flex-1 px-4 py-2.5 text-[10px] font-mono tracking-widest flex items-center justify-center gap-1.5 ${
              view === t.id ? 'text-amber-400 bg-amber-400/5' : 'text-zinc-500'
            }`}
          >
            <t.icon size={11} />
            {t.label}
          </button>
        ))}
      </div>
    </header>
  );
}

// ============================================================================
// SHOWROOM
// ============================================================================

function Showroom({ templates, onSelect, onResetSamples }) {
  const [filter, setFilter] = useState('all');
  const categories = useMemo(() => {
    const cats = new Set(templates.map((t) => t.category));
    return ['all', ...Array.from(cats)];
  }, [templates]);

  const filtered = useMemo(() => {
    if (filter === 'all') return templates;
    return templates.filter((t) => t.category === filter);
  }, [templates, filter]);

  return (
    <div className="animate-slideUp">
      {/* Hero */}
      <div className="relative grid-bg border border-zinc-900 bg-zinc-950 mb-8 overflow-hidden">
        <div className="relative px-6 sm:px-10 py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-amber-400"></div>
            <span className="text-[10px] font-mono tracking-[0.3em] text-amber-400">/ SHOWROOM</span>
          </div>
          <h1 className="font-display text-5xl sm:text-7xl text-zinc-100 leading-none mb-3">
            VECTOR <span className="text-amber-400">WRAP</span> LIBRARY
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl">
            Browse {templates.length} production-ready templates. Each design is fully customizable with{' '}
            <span className="text-amber-400 font-mono text-xs">id-prefix</span> color zones detected at build-time.
          </p>
        </div>
        <div className="absolute right-4 top-4 text-[10px] font-mono text-zinc-600 tracking-widest">
          {String(templates.length).padStart(3, '0')}/∞
        </div>
        <div className="absolute right-0 bottom-0 w-32 h-32 border-l border-t border-zinc-900"></div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 text-[10px] font-mono tracking-widest border transition-all ${
                filter === c
                  ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={onResetSamples}
          className="text-[10px] font-mono tracking-widest text-zinc-500 hover:text-amber-400 flex items-center gap-1.5"
        >
          <RefreshCw size={11} />
          RESET LIBRARY
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="border border-zinc-900 p-16 text-center">
          <Box className="mx-auto text-zinc-700 mb-3" size={32} />
          <div className="font-mono text-xs tracking-widest text-zinc-500">NO TEMPLATES IN THIS CATEGORY</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t, i) => (
            <TemplateCard key={t.id} template={t} index={i} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template, index, onSelect }) {
  const { zones } = parseSvgZones(template.svgContent);
  return (
    <button
      onClick={() => onSelect(template)}
      className="group text-left bg-zinc-950 border border-zinc-900 hover:border-amber-400/40 transition-all relative overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="aspect-[3/2] bg-zinc-900 relative overflow-hidden scanline-overlay">
        <SvgPreview svg={template.svgContent} className="w-full h-full" />
        <div className="absolute top-3 left-3 px-2 py-1 bg-zinc-950/90 backdrop-blur-sm border border-zinc-800 text-[9px] font-mono tracking-widest text-zinc-400">
          {template.category.toUpperCase()}
        </div>
        <div className="absolute top-3 right-3 px-2 py-1 bg-amber-400 text-zinc-950 text-[10px] font-mono font-bold">
          ${template.basePrice}
        </div>
      </div>
      <div className="p-5 border-t border-zinc-900">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display text-2xl text-zinc-100 group-hover:text-amber-400 transition-colors leading-none">
            {template.name}
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 mb-3 tracking-widest">
          <span className="flex items-center gap-1.5">
            <Layers size={10} />
            {zones.length} ZONES
          </span>
          <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
          <span className="flex items-center gap-1.5">
            <Hash size={10} />
            {template.id.slice(-6).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex -space-x-1">
            {zones.slice(0, 5).map((z) => (
              <div
                key={z.id}
                className="w-5 h-5 rounded-full border-2 border-zinc-950"
                style={{ backgroundColor: z.defaultColor }}
                title={z.label}
              />
            ))}
            {zones.length > 5 && (
              <div className="w-5 h-5 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[8px] font-mono text-zinc-400">
                +{zones.length - 5}
              </div>
            )}
          </div>
          <div className="text-[10px] font-mono tracking-widest text-zinc-500 group-hover:text-amber-400 flex items-center gap-1.5">
            CUSTOMIZE <ArrowRight size={11} />
          </div>
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// CUSTOMIZER
// ============================================================================

function Customizer({ template, customization, setCustomization, onAddToCart, onBack }) {
  const { zones } = parseSvgZones(template.svgContent);
  const renderedSvg = applyCustomization(template.svgContent, customization);
  const [activeZone, setActiveZone] = useState(zones[0]?.id || null);

  function setZoneColor(zoneId, color) {
    setCustomization({ ...customization, [zoneId]: color });
  }

  function reset() {
    const initial = {};
    zones.forEach((z) => (initial[z.id] = z.defaultColor));
    setCustomization(initial);
  }

  const isModified = zones.some((z) => customization[z.id] !== z.defaultColor);

  return (
    <div className="animate-slideUp">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-500 hover:text-amber-400"
        >
          <ChevronLeft size={14} />
          BACK TO SHOWROOM
        </button>
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-600">
          <span>{template.id.toUpperCase()}</span>
          {isModified && <span className="text-amber-400 flex items-center gap-1.5"><Activity size={10} />MODIFIED</span>}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Preview Panel */}
        <div className="lg:col-span-3">
          <div className="border border-zinc-900 bg-zinc-950 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                  <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                </div>
                <span className="text-[10px] font-mono tracking-widest text-zinc-500 ml-2">LIVE PREVIEW</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-600">600 × 400 SVG</span>
            </div>
            <div className="aspect-[3/2] bg-zinc-900 relative scanline-overlay">
              <SvgPreview svg={renderedSvg} className="w-full h-full" />
            </div>
            <div className="px-4 py-2.5 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono tracking-widest text-zinc-500">
              <span className="flex items-center gap-2">
                <Eye size={11} />
                {zones.length} ZONES DETECTED
              </span>
              <span>VECTOR · INFINITE SCALE</span>
            </div>
          </div>

          {/* Zone color preview strip */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {zones.map((z) => (
              <button
                key={z.id}
                onClick={() => setActiveZone(z.id)}
                className={`p-3 border text-left transition-all ${
                  activeZone === z.id
                    ? 'border-amber-400 bg-amber-400/5'
                    : 'border-zinc-900 hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-3 h-3 rounded-full ring-1 ring-zinc-700"
                    style={{ backgroundColor: customization[z.id] || z.defaultColor }}
                  />
                  <span className="text-[9px] font-mono text-zinc-500 truncate">{z.id}</span>
                </div>
                <div className="text-xs font-medium text-zinc-300 truncate">{z.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Template Info */}
          <div className="border border-zinc-900 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="px-2 py-0.5 bg-amber-400 text-zinc-950 text-[10px] font-mono font-bold tracking-widest">
                {template.category.toUpperCase()}
              </div>
              <div className="font-display text-3xl text-amber-400">${template.basePrice}</div>
            </div>
            <h2 className="font-display text-3xl text-zinc-100 leading-none mb-3">{template.name}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">{template.description}</p>
          </div>

          {/* Zone Editor */}
          <div className="border border-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette size={13} className="text-amber-400" />
                <span className="text-[11px] font-mono tracking-widest text-zinc-300">COLOR ZONES</span>
              </div>
              {isModified && (
                <button
                  onClick={reset}
                  className="text-[10px] font-mono tracking-widest text-zinc-500 hover:text-amber-400 flex items-center gap-1"
                >
                  <RefreshCw size={10} />
                  RESET
                </button>
              )}
            </div>
            <div className="divide-y divide-zinc-900">
              {zones.map((z) => (
                <ZoneControl
                  key={z.id}
                  zone={z}
                  current={customization[z.id]}
                  onChange={(c) => setZoneColor(z.id, c)}
                  active={activeZone === z.id}
                  onActivate={() => setActiveZone(z.id)}
                />
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onAddToCart}
            className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 px-6 py-4 font-mono text-xs tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-3 corner-cut glow-amber"
          >
            <ShoppingCart size={14} />
            ADD TO CART · ${template.basePrice}
          </button>
        </div>
      </div>
    </div>
  );
}

function ZoneControl({ zone, current, onChange, active, onActivate }) {
  const [showCustom, setShowCustom] = useState(false);
  return (
    <div
      className={`p-4 transition-colors ${active ? 'bg-amber-400/[0.03]' : ''}`}
      onMouseEnter={onActivate}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-5 h-5 rounded-full ring-2 ring-zinc-800 flex-shrink-0"
            style={{ backgroundColor: current }}
          />
          <div className="min-w-0">
            <div className="text-sm font-medium text-zinc-200 truncate">{zone.label}</div>
            <div className="text-[9px] font-mono text-zinc-600 tracking-wider truncate">
              {zone.id} · {current.toUpperCase()}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="text-[10px] font-mono tracking-widest text-zinc-500 hover:text-amber-400 ml-2 flex-shrink-0"
        >
          {showCustom ? 'PRESETS' : 'CUSTOM'}
        </button>
      </div>

      {showCustom ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={current}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-9 bg-zinc-900 border border-zinc-800 cursor-pointer"
          />
          <input
            type="text"
            value={current}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
            }}
            className="flex-1 bg-zinc-900 border border-zinc-800 px-2 py-1.5 text-xs font-mono text-zinc-200 focus:border-amber-400 outline-none"
            placeholder="#000000"
          />
        </div>
      ) : (
        <div className="grid grid-cols-8 gap-1.5">
          {COLOR_PALETTE.map((c) => {
            const isActive = current?.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.hex}
                onClick={() => onChange(c.hex)}
                title={c.name}
                className={`aspect-square rounded-sm transition-all ${
                  isActive
                    ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950 scale-110'
                    : 'ring-1 ring-zinc-800 hover:ring-zinc-600 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CART (Demo checkout with SVG output)
// ============================================================================

function CartView({ items, onRemove, onContinue }) {
  const [showOutput, setShowOutput] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const total = items.reduce((sum, i) => sum + (i.template.basePrice || 0), 0);

  if (items.length === 0) {
    return (
      <div className="animate-slideUp">
        <div className="border border-zinc-900 grid-bg p-16 text-center">
          <ShoppingCart className="mx-auto text-zinc-700 mb-4" size={40} />
          <h2 className="font-display text-4xl text-zinc-300 mb-2">CART IS EMPTY</h2>
          <p className="text-zinc-500 text-sm mb-6">No items selected. Browse the showroom to begin.</p>
          <button
            onClick={onContinue}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-zinc-700 hover:border-amber-400 hover:text-amber-400 text-zinc-300 text-xs font-mono tracking-widest transition-colors"
          >
            <ChevronLeft size={13} />
            BACK TO SHOWROOM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slideUp">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px w-8 bg-amber-400"></div>
        <span className="text-[10px] font-mono tracking-[0.3em] text-amber-400">/ CART</span>
        <span className="text-[10px] font-mono tracking-widest text-zinc-600 ml-auto">
          {String(items.length).padStart(2, '0')} ITEMS · ${total}
        </span>
      </div>
      <h1 className="font-display text-5xl sm:text-6xl text-zinc-100 mb-8 leading-none">
        REVIEW <span className="text-amber-400">ORDER</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={() => onRemove(item.id)}
              onView={() => {
                setActiveItem(item);
                setShowOutput(true);
              }}
            />
          ))}
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="border border-zinc-900 p-5">
            <div className="text-[10px] font-mono tracking-widest text-zinc-500 mb-4">SUMMARY</div>
            <div className="space-y-2 text-sm pb-4 border-b border-zinc-900 mb-4">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between text-zinc-400">
                  <span className="truncate pr-2">{i.template.name}</span>
                  <span className="font-mono">${i.template.basePrice}</span>
                </div>
              ))}
            </div>
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500">TOTAL</span>
              <span className="font-display text-4xl text-amber-400">${total}</span>
            </div>
            <button
              onClick={() => {
                setActiveItem(items[0]);
                setShowOutput(true);
              }}
              className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 px-5 py-3.5 font-mono text-xs tracking-[0.2em] font-bold transition-colors flex items-center justify-center gap-2 corner-cut"
            >
              <FileCode size={13} />
              GENERATE PRINT FILES
            </button>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-zinc-600">
              <AlertCircle size={11} />
              <span>DEMO MODE · NO PAYMENT PROCESSING</span>
            </div>
          </div>

          <div className="border border-zinc-900 p-5">
            <div className="text-[10px] font-mono tracking-widest text-zinc-500 mb-3">DELIVERABLES</div>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Check size={11} className="text-amber-400" />
                <span>SVG vector source (infinite scale)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={11} className="text-amber-400" />
                <span>Print-ready file generation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={11} className="text-amber-400" />
                <span>Customization metadata JSON</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showOutput && activeItem && (
        <CheckoutOutput item={activeItem} onClose={() => setShowOutput(false)} />
      )}
    </div>
  );
}

function CartItem({ item, onRemove, onView }) {
  const zones = useMemo(() => parseSvgZones(item.template.svgContent).zones, [item]);
  return (
    <div className="border border-zinc-900 hover:border-zinc-800 transition-colors p-4 flex gap-4">
      <div className="w-32 h-24 sm:w-40 sm:h-28 bg-zinc-900 flex-shrink-0 overflow-hidden border border-zinc-900">
        <SvgPreview svg={item.finalSvg} className="w-full h-full" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[9px] font-mono tracking-widest text-zinc-500 mb-1">
              {item.template.category.toUpperCase()}
            </div>
            <h3 className="font-display text-2xl text-zinc-100 leading-none truncate">
              {item.template.name}
            </h3>
          </div>
          <div className="font-display text-2xl text-amber-400 flex-shrink-0">
            ${item.template.basePrice}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {zones.map((z) => (
            <div key={z.id} className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-full ring-1 ring-zinc-700"
                style={{ backgroundColor: item.customization[z.id] }}
              />
              <span className="text-[9px] font-mono text-zinc-500">{z.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-3 flex items-center gap-3">
          <button
            onClick={onView}
            className="text-[10px] font-mono tracking-widest text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
          >
            <CodeIcon size={11} />
            VIEW SVG OUTPUT
          </button>
          <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
          <button
            onClick={onRemove}
            className="text-[10px] font-mono tracking-widest text-zinc-500 hover:text-red-400 flex items-center gap-1.5"
          >
            <Trash2 size={11} />
            REMOVE
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutOutput({ item, onClose }) {
  const [tab, setTab] = useState('preview');
  const zones = useMemo(() => parseSvgZones(item.template.svgContent).zones, [item]);

  function downloadSvg() {
    const blob = new Blob([item.finalSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.template.id}-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJson() {
    const orderData = {
      orderId: item.id,
      timestamp: new Date(item.timestamp).toISOString(),
      template: {
        id: item.template.id,
        name: item.template.name,
        category: item.template.category,
        basePrice: item.template.basePrice
      },
      customization: item.customization,
      zones: zones.map(z => ({
        ...z,
        appliedColor: item.customization[z.id]
      }))
    };
    const blob = new Blob([JSON.stringify(orderData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.template.id}-metadata-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto animate-slideUp">
      <div className="bg-zinc-950 border border-zinc-800 max-w-4xl w-full max-h-full overflow-hidden flex flex-col">
        <div className="px-5 py-3 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-mono tracking-widest text-zinc-300">
              CHECKOUT · OUTPUT GENERATED
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 p-1"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex border-b border-zinc-900 bg-zinc-950">
          {[
            { id: 'preview', label: 'PREVIEW', icon: Eye },
            { id: 'svg', label: 'SVG SOURCE', icon: CodeIcon },
            { id: 'meta', label: 'METADATA', icon: Hash }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-[10px] font-mono tracking-widest flex items-center gap-2 transition-colors ${
                tab === t.id
                  ? 'text-amber-400 border-b-2 border-amber-400 -mb-px'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <t.icon size={11} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'preview' && (
            <div className="p-6">
              <div className="aspect-[3/2] bg-zinc-900 border border-zinc-900 mb-4">
                <SvgPreview svg={item.finalSvg} className="w-full h-full" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {zones.map((z) => (
                  <div key={z.id} className="border border-zinc-900 p-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full ring-1 ring-zinc-700"
                        style={{ backgroundColor: item.customization[z.id] }}
                      />
                      <span className="text-[9px] font-mono text-zinc-500 truncate">{z.id}</span>
                    </div>
                    <div className="text-[10px] text-zinc-300 truncate">{z.label}</div>
                    <div className="text-[9px] font-mono text-amber-400">{item.customization[z.id]}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'svg' && (
            <pre className="p-5 text-[11px] font-mono text-zinc-300 leading-relaxed overflow-x-auto bg-zinc-950">
              <code>{formatXml(item.finalSvg)}</code>
            </pre>
          )}
          {tab === 'meta' && (
            <pre className="p-5 text-[11px] font-mono text-zinc-300 leading-relaxed overflow-x-auto bg-zinc-950">
              <code>{JSON.stringify(
                {
                  orderId: item.id,
                  timestamp: new Date(item.timestamp).toISOString(),
                  template: {
                    id: item.template.id,
                    name: item.template.name,
                    category: item.template.category,
                    basePrice: item.template.basePrice
                  },
                  customization: item.customization,
                  totalZones: zones.length
                },
                null,
                2
              )}</code>
            </pre>
          )}
        </div>

        <div className="px-5 py-4 border-t border-zinc-900 flex flex-col sm:flex-row gap-2">
          <button
            onClick={downloadSvg}
            className="flex-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 px-4 py-2.5 font-mono text-[11px] tracking-widest font-bold flex items-center justify-center gap-2 corner-cut"
          >
            <Download size={12} />
            DOWNLOAD SVG
          </button>
          <button
            onClick={downloadJson}
            className="flex-1 border border-zinc-800 hover:border-amber-400 hover:text-amber-400 text-zinc-300 px-4 py-2.5 font-mono text-[11px] tracking-widest flex items-center justify-center gap-2"
          >
            <FileCode size={12} />
            DOWNLOAD METADATA
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-zinc-500 hover:text-zinc-200 font-mono text-[11px] tracking-widest"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

function formatXml(xml) {
  // Lightweight XML formatter
  const PADDING = '  ';
  const reg = /(>)(<)(\/*)/g;
  let pad = 0;
  return xml
    .replace(reg, '$1\n$2$3')
    .split('\n')
    .map((line) => {
      let indent = 0;
      if (line.match(/.+<\/\w[^>]*>$/)) indent = 0;
      else if (line.match(/^<\/\w/)) pad = Math.max(pad - 1, 0);
      else if (line.match(/^<\w[^>]*[^/]>.*$/)) indent = 1;
      const padding = PADDING.repeat(pad);
      pad += indent;
      return padding + line;
    })
    .join('\n');
}

// ============================================================================
// STUDIO (Admin Upload)
// ============================================================================

function Studio({ templates, onAdd, onDelete, showToast }) {
  const [step, setStep] = useState(1);
  const [svgInput, setSvgInput] = useState('');
  const [parseResult, setParseResult] = useState(null);
  const [meta, setMeta] = useState({
    name: '',
    category: 'Custom',
    basePrice: 50,
    description: ''
  });
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.svg')) {
      showToast('Only .svg files supported', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setSvgInput(text);
      analyzeSvg(text);
    };
    reader.readAsText(file);
  }

  function analyzeSvg(text) {
    const result = parseSvgZones(text);
    setParseResult(result);
    if (result.error) {
      showToast(result.error, 'error');
      return;
    }
    if (result.zones.length === 0) {
      showToast('No zones detected (need id="zone-..." prefix)', 'error');
    } else {
      setStep(2);
    }
  }

  function handlePaste() {
    if (!svgInput.trim()) {
      showToast('Paste SVG content first', 'error');
      return;
    }
    analyzeSvg(svgInput);
  }

  async function saveTemplate() {
    if (!meta.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    if (!parseResult || parseResult.zones.length === 0) {
      showToast('No zones detected', 'error');
      return;
    }
    const newTpl = {
      id: `tpl-custom-${Date.now()}`,
      name: meta.name.toUpperCase(),
      category: meta.category,
      basePrice: Number(meta.basePrice) || 50,
      description: meta.description || 'Custom uploaded template.',
      svgContent: svgInput
    };
    await onAdd(newTpl);
    // Reset
    setStep(1);
    setSvgInput('');
    setParseResult(null);
    setMeta({ name: '', category: 'Custom', basePrice: 50, description: '' });
  }

  function reset() {
    setStep(1);
    setSvgInput('');
    setParseResult(null);
    setMeta({ name: '', category: 'Custom', basePrice: 50, description: '' });
  }

  function loadExample() {
    const example = `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
<rect width="600" height="400" fill="#0a0a0a" id="zone-bg" data-label="Background"/>
<polygon points="50,350 300,50 550,350" fill="#7c3aed" id="zone-triangle" data-label="Triangle"/>
<circle cx="300" cy="250" r="60" fill="#fbbf24" id="zone-circle" data-label="Circle"/>
</svg>`;
    setSvgInput(example);
    analyzeSvg(example);
  }

  return (
    <div className="animate-slideUp">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px w-8 bg-amber-400"></div>
        <span className="text-[10px] font-mono tracking-[0.3em] text-amber-400">/ STUDIO</span>
      </div>
      <h1 className="font-display text-5xl sm:text-6xl text-zinc-100 mb-2 leading-none">
        UPLOAD <span className="text-amber-400">TEMPLATE</span>
      </h1>
      <p className="text-zinc-500 text-sm mb-8 max-w-2xl">
        Drop an SVG file with zones marked using <code className="text-amber-400 font-mono text-xs px-1 py-0.5 bg-zinc-900 border border-zinc-800">id="zone-*"</code> convention. The parser auto-detects color zones and prepares the template for the customizer.
      </p>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { n: 1, label: 'UPLOAD' },
          { n: 2, label: 'CONFIGURE' },
          { n: 3, label: 'PUBLISH' }
        ].map((s, i, arr) => (
          <React.Fragment key={s.n}>
            <div className={`flex items-center gap-2 ${step >= s.n ? 'text-amber-400' : 'text-zinc-600'}`}>
              <div className={`w-6 h-6 border flex items-center justify-center text-[10px] font-mono ${
                step >= s.n ? 'border-amber-400 bg-amber-400/10' : 'border-zinc-800'
              }`}>
                {step > s.n ? <Check size={11} /> : s.n}
              </div>
              <span className="text-[10px] font-mono tracking-widest">{s.label}</span>
            </div>
            {i < arr.length - 1 && (
              <div className={`flex-1 h-px ${step > s.n ? 'bg-amber-400' : 'bg-zinc-900'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-12">
        {/* Step 1 / 2 left side */}
        <div className="space-y-4">
          {step === 1 && (
            <>
              <div
                className="border-2 border-dashed border-zinc-800 hover:border-amber-400/40 p-8 text-center cursor-pointer transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleFile}
                  className="hidden"
                />
                <Upload className="mx-auto text-zinc-600 mb-3" size={28} />
                <div className="font-display text-2xl text-zinc-200 mb-1">DROP SVG HERE</div>
                <div className="text-[10px] font-mono tracking-widest text-zinc-500">
                  OR CLICK TO BROWSE
                </div>
              </div>

              <div className="text-center text-[10px] font-mono tracking-widest text-zinc-600 my-2">
                — OR PASTE INLINE —
              </div>

              <textarea
                value={svgInput}
                onChange={(e) => setSvgInput(e.target.value)}
                placeholder='<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg"><rect id="zone-bg" data-label="Background" fill="#000"/></svg>'
                className="w-full h-40 bg-zinc-900 border border-zinc-800 p-3 text-[11px] font-mono text-zinc-300 focus:border-amber-400 outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handlePaste}
                  disabled={!svgInput.trim()}
                  className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-950 px-4 py-2.5 font-mono text-[11px] tracking-widest font-bold flex items-center justify-center gap-2"
                >
                  <Search size={12} />
                  ANALYZE SVG
                </button>
                <button
                  onClick={loadExample}
                  className="px-4 py-2.5 border border-zinc-800 hover:border-amber-400 hover:text-amber-400 text-zinc-400 font-mono text-[11px] tracking-widest"
                >
                  TRY EXAMPLE
                </button>
              </div>
            </>
          )}

          {step === 2 && parseResult && (
            <div className="border border-zinc-900">
              <div className="px-4 py-3 border-b border-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-amber-400" />
                  <span className="text-[11px] font-mono tracking-widest text-zinc-300">
                    {parseResult.zones.length} ZONES DETECTED
                  </span>
                </div>
                <button
                  onClick={reset}
                  className="text-[10px] font-mono tracking-widest text-zinc-500 hover:text-amber-400"
                >
                  ← REUPLOAD
                </button>
              </div>
              <div className="divide-y divide-zinc-900">
                {parseResult.zones.map((z) => (
                  <div key={z.id} className="p-4 flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-sm ring-1 ring-zinc-700 flex-shrink-0"
                      style={{ backgroundColor: z.defaultColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-200">{z.label}</div>
                      <div className="text-[10px] font-mono text-zinc-500 tracking-wider truncate">
                        {z.id} · {z.tagName} · {z.defaultColor}
                      </div>
                    </div>
                    <Check size={14} className="text-amber-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side — preview / metadata form */}
        <div className="space-y-4">
          {parseResult && parseResult.zones.length > 0 && (
            <>
              <div className="border border-zinc-900">
                <div className="px-4 py-2.5 border-b border-zinc-900 flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500">
                    PREVIEW
                  </span>
                  <span className="text-[10px] font-mono text-zinc-600">
                    {(svgInput.length / 1024).toFixed(2)} KB
                  </span>
                </div>
                <div className="aspect-[3/2] bg-zinc-900">
                  <SvgPreview svg={svgInput} className="w-full h-full" />
                </div>
              </div>

              <div className="border border-zinc-900 p-5 space-y-3">
                <div className="text-[10px] font-mono tracking-widest text-zinc-500 mb-2">
                  TEMPLATE METADATA
                </div>
                <div>
                  <label className="text-[10px] font-mono tracking-widest text-zinc-500 mb-1.5 block">
                    NAME *
                  </label>
                  <input
                    type="text"
                    value={meta.name}
                    onChange={(e) => setMeta({ ...meta, name: e.target.value })}
                    placeholder="MY CUSTOM DESIGN"
                    className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-amber-400 outline-none font-display tracking-wide uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-zinc-500 mb-1.5 block">
                      CATEGORY
                    </label>
                    <select
                      value={meta.category}
                      onChange={(e) => setMeta({ ...meta, category: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-amber-400 outline-none"
                    >
                      <option>Custom</option>
                      <option>Racing</option>
                      <option>Decal</option>
                      <option>Pattern</option>
                      <option>Tribal</option>
                      <option>Geometric</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-zinc-500 mb-1.5 block">
                      PRICE (USD)
                    </label>
                    <input
                      type="number"
                      value={meta.basePrice}
                      onChange={(e) => setMeta({ ...meta, basePrice: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-amber-400 outline-none font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono tracking-widest text-zinc-500 mb-1.5 block">
                    DESCRIPTION
                  </label>
                  <textarea
                    value={meta.description}
                    onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                    rows={3}
                    placeholder="Describe this template..."
                    className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-amber-400 outline-none resize-none"
                  />
                </div>
                <button
                  onClick={saveTemplate}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 px-4 py-3 font-mono text-[11px] tracking-widest font-bold flex items-center justify-center gap-2 corner-cut glow-amber"
                >
                  <Plus size={12} />
                  PUBLISH TO SHOWROOM
                </button>
              </div>
            </>
          )}

          {!parseResult && (
            <div className="border border-zinc-900 p-8">
              <div className="text-[10px] font-mono tracking-widest text-zinc-500 mb-3">
                NAMING CONVENTION
              </div>
              <div className="space-y-2 text-xs text-zinc-400 mb-4">
                <p>The parser scans your SVG for elements with IDs starting with <code className="text-amber-400 font-mono px-1 py-0.5 bg-zinc-900">zone-</code>. Each detected element becomes a customizable color zone.</p>
              </div>
              <pre className="bg-zinc-900 border border-zinc-800 p-3 text-[10px] font-mono text-zinc-400 overflow-x-auto">
{`<rect id="zone-bg"
      data-label="Background"
      fill="#0a0a0a"/>
<path id="zone-primary"
      data-label="Primary Stripe"
      fill="#dc2626" d="..."/>`}
              </pre>
              <div className="mt-3 text-[10px] font-mono text-zinc-500">
                <span className="text-amber-400">data-label</span> is optional but recommended.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Existing Templates */}
      <div className="border-t border-zinc-900 pt-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Layers size={14} className="text-amber-400" />
            <h2 className="font-display text-2xl text-zinc-200">EXISTING LIBRARY</h2>
            <span className="text-[10px] font-mono tracking-widest text-zinc-500">
              {String(templates.length).padStart(2, '0')} ITEMS
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {templates.map((t) => {
            const z = parseSvgZones(t.svgContent).zones;
            return (
              <div key={t.id} className="border border-zinc-900 p-3 group">
                <div className="aspect-[3/2] bg-zinc-900 mb-2 overflow-hidden">
                  <SvgPreview svg={t.svgContent} className="w-full h-full" />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-display text-sm text-zinc-200 truncate">{t.name}</div>
                    <div className="text-[9px] font-mono text-zinc-500 tracking-wider">
                      {z.length} ZONES · ${t.basePrice}
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(t.id)}
                    className="text-zinc-700 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TOAST
// ============================================================================

function Toast({ msg, type }) {
  const isError = type === 'error';
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
      <div
        className={`px-4 py-2.5 border font-mono text-[11px] tracking-widest flex items-center gap-2 ${
          isError
            ? 'bg-red-950/80 border-red-900 text-red-200'
            : 'bg-zinc-900 border-amber-400/40 text-amber-300'
        }`}
      >
        {isError ? <AlertCircle size={12} /> : <Check size={12} />}
        {msg.toUpperCase()}
      </div>
    </div>
  );
}
