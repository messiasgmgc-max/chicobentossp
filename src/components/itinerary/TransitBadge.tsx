import React from 'react';
import { TransitMode } from '../../types';
import { Train, Footprints, Car, Bus, ArrowDown, Clock } from 'lucide-react';

interface TransitBadgeProps {
  mode: TransitMode;
  durationMins?: number;
  tips?: string;
  onChangeMode?: (mode: TransitMode) => void;
}

export const TransitBadge: React.FC<TransitBadgeProps> = ({
  mode,
  durationMins = 15,
  tips,
  onChangeMode,
}) => {
  const getIcon = () => {
    switch (mode) {
      case 'walk':
        return <Footprints className="w-3.5 h-3.5 text-emerald-400" />;
      case 'uber':
        return <Car className="w-3.5 h-3.5 text-indigo-400" />;
      case 'bus':
        return <Bus className="w-3.5 h-3.5 text-amber-400" />;
      case 'metro':
      default:
        return <Train className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const getLabel = () => {
    switch (mode) {
      case 'walk':
        return 'A pé';
      case 'uber':
        return 'Uber / Carro';
      case 'bus':
        return 'Ônibus SPTrans';
      case 'metro':
      default:
        return 'Metrô / CPTM';
    }
  };

  return (
    <div className="relative my-2 pl-8 pr-4">
      {/* Vertical Timeline connector line */}
      <div className="absolute left-[1.18rem] top-0 bottom-0 w-0.5 bg-dashed border-l-2 border-slate-700/80 -translate-x-1/2"></div>

      <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-2.5 shadow-sm text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">{getLabel()}</span>
              {durationMins && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  ~{durationMins} min
                </span>
              )}
            </div>
            {tips && (
              <p className="text-[11px] text-slate-300 mt-0.5 font-sans leading-tight">
                {tips}
              </p>
            )}
          </div>
        </div>

        {onChangeMode && (
          <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => onChangeMode('metro')}
              title="Mudar para Metrô"
              className={`p-1 rounded-md transition-colors ${
                mode === 'metro' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Train className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('walk')}
              title="Mudar para Caminhada"
              className={`p-1 rounded-md transition-colors ${
                mode === 'walk' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('uber')}
              title="Mudar para Uber/Carro"
              className={`p-1 rounded-md transition-colors ${
                mode === 'uber' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
