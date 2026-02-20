import React from 'react';
import { Member } from '../types';
import { Check, Shield, Trash2, Pencil } from 'lucide-react';

interface MemberCardProps {
  member: Member;
  isJustified: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (member: Member) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, isJustified, onToggle, onDelete, onEdit }) => {
  const isPermanent = member.isPermanent;

  // Visual state logic
  const activeClass = isJustified || isPermanent
    ? "border-lodge-gold bg-lodge-800/80 shadow-[0_4px_12px_rgba(212,175,55,0.1)]" 
    : "border-lodge-700 bg-lodge-900/50 hover:border-lodge-600 active:bg-lodge-800/40";

  const textClass = isJustified || isPermanent ? "text-lodge-goldLight" : "text-slate-400";

  return (
    <div 
      className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none group ${activeClass}`}
      onClick={() => !isPermanent && onToggle(member.id)}
    >
      <div className="flex items-center gap-3 overflow-hidden pr-2">
        <div className={`
          flex items-center justify-center w-10 h-10 rounded-full border transition-all shrink-0
          ${(isJustified || isPermanent) ? 'bg-lodge-gold text-lodge-900 border-lodge-gold scale-105' : 'border-lodge-700 bg-transparent text-transparent'}
        `}>
          {isPermanent ? <Shield size={18} /> : <Check size={20} />}
        </div>
        
        <div className="flex flex-col min-w-0">
          <span className={`font-serif text-base md:text-lg font-medium truncate ${textClass}`}>
            {member.name}
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            {isPermanent ? 'Giustificato Fisso' : member.role || 'Fratello'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(member);
          }}
          className="p-3 text-slate-500 active:text-white active:bg-lodge-700 rounded-full transition-colors"
          aria-label="Modifica fratello"
        >
          <Pencil size={18} />
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if(window.confirm(`Rimuovere ${member.name} dalla lista?`)) {
              onDelete(member.id);
            }
          }}
          className="p-3 text-slate-600 active:text-red-500 active:bg-lodge-700 rounded-full transition-colors"
          aria-label="Rimuovi fratello"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};