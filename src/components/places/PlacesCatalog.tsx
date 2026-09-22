import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { Place } from '../../types';
import { PlaceCard } from './PlaceCard';
import {
  Search,
  Plus,
  Compass,
  MapPin,
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
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 relative z-10">
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Catálogo de Locais & Votos
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white mt-1 leading-tight">
              Descubra os Melhores Points de SP 🌆
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Vote nos seus favoritos ({currentUser}), dê sugestões e adicione paradas diretamente ao roteiro da viagem.
            </p>
          </div>

          <button
            onClick={onOpenAddPlace}
            className="w-full md:w-auto px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 text-center"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Sugerir Novo Local</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3.5 sm:p-5 shadow-lg space-y-3 sm:space-y-4">
        
        {/* Search Bar & Sort selector */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, bairro, comida (MASP, pizza, café)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-xs text-slate-400 hidden lg:inline font-medium">Ordenar:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-2 sm:py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs font-semibold text-white focus:outline-none focus:border-orange-500"
            >
              <option value="votes">🔥 Mais Votados</option>
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
            { id: 'cultura', label: '🏛️ Museus' },
            { id: 'gastronomia', label: '🍜 Gastronomia' },
            { id: 'parque', label: '🌳 Parques' },
            { id: 'vida_noturna', label: '🍻 Bares' },
            { id: 'compras', label: '🛍️ Compras' },
            { id: 'cafe', label: '☕ Cafés' },
            { id: 'ponto_turistico', label: '🏙️ Mirantes' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
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
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <select
                value={selectedNeighborhood}
                onChange={e => setSelectedNeighborhood(e.target.value)}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none text-[11px] sm:text-xs"
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
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none text-[11px] sm:text-xs"
              >
                <option value="all">Todos os Status</option>
                <option value="wishlist">Apenas Sugestões</option>
                <option value="planned">Confirmados</option>
                <option value="visited">Visitados</option>
              </select>
            </div>
          </div>

          <span className="text-[10px] sm:text-[11px] text-slate-500 font-mono">
            {sortedPlaces.length} {sortedPlaces.length === 1 ? 'local' : 'locais'}
          </span>
        </div>

      </div>

      {/* Places Grid */}
      {sortedPlaces.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-8 sm:p-12 text-center">
          <Compass className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum local encontrado</h3>
          <p className="text-xs text-slate-400 mb-4">Ajuste os filtros ou adicione um novo local para o grupo.</p>
          <button
            onClick={onOpenAddPlace}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Local
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
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
