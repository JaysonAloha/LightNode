import { useCallback } from 'react'
import { embedText, upsertNoteEmbedding } from '../services/ragService'

export function useNoteEmbedding() {
  const embedAndSave = useCallback(async (noteId, content) => {
    if (!noteId || !content?.trim()) return
    try {
      const embedding = await embedText(content)
      await upsertNoteEmbedding(noteId, embedding)
    } catch (err) {
      console.warn('Embedding failed:', err)
    }
  }, [])

  return { embedAndSave }
}
