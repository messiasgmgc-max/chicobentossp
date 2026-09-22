import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { PlaceCategory } from '../../types';
import {
  X,
  Plus,
  Sparkles
} from 'lucide-react';

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
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

// Common SP Neighborhoods with estimated default coordinates
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

export const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ isOpen, onClose }) => {
  const { addPlace, currentUser } = useTrip();

  const [name, setName] = useState('');
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const neighborhoodObj = SP_NEIGHBORHOODS.find(n => n.name === neighborhood);
    const baseLat = neighborhoodObj ? neighborhoodObj.lat : -23.55052;
    const baseLng = neighborhoodObj ? neighborhoodObj.lng : -46.633308;

    // Small jitter for custom spots in the same neighborhood
    const lat = baseLat + (Math.random() - 0.5) * 0.005;
    const lng = baseLng + (Math.random() - 0.5) * 0.005;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    addPlace({
      name: name.trim(),
      category,
      neighborhood,
      address: address.trim() || `${name.trim()}, ${neighborhood}, São Paulo - SP`,
      lat,
      lng,
      description: description.trim() || `Sugestão de lugar incrível para visitar em São Paulo (${neighborhood}).`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate">
              <Sparkles className="w-5 h-5 text-orange-500 shrink-0" />
              Sugerir Novo Local em SP
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              Adicione ao catálogo para o grupo avaliar e votar
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4">
          
          {/* Place Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Nome do Local *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Bar dos Arcos, Casa de Francisca, Parque Villa-Lobos..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Category & Neighborhood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as PlaceCategory)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 capitalize"
              >
                <option value="cultura">Cultura & Museus</option>
                <option value="gastronomia">Gastronomia & Restaurantes</option>
                <option value="parque">Parque & Ao Ar Livre</option>
                <option value="vida_noturna">Vida Noturna & Bares</option>
                <option value="compras">Compras & Galerias</option>
                <option value="cafe">Café & Sobremesas</option>
                <option value="ponto_turistico">Ponto Turístico / Mirante</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Bairro / Região
              </label>
              <select
                value={neighborhood}
                onChange={e => setNeighborhood(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
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
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Endereço / Referência
            </label>
            <input
              type="text"
              placeholder="Ex: Rua Medeiros de Albuquerque, 82"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Descrição / Dica
            </label>
            <textarea
              placeholder="Conta para o grupo o que tem de especial lá..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/* Metro Station & Metro Line */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Estação de Metrô Próxima
              </label>
              <input
                type="text"
                placeholder="Ex: Estação Fradique Coutinho"
                value={metroStation}
                onChange={e => setMetroStation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Linha do Metrô
              </label>
              <select
                value={metroLine}
                onChange={e => setMetroLine(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Linha 1-Azul">Linha 1 - Azul</option>
                <option value="Linha 2-Verde">Linha 2 - Verde</option>
                <option value="Linha 3-Vermelha">Linha 3 - Vermelha</option>
                <option value="Linha 4-Amarela">Linha 4 - Amarela</option>
                <option value="Linha 5-Lilás">Linha 5 - Lilás</option>
                <option value="Linha 9-Esmeralda (CPTM)">Linha 9 - Esmeralda</option>
              </select>
            </div>
          </div>

          {/* Price, Duration, Rating */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-300 mb-1">
                Preço
              </label>
              <select
                value={priceLevel}
                onChange={e => setPriceLevel(Number(e.target.value) as any)}
                className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-[11px] sm:text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value={1}>$ Barato</option>
                <option value={2}>$$ Médio</option>
                <option value={3}>$$$ Caro</option>
                <option value={4}>$$$$ Luxo</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-300 mb-1">
                Tempo (min)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={estimatedTimeMins}
                onChange={e => setEstimatedTimeMins(Number(e.target.value))}
                className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-[11px] sm:text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-300 mb-1">
                Nota (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
                className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-[11px] sm:text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Tags & Photo URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Fotos, Drinks, Feira, Chopp..."
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                URL da Foto (opcional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/25 transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Sugestão</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
