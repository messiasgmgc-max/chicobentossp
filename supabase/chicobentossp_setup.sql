-- ========================================================================
-- Script de Configuração do Chico Bento SP para Supabase
-- Sem conflitos com tabelas financeiras existentes (comprovantes, etc.)
-- ========================================================================

-- 1. Tabela de Integrantes do Grupo (Trip Members / Perfis)
CREATE TABLE IF NOT EXISTS public.trip_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    avatar_color TEXT DEFAULT '#f97316',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Cadastrar Integrantes Iniciais Solicitados: Caca, Gui, Victrugo e Aninha
INSERT INTO public.trip_members (name) VALUES 
    ('Caca'),
    ('Gui'),
    ('Victrugo'),
    ('Aninha')
ON CONFLICT (name) DO NOTHING;

-- 3. Adicionar Colunas de Logística de Hotel e Aeroportos/Voos na tabela trips
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS hotel_name TEXT;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS hotel_address TEXT;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS hotel_checkin TEXT;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS hotel_checkout TEXT;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS hotel_notes TEXT;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS arrival_airport TEXT;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS arrival_datetime TEXT;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS arrival_flight TEXT;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS departure_airport TEXT;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS departure_datetime TEXT;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS departure_flight TEXT;

-- 4. Inserir viagem Chico Bento SP se a tabela estiver vazia
INSERT INTO public.trips (title, description, start_date, end_date)
SELECT 'Chico Bento SP 🏙️', 'Nossa viagem incrível para São Paulo!', '2026-10-15', '2026-10-19'
WHERE NOT EXISTS (SELECT 1 FROM public.trips LIMIT 1);

-- 5. Configurar Row Level Security (RLS) permissivo para trip_members
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'trip_members' AND policyname = 'Acesso total a trip_members'
    ) THEN
        CREATE POLICY "Acesso total a trip_members" ON public.trip_members FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 6. Garantir constraint única em votos por integrante (evita votos duplicados)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_place_votes_user'
    ) THEN
        ALTER TABLE public.place_votes ADD CONSTRAINT uq_place_votes_user UNIQUE (place_id, user_name);
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;
