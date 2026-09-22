import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import {
  Users,
  UserCheck,
  Plus,
  Edit2,
  Check,
  X,
  Sparkles,
  Heart,
  Smile,
  Zap,
  Star
} from 'lucide-react';

interface UserSelectModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
}

// Visual styles and icons for group members
const MEMBER_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  Caca: {
    bg: 'from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30',
    border: 'border-pink-500/50 hover:border-pink-400',
    text: 'text-pink-300',
    icon: '🌸',
  },
  Gui: {
    bg: 'from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30',
    border: 'border-amber-500/50 hover:border-amber-400',
    text: 'text-amber-300',
    icon: '⚡',
  },
  Victrugo: {
    bg: 'from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30',
    border: 'border-cyan-500/50 hover:border-cyan-400',
    text: 'text-cyan-300',
    icon: '🎯',
  },
  Aninha: {
    bg: 'from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30',
    border: 'border-purple-500/50 hover:border-purple-400',
    text: 'text-purple-300',
    icon: '🌟',
  },
};

const DEFAULT_STYLE = {
  bg: 'from-slate-800 to-slate-800/80 hover:from-slate-700 hover:to-slate-700/80',
  border: 'border-slate-700 hover:border-orange-500/60',
  text: 'text-orange-300',
  icon: '✨',
};

export const UserSelectModal: React.FC<UserSelectModalProps> = ({
  isOpen,
  onClose,
  canDismiss = true,
}) => {
  const {
    trip,
    currentUser,
    setCurrentUser,
    addParticipant,
    updateParticipantName,
    deleteParticipant,
    triggerCelebration,
  } = useTrip();

  const [mode, setMode] = useState<'select' | 'create' | 'manage'>('select');
  const [newProfileName, setNewProfileName] = useState('');
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

  if (!isOpen) return null;

  const handleSelectUser = (name: string) => {
    setCurrentUser(name);
    triggerCelebration();
    if (onClose) onClose();
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newProfileName.trim();
    if (trimmed) {
      addParticipant(trimmed);
      setCurrentUser(trimmed);
      setNewProfileName('');
      setMode('select');
      triggerCelebration();
      if (onClose) onClose();
    }
  };

  const handleStartEdit = (name: string) => {
    setEditingMember(name);
    setEditNameValue(name);
  };

  const handleSaveEdit = (oldName: string) => {
    const trimmed = editNameValue.trim();
    if (trimmed && trimmed !== oldName) {
      updateParticipantName(oldName, trimmed);
    }
    setEditingMember(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        
        {/* Decorative Top Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-pink-500 to-amber-500"></div>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-800 text-center relative">
          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 mb-3">
            <Users className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Chico Bento SP 🏙️
          </h2>
          <p className="text-sm text-slate-300 mt-1 font-medium">
            {mode === 'select' && 'Quem está acessando o roteiro?'}
            {mode === 'create' && 'Cadastrar novo integrante no grupo'}
            {mode === 'manage' && 'Editar nomes e integrantes'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === 'select' && 'Selecione seu nome com 1 clique para votar, comentar e montar a viagem:'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          
          {/* MODE: SELECT PROFILE */}
          {mode === 'select' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                {trip.participants.map(name => {
                  const style = MEMBER_STYLES[name] || DEFAULT_STYLE;
                  const isCurrent = currentUser === name;

                  return (
                    <button
                      key={name}
                      onClick={() => handleSelectUser(name)}
                      className={`group relative p-4 rounded-2xl bg-gradient-to-br ${style.bg} border ${style.border} text-left transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-md`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{style.icon}</span>
                        {isCurrent && (
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Ativo
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-white text-base sm:text-lg group-hover:text-orange-300 transition-colors">
                        {name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {isCurrent ? 'Seu perfil atual' : 'Entrar como ' + name}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => setMode('create')}
                  className="px-3 py-2 rounded-xl text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Novo Perfil</span>
                </button>

                <button
                  onClick={() => setMode('manage')}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Nomes</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE: CREATE PROFILE */}
          {mode === 'create' && (
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Nome do Novo Integrante
                </label>
                <input
                  type="text"
                  placeholder="Ex: Matheus, Bia, Gabriel..."
                  value={newProfileName}
                  onChange={e => setNewProfileName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-medium text-sm"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={!newProfileName.trim()}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all"
                >
                  Cadastrar e Entrar
                </button>
              </div>
            </form>
          )}

          {/* MODE: MANAGE / EDIT NAMES */}
          {mode === 'manage' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                Clique no lápis para alterar a escrita do nome:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {trip.participants.map(name => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    {editingMember === name ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={e => setEditNameValue(e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-slate-900 border border-orange-500 rounded-xl text-white text-xs focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(name)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                          title="Salvar"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingMember(null)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 font-bold text-white">
                          <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs text-orange-400">
                            {name[0]}
                          </span>
                          <span>{name}</span>
                          {name === currentUser && (
                            <span className="text-[10px] text-emerald-400 font-medium">(Você)</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(name)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Editar Nome"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {trip.participants.length > 1 && (
                            <button
                              onClick={() => {
                                if (confirm(`Remover ${name} da viagem?`)) {
                                  deleteParticipant(name);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Remover Integrante"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setMode('select')}
                  className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
                >
                  Concluir Edição
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
