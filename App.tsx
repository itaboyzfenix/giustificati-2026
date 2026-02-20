import React, { useState, useEffect, useMemo } from 'react';
import { Member, AttendanceRecord, DayData } from './types';
import { INITIAL_MEMBERS, STORAGE_KEY } from './constants';
import { MemberCard } from './components/MemberCard';
import { Modal } from './components/Modal';
import { AIReportModal } from './components/AIReportModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Plus, 
  UserPlus, 
  ScrollText, 
  Share2,
  Users,
  Shield,
  Check,
  HeartPulse,
  BookOpen,
  X,
  UserCheck
} from 'lucide-react';

const App: React.FC = () => {
  // State
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Modals
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  // Member Form State
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('Maestro');
  const [memberPermanent, setMemberPermanent] = useState(false);

  // Sick Brethren Input State
  const [newSickName, setNewSickName] = useState('');

  // Initialize
  useEffect(() => {
    const init = () => {
      try {
        let stored = localStorage.getItem(STORAGE_KEY);
        
        // Migrazione: se la v2 è vuota, prova a recuperare dalla v1
        if (!stored) {
          const oldData = localStorage.getItem('lodgekeeper_data');
          if (oldData) stored = oldData;
        }

        if (stored) {
          const parsed = JSON.parse(stored);
          // Se la lista caricata è vuota, ripristina i membri iniziali
          const loadedMembers = (parsed.members && Array.isArray(parsed.members) && parsed.members.length > 0) 
            ? parsed.members 
            : INITIAL_MEMBERS;
          
          setMembers(loadedMembers);
          setAttendance(parsed.attendance || {});
        } else {
          setMembers(INITIAL_MEMBERS);
        }
      } catch (e) {
        console.error("Storage error:", e);
        setMembers(INITIAL_MEMBERS);
      }
      
      const today = new Date();
      if (today.getDay() !== 5) {
        const daysUntilFriday = (5 - today.getDay() + 7) % 7;
        const nextFri = new Date(today);
        nextFri.setDate(today.getDate() + daysUntilFriday);
        setCurrentDate(nextFri);
      }
      setIsInitialized(true);
    };

    init();
  }, []);

  // Save on change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ members, attendance }));
      } catch (e) {
        console.error("Save error:", e);
      }
    }
  }, [members, attendance, isInitialized]);

  // Date Logic
  const dateKey = currentDate.toISOString().split('T')[0];
  
  const formattedDate = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(currentDate);

  // Helper to get current day data
  const currentDayData: DayData = useMemo(() => {
    return attendance[dateKey] || { justifiedIds: [], sickBrethren: [], program: '' };
  }, [attendance, dateKey]);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const jumpToNextFriday = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + ((7 - newDate.getDay() + 5) % 7 || 7));
    setCurrentDate(newDate);
  };

  // Logic
  const updateDayData = (newData: Partial<DayData>) => {
    setAttendance(prev => ({
      ...prev,
      [dateKey]: { ...currentDayData, ...newData }
    }));
  };

  const toggleJustification = (id: string) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    const currentList = currentDayData.justifiedIds;
    const isJustified = currentList.includes(id);
    const newList = isJustified ? currentList.filter(mId => mId !== id) : [...currentList, id];
    updateDayData({ justifiedIds: newList });
  };

  const addSickBrethren = () => {
    if (!newSickName.trim()) return;
    updateDayData({ 
      sickBrethren: [...currentDayData.sickBrethren, newSickName.trim()] 
    });
    setNewSickName('');
  };

  const removeSickBrethren = (index: number) => {
    const newList = [...currentDayData.sickBrethren];
    newList.splice(index, 1);
    updateDayData({ sickBrethren: newList });
  };

  const setProgram = (program: string) => {
    updateDayData({ program });
  };

  const openAddModal = () => {
    setEditingMemberId(null);
    setMemberName('');
    setMemberRole('Maestro');
    setMemberPermanent(false);
    setIsMemberModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMemberId(member.id);
    setMemberName(member.name);
    setMemberRole(member.role || 'Maestro');
    setMemberPermanent(member.isPermanent);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = () => {
    if (!memberName.trim()) return;
    if (editingMemberId) {
      setMembers(prev => prev.map(m => m.id === editingMemberId ? {
        ...m,
        name: memberName.trim(),
        role: memberRole,
        isPermanent: memberPermanent
      } : m));
    } else {
      const newMember: Member = {
        id: Date.now().toString(),
        name: memberName.trim(),
        isPermanent: memberPermanent,
        role: memberRole
      };
      setMembers(prev => [...prev, newMember]);
    }
    setIsMemberModalOpen(false);
    setEditingMemberId(null);
  };

  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const resetToInitial = () => {
    if (window.confirm("Vuoi ripristinare la lista originale dei fratelli? I dati attuali verranno sovrascritti.")) {
      setMembers(INITIAL_MEMBERS);
      setAttendance({});
      alert("Lista ripristinata!");
    }
  };

  // Derived
  const permanentMembers = useMemo(() => members.filter(m => m.isPermanent), [members]);
  const activeMembers = useMemo(() => 
    members.filter(m => !m.isPermanent).sort((a, b) => a.name.localeCompare(b.name)), 
  [members]);

  const justifiedNames = useMemo(() => {
    return members
      .filter(m => currentDayData.justifiedIds.includes(m.id))
      .map(m => m.name);
  }, [members, currentDayData.justifiedIds]);

  const permanentNames = useMemo(() => permanentMembers.map(m => m.name), [permanentMembers]);
  const totalJustified = permanentMembers.length + currentDayData.justifiedIds.length;
  const totalPresent = members.length - totalJustified;

  const copySimpleList = () => {
    const lines = [
      `🏛️ *R.L. Giorgio Asproni 1055*`,
      `📅 *${formattedDate}*`,
      '',
      `✅ *Fratelli Presenti: ${totalPresent}*`,
      `❌ *Assenze Totali: ${totalJustified}*`,
      '',
      '🛡️ *Giustificati Fissi:*',
      ...permanentNames.map(n => `- ${n}`),
      '',
      '✍️ *Odierni:*',
      ...(justifiedNames.length ? justifiedNames.map(n => `- ${n}`) : ['Nessuno']),
      '',
      `💊 *Fratelli Infermi (Ospitaliere):*`,
      ...(currentDayData.sickBrethren.length ? currentDayData.sickBrethren.map(n => `- ${n}`) : ['Nessuno segnalato']),
      '',
      `📖 *Programma:*`,
      currentDayData.program || 'Lavori di routine',
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    alert('Dati copiati negli appunti!');
  };

  return (
    <div className="min-h-screen bg-lodge-900 text-slate-200 pb-20 font-sans selection:bg-lodge-gold selection:text-lodge-900 flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-lodge-900/95 backdrop-blur-md border-b border-lodge-800 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-lodge-gold rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-lodge-900 w-6 h-6 md:w-7 md:h-7">
                  <path d="M3 21l9-15 9 15" />
                  <path d="M7 21h10" />
                  <path d="M12 6v15" />
               </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base md:text-xl font-serif font-bold text-lodge-gold tracking-wide leading-tight">R.L. Giorgio Asproni <span className="text-slate-100">n. 1055</span></h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-medium">Oriente di Cagliari</span>
                <span className="text-[8px] text-slate-600">v2.1</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
               onClick={resetToInitial}
               className="bg-lodge-800 active:bg-lodge-700 text-slate-500 p-2.5 rounded-lg border border-lodge-700 transition-colors"
               title="Ripristina lista originale"
            >
              <Users size={20} />
            </button>
            <button 
               onClick={() => setIsAIModalOpen(true)}
               className="bg-lodge-800 active:bg-lodge-700 text-lodge-gold p-2.5 rounded-lg border border-lodge-700 transition-colors"
               aria-label="Genera Verbale AI"
            >
              <ScrollText size={20} />
            </button>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between border-t border-lodge-800/50">
          <button onClick={() => changeDate(-7)} className="p-3 active:bg-lodge-800 rounded-full text-slate-400">
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform" onClick={jumpToNextFriday}>
            <span className="text-[10px] text-lodge-gold uppercase tracking-widest font-bold mb-0.5">Tornata del</span>
            <div className="flex items-center gap-2 text-white font-serif text-base md:text-xl capitalize text-center leading-none">
              <Calendar size={14} className="text-slate-500 hidden sm:block" />
              {formattedDate}
            </div>
          </div>

          <button onClick={() => changeDate(7)} className="p-3 active:bg-lodge-800 rounded-full text-slate-400">
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-8 w-full flex-grow">
        
        {/* Daily Program Section */}
        <section className="bg-lodge-800/40 p-5 rounded-2xl border border-lodge-700/50">
           <h3 className="text-lodge-gold text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <BookOpen size={14} /> Programma dei Lavori
            </h3>
            <textarea 
              value={currentDayData.program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="Inserisci l'ordine del giorno o il programma della tornata..."
              className="w-full bg-lodge-900/50 border border-lodge-700/50 rounded-xl p-4 text-slate-200 text-sm focus:outline-none focus:border-lodge-gold transition-colors min-h-[100px] resize-none"
            />
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-lodge-800 to-lodge-900 p-4 rounded-xl border border-lodge-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <UserCheck size={50} />
            </div>
            <p className="text-lodge-gold text-[10px] font-bold uppercase tracking-wider">Presenti</p>
            <p className="text-3xl font-serif text-white mt-1">{totalPresent}</p>
          </div>
          
          <div className="bg-gradient-to-br from-lodge-800 to-lodge-900 p-4 rounded-xl border border-lodge-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Users size={50} />
            </div>
            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Assenti</p>
            <p className="text-3xl font-serif text-white mt-1">{totalJustified}</p>
          </div>

          <div 
            onClick={copySimpleList}
            className="col-span-2 md:col-span-1 bg-lodge-800 p-4 rounded-xl border border-lodge-700 flex items-center justify-center flex-col cursor-pointer active:bg-lodge-700 active:border-lodge-gold transition-all group"
          >
            <Share2 className="text-lodge-gold mb-1 group-active:scale-110 transition-transform" size={24} />
            <span className="text-xs font-bold text-lodge-gold uppercase tracking-widest">Copia Dati</span>
          </div>
        </div>

        {/* Hospitaler Section (Sick Brethren) */}
        <section className="bg-red-900/10 p-5 rounded-2xl border border-red-900/30">
           <h3 className="text-red-400 text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <HeartPulse size={14} /> Rapporto dell'Ospitaliere (Fratelli Infermi)
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newSickName}
                  onChange={(e) => setNewSickName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSickBrethren()}
                  placeholder="Nome del Fratello ammalato..."
                  className="flex-grow bg-lodge-900/50 border border-lodge-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                />
                <button 
                  onClick={addSickBrethren}
                  className="bg-red-900/40 text-red-200 px-4 py-2 rounded-lg text-sm font-bold border border-red-900/30 active:bg-red-900/60"
                >
                  Segnala
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentDayData.sickBrethren.map((name, idx) => (
                  <div key={idx} className="bg-red-900/20 text-red-200 px-3 py-1.5 rounded-full text-xs border border-red-900/30 flex items-center gap-2">
                    {name}
                    <button onClick={() => removeSickBrethren(idx)} className="text-red-400 hover:text-white">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {currentDayData.sickBrethren.length === 0 && (
                   <span className="text-[11px] text-slate-600 italic">Nessun fratello segnalato come infermo oggi.</span>
                )}
              </div>
            </div>
        </section>

        {/* Permanent List */}
        {permanentMembers.length > 0 && (
          <section>
            <h3 className="text-lodge-gold text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Shield size={12} /> Giustificati Fissi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {permanentMembers.map(member => (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  isJustified={true} 
                  onToggle={() => {}} 
                  onDelete={deleteMember}
                  onEdit={openEditModal}
                />
              ))}
            </div>
          </section>
        )}

        {/* Active List */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Users size={12} /> Tavola dei Giustificati (Odierni)
            </h3>
            <button 
              onClick={openAddModal}
              className="text-[10px] flex items-center gap-1 text-lodge-gold active:text-white transition-colors uppercase font-bold tracking-widest"
            >
              <Plus size={14} /> Aggiungi Fratello
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeMembers.map(member => (
              <MemberCard 
                key={member.id} 
                member={member} 
                isJustified={currentDayData.justifiedIds.includes(member.id)} 
                onToggle={toggleJustification} 
                onDelete={deleteMember}
                onEdit={openEditModal}
              />
            ))}
            
            {activeMembers.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-lodge-700 rounded-lg text-slate-500">
                Nessun fratello attivo in lista. <br/>
                <button onClick={openAddModal} className="text-lodge-gold active:underline mt-2 font-medium">Aggiungine uno</button>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Floating Action Button (Mobile) for Add */}
      <div className="fixed right-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] md:hidden z-30">
        <button 
          onClick={openAddModal}
          className="w-14 h-14 bg-lodge-gold text-lodge-900 rounded-full shadow-2xl shadow-amber-500/40 flex items-center justify-center active:scale-95 active:bg-yellow-500 transition-all"
        >
          <UserPlus size={24} />
        </button>
      </div>

      {/* Modal Add/Edit Member */}
      <Modal 
        isOpen={isMemberModalOpen} 
        onClose={() => setIsMemberModalOpen(false)} 
        title={editingMemberId ? "Modifica Fratello" : "Aggiungi Fratello"}
      >
        <div className="space-y-4 pb-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nome e Cognome</label>
            <input 
              type="text" 
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Es. Mario Rossi"
              className="w-full bg-lodge-800 border border-lodge-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-lodge-gold/50 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Grado</label>
            <select 
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className="w-full bg-lodge-800 border border-lodge-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-lodge-gold/50 appearance-none transition-all"
            >
              <option value="Apprendista">Apprendista (1)</option>
              <option value="Compagno">Compagno (2)</option>
              <option value="Maestro">Maestro (3)</option>
            </select>
          </div>
          
          <label className="flex items-center gap-3 p-4 border border-lodge-700 rounded-lg cursor-pointer active:bg-lodge-800 transition-colors">
            <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${memberPermanent ? 'bg-lodge-gold border-lodge-gold' : 'border-slate-500'}`}>
              {memberPermanent && <Check size={16} className="text-lodge-900" />}
            </div>
            <input 
              type="checkbox" 
              checked={memberPermanent} 
              onChange={(e) => setMemberPermanent(e.target.checked)} 
              className="hidden"
            />
            <div>
              <span className="block text-slate-100 font-medium">Giustificato Fisso</span>
              <span className="block text-[10px] text-slate-500 uppercase tracking-tight">Assenza permanente automatica</span>
            </div>
          </label>

          <button 
            onClick={handleSaveMember}
            disabled={!memberName.trim()}
            className="w-full bg-lodge-gold text-lodge-900 font-bold py-4 rounded-xl active:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/10"
          >
            {editingMemberId ? "Salva Modifiche" : "Aggiungi Fratello"}
          </button>
        </div>
      </Modal>

      <AIReportModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)}
        dateStr={formattedDate}
        justifiedNames={justifiedNames}
        permanentNames={permanentNames}
        sickBrethren={currentDayData.sickBrethren}
        program={currentDayData.program}
        totalPresent={totalPresent}
      />

    </div>
  );
};

export default App;