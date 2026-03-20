import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { embedText, upsertNoteEmbedding } from '../services/ragService'
import { getSeedNotes } from '../data/seedNotes'
import { extractHashtagsFromContent, mergeTags } from '../utils/hashtag'

const LOCAL_STORAGE_KEY = 'lightnode-notes'

const StorageContext = createContext(null)

function loadLocalNotes() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalNotes(notes) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes))
}

function clearLocalNotes() {
  localStorage.removeItem(LOCAL_STORAGE_KEY)
}

function seedInitialNotesIfEmpty() {
  const existing = loadLocalNotes()
  if (existing.length > 0) return existing
  const seed = getSeedNotes()
  saveLocalNotes(seed)
  return seed
}

function clearAndReseed() {
  localStorage.removeItem(LOCAL_STORAGE_KEY)
  const seed = getSeedNotes()
  saveLocalNotes(seed)
  return seed
}

export function StorageProvider({ children, user }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)

  const isGuest = !user

  // 游客模式：使用 localStorage，首次空数据时插入默认笔记
  useEffect(() => {
    if (isGuest) {
      setNotes(seedInitialNotesIfEmpty())
    }
  }, [isGuest])

  // 登录模式：从 Supabase 拉取
  useEffect(() => {
    if (!user) return

    const fetchNotes = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fetch notes error:', error)
        setNotes([])
      } else {
        setNotes(data || [])
      }
      setLoading(false)
    }

    fetchNotes()

    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${user.id}` },
        () => fetchNotes()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const addNote = useCallback(
    async (content, metadata = {}) => {
      const trimmed = content.trim()
      if (!trimmed) return null

      const contentTags = extractHashtagsFromContent(trimmed)
      const mergedTags = mergeTags(contentTags, metadata.tags)

      if (isGuest) {
        const { tags: _omitTags, ...restMetadata } = metadata
        const note = {
          id: crypto.randomUUID(),
          content: trimmed,
          tags: mergedTags,
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          ...restMetadata,
        }
        note.tags = mergedTags
        setNotes((prev) => {
          const next = [{ ...note, tags: mergedTags }, ...prev]
          saveLocalNotes(next)
          return next
        })
        return Promise.resolve(note)
      }

      const insertData = { user_id: user.id, content: trimmed, ...metadata }
      insertData.tags = mergedTags
      const { data, error } = await supabase
        .from('notes')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      setNotes((prev) => [data, ...prev])
      embedText(trimmed)
        .then((emb) => upsertNoteEmbedding(data.id, emb))
        .catch((e) => console.warn('Embedding failed:', e))
      return data
    },
    [user?.id, isGuest]
  )

  const updateNote = useCallback(
    async (id, updates) => {
      if (isGuest) {
        setNotes((prev) => {
          const note = prev.find((n) => n.id === id)
          let patch = { ...updates }
          if (updates.content != null && note) {
            const contentTags = extractHashtagsFromContent(updates.content)
            const existingTags = note.tags || note.metadata?.tags || []
            patch.tags = mergeTags(contentTags, existingTags)
          }
          const next = prev.map((n) => (n.id === id ? { ...n, ...patch } : n))
          saveLocalNotes(next)
          return next
        })
        return
      }

      let patch = { ...updates }
      if (updates.content != null) {
        const note = notes.find((n) => n.id === id)
        if (note) {
          const contentTags = extractHashtagsFromContent(updates.content)
          const existingTags = note.tags || note.metadata?.tags || []
          patch.tags = mergeTags(contentTags, existingTags)
        }
      }

      const { error } = await supabase.from('notes').update(patch).eq('id', id)
      if (error) throw error
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)))
      if (updates.content) {
        embedText(updates.content)
          .then((emb) => upsertNoteEmbedding(id, emb))
          .catch((e) => console.warn('Embedding failed:', e))
      }
    },
    [user?.id, isGuest]
  )

  const deleteNote = useCallback(
    async (id) => {
      if (isGuest) {
        setNotes((prev) => {
          const next = prev.filter((n) => n.id !== id)
          saveLocalNotes(next)
          return next
        })
        return
      }

      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
      setNotes((prev) => prev.filter((n) => n.id !== id))
    },
    [user?.id, isGuest]
  )

  const getNote = useCallback((id) => notes.find((n) => n.id === id), [notes])

  const migrateLocalToCloud = useCallback(async () => {
    if (!user) return
    const localNotes = loadLocalNotes()
    if (localNotes.length === 0) return

    for (const n of localNotes) {
      await supabase.from('notes').insert({
        user_id: user.id,
        content: n.content,
        created_at: n.created_at || n.createdAt || new Date().toISOString(),
      })
    }
    clearLocalNotes()
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setNotes(data || [])
  }, [user?.id])

  const resetAndReseed = useCallback(() => {
    const seed = clearAndReseed()
    setNotes(seed)
  }, [])

  return (
    <StorageContext.Provider
      value={{
        notes,
        loading,
        isGuest,
        addNote,
        updateNote,
        deleteNote,
        getNote,
        migrateLocalToCloud,
        resetAndReseed,
      }}
    >
      {children}
    </StorageContext.Provider>
  )
}

export function useStorage() {
  const ctx = useContext(StorageContext)
  if (!ctx) throw new Error('useStorage must be used within StorageProvider')
  return ctx
}
