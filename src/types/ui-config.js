/**
 * UI 配置类型定义
 */

export const THEME_OPTIONS = ['minimal', 'cozy', 'dark']
export const MODE_OPTIONS = ['study', 'creator', 'project', 'travel', 'default']
export const CARD_DENSITY_OPTIONS = ['compact', 'comfortable', 'spacious']
export const CARD_STYLE_OPTIONS = ['clean', 'notebook', 'scrapbook']
export const FONT_PRESET_OPTIONS = ['mono', 'sans', 'serif']
export const ACCENT_COLOR_OPTIONS = ['teal', 'blue', 'amber', 'rose', 'violet']
export const DEFAULT_VIEW_OPTIONS = ['grid', 'list', 'timeline']
export const NOTE_LAYOUT_OPTIONS = ['standard', 'collage', 'split', 'journal']
export const ANIMATION_LEVEL_OPTIONS = ['low', 'medium']
export const BORDER_RADIUS_OPTIONS = ['sharp', 'soft', 'round']

export const HOMEPAGE_WIDGET_OPTIONS = [
  'welcome',
  'search',
  'recent-notes',
  'daily-review',
  'timeline',
  'ai-widget',
  'map',
  'weather',
]

export const SIDEBAR_ITEM_OPTIONS = [
  'home',
  'notes',
  'timeline',
  'review',
  'ai',
  'ai-studio',
  'graph',
  'settings',
]

export const DEFAULT_UI_CONFIG = {
  theme: 'cozy',
  mode: 'default',
  homepageWidgets: ['welcome', 'search', 'recent-notes', 'daily-review', 'ai-widget'],
  sidebarOrder: ['home', 'notes', 'ai', 'graph', 'review'],
  cardDensity: 'comfortable',
  cardStyle: 'clean',
  fontPreset: 'serif',
  accentColor: 'amber',
  defaultView: 'grid',
  defaultNoteLayout: 'standard',
  showMap: false,
  showTimeline: true,
  showAIWidget: true,
  showReviewWidget: true,
  showWeatherMeta: false,
  showLocationMeta: false,
  animationLevel: 'medium',
  borderRadius: 'soft',
}
