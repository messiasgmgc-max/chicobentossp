import React, { useState } from 'react';
import { SP_METRO_LINES } from '../../lib/mockData';
import { useTrip } from '../../context/TripContext';
import {
  Train,
  CreditCard,
  Plane,
  Car,
  ShieldCheck,
  Navigation,
  Compass,
  ArrowRight,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';

export const TransitGuide: React.FC = () => {
  const { places } = useTrip();
  const [fromPlaceId, setFromPlaceId] = useState<string>(places[0]?.id || '');
  const [toPlaceId, setToPlaceId] = useState<string>(places[1]?.id || '');

  const fromPlace = places.find(p => p.id === fromPlaceId);
  const toPlace = places.find(p => p.id === toPlaceId);

  const getDirectionsUrl = () => {
    if (!fromPlace || !toPlace) return '#';
    const origin = encodeURIComponent(`${fromPlace.name}, ${fromPlace.neighborhood}, São Paulo`);
    const dest = encodeURIComponent(`${toPlace.name}, ${toPlace.neighborhood}, São Paulo`);
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=transit`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Train className="w-3.5 h-3.5" />
            Guia Completo de Mobilidade em São Paulo
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Como ir pros lugares em SP sem complicação 🚇
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            São Paulo tem a maior e mais eficiente malha metroviária do Brasil. Veja as linhas que mais vamos usar, como pagar na catraca por aproximação, dicas de aeroporto e segurança.
          </p>
        </div>
      </div>

      {/* Quick Transit Route Simulator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-400" />
          <h3 className="text-base font-bold text-white">Simulador de Deslocamento Rápido</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Ponto de Partida</label>
            <select
              value={fromPlaceId}
              onChange={e => setFromPlaceId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white focus:outline-none focus:border-orange-500"
            >
              {places.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.neighborhood})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Destino</label>
            <select
              value={toPlaceId}
              onChange={e => setToPlaceId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white focus:outline-none focus:border-orange-500"
            >
              {places.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.neighborhood})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-5">
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>Ver Trajeto no Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>

        {fromPlace && toPlace && (
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-xs text-slate-300 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">De:</span>
              <strong className="text-white">{fromPlace.name}</strong>
              {fromPlace.metroStation && (
                <span className="text-cyan-400 font-mono text-[11px]">({fromPlace.metroStation})</span>
              )}
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Para:</span>
              <strong className="text-white">{toPlace.name}</strong>
              {toPlace.metroStation && (
                <span className="text-cyan-400 font-mono text-[11px]">({toPlace.metroStation})</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Practical Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Payment & Bilhete Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Como Pagar na Catraca</h3>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><strong>Aproximação (NFC)</strong>: Você pode encostar seu cartão de débito/crédito físico ou celular (Apple Pay / Google Wallet) direto no leitor da catraca de quase todas as estações.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><strong>App TOP</strong>: Baixe o aplicativo TOP para comprar bilhetes digitais com QR Code caso seu cartão não tenha aproximação.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><strong>Integração Grátis</strong>: Ao transferir de uma linha de metrô para outra (ex: Verde para Amarela na Estação Paulista), você não paga nada a mais!</span>
            </li>
          </ul>
        </div>

        {/* Airport Transfers */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Plane className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Chegando pelos Aeroportos</h3>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Guarulhos (GRU)</strong>: Pegue o trem Expresso Aeroporto (Linha 13-Jade) direto para a Estação da Luz ou Palmeiras-Barra Funda. Rápido e evita o trânsito da Marginal Tietê.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Congonhas (CGH)</strong>: Uber/Táxi até a Paulista ou Moema leva cerca de 15 a 25 min (fora do pico), ou ônibus executivo / integração até o Metrô São Judas (Linha 1-Azul).</span>
            </li>
          </ul>
        </div>

        {/* Uber vs Metro & Safety */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Quando Usar Uber vs Metrô</h3>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Dias Úteis no Horário de Pico (17h-19h30)</strong>: Sempre prefira o Metrô. O trânsito de SP pode triplicar o tempo de viagem de carro.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Noite / Madrugada (após 22h)</strong>: Em saídas de bares na Vila Madalena, Bixiga ou Centro, peça Uber direto na porta do local para voltar ao hotel com conforto e segurança.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Main SP Metro Lines Guide */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Train className="w-5 h-5 text-orange-400" />
          Principais Linhas de Metrô da nossa Viagem
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SP_METRO_LINES.map(line => (
            <div
              key={line.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden"
            >
              {/* Colored Line Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-2"
                style={{ backgroundColor: line.hexColor }}
              ></div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white">{line.name}</h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {line.stationsCount} estações
                  </span>
                </div>

                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Destaques & Conexões:
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {line.highlights.map(h => (
                    <span
                      key={h}
                      className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 font-medium"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
