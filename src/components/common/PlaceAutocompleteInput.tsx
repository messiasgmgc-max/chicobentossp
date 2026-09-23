import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Loader2,
  X,
  Utensils,
  Beer,
  Coffee,
  Landmark,
  Trees,
  ShoppingBag,
  Compass,
  Train
} from 'lucide-react';
import { searchPlacesOnline, PlaceSearchResult } from '../../services/placesSearchService';
import { PlaceCategory } from '../../types';

interface PlaceAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectPlace: (place: PlaceSearchResult) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
  inputId?: string;
}

const getCategoryIcon = (category: PlaceCategory) => {
  switch (category) {
    case 'gastronomia':
      return <Utensils className="w-4 h-4 text-emerald-400" />;
    case 'vida_noturna':
      return <Beer className="w-4 h-4 text-amber-400" />;
    case 'cafe':
      return <Coffee className="w-4 h-4 text-amber-300" />;
    case 'cultura':
      return <Landmark className="w-4 h-4 text-sky-400" />;
    case 'parque':
      return <Trees className="w-4 h-4 text-emerald-400" />;
    case 'compras':
      return <ShoppingBag className="w-4 h-4 text-indigo-400" />;
    case 'ponto_turistico':
    default:
      return <Compass className="w-4 h-4 text-blue-400" />;
  }
};

export const PlaceAutocompleteInput: React.FC<PlaceAutocompleteInputProps> = ({
  value,
  onChange,
  onSelectPlace,
  placeholder = 'Buscar lugar, loja, restaurante, endereço...',
  label,
  required = false,
  className = '',
  autoFocus = false,
  inputId,
}) => {
  const [suggestions, setSuggestions] = useState<PlaceSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trigger search on input change with 300ms debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
    setHighlightedIndex(-1);

    debounceTimerRef.current = setTimeout(async () => {
      const results = await searchPlacesOnline(val);
      setSuggestions(results);
      setIsLoading(false);
      if (results.length > 0) {
        setIsOpen(true);
      }
    }, 320);
  };

  const handleSelect = (place: PlaceSearchResult) => {
    onSelectPlace(place);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-blue-400 font-normal">
            💡 Busca ao vivo do Google Maps & SP
          </span>
        </label>
      )}

      {/* Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          ) : (
            <Search className="w-4 h-4 text-slate-400" />
          )}
        </div>

        <input
          id={inputId}
          type="text"
          required={required}
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            title="Limpar texto"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[100] bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-800/80 animate-in fade-in duration-100">
          {suggestions.length > 0 ? (
            <>
              <div className="px-3.5 py-1.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-blue-400">
                  <MapPin className="w-3 h-3" />
                  Sugestões Encontradas em SP
                </span>
                <span>{suggestions.length} resultados</span>
              </div>

              {suggestions.map((item, idx) => {
                const isSelected = idx === highlightedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`p-3 cursor-pointer transition-colors flex items-start gap-3 text-left ${
                      isSelected
                        ? 'bg-blue-600/15 border-l-2 border-blue-500 pl-2.5'
                        : 'hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800 shrink-0 mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {item.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold capitalize shrink-0 border border-slate-700/60">
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.formattedAddress}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500 font-medium">
                          📍 {item.neighborhood}
                        </span>

                        {item.metroStation && (
                          <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-medium bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-800/40">
                            <Train className="w-2.5 h-2.5" />
                            <span>{item.metroStation}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : !isLoading && value.trim().length >= 2 ? (
            <div className="p-4 text-center text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">
                Nenhum endereço exato localizado para "{value}"
              </p>
              <p className="text-[11px] text-slate-500">
                Você pode continuar e salvar com o nome digitado normalmente.
              </p>
            </div>
          ) : null}

          {/* Footer Hint */}
          <div className="p-2 bg-slate-950/50 text-[10px] text-center text-slate-500 border-t border-slate-800/60">
            Clique em uma sugestão para preencher endereço, bairro e GPS automaticamente
          </div>
        </div>
      )}
    </div>
  );
};
