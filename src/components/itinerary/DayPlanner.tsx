import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { ItineraryItem, TransitMode, Place } from '../../types';
import { TransitBadge } from './TransitBadge';
import { AddStopModal } from './AddStopModal';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Navigation,
  ExternalLink,
  Train,
  CheckCircle2,
  Share2,
  Sparkles,
  Edit2,
  Layers,
  ArrowRight
} from 'lucide-react';

import { TripLogisticsCard } from '../logistics/TripLogisticsCard';

interface DayPlannerProps {
  onOpenCreateNewPlace: () => void;
  onSelectPlaceForDetails: (place: Place) => void;
}

export const DayPlanner: React.FC<DayPlannerProps> = ({
  onOpenCreateNewPlace,
  onSelectPlaceForDetails,
}) => {
  const {
    trip,
    places,
    itineraryDays,
    addDay,
    deleteDay,
    updateDay,
    removeItemFromDay,
    reorderDayItems,
    updateItineraryItem,
    changePlaceStatus,
    triggerCelebration,
  } = useTrip();

  const [activeDayId, setActiveDayId] = useState<string>(
    itineraryDays[0]?.id || ''
  );
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [editingNotesItemId, setEditingNotesItemId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [isAddingNewDay, setIsAddingNewDay] = useState(false);
  const [newDayTitle, setNewDayTitle] = useState('');
  const [newDayDate, setNewDayDate] = useState(trip.startDate || '');

  // Fallback to first day if active day was deleted or changed
  const currentDay = itineraryDays.find(d => d.id === activeDayId) || itineraryDays[0];

  // Resolve items with place details
  const populatedItems = (currentDay?.items || []).map(item => ({
    ...item,
    place: places.find(p => p.id === item.placeId),
  }));

  // Calculate day metrics
  const totalVisitingMinutes = populatedItems.reduce(
    (sum, item) => sum + (item.place?.estimatedTimeMins || 60),
    0
  );
  const totalTransitMinutes = populatedItems.reduce(
    (sum, item) => sum + (item.transitDurationMins || 15),
    0
  );
  const totalEstimatedHours = ((totalVisitingMinutes + totalTransitMinutes) / 60).toFixed(1);

  // Generate Google Maps Directions URL for the entire day's route!
  const generateGoogleMapsRouteUrl = () => {
    if (populatedItems.length === 0) return '#';
    const validPlaces = populatedItems.map(i => i.place).filter(Boolean) as Place[];
    if (validPlaces.length === 0) return '#';

    if (validPlaces.length === 1) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${validPlaces[0].name}, ${validPlaces[0].address || validPlaces[0].neighborhood}, São Paulo - SP`
      )}`;
    }

    const origin = encodeURIComponent(`${validPlaces[0].name}, ${validPlaces[0].neighborhood}, São Paulo`);
    const destination = encodeURIComponent(
      `${validPlaces[validPlaces.length - 1].name}, ${validPlaces[validPlaces.length - 1].neighborhood}, São Paulo`
    );

    const waypoints = validPlaces
      .slice(1, -1)
      .map(p => encodeURIComponent(`${p.name}, ${p.neighborhood}, São Paulo`))
      .join('|');

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${
      waypoints ? `&waypoints=${waypoints}` : ''
    }&travelmode=transit`;
  };

  const handleCreateDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDayTitle.trim()) {
      const dayDate = newDayDate || trip.startDate || new Date().toISOString().split('T')[0];
      addDay(newDayTitle.trim(), dayDate);
      setNewDayTitle('');
      setIsAddingNewDay(false);
      triggerCelebration();
    }
  };

  const handleSaveNotes = (dayId: string, itemId: string) => {
    updateItineraryItem(dayId, itemId, { notes: tempNotes });
    setEditingNotesItemId(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
      
      {/* 1. Trip Logistics: Hotel & Flights */}
      <TripLogisticsCard />

      {/* 2. Day Selector Header & Action Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Planejador de Roteiro Inteligente
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              {currentDay?.title || 'Roteiro de São Paulo'}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              {currentDay?.date
                ? new Date(currentDay.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })
                : 'Data a definir'}
            </p>
          </div>

          {/* Quick Metrics & Google Maps Multi-stop Route Button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-2xl flex items-center gap-4 text-xs font-medium">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Paradas</span>
                <span className="text-white font-mono text-sm font-bold">{populatedItems.length}</span>
              </div>
              <div className="w-px h-6 bg-slate-800"></div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Duração Estimada</span>
                <span className="text-orange-400 font-mono text-sm font-bold">~{totalEstimatedHours}h</span>
              </div>
            </div>

            {populatedItems.length > 0 && (
              <a
                href={generateGoogleMapsRouteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Navegar Rota no Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            )}
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 scrollbar-none">
          {itineraryDays.map(day => (
            <button
              key={day.id}
              onClick={() => setActiveDayId(day.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold shrink-0 transition-all flex items-center gap-2 ${
                currentDay?.id === day.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 scale-100'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>Dia {day.dayNumber}</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-md ${currentDay?.id === day.id ? 'bg-orange-600/60' : 'bg-slate-700/70 text-slate-400'}`}>
                {day.items.length}
              </span>
            </button>
          ))}

          {/* Add New Day Button */}
          {!isAddingNewDay ? (
            <button
              onClick={() => setIsAddingNewDay(true)}
              className="px-3.5 py-2 rounded-2xl border border-dashed border-slate-700 hover:border-orange-500/60 text-slate-400 hover:text-orange-400 text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Dia</span>
            </button>
          ) : (
            <form onSubmit={handleCreateDay} className="flex items-center gap-2 shrink-0 bg-slate-800 p-1.5 rounded-2xl border border-orange-500/40">
              <input
                type="text"
                placeholder="Título do dia (ex: Dia 5: Parques)..."
                value={newDayTitle}
                onChange={e => setNewDayTitle(e.target.value)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNewDay(false)}
                className="px-2 py-1 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Itinerary Timeline */}
      {itineraryDays.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Nenhum dia de roteiro criado ainda</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Vamos começar do zero! Defina os dias da viagem para organizar os pontos turísticos, restaurantes e horários.
          </p>
          <button
            onClick={() => setIsAddingNewDay(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-orange-500/25 inline-flex items-center gap-2 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Criar Primeiro Dia da Viagem
          </button>
        </div>
      ) : currentDay ? (
        <div className="space-y-3">
          
          {populatedItems.length === 0 ? (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Nenhum ponto adicionado para este dia</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                Comece adicionando lugares e paradas para este dia com horários e notas.
              </p>
              <button
                onClick={() => setIsAddStopOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-orange-500/25 inline-flex items-center gap-2 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Adicionar Primeira Parada
              </button>
            </div>
          ) : (
            <div className="relative">
              {populatedItems.map((item, index) => {
                const place = item.place;
                const isLast = index === populatedItems.length - 1;

                return (
                  <React.Fragment key={item.id}>
                    {/* Place Item Card */}
                    <div className="relative group bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-lg transition-all">
                      
                      {/* Left timeline index marker */}
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
                          {index + 1}
                        </div>

                        {/* Place Thumbnail */}
                        {place?.photoUrl && (
                          <img
                            src={place.photoUrl}
                            alt={place?.name || 'Local'}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-slate-800 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => place && onSelectPlaceForDetails(place)}
                          />
                        )}

                        {/* Place Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <h3
                              onClick={() => place && onSelectPlaceForDetails(place)}
                              className="text-base font-bold text-white hover:text-orange-400 cursor-pointer transition-colors truncate"
                            >
                              {place?.name || 'Local não encontrado'}
                            </h3>

                            {/* Time Slot input */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <input
                                type="time"
                                value={item.startTime || ''}
                                onChange={e =>
                                  updateItineraryItem(currentDay.id, item.id, { startTime: e.target.value })
                                }
                                placeholder="Horário"
                                className="bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                              />
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            <span>{place?.neighborhood}</span>
                            {place?.metroStation && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="flex items-center gap-1 text-cyan-400 text-[11px] font-medium truncate">
                                  <Train className="w-3 h-3 shrink-0" />
                                  {place.metroStation} ({place.metroLine || 'Metrô'})
                                </span>
                              </>
                            )}
                          </p>

                          {/* Editable Notes for this stop */}
                          {editingNotesItemId === item.id ? (
                            <div className="mt-2 space-y-2">
                              <textarea
                                value={tempNotes}
                                onChange={e => setTempNotes(e.target.value)}
                                placeholder="Ex: Comprar ingresso na bilheteria, almoçar no restaurante do subsolo..."
                                className="w-full p-2 bg-slate-950 border border-orange-500/50 rounded-xl text-xs text-white focus:outline-none resize-none"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveNotes(currentDay.id, item.id)}
                                  className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold"
                                >
                                  Salvar Nota
                                </button>
                                <button
                                  onClick={() => setEditingNotesItemId(null)}
                                  className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingNotesItemId(item.id);
                                setTempNotes(item.notes || '');
                              }}
                              className="group/note mt-1.5 p-2 rounded-xl bg-slate-950/50 border border-slate-800/60 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs text-slate-300"
                            >
                              <p className="line-clamp-1 italic">
                                {item.notes || 'Clique para adicionar uma anotação ou dica para esta parada...'}
                              </p>
                              <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover/note:opacity-100 transition-opacity ml-2 shrink-0" />
                            </div>
                          )}
                        </div>

                        {/* Actions: Reorder up/down, delete */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          {index > 0 && (
                            <button
                              onClick={() => reorderDayItems(currentDay.id, index, index - 1)}
                              title="Mover para cima"
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          )}
                          {index < populatedItems.length - 1 && (
                            <button
                              onClick={() => reorderDayItems(currentDay.id, index, index + 1)}
                              title="Mover para baixo"
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => removeItemFromDay(currentDay.id, item.id)}
                            title="Remover parada deste dia"
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Transit Connector between this and next stop */}
                    {!isLast && (
                      <TransitBadge
                        mode={item.transitMode || 'metro'}
                        durationMins={item.transitDurationMins}
                        tips={item.transitTips}
                        onChangeMode={newMode =>
                          updateItineraryItem(currentDay.id, item.id, { transitMode: newMode })
                        }
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Add Stop Button at the bottom of the timeline */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setIsAddStopOpen(true)}
              className="w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-orange-500/50 text-slate-200 hover:text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <Plus className="w-4 h-4 text-orange-400" />
              <span>Adicionar Mais um Ponto ao Roteiro</span>
            </button>

            {itineraryDays.length > 1 && (
              <button
                onClick={() => {
                  if (confirm(`Deseja mesmo excluir o ${currentDay.title}?`)) {
                    deleteDay(currentDay.id);
                  }
                }}
                className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/40 text-slate-500 hover:text-rose-400 text-xs font-semibold transition-colors"
              >
                Excluir este Dia
              </button>
            )}
          </div>

        </div>
      ) : null}

      {/* Add Stop Modal */}
      {currentDay && (
        <AddStopModal
          dayId={currentDay.id}
          isOpen={isAddStopOpen}
          onClose={() => setIsAddStopOpen(false)}
          onOpenCreateNewPlace={onOpenCreateNewPlace}
        />
      )}

    </div>
  );
};
