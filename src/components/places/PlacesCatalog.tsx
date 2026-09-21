import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { Place, PlaceCategory, PlaceStatus } from '../../types';
import { PlaceCard } from './PlaceCard';
import {
  Search,
  Filter,
  Flame,
  Star,
  DollarSign,
  Plus,
  Compass,
  MapPin,
  Sparkles,
  Layers
} from 'lucide-react';

interface PlacesCatalogProps {
  onOpenDetails: (place: Place) => void;
  onOpenAddPlace: () => void;
  onQuickAddToDay: (place: Place) => void;
}

export const PlacesCatalog: React.FC<PlacesCatalogProps> = ({
  onOpenDetails,
  onOpenAddPlace,
  onQuickAddToDay,
}) => {
  const { places, currentUser } = useTrip();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'rating' | 'price_asc' | 'name'>('votes');

  // Extract unique neighborhoods for filter
  const neighborhoods = Array.from(new Set(places.map(p => p.neighborhood))).sort();

  // Filter & Sort Places
  const filteredPlaces = places.filter(place => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || place.category === selectedCategory;

    const matchesNeighborhood =
      selectedNeighborhood === 'all' || place.neighborhood === selectedNeighborhood;

    const matchesStatus =
      selectedStatus === 'all' || place.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesNeighborhood && matchesStatus;
  });

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    if (sortBy === 'votes') {
      const aVotes = (a.votes?.filter(v => v.voteType === 'up' || v.voteType === 'super_want').length || 0) + (a.votes?.filter(v => v.voteType === 'super_want').length || 0);
      const bVotes = (b.votes?.filter(v => v.voteType === 'up' || v.voteType === 'super_want').length || 0) + (b.votes?.filter(v => v.voteType === 'super_want').length || 0);
      return bVotes - aVotes;
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (sortBy === 'price_asc') {
      return a.priceLevel - b.priceLevel;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Catálogo de Locais & Votação da Galera
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Descubra & Escolha os Melhores Points de SP 🌆
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Vote nos lugares que você mais quer visitar (com seu usuário <strong>{currentUser}</strong>), dê sugestões para os amigos e adicione as paradas confirmadas diretamente ao roteiro diário.
            </p>
          </div>

          <button
            onClick={onOpenAddPlace}
            className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Sugerir Novo Local</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-4">
        
        {/* Search Bar & Sort selector */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, bairro, comida (ex: MASP, pizza, boteco, sushi)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-xs text-slate-400 hidden lg:inline font-medium">Ordenar:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs font-semibold text-white focus:outline-none focus:border-orange-500"
            >
              <option value="votes">🔥 Mais Votados pelo Grupo</option>
              <option value="rating">⭐ Melhor Avaliação</option>
              <option value="price_asc">💲 Mais Econômicos</option>
              <option value="name">🔤 Ordem Alfabética</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'Todos os Locais' },
            { id: 'cultura', label: '🏛️ Cultura & Museus' },
            { id: 'gastronomia', label: '🍜 Gastronomia' },
            { id: 'parque', label: '🌳 Parques' },
            { id: 'vida_noturna', label: '🍻 Vida Noturna & Bares' },
            { id: 'compras', label: '🛍️ Compras' },
            { id: 'cafe', label: '☕ Cafés & Doces' },
            { id: 'ponto_turistico', label: '🏙️ Mirantes & Pontos' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-slate-950/70 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Neighborhood & Status */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <select
              value={selectedNeighborhood}
              onChange={e => setSelectedNeighborhood(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none"
            >
              <option value="all">Todos os Bairros</option>
              {neighborhoods.map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="wishlist">Apenas Sugestões</option>
              <option value="planned">Confirmados no Roteiro</option>
              <option value="visited">Já Visitados</option>
            </select>
          </div>

          <span className="text-[11px] text-slate-500 ml-auto font-mono">
            {sortedPlaces.length} {sortedPlaces.length === 1 ? 'local encontrado' : 'locais encontrados'}
          </span>
        </div>

      </div>

      {/* Places Grid */}
      {sortedPlaces.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
          <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum local encontrado com esses filtros</h3>
          <p className="text-xs text-slate-400 mb-5">Tente ajustar sua busca ou adicione um novo local para o grupo.</p>
          <button
            onClick={onOpenAddPlace}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Local
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlaces.map(place => (
            <PlaceCard
              key={place.id}
              place={place}
              onOpenDetails={onOpenDetails}
              onQuickAddToDay={onQuickAddToDay}
            />
          ))}
        </div>
      )}

    </div>
  );
};
