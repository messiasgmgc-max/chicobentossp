-- ========================================================================
-- CHICO BENTO SP - SETUP COMPLETO E DEFINITIVO PARA O SUPABASE
-- Execute este script completo no SQL Editor do Supabase (supabase.com)
-- É 100% seguro e idempotente (não apaga dados existentes de outros apps)
-- ========================================================================

-- 1. TABELA DE VIAGENS (TRIPS)
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cover_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garantir todas as colunas de Logística, Hotel e Voos na tabela trips
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

-- Inserir ou atualizar a viagem fixa Chico Bento SP com ID padronizado
INSERT INTO public.trips (
    id,
    title,
    description,
    start_date,
    end_date
) VALUES (
    '00000000-0000-4000-8000-000000000001',
    'Chico Bento SP 🏙️',
    'Nossa viagem incrível para São Paulo!',
    '2026-10-15',
    '2026-10-19'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date;

-- 2. TABELA DE INTEGRANTES DO GRUPO (TRIP MEMBERS)
CREATE TABLE IF NOT EXISTS public.trip_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    avatar_color TEXT DEFAULT '#2563eb',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir integrantes iniciais
INSERT INTO public.trip_members (name) VALUES 
    ('Caca'),
    ('Gui'),
    ('Victrugo'),
    ('Aninha')
ON CONFLICT (name) DO NOTHING;

-- 3. TABELA DE LUGARES & PONTOS DE INTERESSE (PLACES)
CREATE TABLE IF NOT EXISTS public.places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('cultura', 'gastronomia', 'parque', 'vida_noturna', 'compras', 'cafe', 'ponto_turistico')),
    neighborhood TEXT NOT NULL,
    address TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    description TEXT,
    price_level INTEGER DEFAULT 2 CHECK (price_level BETWEEN 1 AND 4),
    rating DOUBLE PRECISION DEFAULT 4.5,
    estimated_time_mins INTEGER DEFAULT 90,
    photo_url TEXT,
    tags TEXT[] DEFAULT '{}',
    metro_station TEXT,
    metro_line TEXT,
    status TEXT DEFAULT 'wishlist' CHECK (status IN ('wishlist', 'planned', 'visited', 'rejected')),
    created_by TEXT DEFAULT 'Viajante',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE VOTOS EM LUGARES (PLACE VOTES)
CREATE TABLE IF NOT EXISTS public.place_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down', 'super_want')),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

-- 5. TABELA DE DIAS DO ROTEIRO (ITINERARY DAYS)
CREATE TABLE IF NOT EXISTS public.itinerary_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE PARADAS/ITENS DO ITINERÁRIO (ITINERARY ITEMS)
CREATE TABLE IF NOT EXISTS public.itinerary_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID REFERENCES public.itinerary_days(id) ON DELETE CASCADE,
    place_id UUID REFERENCES public.places(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    start_time TIME,
    end_time TIME,
    notes TEXT,
    transit_mode TEXT DEFAULT 'metro' CHECK (transit_mode IN ('metro', 'walk', 'uber', 'bus')),
    transit_duration_mins INTEGER,
    transit_tips TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABELA DE ANOTAÇÕES & DICAS GERAIS (NOTES)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('seguranca', 'transporte', 'dica_geral', 'checklist', 'documentos')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABELA DE GASTOS DO GRUPO (EXPENSES)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('alimentacao', 'transporte', 'hospedagem', 'passeios', 'compras', 'outros')),
    paid_by TEXT NOT NULL,
    split_with TEXT[] NOT NULL DEFAULT '{}',
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_places_trip_id ON public.places(trip_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_trip_id ON public.itinerary_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_day_id ON public.itinerary_items(day_id);
CREATE INDEX IF NOT EXISTS idx_place_votes_place_id ON public.place_votes(place_id);
CREATE INDEX IF NOT EXISTS idx_notes_trip_id ON public.notes(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON public.expenses(trip_id);

-- ATIVAR ROW LEVEL SECURITY (RLS) PERMISSIVO PARA O GRUPO
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- POLICIES COM CHECAGEM DE EXISTÊNCIA (IDEMPOTENTES)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Acesso total a trips" ON public.trips;
    CREATE POLICY "Acesso total a trips" ON public.trips FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Acesso total a trip_members" ON public.trip_members;
    CREATE POLICY "Acesso total a trip_members" ON public.trip_members FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Acesso total a places" ON public.places;
    CREATE POLICY "Acesso total a places" ON public.places FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Acesso total a place_votes" ON public.place_votes;
    CREATE POLICY "Acesso total a place_votes" ON public.place_votes FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Acesso total a itinerary_days" ON public.itinerary_days;
    CREATE POLICY "Acesso total a itinerary_days" ON public.itinerary_days FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Acesso total a itinerary_items" ON public.itinerary_items;
    CREATE POLICY "Acesso total a itinerary_items" ON public.itinerary_items FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Acesso total a notes" ON public.notes;
    CREATE POLICY "Acesso total a notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Acesso total a expenses" ON public.expenses;
    CREATE POLICY "Acesso total a expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
END $$;

-- HABILITAR REALTIME DO SUPABASE PARA SINCRONIZAÇÃO INSTANTÂNEA ENTRE CELULAR E NOTEBOOK
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_members;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.places;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.place_votes;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.itinerary_days;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.itinerary_items;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END;
END $$;
