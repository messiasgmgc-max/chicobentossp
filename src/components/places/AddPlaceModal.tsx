import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { PlaceCategory, PlaceStatus } from '../../types';
import {
  X,
  Plus,
  MapPin,
  Train,
  Clock,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { PlaceAutocompleteInput } from '../common/PlaceAutocompleteInput';
import { PlaceSearchResult } from '../../services/placesSearchService';

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const DEFAULT_CATEGORY_PHOTOS: Record<PlaceCategory, string> = {
  cultura: 'https://images.unsplash.com/photo-1583275479278-858bf23700f2?auto=format&fit=crop&w=800&q=80',
  gastronomia: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  parque: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=800&q=80',
  vida_noturna: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
  compras: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
  cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
  ponto_turistico: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
};

const SP_NEIGHBORHOODS: { name: string; lat: number; lng: number }[] = [
  { name: 'Av. Paulista / Bela Vista', lat: -23.561494, lng: -46.655881 },
  { name: 'Liberdade', lat: -23.555239, lng: -46.635832 },
  { name: 'Vila Madalena', lat: -23.557088, lng: -46.686524 },
  { name: 'Pinheiros', lat: -23.567088, lng: -46.696524 },
  { name: 'Centro Histórico / Sé', lat: -23.548943, lng: -46.638818 },
  { name: 'Jardins / Cerqueira César', lat: -23.565432, lng: -46.669882 },
  { name: 'Ibirapuera / Vila Mariana', lat: -23.587416, lng: -46.657634 },
  { name: 'Itaim Bibi / Faria Lima', lat: -23.584123, lng: -46.681234 },
  { name: 'Bom Retiro / Luz', lat: -23.534279, lng: -46.633887 },
  { name: 'Moema', lat: -23.604123, lng: -46.661234 },
  { name: 'Santana (Zona Norte)', lat: -23.504123, lng: -46.621234 },
];

export const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ isOpen, onClose, initialQuery = '' }) => {
  const { addPlace, currentUser } = useTrip();

  const [name, setName] = useState(initialQuery);
  const [category, setCategory] = useState<PlaceCategory>('gastronomia');
  const [neighborhood, setNeighborhood] = useState('Av. Paulista / Bela Vista');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [priceLevel, setPriceLevel] = useState<1 | 2 | 3 | 4>(2);
  const [rating, setRating] = useState(4.8);
  const [estimatedTimeMins, setEstimatedTimeMins] = useState(90);
  const [photoUrl, setPhotoUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [metroStation, setMetroStation] = useState('');
  const [metroLine, setMetroLine] = useState('Linha 2-Verde');
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Update initial query if changed
  React.useEffect(() => {
    if (initialQuery) {
      setName(initialQuery);
    }
  }, [initialQuery]);

  if (!isOpen) return null;

  const handleSelectPlace = (place: PlaceSearchResult) => {
    setName(place.name);
    setAddress(place.formattedAddress);
    setCategory(place.category);
    setSelectedCoordinates({ lat: place.lat, lng: place.lng });

    // Match known neighborhood or use detected suburb
    if (place.neighborhood) {
      const match = SP_NEIGHBORHOODS.find(
        n =>
          n.name.toLowerCase().includes(place.neighborhood.toLowerCase()) ||
          place.neighborhood.toLowerCase().includes(n.name.toLowerCase().split('/')[0].trim())
      );
      if (match) {
        setNeighborhood(match.name);
      } else {
        setNeighborhood(place.neighborhood);
      }
    }

    if (place.metroStation) {
      setMetroStation(place.metroStation);
      if (place.metroLine) {
        setMetroLine(place.metroLine);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const neighborhoodObj = SP_NEIGHBORHOODS.find(n => n.name === neighborhood);
    const baseLat = neighborhoodObj ? neighborhoodObj.lat : -23.55052;
    const baseLng = neighborhoodObj ? neighborhoodObj.lng : -46.633308;

    // Use REAL coordinates from Google Maps / OSM when selected, otherwise center of neighborhood
    const finalLat = selectedCoordinates ? selectedCoordinates.lat : baseLat + (Math.random() - 0.5) * 0.005;
    const finalLng = selectedCoordinates ? selectedCoordinates.lng : baseLng + (Math.random() - 0.5) * 0.005;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    addPlace({
      name: name.trim(),
      category,
      neighborhood,
      address: address.trim() || `${name.trim()}, ${neighborhood}, São Paulo - SP`,
      lat: finalLat,
      lng: finalLng,
      description: description.trim() || `Sugestão de lugar em São Paulo (${neighborhood}).`,
      priceLevel,
      rating,
      estimatedTimeMins: Number(estimatedTimeMins) || 90,
      photoUrl: photoUrl.trim() || DEFAULT_CATEGORY_PHOTOS[category],
      tags: tags.length > 0 ? tags : ['São Paulo', category],
      metroStation: metroStation.trim() || undefined,
      metroLine: metroStation.trim() ? metroLine : undefined,
      status: 'wishlist',
      createdBy: currentUser || 'Viajante',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl w-full max-w-xl h-[92dvh] sm:h-auto sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Pinned Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
              Sugerir Novo Local em SP
            </h2>
            <p className="text-xs text-slate-400 truncate">
              Adicione pontos turísticos, restaurantes e passeios
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="add-place-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        >
          {/* Place Name with Live Google Maps & OSM Autocomplete */}
          <div>
            <PlaceAutocompleteInput
              label="Nome do Local ou Endereço *"
              placeholder="Digite para buscar (ex: Bar Brahma, MASP, Coco Bambu, Rua Augusta 500...)"
              value={name}
              onChange={val => {
                setName(val);
                if (selectedCoordinates) {
                  setSelectedCoordinates(null);
                }
              }}
              onSelectPlace={handleSelectPlace}
              required
              autoFocus
            />
          </div>

          {/* Place Verified Badge / Feedback */}
          {selectedCoordinates && (
            <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-2 text-xs text-blue-200 animate-in fade-in">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <span className="font-semibold text-white">Local confirmado no Mapa! </span>
                  <span className="text-[11px] text-blue-300 font-mono">
                    ({selectedCoordinates.lat.toFixed(4)}, {selectedCoordinates.lng.toFixed(4)})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCoordinates(null)}
                className="text-[11px] text-slate-400 hover:text-white underline shrink-0"
              >
                Limpar GPS
              </button>
            </div>
          )}

          {/* Category & Neighborhood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as PlaceCategory)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 capitalize"
              >
                <option value="gastronomia">Gastronomia / Restaurante</option>
                <option value="cultura">Cultura / Museu / Teatro</option>
                <option value="ponto_turistico">Ponto Turístico / Mirante</option>
                <option value="parque">Parque / Ao Ar Livre</option>
                <option value="vida_noturna">Vida Noturna / Bar</option>
                <option value="cafe">Café / Padaria Artesanal</option>
                <option value="compras">Compras / Feiras</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Região / Bairro *
              </label>
              <select
                value={neighborhood}
                onChange={e => setNeighborhood(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {SP_NEIGHBORHOODS.map(n => (
                  <option key={n.name} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Endereço Completo
            </label>
            <input
              type="text"
              placeholder="Ex: R. Medeiros de Albuquerque, 82 - Vila Madalena"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Descrição ou Por que ir lá?
            </label>
            <textarea
              rows={2}
              placeholder="Diga para o grupo o que tem de legal lá..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Price, Rating, Time */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Preço
              </label>
              <select
                value={priceLevel}
                onChange={e => setPriceLevel(Number(e.target.value) as 1 | 2 | 3 | 4)}
                className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value={1}>$ (Barato)</option>
                <option value={2}>$$ (Médio)</option>
                <option value={3}>$$$ (Sofisticado)</option>
                <option value={4}>$$$$ (Luxo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nota
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tempo (min)
              </label>
              <input
                type="number"
                step="15"
                min="15"
                value={estimatedTimeMins}
                onChange={e => setEstimatedTimeMins(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Metro Station & Line */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Estação de Metrô Próxima
              </label>
              <input
                type="text"
                placeholder="Ex: Trianon-MASP, Fradique Coutinho..."
                value={metroStation}
                onChange={e => setMetroStation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Linha do Metrô
              </label>
              <select
                value={metroLine}
                onChange={e => setMetroLine(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Linha 2-Verde">Linha 2 - Verde (Paulista)</option>
                <option value="Linha 4-Amarela">Linha 4 - Amarela (Pinheiros)</option>
                <option value="Linha 1-Azul">Linha 1 - Azul (Liberdade/Luz)</option>
                <option value="Linha 3-Vermelha">Linha 3 - Vermelha (Centro)</option>
                <option value="Linha 5-Lilás">Linha 5 - Lilás (Ibirapuera)</option>
                <option value="Linha 9-Esmeralda">Linha 9 - Esmeralda (CPTM)</option>
              </select>
            </div>
          </div>

          {/* Tags & Photo URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Imperdível, Foto, Vista bonita..."
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                URL da Foto (opcional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </form>

        {/* Pinned Sticky Footer - ALWAYS visible on mobile & desktop */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-900 shrink-0 flex items-center justify-end gap-3 pb-safe">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="add-place-form"
            className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Salvar Sugestão</span>
          </button>
        </div>

      </div>
    </div>
  );
};
