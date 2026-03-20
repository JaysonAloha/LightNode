import { Link } from 'react-router-dom'
import { useStorage } from '../context/StorageContext'

export function UpgradeModal({ onClose, feature = 'ai' }) {
  const { notes } = useStorage()
  const count = notes.length

  const messages = {
    ai: {
      title: '升级 Pro 解锁 AI 智能问答',
      desc: `您已收集了 ${count} 条知识，升级 Pro 让 AI 帮您真正发挥它们的价值。`,
      features: ['完整 RAG 语义检索', '流式 AI 回答', '引用来源追溯'],
    },
    'ai-studio': {
      title: '升级 Max 解锁 AI Studio',
      desc: '用自然语言定制您的工作台，AI 实时生成界面配置。',
      features: ['自然语言调整 UI', '实时预览与保存', '多预设一键切换'],
    },
    sync: {
      title: '升级 Pro 云端同步',
      desc: '多端实时访问，永不丢失。',
      features: ['云端存储', '多设备同步', '数据安全'],
    },
    export: {
      title: '升级 Pro 导出数据',
      desc: '尊重您的数据主权，随时导出。',
      features: ['Markdown 导出', 'PDF 导出', '批量下载'],
    },
    graph: {
      title: '升级 Pro 解锁知识图谱',
      desc: '可视化您的知识网络，发现关联。',
      features: ['力导向图', '标签关联', '智能推荐'],
    },
  }

  const msg = messages[feature] || messages.ai

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6 shadow-xl"
        style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--radius)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2">{msg.title}</h2>
        <p className="text-sm opacity-80 mb-4">{msg.desc}</p>
        <ul className="space-y-2 mb-6">
          {msg.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span style={{ color: 'var(--accent)' }}>✓</span>
              {f}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Link
            to="/pricing"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-center"
            style={{ backgroundColor: 'var(--accent)', color: '#0f0f0f' }}
          >
            查看定价
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 opacity-70 hover:opacity-100"
          >
            稍后再说
          </button>
        </div>
      </div>
    </div>
  )
}
