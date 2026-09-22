import React, { useState } from 'react';
import { Place } from '../../types';
import { useTrip } from '../../context/TripContext';
import {
  X,
  MapPin,
  Star,
  Clock,
  Train,
  DollarSign,
  Calendar,
  Send,
  MessageSquare,
  ExternalLink,
  Trash2,
  CheckCircle2
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
}) => {
  const { currentUser, votePlace, deletePlace, itineraryDays, addItemToDay } = useTrip();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cover Photo & Header with Close */}
        <div className="relative h-44 sm:h-64 bg-slate-950 shrink-0">
          <img
            src={place.photoUrl}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Place Title in image overlay */}
          <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-orange-500 text-white shadow-md">
              {place.category.replace('_', ' ')}
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1 leading-tight truncate">
              {place.name}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* Key Quick Info Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-2xl flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Avaliação</span>
                <span className="text-xs font-bold text-white">{place.rating} / 5.0</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-2xl flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Tempo</span>
                <span className="text-xs font-bold text-white">~{place.estimatedTimeMins}m</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-2xl flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Preço</span>
                <span className="text-xs font-bold text-emerald-400 truncate">
                  {place.priceLevel === 1 ? '$ Barato' : place.priceLevel === 2 ? '$$ Médio' : place.priceLevel === 3 ? '$$$ Caro' : '$$$$ Luxo'}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-2xl flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Bairro</span>
                <span className="text-xs font-bold text-white truncate block">{place.neighborhood}</span>
              </div>
            </div>
          </div>

          {/* Description & Details */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sobre o local</h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {place.description}
            </p>
          </div>

          {/* Location & Metro info */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-1 min-w-0">
                <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium truncate">
                  <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>{place.address || `${place.name}, ${place.neighborhood}`}</span>
                </p>
                {place.metroStation && (
                  <p className="text-xs text-cyan-400 flex items-center gap-1.5 font-medium truncate">
                    <Train className="w-3.5 h-3.5 shrink-0" />
                    <span>Estação: <strong>{place.metroStation}</strong> ({place.metroLine || 'Metrô'})</span>
                  </p>
                )}
              </div>

              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Add to Itinerary Day Box */}
          <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-2xl p-3.5 sm:p-4">
            <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Adicionar ao Roteiro Diário
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={selectedDayId}
                onChange={e => setSelectedDayId(e.target.value)}
                className="w-full sm:w-auto flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              >
                {itineraryDays.map(day => (
                  <option key={day.id} value={day.id}>
                    Dia {day.dayNumber}: {day.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddToSelectedDay}
                className="w-full sm:w-auto px-4 py-2.5 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 shrink-0"
              >
                {addedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Adicionado!</span>
                  </>
                ) : (
                  <>
                    <span>Adicionar a este Dia</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Collaborative Comments & Votes */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              Sugestões e Comentários ({place.votes?.length || 0})
            </h4>

            {/* List existing comments */}
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
              {(!place.votes || place.votes.length === 0) ? (
                <p className="text-xs text-slate-500 italic py-1">
                  Nenhum comentário ainda. Dê sua opinião sobre este local!
                </p>
              ) : (
                place.votes.map(vote => (
                  <div key={vote.id} className="bg-slate-950/60 border border-slate-800 p-2.5 sm:p-3 rounded-2xl text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                          {vote.userName[0]}
                        </div>
                        <span className="font-bold text-white">{vote.userName}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {vote.voteType === 'super_want' ? '🚀 Super quero!' : vote.voteType === 'up' ? '👍 Curtiu' : '👎 Outro'}
                      </span>
                    </div>
                    {vote.comment && <p className="text-slate-300 mt-1 pl-6">{vote.comment}</p>}
                  </div>
                ))
              )}
            </div>

            {/* Post a comment form */}
            <form onSubmit={handleSendComment} className="flex gap-1.5">
              <input
                type="text"
                placeholder={`Comentar como ${currentUser}...`}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-orange-400" />
                <span>Enviar</span>
              </button>
            </form>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
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
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
