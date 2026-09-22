import React from 'react';
import { Place, PlaceCategory, PlaceStatus } from '../../types';
import { useTrip } from '../../context/TripContext';
import {
  MapPin,
  Star,
  Clock,
  Train,
  ThumbsUp,
  ThumbsDown,
  Rocket,
  MessageSquare,
  Plus,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onOpenDetails: (place: Place) => void;
  onQuickAddToDay?: (place: Place) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onOpenDetails,
  onQuickAddToDay,
}) => {
  const { currentUser, votePlace } = useTrip();

  const userVote = place.votes?.find(v => v.userName === currentUser);
  const upVotesCount = place.votes?.filter(v => v.voteType === 'up' || v.voteType === 'super_want').length || 0;
  const superVotesCount = place.votes?.filter(v => v.voteType === 'super_want').length || 0;

  const getCategoryColor = (cat: PlaceCategory) => {
    switch (cat) {
      case 'cultura':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'gastronomia':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'parque':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'vida_noturna':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'compras':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'cafe':
        return 'bg-amber-700/20 text-amber-200 border-amber-700/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const getStatusBadge = (status: PlaceStatus) => {
    switch (status) {
      case 'planned':
        return (
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            No Roteiro
          </span>
        );
      case 'visited':
        return (
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            Visitado 🎉
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
            Sugestão
          </span>
        );
    }
  };

  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between">
      
      {/* Top Image & Floating Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950 cursor-pointer" onClick={() => onOpenDetails(place)}>
        <img
          src={place.photoUrl}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>

        {/* Floating Category and Status */}
        <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between gap-1.5">
          <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-[10px] sm:text-xs font-bold capitalize border backdrop-blur-md shadow-sm truncate max-w-[60%] ${getCategoryColor(place.category)}`}>
            {place.category.replace('_', ' ')}
          </span>
          {getStatusBadge(place.status)}
        </div>

        {/* Bottom Image Overlay: Price, Rating, Duration */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between text-[11px] sm:text-xs text-white">
          <div className="flex items-center gap-1 font-medium bg-black/60 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-white/10">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold">{place.rating}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center font-mono text-amber-300 bg-black/60 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-white/10">
              {Array.from({ length: 4 }).map((_, i) => (
                <DollarSign
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < place.priceLevel ? 'text-amber-400' : 'text-slate-600'}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-white/10">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-300" />
              <span>~{place.estimatedTimeMins}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3
            onClick={() => onOpenDetails(place)}
            className="text-sm sm:text-base font-bold text-white hover:text-orange-400 cursor-pointer transition-colors line-clamp-1"
          >
            {place.name}
          </h3>

          <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
            <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
            <span className="font-medium text-slate-300 truncate">{place.neighborhood}</span>
          </p>

          {place.metroStation && (
            <p className="text-[10px] sm:text-[11px] text-cyan-400 flex items-center gap-1 mt-0.5 font-medium truncate">
              <Train className="w-3 h-3 shrink-0" />
              <span>{place.metroStation}</span>
            </p>
          )}

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {place.description}
          </p>

          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {place.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-medium border border-slate-700/60"
                >
                  #{tag}
                </span>
              ))}
              {place.tags.length > 3 && (
                <span className="text-[9px] sm:text-[10px] text-slate-500 self-center">
                  +{place.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Collaborative Voting & Action Bar */}
        <div className="pt-2.5 sm:pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
          
          {/* Vote Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-950/60 p-1 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => votePlace(place.id, 'super_want')}
              title="Super Quero Ir!"
              className={`p-1.5 rounded-xl transition-all text-xs font-bold flex items-center gap-1 active:scale-90 ${
                userVote?.voteType === 'super_want'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-orange-400 hover:bg-slate-800'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              {superVotesCount > 0 && <span className="text-[10px]">{superVotesCount}</span>}
            </button>

            <button
              onClick={() => votePlace(place.id, 'up')}
              title="Gostei"
              className={`p-1.5 rounded-xl transition-all text-xs font-bold flex items-center gap-1 active:scale-90 ${
                userVote?.voteType === 'up'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {upVotesCount > 0 && <span className="text-[10px]">{upVotesCount}</span>}
            </button>

            <button
              onClick={() => votePlace(place.id, 'down')}
              title="Prefiro outro"
              className={`p-1.5 rounded-xl transition-all text-xs active:scale-90 ${
                userVote?.voteType === 'down'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onOpenDetails(place)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors active:scale-90"
              title="Ver detalhes"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>

            {onQuickAddToDay && (
              <button
                onClick={() => onQuickAddToDay(place)}
                className="px-2.5 sm:px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center gap-1 shadow-md shadow-orange-600/20"
                title="Adicionar ao roteiro"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Roteiro</span>
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
