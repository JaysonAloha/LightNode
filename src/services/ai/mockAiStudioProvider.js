const KEYWORD_MAP = {
  手帐: { theme: 'cozy', cardStyle: 'scrapbook', fontPreset: 'serif' },
  极简: { theme: 'minimal', cardStyle: 'clean', cardDensity: 'compact' },
  深色: { theme: 'dark' },
  学习: { mode: 'study', showReviewWidget: true, showTimeline: true },
  创作: { mode: 'creator', cardStyle: 'notebook' },
  项目: { mode: 'project', defaultView: 'list' },
  旅行: { mode: 'travel', showMap: true, showWeatherMeta: true },
  紧凑: { cardDensity: 'compact' },
  宽松: { cardDensity: 'spacious' },
  首页: { homepageWidgets: ['welcome', 'search', 'recent-notes', 'daily-review', 'ai-widget'] },
  地图: { showMap: true },
  隐藏地图: { showMap: false },
  时间轴: { showTimeline: true },
  AI问答: { showAIWidget: true },
  回顾: { showReviewWidget: true },
  圆角: { borderRadius: 'round' },
  直角: { borderRadius: 'sharp' },
}

export async function mockChat(userMessage, currentConfig) {
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 400))

  const config = { ...currentConfig }
  let matched = false

  for (const [keyword, patch] of Object.entries(KEYWORD_MAP)) {
    if (userMessage.includes(keyword)) {
      Object.assign(config, patch)
      matched = true
    }
  }

  if (!matched) {
    if (userMessage.includes('更') || userMessage.includes('强化')) {
      config.cardStyle = config.cardStyle === 'clean' ? 'notebook' : 'scrapbook'
      config.showReviewWidget = true
    }
  }

  const explanations = [
    `已根据您的偏好调整界面配置。`,
    `已更新个性化设置，预览区会实时反映变化。`,
    `配置已应用，您可以继续微调或保存为预设。`,
  ]

  return {
    explanation: explanations[Math.floor(Math.random() * explanations.length)],
    ui_config: config,
    optional_suggestions: config.showMap ? ['可以尝试添加天气信息'] : [],
  }
}
