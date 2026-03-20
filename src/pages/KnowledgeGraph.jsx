import { useCallback, useMemo, useEffect, useState } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useStorage } from '../context/StorageContext'
import { useTheme } from '../context/ThemeContext'

function getTagsForGraph(note) {
  if (note.tags?.length) return note.tags.map((t) => (typeof t === 'string' && t.startsWith('#') ? t.slice(1) : t))
  const matches = (note.content || '').match(/(?<!\S)#([^\s#]+)/g) || []
  return [...new Set(matches.map((m) => (m.startsWith('#') ? m.slice(1) : m)))]
}

export function KnowledgeGraph({ canUseGraph, onUpgrade }) {
  const { notes } = useStorage()
  const { theme } = useTheme()

  const { initialNodes, initialEdges } = useMemo(() => {
    const noteList = notes.slice(0, 30)
    const nodes = []
    const edges = []
    const edgeKeys = new Set()

    // 网状发散布局：增加间距，避免线与节点重叠
    function getPosition(i, total) {
      if (total <= 1) return { x: 220, y: 180 }
      if (total === 2) return { x: 160 + i * 220, y: 200 }
      if (total === 3) {
        const positions = [{ x: 140, y: 120 }, { x: 340, y: 120 }, { x: 240, y: 280 }]
        return positions[i] || { x: 100, y: 100 }
      }
      if (total <= 5) {
        const cols = Math.ceil(Math.sqrt(total))
        const gap = 180
        return { x: 100 + (i % cols) * gap, y: 100 + Math.floor(i / cols) * gap }
      }
      const cols = Math.min(5, Math.ceil(Math.sqrt(total)))
      return { x: 80 + (i % cols) * 180, y: 80 + Math.floor(i / cols) * 140 }
    }

    noteList.forEach((note, i) => {
      const id = `n-${note.id}`
      const label = note.title || note.content?.split('\n')[0] || note.content?.slice(0, 20) || 'Untitled'
      const displayLabel = label.length > 18 ? label.slice(0, 18) + '…' : label
      nodes.push({
        id,
        type: 'default',
        position: getPosition(i, noteList.length),
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        data: {
          label: displayLabel,
          note,
          summary: (note.metadata?.summary || note.content || '').slice(0, 120) + '…',
        },
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '2px solid var(--border-default)',
          borderRadius: theme === 'cozy' ? 10 : 6,
          padding: '8px 12px',
          minWidth: 100,
          fontSize: 12,
        },
      })
    })

    // 两两比较 tags，有交集则生成连线
    for (let i = 0; i < noteList.length; i++) {
      for (let j = i + 1; j < noteList.length; j++) {
        const noteA = noteList[i]
        const noteB = noteList[j]
        const tagsA = getTagsForGraph(noteA)
        const tagsB = getTagsForGraph(noteB)
        const sharedTags = tagsA.filter((t) => tagsB.includes(t))
        if (sharedTags.length === 0) continue

        const source = `n-${noteA.id}`
        const target = `n-${noteB.id}`
        const edgeId = `edge-${noteA.id}-${noteB.id}`
        const edgeKey = `${noteA.id}-${noteB.id}`
        if (edgeKeys.has(edgeKey)) continue
        edgeKeys.add(edgeKey)

        edges.push({
          id: edgeId,
          source,
          target,
          label: sharedTags[0],
          type: 'default',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8', width: 8, height: 8 },
          labelStyle: { fill: '#334155', fontWeight: 500, fontSize: 11 },
          labelShowBg: true,
          labelBgStyle: { fill: '#fff', rx: 4, stroke: 'none' },
          labelBgPadding: [6, 4],
          labelBgBorderRadius: 4,
        })
      }
    }

    // 兜底：若默认 3 条数据无标签交集，强制建立 note-1↔note-2↔note-3 的连线
    if (edges.length === 0 && noteList.length >= 2) {
      const defaultIds = ['note-1', 'note-2', 'note-3']
      const hasDefault = noteList.some((n) => defaultIds.includes(n.id))
      if (hasDefault) {
        for (let i = 0; i < noteList.length; i++) {
          for (let j = i + 1; j < noteList.length; j++) {
            const source = `n-${noteList[i].id}`
            const target = `n-${noteList[j].id}`
            edges.push({
              id: `edge-${noteList[i].id}-${noteList[j].id}-fallback`,
              source,
              target,
              label: '关联',
              type: 'default',
              animated: true,
              style: { stroke: '#94a3b8', strokeWidth: 1.5 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8', width: 8, height: 8 },
              labelStyle: { fill: '#334155', fontWeight: 500, fontSize: 11 },
              labelShowBg: true,
              labelBgStyle: { fill: '#fff', rx: 4, stroke: 'none' },
              labelBgPadding: [6, 4],
              labelBgBorderRadius: 4,
            })
          }
        }
      }
    }

    return {
      initialNodes: nodes,
      initialEdges: edges,
    }
  }, [notes, theme])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNote, setSelectedNote] = useState(null)

  const onConnect = useCallback((connection) => {
    const id = `edge-${connection.source}-${connection.target}-manual`
    setEdges((prev) => {
      if (prev.some((e) => e.source === connection.source && e.target === connection.target)) return prev
      return [...prev, {
        id,
        source: connection.source,
        target: connection.target,
        type: 'default',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8', width: 8, height: 8 },
        labelStyle: { fill: '#334155', fontWeight: 500, fontSize: 11 },
        labelShowBg: true,
        labelBgStyle: { fill: '#fff', rx: 4, stroke: 'none' },
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 4,
      }]
    })
  }, [setEdges])

  const onNodeClick = useCallback((_, node) => {
    const note = node.data?.note
    if (note) {
      const summary = note.metadata?.summary || (note.title ? note.title + ' · ' : '') + (note.content || '').slice(0, 150)
      setSelectedNote({ ...note, summary })
    }
  }, [])

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  if (!canUseGraph?.()) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="text-xl font-semibold mb-4">知识图谱</h1>
        <p className="mb-6 opacity-80">升级 Pro 解锁知识图谱，可视化您的知识网络</p>
        <button
          onClick={() => onUpgrade?.('graph')}
          className="px-6 py-2"
          style={{ backgroundColor: 'var(--accent)', color: '#0f0f0f' }}
        >
          升级 Pro
        </button>
      </div>
    )
  }

  if (notes.length < 2) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="text-xl font-semibold mb-4">知识图谱</h1>
        <p className="text-sm opacity-80">至少需要 2 条笔记才能展示关联图谱</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h1 className="text-xl font-semibold mb-2">知识图谱</h1>
      <p className="text-sm mb-4 opacity-80">
        笔记按标签关联，节点可拖拽，点击节点查看摘要。共 {notes.length} 条笔记。
      </p>
      {selectedNote && (
        <div
          className="mb-4 p-4 rounded border"
          style={{
            borderColor: 'var(--border-default)',
            backgroundColor: 'var(--bg-panel)',
            color: 'var(--text-secondary)',
          }}
        >
          <p className="text-xs font-mono mb-1" style={{ color: 'var(--accent)' }}>
            {selectedNote.title || '摘要'}
          </p>
          <p className="text-sm line-clamp-3">{selectedNote.summary}</p>
        </div>
      )}
      <div className="relative w-full h-[70vh] min-h-[400px] rounded border" style={{ borderColor: 'var(--border-default)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          nodesDraggable
          nodesConnectable
          connectOnClick={false}
          style={{ background: 'var(--bg-primary)' }}
        >
          <Controls />
          <MiniMap
            nodeColor="var(--accent)"
            maskColor="rgba(0,0,0,0.1)"
          />
          <Background gap={12} size={1} color="var(--border-color)" />
        </ReactFlow>

        {/* 操作说明与图例 - 悬浮玻璃面板 */}
        <div
          className={`
            absolute bottom-3 left-3 z-10 px-3 py-2.5 rounded-lg
            backdrop-blur-sm border shadow-sm
            ${theme === 'dark' ? 'bg-[#1a1f2b]/85' : 'bg-white/80'}
          `}
          style={{
            borderColor: 'var(--border-default)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-start gap-2">
            <span className="text-sm opacity-70 shrink-0" style={{ color: 'var(--text-secondary)' }} title="操作说明">
              ℹ
            </span>
            <div className="text-xs space-y-1.5 min-w-0" style={{ color: 'var(--text-secondary)' }}>
              <p><span className="inline-block w-2 h-2 rounded-full border border-current opacity-70 align-middle mr-1.5" style={{ borderWidth: 1.5 }} /> 顶部圆点：入（Input）· 被引用</p>
              <p><span className="inline-block w-2 h-2 rounded-full border border-current opacity-70 align-middle mr-1.5" style={{ borderWidth: 1.5 }} /> 底部圆点：出（Output）· 引用他人</p>
              <p className="pt-0.5 opacity-90">拖拽从「出」→「入」建立自定义关联</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
