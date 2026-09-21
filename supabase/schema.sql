-- ========================================================================
-- Schema do Banco de Dados SampaTrip para Supabase
-- ========================================================================

-- 1. Tabela de Viagens (Trips)
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cover_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Lugares & Pontos de Interesse (Places)
CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
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

-- 3. Tabela de Dias do Roteiro (Itinerary Days)
CREATE TABLE IF NOT EXISTS itinerary_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Itens/Paradas do Itinerário (Itinerary Items)
CREATE TABLE IF NOT EXISTS itinerary_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID REFERENCES itinerary_days(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    start_time TIME,
    end_time TIME,
    notes TEXT,
    transit_mode TEXT DEFAULT 'metro' CHECK (transit_mode IN ('metro', 'walk', 'uber', 'bus')),
    transit_duration_mins INTEGER,
    transit_tips TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Votos e Sugestões Colaborativas (Place Votes & Suggestions)
CREATE TABLE IF NOT EXISTS place_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down', 'super_want')),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Anotações & Dicas Gerais (Notes & Tips)
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('seguranca', 'transporte', 'dica_geral', 'checklist', 'documentos')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabela de Gastos e Divisão de Custos (Expenses)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('alimentacao', 'transporte', 'hospedagem', 'passeios', 'compras', 'outros')),
    paid_by TEXT NOT NULL,
    split_with TEXT[] NOT NULL DEFAULT '{}',
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_places_trip_id ON places(trip_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_trip_id ON itinerary_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_day_id ON itinerary_items(day_id);
CREATE INDEX IF NOT EXISTS idx_place_votes_place_id ON place_votes(place_id);
CREATE INDEX IF NOT EXISTS idx_notes_trip_id ON notes(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);

-- Ativar Row Level Security (RLS) permissivo para leitura e escrita pública/anônima do grupo
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso total a trips" ON trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total a places" ON places FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total a itinerary_days" ON itinerary_days FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total a itinerary_items" ON itinerary_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total a place_votes" ON place_votes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total a notes" ON notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total a expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
