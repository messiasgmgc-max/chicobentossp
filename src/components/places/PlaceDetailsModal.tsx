import React, { useState } from 'react';
import { Place, PlaceStatus } from '../../types';
import { useTrip } from '../../context/TripContext';
import {
  X,
  MapPin,
  Star,
  Clock,
  Train,
  DollarSign,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Rocket,
  Send,
  MessageSquare,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Plus
} from 'lucide-react';

interface PlaceDetailsModalProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
  onQuickAddToDay?: (place: Place) => void;
}

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({
  place,
  isOpen,
  onClose,
  onQuickAddToDay,
}) => {
  const { currentUser, votePlace, changePlaceStatus, deletePlace, itineraryDays, addItemToDay } = useTrip();
  const [commentText, setCommentText] = useState('');
  const [selectedDayId, setSelectedDayId] = useState(itineraryDays[0]?.id || '');
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!isOpen || !place) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      votePlace(place.id, 'up', commentText.trim());
      setCommentText('');
    }
  };

  const handleAddToSelectedDay = () => {
    if (selectedDayId) {
      addItemToDay(selectedDayId, place.id);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    }
  };

  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.name}, ${place.address || place.neighborhood}, São Paulo - SP`
  )}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl h-[92dvh] sm:h-auto sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cover Photo & Header with Close */}
        <div className="relative h-48 sm:h-56 bg-slate-950 shrink-0">
          <img
            src={place.photoUrl}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 backdrop-blur-md transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Place Title in image overlay */}
          <div className="absolute bottom-4 left-5 right-5">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-600 text-white shadow-sm inline-block">
              {place.category.replace('_', ' ')}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5 leading-tight">
              {place.name}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Key Quick Info Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-medium">Avaliação</span>
                <span className="text-xs font-semibold text-white">{place.rating} / 5.0</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-medium">Faixa de Preço</span>
                <span className="text-xs font-semibold text-white">
                  {'$'.repeat(place.priceLevel)}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-medium">Tempo Sugerido</span>
                <span className="text-xs font-semibold text-white">~{place.estimatedTimeMins} min</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-medium">Bairro</span>
                <span className="text-xs font-semibold text-white truncate max-w-[100px] block">
                  {place.neighborhood}
                </span>
              </div>
            </div>
          </div>

          {/* Address & Navigation */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-300 flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{place.address || place.neighborhood}</span>
              </p>
              {place.metroStation && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                  <Train className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>{place.metroStation} ({place.metroLine || 'Metrô'})</span>
                </p>
              )}
            </div>

            <a
              href={googleMapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-slate-700 transition-colors"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Description */}
          {place.description && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Sobre este local
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {place.description}
              </p>
            </div>
          )}

          {/* Fast Vote Action */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              O que você acha deste local? (Votar como {currentUser || 'Você'})
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => votePlace(place.id, 'super_want')}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 text-xs font-semibold text-slate-200 hover:text-blue-300 flex items-center justify-center gap-1.5 transition-all"
              >
                <Rocket className="w-3.5 h-3.5 text-blue-400" />
                <span>Super Quero!</span>
              </button>

              <button
                type="button"
                onClick={() => votePlace(place.id, 'up')}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-emerald-600/20 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 hover:text-emerald-300 flex items-center justify-center gap-1.5 transition-all"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gostei</span>
              </button>

              <button
                type="button"
                onClick={() => votePlace(place.id, 'down')}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-600/20 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold text-slate-200 hover:text-rose-300 flex items-center justify-center gap-1.5 transition-all"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                <span>Passo</span>
              </button>
            </div>
          </div>

          {/* Add directly to an Itinerary Day */}
          {itineraryDays.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Adicionar ao Roteiro Diário
              </h4>

              <div className="flex gap-2">
                <select
                  value={selectedDayId}
                  onChange={e => setSelectedDayId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {itineraryDays.map(d => (
                    <option key={d.id} value={d.id}>
                      Dia {d.dayNumber}: {d.title} ({d.date})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddToSelectedDay}
                  disabled={addedSuccess}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
                >
                  {addedSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Adicionado!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Collaborative Comments & Suggestions */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Comentários do Grupo ({place.votes?.length || 0})
            </h4>

            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
              {(!place.votes || place.votes.length === 0) ? (
                <p className="text-xs text-slate-500 italic py-1">
                  Nenhum comentário ainda. Dê sua opinião sobre este local!
                </p>
              ) : (
                place.votes.map(vote => (
                  <div key={vote.id} className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                          {vote.userName[0]}
                        </div>
                        <span className="font-semibold text-white">{vote.userName}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {vote.voteType === 'super_want' ? '🚀 Super quero' : vote.voteType === 'up' ? '👍 Curtiu' : '👎 Outro'}
                      </span>
                    </div>
                    {vote.comment && <p className="text-slate-300 mt-1 pl-6">{vote.comment}</p>}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                type="text"
                placeholder={`Comentar como ${currentUser || 'Você'}...`}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-blue-400" />
                <span>Enviar</span>
              </button>
            </form>
          </div>

        </div>

        {/* Pinned Sticky Footer - ALWAYS visible on mobile & desktop */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900 shrink-0 flex items-center justify-between pb-safe">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Remover "${place.name}" do catálogo da viagem?`)) {
                deletePlace(place.id);
                onClose();
              }
            }}
            className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Local</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
