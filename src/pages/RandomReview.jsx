import { useState, useEffect } from 'react'
import { useStorage } from '../context/StorageContext'
import { NoteCard } from '../components/NoteCard'
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function RandomReview() {
  const { notes } = useStorage()
  const [picked, setPicked] = useState([])

  const refresh = () => {
    if (notes.length === 0) {
      setPicked([])
      return
    }
    const shuffled = shuffle(notes)
    setPicked(shuffled.slice(0, 3))
  }

  useEffect(() => {
    refresh()
  }, [notes])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="text-xl font-semibold mb-2">随机漫步</h1>
      <p className="text-sm mb-6 opacity-80">
        防吃灰回顾：随机抽取 3 条知识卡片，温故知新
      </p>

      <button
        onClick={refresh}
        className="mb-8 px-6 py-2 text-sm"
        style={{ backgroundColor: 'var(--accent)', color: '#0f0f0f' }}
      >
        🎲 再抽一次
      </button>

      <div className="w-full max-w-2xl space-y-6">
        {picked.length === 0 ? (
          <p className="text-center text-sm opacity-60">暂无笔记，快去记录吧～</p>
        ) : (
          picked.map((note) => (
            <div key={note.id}>
              <NoteCard note={note} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
