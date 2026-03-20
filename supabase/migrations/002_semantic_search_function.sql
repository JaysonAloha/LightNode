-- 混合检索函数：语义向量 + 全文搜索，RRF 融合
CREATE OR REPLACE FUNCTION public.search_notes_hybrid(
  p_user_id UUID,
  p_query TEXT,
  p_query_embedding vector(1536),
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  note_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  rrf_score FLOAT
) AS $$
DECLARE
  k INT := 60;  -- RRF 常数
BEGIN
  RETURN QUERY
  WITH semantic_results AS (
    SELECT n.id, n.content, n.created_at,
           ROW_NUMBER() OVER (ORDER BY (ne.embedding <=> p_query_embedding)) AS rank
    FROM public.notes n
    JOIN public.note_embeddings ne ON ne.note_id = n.id
    WHERE n.user_id = p_user_id AND ne.embedding IS NOT NULL
    ORDER BY ne.embedding <=> p_query_embedding
    LIMIT 10
  ),
  fulltext_results AS (
    SELECT n.id, n.content, n.created_at,
           ROW_NUMBER() OVER (ORDER BY ts_rank(n.content_tsv, plainto_tsquery('simple', p_query)) DESC) AS rank
    FROM public.notes n
    WHERE n.user_id = p_user_id
      AND n.content_tsv @@ plainto_tsquery('simple', p_query)
    LIMIT 10
  ),
  combined AS (
    SELECT id, content, created_at, 1.0 / (k + rank::float) AS rrf_score FROM semantic_results
    UNION ALL
    SELECT id, content, created_at, 1.0 / (k + rank::float) AS rrf_score FROM fulltext_results
  )
  SELECT combined.id AS note_id, combined.content, combined.created_at,
         SUM(combined.rrf_score)::float AS rrf_score
  FROM combined
  GROUP BY combined.id, combined.content, combined.created_at
  ORDER BY rrf_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
