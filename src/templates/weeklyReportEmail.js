/**
 * 每周知识复盘报告 - 邮件模板
 * 可配合 Resend / SendGrid 使用
 */

export function buildWeeklyReportEmail({ userName, newCount, topThemes, reviewNotes }) {
  const themeList = topThemes.map((t, i) => `${i + 1}. ${t}`).join('\n')
  const reviewList = reviewNotes
    .map((n, i) => `${i + 1}. ${n.content?.slice(0, 80)}...`)
    .join('\n')

  return {
    subject: `轻知 · 本周知识复盘 (${new Date().toLocaleDateString('zh-CN')})`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { color: #22c55e; font-size: 24px; margin-bottom: 24px; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 16px; color: #666; margin-bottom: 8px; }
    .stat { font-size: 32px; font-weight: bold; color: #22c55e; }
    ul { padding-left: 20px; }
    .footer { margin-top: 32px; font-size: 12px; color: #999; }
    a { color: #22c55e; }
  </style>
</head>
<body>
  <div class="header">轻知 LightNode · 每周复盘</div>
  
  <p>${userName || '您好'}，这是您本周的知识复盘报告。</p>
  
  <div class="section">
    <h2>📊 本周新增</h2>
    <p class="stat">${newCount} 条</p>
    <p>继续保持记录的习惯！</p>
  </div>
  
  <div class="section">
    <h2>🏷 本周知识主题 TOP3</h2>
    <pre style="white-space: pre-wrap; font-family: inherit;">${themeList || '暂无数据'}</pre>
  </div>
  
  <div class="section">
    <h2>📌 推荐复习（5 条旧笔记）</h2>
    <pre style="white-space: pre-wrap; font-family: inherit;">${reviewList || '暂无'}</pre>
  </div>
  
  <p><a href="https://your-app.com">打开轻知 →</a></p>
  
  <div class="footer">
    轻知 LightNode · 您的个人知识库<br>
    如不想收到此邮件，可在设置中关闭
  </div>
</body>
</html>
    `.trim(),
    text: `
轻知 · 本周知识复盘

本周新增：${newCount} 条笔记
知识主题 TOP3：${themeList || '暂无'}
推荐复习：${reviewList || '暂无'}

打开轻知：https://your-app.com
    `.trim(),
  }
}
