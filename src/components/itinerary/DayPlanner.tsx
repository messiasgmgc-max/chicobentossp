import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { ItineraryItem, TransitMode, Place } from '../../types';
import { TransitBadge } from './TransitBadge';
import { AddStopModal } from './AddStopModal';
import { TripLogisticsCard } from '../logistics/TripLogisticsCard';
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
  ArrowRight,
  X
} from 'lucide-react';

interface DayPlannerProps {
  onOpenCreateNewPlace: (initialQuery?: string) => void;
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
  
  // Clean New Day Modal State
  const [isAddingNewDay, setIsAddingNewDay] = useState(false);
  const [newDayTitle, setNewDayTitle] = useState('');
  const [newDayDate, setNewDayDate] = useState(trip.startDate || '');
  const [newDayDescription, setNewDayDescription] = useState('');

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
      addDay(newDayTitle.trim(), dayDate, newDayDescription.trim() || undefined);
      setNewDayTitle('');
      setNewDayDescription('');
      setIsAddingNewDay(false);
      triggerCelebration();
    }
  };

  const handleSaveNotes = (dayId: string, itemId: string) => {
    updateItineraryItem(dayId, itemId, { notes: tempNotes });
    setEditingNotesItemId(null);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-4 animate-in fade-in duration-150">
      
      {/* 1. Trip Logistics: Hotel & Flights */}
      <TripLogisticsCard />

      {/* 2. Day Selector Header & Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Roteiro da Viagem
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5 truncate">
              {currentDay?.title || 'Roteiro de São Paulo'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                {currentDay?.date
                  ? new Date(currentDay.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })
                  : 'Data a definir'}
              </span>
            </p>
          </div>

          {/* Quick Metrics & Google Maps Multi-stop Route Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-3 text-xs font-medium">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Paradas</span>
                <span className="text-white font-mono text-sm font-bold">{populatedItems.length}</span>
              </div>
              <div className="w-px h-6 bg-slate-800"></div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Duração</span>
                <span className="text-blue-400 font-mono text-sm font-bold">~{totalEstimatedHours}h</span>
              </div>
            </div>

            {populatedItems.length > 0 && (
              <a
                href={generateGoogleMapsRouteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm active:scale-95 transition-all shrink-0"
              >
                <Navigation className="w-4 h-4 shrink-0" />
                <span>Navegar Rota no Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
              </a>
            )}
          </div>
        </div>

        {/* Day Selector Pills (Scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3.5 pb-1 scrollbar-none">
          {itineraryDays.map(day => (
            <button
              key={day.id}
              onClick={() => setActiveDayId(day.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 active:scale-95 ${
                currentDay?.id === day.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>Dia {day.dayNumber}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${currentDay?.id === day.id ? 'bg-blue-700 text-white' : 'bg-slate-700 text-slate-400'}`}>
                {day.items.length}
              </span>
            </button>
          ))}

          {/* Clean Add New Day Trigger */}
          <button
            onClick={() => setIsAddingNewDay(true)}
            className="px-3 py-2 rounded-xl border border-dashed border-slate-700 hover:border-blue-500/60 text-slate-400 hover:text-blue-400 text-xs font-medium shrink-0 transition-colors flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Dia</span>
          </button>
        </div>
      </div>

      {/* Itinerary Timeline */}
      {itineraryDays.length === 0 ? (
        <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Nenhum dia cadastrado ainda</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-5">
            Comece definindo os dias da viagem para organizar os passeios, restaurantes e horários.
          </p>
          <button
            onClick={() => setIsAddingNewDay(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md inline-flex items-center gap-2 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Criar Primeiro Dia da Viagem
          </button>
        </div>
      ) : currentDay ? (
        <div className="space-y-3">
          
          {populatedItems.length === 0 ? (
            <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-8 sm:p-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Nenhum ponto adicionado para este dia</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                Adicione locais do catálogo ou cadastre novas paradas com horários e notas.
              </p>
              <button
                onClick={() => setIsAddStopOpen(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md inline-flex items-center gap-2 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Adicionar Primeira Parada
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {populatedItems.map((item, index) => {
                const place = item.place;
                const isLast = index === populatedItems.length - 1;

                return (
                  <React.Fragment key={item.id}>
                    {/* Place Item Card */}
                    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 sm:p-4 shadow-sm transition-all">
                      
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Number Index Marker */}
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
                          {index + 1}
                        </div>

                        {/* Place Thumbnail */}
                        {place?.photoUrl && (
                          <img
                            src={place.photoUrl}
                            alt={place?.name || 'Local'}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 border border-slate-800 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => place && onSelectPlaceForDetails(place)}
                          />
                        )}

                        {/* Place Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <h3
                              onClick={() => place && onSelectPlaceForDetails(place)}
                              className="text-sm sm:text-base font-semibold text-white hover:text-blue-400 cursor-pointer transition-colors truncate"
                            >
                              {place?.name || 'Local não encontrado'}
                            </h3>

                            {/* Time Slot input */}
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <input
                                type="time"
                                value={item.startTime || ''}
                                onChange={e =>
                                  updateItineraryItem(currentDay.id, item.id, { startTime: e.target.value })
                                }
                                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-2 truncate">
                            <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                            <span>{place?.neighborhood}</span>
                            {place?.metroStation && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-cyan-400 text-[11px] truncate">
                                  {place.metroStation}
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
                                placeholder="Anotação para esta parada..."
                                className="w-full p-2 bg-slate-950 border border-blue-500 rounded-xl text-xs text-white focus:outline-none resize-none"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveNotes(currentDay.id, item.id)}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                                >
                                  Salvar Nota
                                </button>
                                <button
                                  type="button"
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
                              className="mt-1 p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs text-slate-400"
                            >
                              <p className="line-clamp-1 italic">
                                {item.notes || 'Clique para adicionar uma anotação ou dica...'}
                              </p>
                              <Edit2 className="w-3 h-3 text-slate-500 ml-2 shrink-0" />
                            </div>
                          )}
                        </div>

                        {/* Actions: Reorder up/down, delete */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => reorderDayItems(currentDay.id, index, index - 1)}
                              title="Mover para cima"
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          )}
                          {index < populatedItems.length - 1 && (
                            <button
                              type="button"
                              onClick={() => reorderDayItems(currentDay.id, index, index + 1)}
                              title="Mover para baixo"
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeItemFromDay(currentDay.id, item.id)}
                            title="Remover parada"
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={() => setIsAddStopOpen(true)}
              className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Adicionar Ponto a Este Dia</span>
            </button>

            {itineraryDays.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Deseja mesmo excluir o ${currentDay.title}?`)) {
                    deleteDay(currentDay.id);
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/40 text-slate-500 hover:text-rose-400 text-xs font-semibold transition-colors"
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

      {/* Clean Create New Day Modal (Never cut off on mobile) */}
      {isAddingNewDay && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl w-full max-w-md h-auto flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Criar Novo Dia de Roteiro
                </h3>
                <p className="text-xs text-slate-400">
                  Adicione um dia à viagem
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNewDay(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form id="new-day-form" onSubmit={handleCreateDay} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Título do Dia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dia 1: Chegada, Hotel & Paulista"
                  value={newDayTitle}
                  onChange={e => setNewDayTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Data do Dia *
                </label>
                <input
                  type="date"
                  required
                  value={newDayDate}
                  onChange={e => setNewDayDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descrição (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Museus de manhã e restaurante à noite"
                  value={newDayDescription}
                  onChange={e => setNewDayDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </form>

            {/* Pinned Sticky Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 flex items-center justify-end gap-3 pb-safe">
              <button
                type="button"
                onClick={() => setIsAddingNewDay(false)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="new-day-form"
                className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-transform active:scale-95"
              >
                Salvar Dia
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
