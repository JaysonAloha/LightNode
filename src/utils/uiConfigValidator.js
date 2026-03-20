import {
  THEME_OPTIONS,
  MODE_OPTIONS,
  CARD_DENSITY_OPTIONS,
  CARD_STYLE_OPTIONS,
  FONT_PRESET_OPTIONS,
  ACCENT_COLOR_OPTIONS,
  DEFAULT_VIEW_OPTIONS,
  NOTE_LAYOUT_OPTIONS,
  ANIMATION_LEVEL_OPTIONS,
  BORDER_RADIUS_OPTIONS,
  HOMEPAGE_WIDGET_OPTIONS,
  SIDEBAR_ITEM_OPTIONS,
} from '../types/ui-config'

const VALIDATORS = {
  theme: (v) => THEME_OPTIONS.includes(v),
  mode: (v) => MODE_OPTIONS.includes(v),
  homepageWidgets: (v) =>
    Array.isArray(v) && v.every((w) => HOMEPAGE_WIDGET_OPTIONS.includes(w)),
  sidebarOrder: (v) =>
    Array.isArray(v) && v.every((s) => SIDEBAR_ITEM_OPTIONS.includes(s)),
  cardDensity: (v) => CARD_DENSITY_OPTIONS.includes(v),
  cardStyle: (v) => CARD_STYLE_OPTIONS.includes(v),
  fontPreset: (v) => FONT_PRESET_OPTIONS.includes(v),
  accentColor: (v) => ACCENT_COLOR_OPTIONS.includes(v),
  defaultView: (v) => DEFAULT_VIEW_OPTIONS.includes(v),
  defaultNoteLayout: (v) => NOTE_LAYOUT_OPTIONS.includes(v),
  showMap: (v) => typeof v === 'boolean',
  showTimeline: (v) => typeof v === 'boolean',
  showAIWidget: (v) => typeof v === 'boolean',
  showReviewWidget: (v) => typeof v === 'boolean',
  showWeatherMeta: (v) => typeof v === 'boolean',
  showLocationMeta: (v) => typeof v === 'boolean',
  animationLevel: (v) => ANIMATION_LEVEL_OPTIONS.includes(v),
  borderRadius: (v) => BORDER_RADIUS_OPTIONS.includes(v),
}

export function validateUiConfig(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const result = {}
  for (const [key, validator] of Object.entries(VALIDATORS)) {
    if (key in raw && validator(raw[key])) {
      result[key] = raw[key]
    }
  }
  return result
}
