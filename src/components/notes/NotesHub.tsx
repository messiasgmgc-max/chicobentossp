import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { TripNote, TripExpense } from '../../types';
import {
  FileText,
  DollarSign,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Pin,
  Shield,
  Train,
  Sparkles,
  Luggage,
  Calendar,
  Users,
  CreditCard,
  PieChart,
  X
} from 'lucide-react';

export const NotesHub: React.FC = () => {
  const {
    notes,
    expenses,
    trip,
    currentUser,
    addNote,
    deleteNote,
    toggleChecklistNote,
    addExpense,
    deleteExpense,
  } = useTrip();

  const [activeSubTab, setActiveSubTab] = useState<'notes' | 'expenses'>('notes');
  const [selectedNoteCategory, setSelectedNoteCategory] = useState<string>('all');

  // Add Note Form State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<TripNote['category']>('dica_geral');

  // Add Expense Form State
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<TripExpense['category']>('alimentacao');
  const [expensePaidBy, setExpensePaidBy] = useState(currentUser);
  const [expenseSplitWith, setExpenseSplitWith] = useState<string[]>(trip.participants);

  // Filter notes
  const filteredNotes = notes.filter(n =>
    selectedNoteCategory === 'all' ? true : n.category === selectedNoteCategory
  );

  // Handle Note Submission
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    addNote({
      title: noteTitle.trim(),
      content: noteContent.trim(),
      category: noteCategory,
      author: currentUser,
      isPinned: false,
      completed: false,
    });

    setNoteTitle('');
    setNoteContent('');
    setIsAddingNote(false);
  };

  // Handle Expense Submission
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(expenseAmount.replace(',', '.'));
    if (!expenseTitle.trim() || isNaN(amountVal) || amountVal <= 0) return;

    addExpense({
      title: expenseTitle.trim(),
      amountCents: Math.round(amountVal * 100),
      category: expenseCategory,
      paidBy: expensePaidBy,
      splitWith: expenseSplitWith.length > 0 ? expenseSplitWith : trip.participants,
      date: new Date().toISOString().split('T')[0],
    });

    setExpenseTitle('');
    setExpenseAmount('');
    setIsAddingExpense(false);
  };

  // Expense Calculations
  const totalTripCents = expenses.reduce((sum, e) => sum + e.amountCents, 0);
  const totalTripReais = (totalTripCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  // Calculate balances per participant
  const balances: Record<string, { paid: number; shouldPay: number; net: number }> = {};
  trip.participants.forEach(p => {
    balances[p] = { paid: 0, shouldPay: 0, net: 0 };
  });

  expenses.forEach(exp => {
    // Credit payer
    if (balances[exp.paidBy]) {
      balances[exp.paidBy].paid += exp.amountCents;
    }
    // Debit splitters
    const splitCount = exp.splitWith.length || trip.participants.length;
    const shareCents = exp.amountCents / splitCount;
    exp.splitWith.forEach(p => {
      if (balances[p]) {
        balances[p].shouldPay += shareCents;
      }
    });
  });

  Object.keys(balances).forEach(p => {
    balances[p].net = balances[p].paid - balances[p].shouldPay;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner & SubTab switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Central de Anotações & Finanças da Viagem
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Informações Úteis & Divisão de Gastos 📝
          </h2>
        </div>

        {/* SubTab Pills */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveSubTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'notes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Anotações & Dicas ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'expenses'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Divisão de Gastos ({expenses.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: NOTES & CHECKLISTS */}
      {activeSubTab === 'notes' && (
        <div className="space-y-6">
          
          {/* Note Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs w-full sm:w-auto">
              {[
                { id: 'all', label: 'Todas as Notas' },
                { id: 'seguranca', label: '🛡️ Segurança' },
                { id: 'transporte', label: '🚇 Transporte' },
                { id: 'checklist', label: '🎒 Checklist' },
                { id: 'dica_geral', label: '💡 Dicas Gerais' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedNoteCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                    selectedNoteCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAddingNote(true)}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Anotação</span>
            </button>
          </div>

          {/* Add Note Modal - Fixed Sticky Footer for Mobile & Desktop */}
          {isAddingNote && (
            <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
              <div className="bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl w-full max-w-xl h-[88dvh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                
                {/* Pinned Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-400" />
                    Criar Nova Anotação para o Grupo
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Form Body */}
                <form
                  id="add-note-form"
                  onSubmit={handleCreateNote}
                  className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Título da Nota *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Reserva do restaurante, Itens para levar..."
                        value={noteTitle}
                        onChange={e => setNoteTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Categoria</label>
                      <select
                        value={noteCategory}
                        onChange={e => setNoteCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 capitalize"
                      >
                        <option value="dica_geral">💡 Dica Geral</option>
                        <option value="seguranca">🛡️ Segurança em SP</option>
                        <option value="transporte">🚇 Transporte</option>
                        <option value="checklist">🎒 Checklist / O que levar</option>
                        <option value="documentos">📄 Documentos & Ingressos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Conteúdo da Anotação *</label>
                      <textarea
                        rows={5}
                        required
                        placeholder="Escreva detalhes, links, dicas, lembretes..."
                        value={noteContent}
                        onChange={e => setNoteContent(e.target.value)}
                        className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </form>

                {/* Pinned Sticky Footer */}
                <div className="px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-900 shrink-0 flex items-center justify-end gap-3 pb-safe">
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    form="add-note-form"
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    Salvar Anotação
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Notes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-3 relative group hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {note.category.replace('_', ' ')}
                    </span>

                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-slate-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Excluir nota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{note.title}</h3>

                  <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {note.content}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Anotado por <strong className="text-slate-400">{note.author}</strong></span>
                  <span>{new Date(note.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: EXPENSES & SPLITTING */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-6">
          
          {/* Expenses Dashboard Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Gasto Total da Viagem</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono">{totalTripReais}</p>
              <p className="text-[11px] text-slate-400 mt-1">{expenses.length} despesas registradas</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Média por Pessoa</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono">
                {trip.participants.length > 0
                  ? ((totalTripCents / trip.participants.length) / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })
                  : 'R$ 0,00'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Dividido igualmente entre {trip.participants.length} pessoas</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Registrar Novo Gasto</span>
                <p className="text-xs text-slate-300 mt-1">Alimentação, Uber, ingressos...</p>
              </div>
              <button
                onClick={() => setIsAddingExpense(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Add Expense Modal - Fixed Sticky Footer for Mobile & Desktop */}
          {isAddingExpense && (
            <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
              <div className="bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl w-full max-w-xl h-[88dvh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                
                {/* Pinned Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    Novo Gasto em Grupo
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingExpense(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Form Body */}
                <form
                  id="add-expense-form"
                  onSubmit={handleCreateExpense}
                  className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">Descrição do Gasto *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Jantar na cantina do Bixiga, Uber para o MASP..."
                        value={expenseTitle}
                        onChange={e => setExpenseTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Valor (R$) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 140,00"
                        value={expenseAmount}
                        onChange={e => setExpenseAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Quem Pagou?</label>
                      <select
                        value={expensePaidBy}
                        onChange={e => setExpensePaidBy(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {trip.participants.map(p => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Categoria</label>
                      <select
                        value={expenseCategory}
                        onChange={e => setExpenseCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 capitalize"
                      >
                        <option value="alimentacao">🍜 Alimentação</option>
                        <option value="transporte">🚗 Transporte / Uber</option>
                        <option value="passeios">🎟️ Passeios & Ingressos</option>
                        <option value="hospedagem">🏨 Hospedagem</option>
                        <option value="compras">🛍️ Compras</option>
                        <option value="outros">📦 Outros</option>
                      </select>
                    </div>
                  </div>
                </form>

                {/* Pinned Sticky Footer */}
                <div className="px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-900 shrink-0 flex items-center justify-end gap-3 pb-safe">
                  <button
                    type="button"
                    onClick={() => setIsAddingExpense(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    form="add-expense-form"
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    Salvar Gasto
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Balances & Settlement Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Balanço Individual & Quem Deve Para Quem
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {trip.participants.map(name => {
                const b = balances[name] || { paid: 0, shouldPay: 0, net: 0 };
                const isPositive = b.net > 0;
                const isZero = Math.abs(b.net) < 1;

                return (
                  <div key={name} className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-xs">{name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isZero
                            ? 'bg-slate-800 text-slate-400'
                            : isPositive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isZero ? 'Quitado' : isPositive ? 'Tem a receber' : 'Deve pagar'}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Pagou:</span>
                        <span className="font-mono text-slate-200">
                          {(b.paid / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parte dele(a):</span>
                        <span className="font-mono text-slate-200">
                          {(b.shouldPay / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-400">Saldo:</span>
                      <span
                        className={`font-mono ${
                          isPositive ? 'text-emerald-400' : isZero ? 'text-slate-400' : 'text-rose-400'
                        }`}
                      >
                        {(b.net / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Histórico de Despesas Lançadas
              </h4>
            </div>

            <div className="divide-y divide-slate-800">
              {expenses.map(exp => (
                <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{exp.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold capitalize shrink-0">
                        {exp.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Pago por <strong className="text-slate-200">{exp.paidBy}</strong> • Dividido com {exp.splitWith.join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-sm font-extrabold text-white font-mono">
                      {(exp.amountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Excluir despesa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
