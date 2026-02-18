import React, { useState, useEffect, useMemo } from 'react';
import { Member, AttendanceRecord } from './types';
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
  Check
} from 'lucide-react';

const App: React.FC = () => {
  // State
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Modals
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  // Member Form State
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('Maestro');
  const [memberPermanent, setMemberPermanent] = useState(false);

  // Initialize
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setMembers(parsed.members || INITIAL_MEMBERS);
      setAttendance(parsed.attendance || {});
    } else {
      setMembers(INITIAL_MEMBERS);
    }
    
    // Set initial date to next Friday if today isn't Friday
    const today = new Date();
    if (today.getDay() !== 5) {
      const day = today.getDay();
      // Logic: if today is 0 (Sun) -> need +5. If 6 (Sat) -> need +6. If 1 (Mon) -> +4.
      const daysUntilFriday = (5 - today.getDay() + 7) % 7;
      const nextFri = new Date(today);
      nextFri.setDate(today.getDate() + daysUntilFriday);
      setCurrentDate(nextFri);
    }
  }, []);

  // Save on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ members, attendance }));
  }, [members, attendance]);

  // Date Logic
  const dateKey = currentDate.toISOString().split('T')[0];
  
  const formattedDate = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(currentDate);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const jumpToNextFriday = () => {
    const newDate = new Date(currentDate);
    // Find next friday
    newDate.setDate(newDate.getDate() + ((7 - newDate.getDay() + 5) % 7 || 7));
    setCurrentDate(newDate);
  };

  // Logic
  const toggleJustification = (id: string) => {
    setAttendance(prev => {
      const currentList = prev[dateKey] || [];
      const isJustified = currentList.includes(id);
      
      let newList;
      if (isJustified) {
        newList = currentList.filter(mId => mId !== id);
      } else {
        newList = [...currentList, id];
      }
      
      return { ...prev, [dateKey]: newList };
    });
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
      // Edit existing
      setMembers(prev => prev.map(m => m.id === editingMemberId ? {
        ...m,
        name: memberName.trim(),
        role: memberRole,
        isPermanent: memberPermanent
      } : m));
    } else {
      // Add new
      const newMember: Member = {
        id: Date.now().toString(),
        name: memberName.trim(),
        isPermanent: memberPermanent,
        role: memberRole
      };
      setMembers(prev => [...prev, newMember]);
    }

    setIsMemberModalOpen(false);
    // Reset form
    setMemberName('');
    setMemberRole('Maestro');
    setMemberPermanent(false);
    setEditingMemberId(null);
  };

  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  // Derived State
  const justifiedIds = attendance[dateKey] || [];
  
  const permanentMembers = useMemo(() => members.filter(m => m.isPermanent), [members]);
  // Sort active members alphabetically
  const activeMembers = useMemo(() => 
    members
      .filter(m => !m.isPermanent)
      .sort((a, b) => a.name.localeCompare(b.name)), 
  [members]);

  const justifiedNames = useMemo(() => {
    return members
      .filter(m => justifiedIds.includes(m.id))
      .map(m => m.name);
  }, [members, justifiedIds]);

  const permanentNames = useMemo(() => permanentMembers.map(m => m.name), [permanentMembers]);

  const totalJustified = permanentMembers.length + justifiedIds.length;

  const copySimpleList = () => {
    const lines = [
      `🏛️ *Tavola Giustificati - ${formattedDate}*`,
      '',
      '🛡️ *Fissi:*',
      ...permanentNames.map(n => `- ${n}`),
      '',
      '✍️ *Odierni:*',
      ...(justifiedNames.length ? justifiedNames.map(n => `- ${n}`) : ['Nessuno']),
      '',
      `Totale: ${totalJustified}`
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    alert('Lista semplice copiata!');
  };

  return (
    <div className="min-h-screen bg-lodge-900 text-slate-200 pb-20 font-sans selection:bg-lodge-gold selection:text-lodge-900">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-lodge-900/95 backdrop-blur-md border-b border-lodge-800 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-lodge-gold rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
               {/* Compass/Square generic symbol simplified */}
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-lodge-900 w-7 h-7">
                  <path d="M3 21l9-15 9 15" />
                  <path d="M7 21h10" />
                  <path d="M12 6v15" />
               </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-serif font-bold text-lodge-gold tracking-wide leading-tight">R.L. Giorgio Asproni <span className="text-slate-100">n. 1055</span></h1>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-medium">Oriente di Cagliari</span>
            </div>
          </div>
          <button 
             onClick={() => setIsAIModalOpen(true)}
             className="bg-lodge-800 hover:bg-lodge-700 text-lodge-gold p-2 rounded-lg border border-lodge-700 transition-colors"
             aria-label="Genera Verbale AI"
          >
            <ScrollText size={20} />
          </button>
        </div>

        {/* Date Navigator */}
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between border-t border-lodge-800/50">
          <button onClick={() => changeDate(-7)} className="p-2 hover:bg-lodge-800 rounded-full text-slate-400">
            <ChevronLeft />
          </button>
          
          <div className="flex flex-col items-center cursor-pointer" onClick={jumpToNextFriday}>
            <span className="text-xs text-lodge-gold uppercase tracking-widest font-bold mb-1">Tornata del</span>
            <div className="flex items-center gap-2 text-white font-serif text-lg md:text-xl capitalize text-center leading-none">
              <Calendar size={16} className="text-slate-500 hidden sm:block" />
              {formattedDate}
            </div>
          </div>

          <button onClick={() => changeDate(7)} className="p-2 hover:bg-lodge-800 rounded-full text-slate-400">
            <ChevronRight />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-8">
        
        {/* Stats Card */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-lodge-800 to-lodge-900 p-4 rounded-xl border border-lodge-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Users size={60} />
            </div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Totale Giustificati</p>
            <p className="text-4xl font-serif text-white mt-1">{totalJustified}</p>
          </div>
          <div 
            onClick={copySimpleList}
            className="bg-lodge-800 p-4 rounded-xl border border-lodge-700 flex items-center justify-center flex-col cursor-pointer hover:bg-lodge-700 hover:border-lodge-gold transition-all group"
          >
            <Share2 className="text-lodge-gold mb-2 group-hover:scale-110 transition-transform" size={24} />
            <span className="text-sm font-medium text-slate-300">Copia Lista</span>
          </div>
        </div>

        {/* Permanent List */}
        {permanentMembers.length > 0 && (
          <section>
            <h3 className="text-lodge-gold text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield size={14} /> Giustificati Fissi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {permanentMembers.map(member => (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  isJustified={true} // Always visually justified
                  onToggle={() => {}} // No toggle for permanent here
                  onDelete={deleteMember}
                  onEdit={openEditModal}
                />
              ))}
            </div>
          </section>
        )}

        {/* Active List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Users size={14} /> Lista Fratelli
            </h3>
            <button 
              onClick={openAddModal}
              className="text-xs flex items-center gap-1 text-lodge-gold hover:text-white transition-colors uppercase font-bold tracking-wider"
            >
              <Plus size={14} /> Aggiungi
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeMembers.map(member => (
              <MemberCard 
                key={member.id} 
                member={member} 
                isJustified={justifiedIds.includes(member.id)} 
                onToggle={toggleJustification} 
                onDelete={deleteMember}
                onEdit={openEditModal}
              />
            ))}
            
            {activeMembers.length === 0 && (
              <div className="col-span-full py-8 text-center border border-dashed border-lodge-700 rounded-lg text-slate-500">
                Nessun fratello attivo in lista. <br/>
                <button onClick={openAddModal} className="text-lodge-gold hover:underline mt-2">Aggiungine uno</button>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Floating Action Button (Mobile) for Add */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button 
          onClick={openAddModal}
          className="w-14 h-14 bg-lodge-gold text-lodge-900 rounded-full shadow-xl shadow-amber-500/20 flex items-center justify-center hover:scale-105 transition-transform"
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nome e Cognome</label>
            <input 
              type="text" 
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Es. Mario Rossi"
              className="w-full bg-lodge-900 border border-lodge-700 rounded p-3 text-white focus:outline-none focus:border-lodge-gold"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Grado</label>
            <select 
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className="w-full bg-lodge-900 border border-lodge-700 rounded p-3 text-white focus:outline-none focus:border-lodge-gold"
            >
              <option value="Apprendista">Apprendista (1)</option>
              <option value="Compagno">Compagno (2)</option>
              <option value="Maestro">Maestro (3)</option>
            </select>
          </div>
          
          <label className="flex items-center gap-3 p-3 border border-lodge-700 rounded cursor-pointer hover:bg-lodge-800 transition-colors">
            <div className={`w-5 h-5 rounded border flex items-center justify-center ${memberPermanent ? 'bg-lodge-gold border-lodge-gold' : 'border-slate-500'}`}>
              {memberPermanent && <Check size={14} className="text-lodge-900" />}
            </div>
            <input 
              type="checkbox" 
              checked={memberPermanent} 
              onChange={(e) => setMemberPermanent(e.target.checked)} 
              className="hidden"
            />
            <div>
              <span className="block text-slate-200">Giustificato Fisso</span>
              <span className="block text-xs text-slate-500">Sarà sempre segnato come assente</span>
            </div>
          </label>

          <button 
            onClick={handleSaveMember}
            disabled={!memberName.trim()}
            className="w-full bg-lodge-gold text-lodge-900 font-bold py-3 rounded hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingMemberId ? "Salva Modifiche" : "Aggiungi alla Lista"}
          </button>
        </div>
      </Modal>

      <AIReportModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)}
        dateStr={formattedDate}
        justifiedNames={justifiedNames}
        permanentNames={permanentNames}
      />

    </div>
  );
};

export default App;