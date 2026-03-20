import { DEFAULT_UI_CONFIG } from '../types/ui-config'
import { validateUiConfig } from './uiConfigValidator'

export function normalizeUiConfig(raw) {
  const validated = validateUiConfig(raw)
  return { ...DEFAULT_UI_CONFIG, ...validated }
}

export function mergeUiConfig(current, patch) {
  const validated = validateUiConfig(patch)
  return { ...current, ...validated }
}
