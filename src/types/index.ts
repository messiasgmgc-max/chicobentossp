export type PlaceCategory =
  | 'cultura'
  | 'gastronomia'
  | 'parque'
  | 'vida_noturna'
  | 'compras'
  | 'cafe'
  | 'ponto_turistico';

export type PlaceStatus = 'wishlist' | 'planned' | 'visited' | 'rejected';

export type TransitMode = 'metro' | 'walk' | 'uber' | 'bus';

export interface PlaceVote {
  id: string;
  placeId: string;
  userName: string;
  voteType: 'up' | 'down' | 'super_want';
  comment?: string;
  createdAt?: string;
}

export interface Place {
  id: string;
  tripId?: string;
  name: string;
  category: PlaceCategory;
  neighborhood: string;
  address?: string;
  lat: number;
  lng: number;
  description: string;
  priceLevel: 1 | 2 | 3 | 4; // 1 = $ (Barato), 2 = $$ (Médio), 3 = $$$ (Sofisticado), 4 = $$$$ (Gourmet/Luxo)
  rating: number;
  estimatedTimeMins: number;
  photoUrl: string;
  tags: string[];
  metroStation?: string;
  metroLine?: string; // e.g. "Linha 2-Verde / Linha 4-Amarela"
  status: PlaceStatus;
  createdBy: string;
  createdAt: string;
  votes?: PlaceVote[];
  userNotes?: string;
  openingHours?: string;
}

export interface ItineraryItem {
  id: string;
  dayId: string;
  placeId: string;
  place?: Place;
  orderIndex: number;
  startTime?: string; // e.g. "09:30"
  endTime?: string;   // e.g. "11:30"
  notes?: string;
  transitMode?: TransitMode;
  transitDurationMins?: number;
  transitTips?: string; // e.g. "Pegar Linha 4-Amarela (Estação Paulista) e descer em Higienópolis-Mackenzie (5 min)"
}

export interface ItineraryDay {
  id: string;
  tripId?: string;
  dayNumber: number;
  date: string; // YYYY-MM-DD
  title: string; // e.g. "Dia 1: Arte na Paulista & Japão na Liberdade"
  description?: string;
  items: ItineraryItem[];
}

export interface TripNote {
  id: string;
  tripId?: string;
  category: 'seguranca' | 'transporte' | 'dica_geral' | 'checklist' | 'documentos';
  title: string;
  content: string;
  author: string;
  isPinned?: boolean;
  completed?: boolean; // Para itens de checklist
  createdAt: string;
}

export interface TripExpense {
  id: string;
  tripId?: string;
  title: string;
  amountCents: number; // Ex: 4500 = R$ 45,00
  category: 'alimentacao' | 'transporte' | 'hospedagem' | 'passeios' | 'compras' | 'outros';
  paidBy: string;
  splitWith: string[]; // Nomes dos participantes
  date: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  participants: string[];
  currentUser: string;
}

export interface SPTransportLine {
  id: string;
  name: string;
  type: 'metro' | 'cptm' | 'viaquatro' | 'viamobilidade';
  color: string;
  hexColor: string;
  stationsCount: number;
  highlights: string[];
}
