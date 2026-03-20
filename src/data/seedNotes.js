/**
 * 默认 3 条笔记（仅中文）
 */
export function getSeedNotes() {
  return [
    {
      id: 'note-1',
      title: 'LightNode 产品定位思考',
      content: 'AI 原生的个人知识库，支持回顾、检索和生成。\n\n想加入图片手帐和 AI 推荐整理功能。',
      tags: ['产品设计', 'AI', '商业化', 'UI'],
      favorite: true,
      metadata: {
        location: '深圳市·南山区',
        weatherSnapshot: { condition: 'Sunny', temperature: 24, text: '晴天' },
      },
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'note-2',
      title: '今日项目推进记录',
      content: '完成了首页 Hero 区改版，输入框从顶部移到中心区域。下一步重点是提升 Code Mode 的一致性。',
      tags: ['项目管理', 'UI', '产品设计'],
      favorite: false,
      metadata: {
        location: '北京市·朝阳区',
        weatherSnapshot: { condition: 'Cloudy', temperature: 20, text: '多云' },
      },
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'note-3',
      title: '周五晚上的灵感碎片',
      content: '知识库不该只是存，还应该能回忆和再组织。如果每条记录都带一点时间、地点和情绪，未来回看时会更有现场感。',
      tags: ['灵感', '思考', '产品设计'],
      favorite: false,
      metadata: {
        location: '上海市·徐汇区',
        weatherSnapshot: { condition: 'Rainy', temperature: 18, text: '小雨' },
      },
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
}
