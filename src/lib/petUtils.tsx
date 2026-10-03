import React from 'react';
import { Cat, Dog, Fish, Rabbit, Bird, PiggyBank, Turtle, PawPrint } from 'lucide-react';

export const getPetBackgroundStyle = (species: string): React.CSSProperties => {
  const s = (species || '').toLowerCase();
  
  if (s === 'gato') {
    // Arranhado (scratches)
    return {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 30 L20 10 M15 32 L25 12 M20 34 L30 14' stroke='rgba(255,255,255,0.05)' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
      backgroundSize: '40px 40px'
    };
  }
  if (s === 'cachorro') {
    // Patinhas (paws)
    return {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='14' cy='14' r='3' fill='rgba(255,255,255,0.05)'/%3E%3Ccircle cx='20' cy='10' r='3' fill='rgba(255,255,255,0.05)'/%3E%3Ccircle cx='26' cy='14' r='3' fill='rgba(255,255,255,0.05)'/%3E%3Cpath d='M16 20 Q20 16 24 20 Q28 26 20 28 Q12 26 16 20' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E")`,
      backgroundSize: '40px 40px'
    };
  }
  if (s === 'peixe') {
    // Bolhas (bubbles)
    return {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='30' r='4' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1'/%3E%3Ccircle cx='25' cy='15' r='6' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1'/%3E%3Ccircle cx='35' cy='35' r='2' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1'/%3E%3C/svg%3E")`,
      backgroundSize: '40px 40px'
    };
  }
  if (s === 'pássaro') {
    // Penas (feathers)
    return {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 20 Q20 10 30 20 Q20 30 10 20 M20 15 L20 25' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'/%3E%3C/svg%3E")`,
      backgroundSize: '40px 40px'
    };
  }
  
  return {};
};

export const getPetContainerClasses = (species: string): string => {
  const s = (species || '').toLowerCase();
  let classes = "";
  if (s === 'gato') classes = 'bg-orange-500/10 border-orange-500/30 rounded-xl relative overflow-hidden';
  else if (s === 'cachorro') classes = 'bg-blue-500/10 border-blue-500/30 rounded-2xl relative overflow-hidden';
  else if (s === 'peixe') classes = 'bg-cyan-500/10 border-cyan-500/30 rounded-3xl relative overflow-hidden';
  else if (s === 'roedor') classes = 'bg-amber-500/10 border-amber-500/40 border-dashed rounded-lg relative overflow-hidden'; // Roído
  else if (s === 'pássaro') classes = 'bg-sky-500/10 border-sky-500/30 rounded-t-full relative overflow-hidden';
  else if (s === 'porco') classes = 'bg-pink-500/10 border-pink-500/30 rounded-3xl relative overflow-hidden';
  else if (s === 'réptil') classes = 'bg-emerald-800/20 border-emerald-500/30 rounded-none border-b-4 border-r-4 relative overflow-hidden';
  else classes = 'bg-zinc-500/10 border-zinc-500/30 rounded-lg relative overflow-hidden';
  
  return classes;
};

export const PetIcon = ({ species, className = "w-4 h-4" }: { species: string, className?: string }) => {
  const s = (species || '').toLowerCase();
  switch (s) {
    case 'gato': return <Cat className={className} />;
    case 'cachorro': return <Dog className={className} />;
    case 'peixe': return <Fish className={className} />;
    case 'roedor': return <Rabbit className={className} />;
    case 'pássaro': return <Bird className={className} />;
    case 'porco': return <PiggyBank className={className} />;
    case 'réptil': return <Turtle className={className} />;
    default: return <PawPrint className={className} />;
  }
};
