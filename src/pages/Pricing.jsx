import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '永久免费',
    desc: '适合轻度使用',
    features: [
      '最多 50 条笔记',
      '关键词搜索',
      '本地存储',
      '双主题',
    ],
    cta: '当前方案',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$8',
    period: '/月',
    desc: '个人知识管理首选',
    features: [
      '无限笔记',
      '完整 RAG AI 问答',
      '云端同步',
      '数据导出 (Markdown/PDF)',
      '知识图谱',
    ],
    cta: '升级 Pro',
    highlight: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '$15',
    period: '/人/月',
    desc: '团队协作',
    features: [
      'Pro 全部功能',
      '共享知识库',
      '团队协同编辑',
      '管理员权限',
    ],
    cta: '联系销售',
    highlight: false,
  },
  {
    id: 'max',
    name: 'Max',
    price: '$20',
    period: '/月',
    desc: 'AI 共创工作台',
    features: [
      'Pro 全部功能',
      'AI Studio 自然语言定制 UI',
      '实时预览与多预设',
      '专属个性化工作台',
    ],
    cta: '升级 Max',
    highlight: false,
  },
]

export function Pricing() {
  const { theme } = useTheme()
  const isCozy = theme === 'cozy'

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">轻知定价</h1>
        <p className="text-center opacity-80 mb-12">选择适合您的方案</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`
                p-6 border flex flex-col
                ${plan.highlight ? 'ring-2' : ''}
                ${isCozy ? 'rounded-2xl' : 'rounded-none'}
              `}
              style={{
                borderColor: plan.highlight ? 'var(--accent)' : 'var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
            >
              <h2 className="text-xl font-semibold mb-1">{plan.name}</h2>
              <p className="text-sm opacity-80 mb-4">{plan.desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="opacity-70">{plan.period}</span>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span style={{ color: 'var(--accent)' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/"
                className={`
                  block w-full py-2.5 text-center text-sm font-medium
                  ${plan.highlight ? '' : 'opacity-80 hover:opacity-100'}
                `}
                style={{
                  backgroundColor: plan.highlight ? 'var(--accent)' : 'transparent',
                  color: plan.highlight ? '#0f0f0f' : 'var(--text-primary)',
                  border: plan.highlight ? 'none' : '1px solid var(--border-color)',
                  borderRadius: isCozy ? '0.75rem' : 0,
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm opacity-60 mt-8">
          <Link to="/" className="hover:opacity-100">← 返回首页</Link>
        </p>
      </div>
    </div>
  )
}
