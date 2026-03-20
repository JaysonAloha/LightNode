-- 启用 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 启用全文搜索扩展
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 用户订阅等级枚举
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'team');

-- 用户扩展表（与 auth.users 关联）
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 笔记表
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_tsv TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 笔记向量嵌入表
CREATE TABLE public.note_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(note_id)
);

-- 全文搜索索引
CREATE INDEX notes_content_tsv_idx ON public.notes USING GIN(content_tsv);
CREATE INDEX notes_user_id_idx ON public.notes(user_id);
CREATE INDEX note_embeddings_note_id_idx ON public.note_embeddings(note_id);
CREATE INDEX note_embeddings_embedding_idx ON public.note_embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 自动更新 content_tsv
CREATE OR REPLACE FUNCTION notes_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.content_tsv := to_tsvector('simple', coalesce(NEW.content, ''));
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_tsv_update
  BEFORE INSERT OR UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION notes_tsv_trigger();

-- RLS 策略
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_embeddings ENABLE ROW LEVEL SECURITY;

-- user_profiles: 用户只能读写自己的
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- notes: 用户只能读写自己的
CREATE POLICY "Users can select own notes" ON public.notes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes
  FOR DELETE USING (auth.uid() = user_id);

-- note_embeddings: 通过 notes 关联，用户只能访问自己笔记的嵌入
CREATE POLICY "Users can read own note embeddings" ON public.note_embeddings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.notes n WHERE n.id = note_id AND n.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own note embeddings" ON public.note_embeddings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.notes n WHERE n.id = note_id AND n.user_id = auth.uid())
  );
CREATE POLICY "Users can update own note embeddings" ON public.note_embeddings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.notes n WHERE n.id = note_id AND n.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own note embeddings" ON public.note_embeddings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.notes n WHERE n.id = note_id AND n.user_id = auth.uid())
  );

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
