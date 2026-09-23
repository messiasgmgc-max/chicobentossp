import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import {
  Users,
  UserCheck,
  Plus,
  Edit2,
  Check,
  X,
  Sparkles
} from 'lucide-react';

interface UserSelectModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
}

// Clean, pleasant styles and icons for group members
const MEMBER_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  Caca: {
    bg: 'bg-rose-500/10 hover:bg-rose-500/20',
    border: 'border-rose-500/30 hover:border-rose-400/50',
    text: 'text-rose-300',
    icon: '🌸',
  },
  Gui: {
    bg: 'bg-amber-500/10 hover:bg-amber-500/20',
    border: 'border-amber-500/30 hover:border-amber-400/50',
    text: 'text-amber-300',
    icon: '⚡',
  },
  Victrugo: {
    bg: 'bg-blue-500/10 hover:bg-blue-500/20',
    border: 'border-blue-500/30 hover:border-blue-400/50',
    text: 'text-blue-300',
    icon: '🎯',
  },
  Aninha: {
    bg: 'bg-purple-500/10 hover:bg-purple-500/20',
    border: 'border-purple-500/30 hover:border-purple-400/50',
    text: 'text-purple-300',
    icon: '🌟',
  },
};

const DEFAULT_STYLE = {
  bg: 'bg-slate-800 hover:bg-slate-700',
  border: 'border-slate-700 hover:border-slate-600',
  text: 'text-slate-200',
  icon: '👤',
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
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-800 text-center relative shrink-0">
          {canDismiss && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5">
            <Users className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            Chico Bento SP 🏙️
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'select' && 'Quem está usando o aplicativo agora?'}
            {mode === 'create' && 'Cadastrar novo participante'}
            {mode === 'manage' && 'Editar nomes dos integrantes'}
          </p>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* MODE: SELECT PROFILE */}
          {mode === 'select' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {trip.participants.map(name => {
                  const style = MEMBER_STYLES[name] || DEFAULT_STYLE;
                  const isCurrent = currentUser === name;

                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelectUser(name)}
                      className={`p-4 rounded-xl border text-left transition-all active:scale-95 shadow-sm ${style.bg} ${style.border}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{style.icon}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Ativo
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-white text-base truncate">
                        {name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {isCurrent ? 'Perfil atual' : 'Entrar como ' + name}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setMode('create')}
                  className="px-3 py-2 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-slate-800 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Perfil</span>
                </button>

                <button
                  type="button"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome do Novo Integrante
                </label>
                <input
                  type="text"
                  placeholder="Ex: Matheus, Carol, Lucas..."
                  value={newProfileName}
                  onChange={e => setNewProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={!newProfileName.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors"
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
                Clique no lápis para alterar o nome de alguém:
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {trip.participants.map(name => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    {editingMember === name ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={e => setEditNameValue(e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-slate-900 border border-blue-500 rounded-lg text-white text-xs focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(name)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                          title="Salvar"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingMember(null)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 font-semibold text-white">
                          <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs text-blue-400">
                            {name[0]}
                          </span>
                          <span>{name}</span>
                          {name === currentUser && (
                            <span className="text-[10px] text-emerald-400 font-normal">(Você)</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(name)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Editar Nome"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {trip.participants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remover ${name} da viagem?`)) {
                                  deleteParticipant(name);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Remover"
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
                  type="button"
                  onClick={() => setMode('select')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                >
                  Concluir Edição
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Safe-area bottom spacing */}
        <div className="pb-safe"></div>
      </div>
    </div>
  );
};
