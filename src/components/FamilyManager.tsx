import { DateInput } from './DateInput';
import { formatCurrency } from "../lib/format";
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useRef, useEffect } from 'react';
import { PersonName } from './PersonName';
import { Users, Trash2, Edit2, Check, X, Plus, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { showNotification, requestNotificationPermission } from '../lib/notifications';
import { Person, PixKey, Machine, Housing, Insurance } from '../types';
import { Monitor, Car, CreditCard, Home, Shield, Castle, Building } from 'lucide-react';
import { CardsManager } from './CardsManager';

export const getCalculatedDate = (dateStr: string, addDays = 0, addYears = 0) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  date.setUTCDate(date.getUTCDate() + addDays);
  date.setUTCFullYear(date.getUTCFullYear() + addYears);
  return date.toISOString().split('T')[0].split('-').reverse().join('/');
};

import { getPetContainerClasses, getPetBackgroundStyle, PetIcon } from '../lib/petUtils';

interface Props {
  people: Record<string, Person>;
  machines: Record<string, Machine>;
  cards: Record<string, any>;
  housings?: Record<string, Housing>;
  insurances?: Record<string, Insurance>;
  onAddInsurance?: (insurance: Insurance) => void;
  onUpdateInsurance?: (insurance: Insurance) => void;
  onDeleteInsurance?: (id: string) => void;
  onAddHousing?: (housing: Housing) => void;
  onUpdateHousing?: (housing: Housing) => void;
  onDeleteHousing?: (id: string) => void;
  onAddPerson: (person: Person) => void;
  onUpdatePerson: (person: Person) => void;
  onDeletePerson: (id: string) => void;
  onAddMachine: (machine: Machine) => void;
  onUpdateMachine: (machine: Machine) => void;
  onDeleteMachine: (id: string) => void;
  onAddCard: (card: any) => void;
  onUpdateCard: (card: any) => void;
  onDeleteCard: (id: string) => void;
}


const getBankColor = (bank: string) => {
  if (!bank) return 'text-white border-white/5 bg-[#050505]';
  const b = bank.toLowerCase();
  if (b.includes('nubank')) return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
  if (b.includes('itaú') || b.includes('itau')) return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
  if (b.includes('bradesco')) return 'text-red-500 border-red-500/30 bg-red-500/10';
  if (b.includes('santander')) return 'text-red-600 border-red-600/30 bg-red-600/10';
  if (b.includes('brasil')) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
  if (b.includes('caixa')) return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
  if (b.includes('inter')) return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
  if (b.includes('c6')) return 'text-zinc-300 border-zinc-500/30 bg-zinc-800';
  if (b.includes('mercado')) return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
  if (b.includes('picpay')) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  return 'text-white border-white/5 bg-[#050505]';
};

export const FamilyManager: React.FC<Props> = ({ people, machines, cards, onAddPerson, onUpdatePerson, onDeletePerson, onAddMachine, onUpdateMachine, onDeleteMachine, onAddCard, onUpdateCard, onDeleteCard, housings = {}, onAddHousing, onUpdateHousing, onDeleteHousing, insurances = {}, onAddInsurance, onUpdateInsurance, onDeleteInsurance }) => {
  const [subTab, setSubTab] = useState<'people' | 'machines' | 'cards' | 'housings' | 'insurances'>('people');

  useEffect(() => {
    if (!("Notification" in window)) return;
    
    const checkWarranties = async () => {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await requestNotificationPermission();
      }

      if (permission === "granted") {
        const lastNotified = localStorage.getItem('lastWarrantyNotification');
        const todayStr = new Date().toISOString().split('T')[0];
        if (lastNotified === todayStr) return;

        let notifiedSomething = false;

        Object.values(machines).forEach(v => {
          if (v.category === 'appliance' && v.purchaseDate) {
            const purchase = new Date(v.purchaseDate);
            if (isNaN(purchase.getTime())) return;
            
            // Loja: 90 days
            const lojaDate = new Date(purchase);
            lojaDate.setUTCDate(lojaDate.getUTCDate() + 90);
            if (lojaDate.toISOString().split('T')[0] === todayStr) {
              showNotification("Garantia Expirada", { body: `${v.name}: A Garantia da Loja acabou hoje.` });
              notifiedSomething = true;
            }

            // Fabrica: 1 year
            const fabricaDate = new Date(purchase);
            fabricaDate.setUTCFullYear(fabricaDate.getUTCFullYear() + 1);
            if (fabricaDate.toISOString().split('T')[0] === todayStr) {
              showNotification("Garantia Expirada", { body: `${v.name}: A Garantia de Fábrica acabou hoje.` });
              notifiedSomething = true;
            }

            // Estendida
            if (v.extendedWarranty && v.extendedWarrantyTime) {
              const months = parseInt(v.extendedWarrantyTime) || 0;
              const estendidaDate = new Date(purchase);
              estendidaDate.setUTCFullYear(estendidaDate.getUTCFullYear() + 1); // after factory
              estendidaDate.setUTCMonth(estendidaDate.getUTCMonth() + months);
              if (estendidaDate.toISOString().split('T')[0] === todayStr) {
                showNotification("Garantia Expirada", { body: `${v.name}: A Garantia Estendida (${v.extendedWarrantyTime}) acabou hoje.` });
                notifiedSomething = true;
              }
            }
          }
        });

        if (notifiedSomething) {
          localStorage.setItem('lastWarrantyNotification', todayStr);
        }
      }
    };

    checkWarranties();
  }, [machines]);

  
  
  const [isInsuranceFormOpen, setIsInsuranceFormOpen] = useState(false);
  const [editingInsuranceId, setEditingInsuranceId] = useState<string | null>(null);
  const [iInsuredName, setIInsuredName] = useState('');
  const [iBeneficiaries, setIBeneficiaries] = useState('');
  const [iCompany, setICompany] = useState('');
  const [iContact, setIContact] = useState('');
  const [iContractNumber, setIContractNumber] = useState('');
  const [iType, setIType] = useState('');
  
  const [editIInsuredName, setEditIInsuredName] = useState('');
  const [editIBeneficiaries, setEditIBeneficiaries] = useState('');
  const [editICompany, setEditICompany] = useState('');
  const [editIContact, setEditIContact] = useState('');
  const [editIContractNumber, setEditIContractNumber] = useState('');
  const [editIType, setEditIType] = useState('');

  const resetInsuranceForm = () => {
    setIInsuredName('');
    setIBeneficiaries('');
    setICompany('');
    setIContact('');
    setIContractNumber('');
    setIType('');
    setIsInsuranceFormOpen(false);
  };

  const handleAddInsurance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!iInsuredName || !iCompany || !iType) return;
    
    if (onAddInsurance) {
      onAddInsurance({
        id: uuidv4(),
        insuredName: iInsuredName,
        beneficiaries: iBeneficiaries,
        company: iCompany,
        contact: iContact,
        contractNumber: iContractNumber,
        type: iType
      });
    }
    resetInsuranceForm();
  };

  const startEditInsurance = (i: Insurance) => {
    setEditIInsuredName(i.insuredName);
    setEditIBeneficiaries(i.beneficiaries || '');
    setEditICompany(i.company);
    setEditIContact(i.contact || '');
    setEditIContractNumber(i.contractNumber || '');
    setEditIType(i.type);
    setEditingInsuranceId(i.id);
  };

  const saveEditInsurance = (i: Insurance) => {
    if (!editIInsuredName || !editICompany || !editIType) return;
    if (onUpdateInsurance) {
      onUpdateInsurance({
        ...i,
        insuredName: editIInsuredName,
        beneficiaries: editIBeneficiaries,
        company: editICompany,
        contact: editIContact,
        contractNumber: editIContractNumber,
        type: editIType
      });
    }
    setEditingInsuranceId(null);
  };

  // Machine state
  const [isMachineFormOpen, setIsMachineFormOpen] = useState(false);
  const [vCategory, setVCategory] = useState<'vehicle' | 'appliance'>('vehicle');
  const [vExtendedWarranty, setVExtendedWarranty] = useState(false);
  const [vExtendedWarrantyTime, setVExtendedWarrantyTime] = useState('');
  const [vName, setVName] = useState('');
  const [vMachineType, setVMachineType] = useState('');
  const [vPurchaseDate, setVPurchaseDate] = useState('');
  const [vWarranty, setVWarranty] = useState('');
  const [vBrand, setVBrand] = useState('');
  const [vColor, setVColor] = useState('');
  const [vModel, setVModel] = useState('');
  const [vPlate, setVPlate] = useState('');
  const [vIpva, setVIpva] = useState('');
  const [vIpvaExempt, setVIpvaExempt] = useState(false);
  const [vLicensing, setVLicensing] = useState('');
  
  
  // Housing state
  const [isHousingFormOpen, setIsHousingFormOpen] = useState(false);
  const [hName, setHName] = useState('');
  const [hAddress, setHAddress] = useState('');
  const [hCity, setHCity] = useState('');
  const [hNeighborhood, setHNeighborhood] = useState('');
  const [hComplement, setHComplement] = useState('');
  const [hZipCode, setHZipCode] = useState('');

  const [editingHousingId, setEditingHousingId] = useState<string | null>(null);
  const [editHName, setEditHName] = useState('');
  const [editHZipCode, setEditHZipCode] = useState('');
  const [editHAddress, setEditHAddress] = useState('');
  const [editHNeighborhood, setEditHNeighborhood] = useState('');
  const [editHCity, setEditHCity] = useState('');
  const [editHComplement, setEditHComplement] = useState('');


  const resetHousingForm = () => {
    setHName('');
    setHAddress('');
    setHCity('');
    setHNeighborhood('');
    setHComplement('');
    setHZipCode('');
    setIsHousingFormOpen(false);
    setEditingHousingId(null);
  };

  const handleAddHousing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hName || !hAddress || !hCity || !hNeighborhood || !hZipCode) return;
    
    if (editingHousingId && onUpdateHousing) {
      onUpdateHousing({
        id: editingHousingId,
        name: hName,
        address: hAddress,
        city: hCity,
        neighborhood: hNeighborhood,
        complement: hComplement,
        zipCode: hZipCode
      });
    } else if (onAddHousing) {
      onAddHousing({
        id: uuidv4(),
        name: hName,
        address: hAddress,
        city: hCity,
        neighborhood: hNeighborhood,
        complement: hComplement,
        zipCode: hZipCode
      });
    }
    resetHousingForm();
  };

  
  const saveEditHousing = (h: Housing) => {
    if (!editHName) return;
    if (onUpdateHousing) {
      onUpdateHousing({
        ...h,
        name: editHName,
        zipCode: editHZipCode,
        address: editHAddress,
        neighborhood: editHNeighborhood,
        city: editHCity,
        complement: editHComplement
      });
    }
    setEditingHousingId(null);
  };

  const startEditHousing = (h: Housing) => {
    setEditHName(h.name);
    setEditHZipCode(h.zipCode);
    setEditHAddress(h.address);
    setEditHNeighborhood(h.neighborhood);
    setEditHCity(h.city);
    setEditHComplement(h.complement || '');
    setEditingHousingId(h.id);
    // removed setIsHousingFormOpen
  };
  const oldStartEditHousing = (h: any) => {
    setEditingHousingId(h.id);
    setHName(h.name);
    setHAddress(h.address);
    setHCity(h.city);
    setHNeighborhood(h.neighborhood);
    setHComplement(h.complement || '');
    setHZipCode(h.zipCode);
    setIsHousingFormOpen(true);
  };

  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [editVCategory, setEditVCategory] = useState<'vehicle' | 'appliance'>('vehicle');
  const [editVExtendedWarranty, setEditVExtendedWarranty] = useState(false);
  const [editVExtendedWarrantyTime, setEditVExtendedWarrantyTime] = useState('');
  const [editVName, setEditVName] = useState('');
  const [editVMachineType, setEditVMachineType] = useState('');
  const [editVPurchaseDate, setEditVPurchaseDate] = useState('');
  const [editVWarranty, setEditVWarranty] = useState('');
  const [editVBrand, setEditVBrand] = useState('');
  const [editVColor, setEditVColor] = useState('');
  const [editVModel, setEditVModel] = useState('');
  const [editVPlate, setEditVPlate] = useState('');
  const [editVIpva, setEditVIpva] = useState('');
  const [editVIpvaExempt, setEditVIpvaExempt] = useState(false);
  const [editVLicensing, setEditVLicensing] = useState('');

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName) return;
    onAddMachine({
      category: vCategory,
      extendedWarranty: vExtendedWarranty,
      extendedWarrantyTime: vExtendedWarrantyTime,
      id: uuidv4(),
      name: vName,
      brand: vBrand,
      color: vColor,
      model: vModel,
      plate: vPlate,
      machineType: vMachineType,
      purchaseDate: vPurchaseDate,
      warranty: vWarranty,
      ipvaValue: vIpvaExempt ? 0 : (vIpva ? parseFloat(vIpva) : undefined),
      ipvaExempt: vIpvaExempt,
      licensingValue: vLicensing ? parseFloat(vLicensing) : undefined
    });
    setVName(''); setVBrand(''); setVColor(''); setVModel(''); setVPlate(''); setVIpva(''); setVIpvaExempt(false); setVLicensing(''); setVMachineType(''); setVPurchaseDate(''); setVWarranty(''); setVCategory('vehicle'); setVExtendedWarranty(false); setVExtendedWarrantyTime('');
    setIsMachineFormOpen(false);
  };

  const startEditMachine = (v: Machine) => {
    setEditingMachineId(v.id);
    setEditVName(v.name);
    setEditVBrand(v.brand || '');
    setEditVColor(v.color || '');
    setEditVModel(v.model || '');
    setEditVPlate(v.plate || '');
    setEditVIpva(v.ipvaValue ? v.ipvaValue.toString() : '');
    setEditVIpvaExempt(v.ipvaExempt || false);
    setEditVLicensing(v.licensingValue ? v.licensingValue.toString() : '');
  };

  const saveEditMachine = (v: Machine) => {
    if (!editVName) return;
    onUpdateMachine({
      ...v,
      name: editVName,
      brand: editVBrand,
      color: editVColor,
      model: editVModel,
      category: editVCategory,
      extendedWarranty: editVExtendedWarranty,
      extendedWarrantyTime: editVExtendedWarrantyTime,
      plate: editVPlate,
      machineType: editVMachineType,
      purchaseDate: editVPurchaseDate,
      warranty: editVWarranty,
      ipvaValue: editVIpvaExempt ? 0 : (editVIpva ? parseFloat(editVIpva.replace(/[^0-9.,]/g, "").replace(",", ".")) : undefined),
      ipvaExempt: editVIpvaExempt,
      licensingValue: editVLicensing ? parseFloat(editVLicensing.replace(/[^0-9.,]/g, "").replace(",", ".")) : undefined
    });
    setEditingMachineId(null);
  };


  const [name, setName] = useState('');
  const [role, setRole] = useState<'family' | 'third_party' | 'pet'>('family');
  const [species, setSpecies] = useState('cachorro');
  const [adoptionDate, setAdoptionDate] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cpf, setCpf] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const longPressTimer = useRef<any>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'family' | 'third_party' | 'pet'>('family');
  const [editSpecies, setEditSpecies] = useState('cachorro');
  const [editAdoptionDate, setEditAdoptionDate] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editRelationship, setEditRelationship] = useState('');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addingPixTo, setAddingPixTo] = useState<string | null>(null);
  const [editingPixId, setEditingPixId] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState('');
  const [pixNickname, setPixNickname] = useState('');
  const [pixBank, setPixBank] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    
    let finalName = name.trim();
    let secretTheme = undefined;
    if (finalName.includes('TRICOLOR')) {
      finalName = finalName.replace('TRICOLOR', '').trim();
      secretTheme = 'fluminense' as const;
    }
    const newPerson: Person = {
      id: uuidv4(),
      name: finalName,
      role: role,
      species: role === 'pet' ? species : undefined,
      adoptionDate: role === 'pet' ? adoptionDate : undefined,
      birthDate: role === 'pet' ? birthDate : undefined,
      cpf: role === 'pet' ? undefined : cpf.trim(),
      relationship: role === 'pet' ? undefined : relationship.trim(),
      secretTheme
    };
    onAddPerson(newPerson);
    setName('');
    setCpf('');
    setRelationship('');
    setRole('family');
    setSpecies('cachorro');
    setIsFormOpen(false);
  };

  
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setReorderMode(true);
    }, 800);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    
    const peopleList = Object.values(people).sort((a, b) => (a.order || 0) - (b.order || 0));
    const draggedIndex = peopleList.findIndex(p => p.id === draggedId);
    const targetIndex = peopleList.findIndex(p => p.id === targetId);
    
    const newList = [...peopleList];
    const [removed] = newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, removed);
    
    newList.forEach((p, index) => {
      if (p.order !== index) {
        onUpdatePerson({ ...p, order: index });
      }
    });
    setDraggedId(null);
  };

  const startEdit = (person: Person) => {
    setEditName(person.name);
    setEditRole(person.role || 'family');
    setEditSpecies(person.species || 'cachorro');
    setEditAdoptionDate(person.adoptionDate || '');
    setEditBirthDate(person.birthDate || '');
    setEditCpf(person.cpf || '');
    setEditRelationship(person.relationship || '');
    setEditingId(person.id);
  };

  const saveEdit = (person: Person) => {
    if (!editName.trim()) return;
    
    let finalEditName = editName.trim();
    let secretTheme = person.secretTheme;
    if (finalEditName.includes('TRICOLOR')) {
      finalEditName = finalEditName.replace('TRICOLOR', '').trim();
      secretTheme = 'fluminense';
    }

    onUpdatePerson({
      ...person,
      name: finalEditName,
      role: editRole,
      species: editRole === 'pet' ? editSpecies : undefined,
      adoptionDate: editRole === 'pet' ? editAdoptionDate : undefined,
      birthDate: editRole === 'pet' ? editBirthDate : undefined,
      cpf: editRole === 'pet' ? undefined : editCpf,
      relationship: editRole === 'pet' ? undefined : editRelationship,
      secretTheme: secretTheme as any
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditRole('family');
    setEditSpecies('cachorro');
    setEditCpf('');
    setEditRelationship('');
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleAddPix = (e: React.FormEvent, person: Person) => {
    e.preventDefault();
    if (!pixKey.trim()) return;

    const newPix: PixKey = {
      id: uuidv4(),
      key: pixKey.trim(),
      nickname: pixNickname.trim(),
      bank: pixBank.trim()
    };

    const updatedKeys = [...(person.pixKeys || []), newPix];
    onUpdatePerson({ ...person, pixKeys: updatedKeys });
    
    setPixKey('');
    setPixNickname('');
    setPixBank('');
    setAddingPixTo(null);
  };

  const handleDeletePix = (person: Person, pixId: string) => {
    const updatedKeys = (person.pixKeys || []).filter(p => p.id !== pixId);
    onUpdatePerson({ ...person, pixKeys: updatedKeys });
  };

  const peopleList = (Object.values(people) as Person[]).sort((a, b) => {
    // Family on top
    if (a.role === 'family' && b.role !== 'family') return -1;
    if (a.role !== 'family' && b.role === 'family') return 1;
    // Fallback to order
    return (a.order || 0) - (b.order || 0);
  });

  return (
    <div className="flex flex-col gap-6">

      <div className="flex gap-4 border-b border-white/10 pb-2">
        <button 
          onClick={() => setSubTab('people')}
          className={`text-[10px] uppercase tracking-widest font-bold pb-2 border-b-2 transition-colors ${subTab === 'people' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-white/40 hover:text-white/80'}`}
        >
          Pessoas
        </button>
        <button 
          onClick={() => setSubTab('machines')}
          className={`pb-2 text-[10px] uppercase tracking-[0.2em] font-bold border-b-2 transition-colors ${subTab === 'machines' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-white/40 hover:text-white/80'}`}
        >
          Máquinas
        </button>
        <button 
          onClick={() => setSubTab('cards')}
          className={`pb-2 text-[10px] uppercase tracking-[0.2em] font-bold border-b-2 transition-colors ${subTab === 'cards' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-white/40 hover:text-white/80'}`}
        >
          Cartões
        </button>
        <button 
          onClick={() => setSubTab('housings')}
          className={`pb-2 text-[10px] uppercase tracking-[0.2em] font-bold border-b-2 transition-colors ${subTab === 'housings' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-white/40 hover:text-white/80'}`}
        >
          Moradia
        </button>

        <button 
          onClick={() => setSubTab('insurances')}
          className={`pb-2 text-[10px] uppercase tracking-[0.2em] font-bold border-b-2 transition-colors ${subTab === 'insurances' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-white/40 hover:text-white/80'}`}
        >
          Seguros
        </button>

        
      </div>

      {subTab === 'people' && (
      <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Membros da Família</h2>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-emerald-400 text-[10px] uppercase tracking-widest font-bold border border-white/10 transition-colors"
        >
          {isFormOpen ? 'Cancelar' : 'Adicionar Pessoa'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-6 bg-white/5 border border-white/10 flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Nome</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder={role === 'pet' ? "Nome do Pet" : "Ex: João"}
                required
                className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full"
              />
            </div>
            <div className="flex flex-col gap-1 w-full md:w-40">
              <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Tipo</label>
              <select 
                value={role} 
                onChange={e => setRole(e.target.value as 'family' | 'third_party' | 'pet')}
                className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full"
              >
                <option value="family">Família</option>
                <option value="third_party">Terceiro</option>
                <option value="pet">Pet</option>
              </select>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
              {role === 'pet' && (
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Data de Adoção</label>
                  <DateInput value={adoptionDate} onChange={setAdoptionDate} containerClassName="w-full"  className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full [color-scheme:dark]"  />
                </div>
              )}
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Data de Nascimento</label>
                <DateInput value={birthDate} onChange={setBirthDate} containerClassName="w-full"  className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full [color-scheme:dark]"  />
              </div>
            </div>

          {role === 'pet' ? (
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Espécie</label>
                <select 
                  value={species} 
                  onChange={e => setSpecies(e.target.value)}
                  className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full"
                >
                  <option value="gato">Gato</option>
                  <option value="cachorro">Cachorro</option>
                  <option value="peixe">Peixe</option>
                  <option value="roedor">Roedor</option>
                  <option value="pássaro">Pássaro</option>
                  <option value="porco">Porco</option>
                  <option value="réptil">Réptil</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">CPF (Opcional)</label>
                <input 
                  type="text" 
                  value={cpf} 
                  onChange={e => setCpf(e.target.value)} 
                  placeholder="000.000.000-00"
                  className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Vínculo (Opcional)</label>
                <input 
                  type="text" 
                  value={relationship} 
                  onChange={e => setRelationship(e.target.value)} 
                  placeholder="Marido, Esposa, Filho..."
                  className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full"
                />
              </div>
            </div>
          )}
          <button 
            type="submit"
            className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-black p-3 text-xs uppercase tracking-widest font-bold transition-colors"
          >
            {role === 'pet' ? 'Salvar Pet' : 'Salvar Pessoa'}
          </button>
        </form>
      )}

      {peopleList.length === 0 ? (
        <div className="p-10 border border-white/10 flex flex-col items-center justify-center gap-2">
          <Users className="w-8 h-8 text-white/20" />
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Nenhuma pessoa cadastrada</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {peopleList.map(person => {
            let containerClasses = `p-4 flex flex-col `;
            let tagClasses = "";
            let tagText: React.ReactNode = "";

            if (person.role === 'pet') {
               const species = (person.species || '').toLowerCase();
               if (species === 'gato') containerClasses += 'bg-orange-500/10 border-orange-500/30 rounded-xl';
               else if (species === 'cachorro') containerClasses += 'bg-blue-500/10 border-blue-500/30 rounded-xl';
               else if (species === 'peixe') containerClasses += 'bg-cyan-500/10 border-cyan-500/30 rounded-full px-6';
               else if (species === 'roedor') containerClasses += 'bg-amber-500/10 border-amber-500/30 rounded-sm';
               else if (species === 'pássaro') containerClasses += 'bg-sky-500/10 border-sky-500/30 rounded-t-full px-6 pt-6';
               else if (species === 'porco') containerClasses += 'bg-pink-500/10 border-pink-500/30 rounded-3xl';
               else if (species === 'réptil') containerClasses += 'bg-emerald-800/20 border-emerald-500/30 rounded-none border-b-4 border-r-4';
               else containerClasses += 'bg-zinc-500/10 border-zinc-500/30 rounded-lg';
               
               tagClasses = "bg-white/10 text-white/70";
               tagText = <div className="flex items-center gap-1"><PetIcon species={person.species || ''} className="w-3 h-3" /> Pet</div>;
            } else {
               containerClasses += person.secretTheme === 'fluminense' ? 'bg-gradient-to-r from-[#8A1538]/10 via-white/5 to-[#00572D]/10 border-[#8A1538]/50 shadow-[0_0_15px_rgba(138,21,56,0.1)] border' : 'bg-white/5 border-white/10 border';
               tagClasses = person.role === 'third_party' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400';
               tagText = person.role === 'third_party' ? 'Terceiro' : 'Família';
            }

            return (
            <div key={person.id} className={containerClasses + (draggedId === person.id ? ' opacity-50' : '')} style={person.role === 'pet' ? getPetBackgroundStyle(person.species || '') : {}} onMouseDown={handleTouchStart} onMouseUp={handleTouchEnd} onMouseLeave={handleTouchEnd} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} draggable={reorderMode} onDragStart={(e) => handleDragStart(e, person.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, person.id)}>
              <div className="flex justify-between items-center group">
                {editingId === person.id ? (
                  <div className="flex flex-col md:flex-row gap-2 flex-1 mr-4">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white flex-1"
                      autoFocus
                    />
                    <select 
                      value={editRole} 
                      onChange={e => setEditRole(e.target.value as 'family' | 'third_party' | 'pet')}
                      className="bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white w-full md:w-28"
                    >
                      <option value="family">Família</option>
                      <option value="third_party">Terceiro</option>
                      <option value="pet">Pet</option>
                    </select>
                    <div className="flex gap-2 w-full mt-2">
                      {editRole === 'pet' && (
                        <DateInput value={editAdoptionDate} onChange={setEditAdoptionDate} containerClassName="w-full flex-1"  className="flex-1 bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white [color-scheme:dark]" placeholder="Data de Adoção"  />
                      )}
                      <DateInput value={editBirthDate} onChange={setEditBirthDate} containerClassName="w-full flex-1"  className="flex-1 bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white [color-scheme:dark]" placeholder="Nascimento"  />
                    </div>
                    {editRole === 'pet' ? (
                    <>

                    <select 
                      value={editSpecies} 
                        onChange={e => setEditSpecies(e.target.value)}
                        className="bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white flex-1"
                      >
                        <option value="gato">Gato</option>
                        <option value="cachorro">Cachorro</option>
                        <option value="peixe">Peixe</option>
                        <option value="roedor">Roedor</option>
                        <option value="pássaro">Pássaro</option>
                        <option value="porco">Porco</option>
                        <option value="réptil">Réptil</option>
                      </select>
                    </>
                  ) : (
                      <>
                        <input 
                          type="text" 
                          value={editRelationship}
                          onChange={e => setEditRelationship(e.target.value)}
                          placeholder="Vínculo"
                          className="bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white flex-1"
                        />
                        <input 
                          type="text" 
                          value={editCpf}
                          onChange={e => setEditCpf(e.target.value)}
                          placeholder="CPF"
                          className="bg-[#050505] border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white flex-1"
                        />
                      </>
                    )}
                    <div className="flex gap-1">
                      <button onClick={() => saveEdit(person)} className="p-2 text-emerald-400 hover:bg-white/10 rounded transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={cancelEdit} className="p-2 text-white/40 hover:text-white transition-colors hover:bg-white/10 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {person.secretTheme === 'fluminense' ? (
                          <div className="font-bold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #870A28 0%, #870A28 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #00613C 66.66%, #00613C 100%)' }}>
                            <PersonName rawName={person.name} />
                          </div>
                        ) : (
                          <div className="text-white font-medium"><PersonName rawName={person.name} /></div>
                        )}
                        <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm ${tagClasses}`}>
    {tagText}
  </span>
                        {person.relationship && (
                          <span className="text-[10px] text-white/40 px-2 border border-white/10 rounded-sm flex items-center gap-1">
                            {(person.relationship.toLowerCase() === 'esposa' || person.relationship.toLowerCase() === 'marido') && (
                              <svg className="w-3 h-3 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="12" r="5" />
                                <circle cx="15" cy="12" r="5" />
                              </svg>
                            )}
                            {person.relationship}
                          </span>
                        )}
                      </div>
                      {person.cpf && (
                        <div className="text-[10px] text-white/40 font-mono">CPF: {person.cpf}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(person)}
                        className="p-2 text-white/40 hover:text-white transition-colors hover:bg-white/10 rounded"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeletePerson(person.id)}
                        className="p-2 text-white/40 hover:text-rose-400 transition-colors hover:bg-white/10 rounded"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setExpandedId(expandedId === person.id ? null : person.id)}
                        className={`p-2 transition-colors hover:bg-white/10 rounded ${expandedId === person.id ? 'text-emerald-400' : 'text-white/40 hover:text-white'}`}
                        title="Ver Chaves Pix"
                      >
                        {expandedId === person.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Pix Keys Section */}
              {expandedId === person.id && !editingId && (
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Chaves Pix</h3>
                    <button 
                      onClick={() => setAddingPixTo(addingPixTo === person.id ? null : person.id)}
                      className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1 hover:text-emerald-300"
                    >
                      <Plus className="w-3 h-3" /> Adicionar Chave
                    </button>
                  </div>

                  {addingPixTo === person.id && (
                    <form onSubmit={(e) => handleAddPix(e, person)} className="flex flex-col md:flex-row gap-2 bg-[#050505] p-3 border border-white/10">
                      <input 
                        type="text" 
                        value={pixKey}
                        onChange={e => setPixKey(e.target.value)}
                        placeholder="Chave Pix (CPF, Email, Tel, Aleatória)"
                        required
                        className="bg-transparent border-b border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white flex-1"
                      />
                      <input 
                        type="text" 
                        value={pixNickname}
                        onChange={e => setPixNickname(e.target.value)}
                        placeholder="Apelido (ex: Principal)"
                        className="bg-transparent border-b border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white w-full md:w-32"
                      />
                      <input 
                        type="text" 
                        value={pixBank}
                        onChange={e => setPixBank(e.target.value)}
                        placeholder="Banco"
                        className="bg-transparent border-b border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white w-full md:w-32"
                      />
                      <button type="submit" className="p-2 bg-white/10 hover:bg-emerald-500 hover:text-black text-white transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  <div className="flex flex-col gap-2">
                    {(!person.pixKeys || person.pixKeys.length === 0) ? (
                      <div className="text-xs text-white/30 italic">Nenhuma chave cadastrada.</div>
                    ) : (
                      (person.pixKeys || []).map(pix => (
                        <div key={pix.id} className={`flex items-center justify-between p-3 border ${getBankColor(pix.bank || '')}`}>
                          <div className="flex flex-col">
                            <span className="text-white text-sm font-mono">{pix.key}</span>
                            <div className="flex gap-2 text-[10px] text-white/40 uppercase tracking-widest mt-1">
                              {pix.nickname && <span>{pix.nickname}</span>}
                              {pix.nickname && pix.bank && <span>•</span>}
                              {pix.bank && <span>{pix.bank}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => copyToClipboard(pix.key)}
                              className="p-2 text-emerald-400 hover:bg-white/10 rounded transition-colors"
                              title="Copiar Chave"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeletePix(person, pix.id)}
                              className="p-2 text-white/40 hover:text-rose-400 transition-colors hover:bg-white/10 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )})}
        </div>
      )}

      </div>
      )}



      {subTab === 'machines' && (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Máquinas da Família</h2>
          <button 
            onClick={() => setIsMachineFormOpen(!isMachineFormOpen)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-emerald-400 text-[10px] uppercase tracking-widest font-bold border border-white/10 transition-colors"
          >
            {isMachineFormOpen ? 'Cancelar' : 'Adicionar Máquina'}
          </button>
        </div>

        {isMachineFormOpen && (
          <form onSubmit={handleAddMachine} className="p-6 bg-white/5 border border-white/10 flex flex-col gap-4">
            <select value={vCategory} onChange={e => setVCategory(e.target.value as any)} className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full md:w-1/2">
              <option value="vehicle">Veículos</option>
              <option value="appliance">Eletrodomésticos</option>
            </select>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={vName} onChange={e => setVName(e.target.value)} placeholder={vCategory === 'vehicle' ? "Apelido (ex: Carro da Maria)" : "Nome (ex: Geladeira)"} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={vBrand} onChange={e => setVBrand(e.target.value)} placeholder={vCategory === 'vehicle' ? "Marca (ex: Honda)" : "Marca (ex: Brastemp)"} required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              
              {vCategory === 'vehicle' ? (
                <>
                  <input type="text" value={vModel} onChange={e => setVModel(e.target.value)} placeholder="Modelo (ex: Civic)" required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
                  <input type="text" value={vColor} onChange={e => setVColor(e.target.value)} placeholder="Cor" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
                  <input type="text" value={vPlate} onChange={e => setVPlate(e.target.value)} placeholder="Placa" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full uppercase" />
                  <div className="flex gap-2 items-center w-full bg-[#050505] border border-white/10 p-3 text-sm focus-within:border-emerald-500/50">
                    <input type="number" step="0.01" value={vIpva} onChange={e => setVIpva(e.target.value)} disabled={vIpvaExempt} placeholder={vIpvaExempt ? "Isento" : "Valor IPVA (R$)"} className="bg-transparent outline-none text-white w-full disabled:opacity-30" />
                    <label className="flex items-center gap-2 text-white/50 text-xs whitespace-nowrap cursor-pointer">
                      <input type="checkbox" checked={vIpvaExempt} onChange={e => setVIpvaExempt(e.target.checked)} className="accent-emerald-500" /> Isento
                    </label>
                  </div>
                  <input type="number" step="0.01" value={vLicensing} onChange={e => setVLicensing(e.target.value)} placeholder="Valor Licenciamento (R$)" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
                </>
              ) : (
                <>
                  <DateInput value={vPurchaseDate} onChange={setVPurchaseDate} required placeholder="Data de Compra" containerClassName="w-full" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
                  <div className="flex flex-col gap-2 bg-[#050505] border border-white/10 p-3 w-full">
                    <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">Garantia da Loja</p>
                    <p className="text-sm text-white">{vPurchaseDate ? `Até ${getCalculatedDate(vPurchaseDate, 90, 0)}` : '90 dias'}</p>
                  </div>
                  <div className="flex flex-col gap-2 bg-[#050505] border border-white/10 p-3 w-full">
                    <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">Garantia de Fábrica</p>
                    <p className="text-sm text-white">{vPurchaseDate ? `Até ${getCalculatedDate(vPurchaseDate, 0, 1)}` : '1 ano'}</p>
                  </div>
                  <div className="flex flex-col gap-2 bg-[#050505] border border-white/10 p-3 w-full col-span-1 md:col-span-2">
                    <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer mb-2">
                      <input type="checkbox" checked={vExtendedWarranty} onChange={e => setVExtendedWarranty(e.target.checked)} className="accent-emerald-500" />
                      Garantia Estendida
                    </label>
                    {vExtendedWarranty && (
                      <select value={vExtendedWarrantyTime} onChange={e => setVExtendedWarrantyTime(e.target.value)} className="bg-transparent border border-white/10 p-2 text-sm focus:border-emerald-500/50 outline-none text-white w-full md:w-1/2">
                        <option value="">Selecione o tempo...</option>
                        <option value="12 meses">12 meses</option>
                        <option value="24 meses">24 meses</option>
                        <option value="36 meses">36 meses</option>
                      </select>
                    )}
                  </div>
                </>
              )}
            </div>
            <button type="submit" className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-black p-3 text-xs uppercase tracking-widest font-bold transition-colors">
              Salvar Máquina
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(machines).map((v: any) => {
    const isKuro = v.name.toUpperCase().includes('KURO');
    const containerClasses = isKuro
      ? "p-4 bg-black border-2 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)] relative group font-mono"
      : "p-4 bg-white/5 border border-white/10 relative group";
    const titleClasses = isKuro ? "text-sm font-black text-cyan-400 tracking-widest" : "text-sm font-medium text-white";
    const infoContainerClasses = isKuro ? "text-[10px] text-fuchsia-400 tracking-widest flex flex-col gap-1" : "text-[10px] text-white/40 uppercase tracking-widest flex flex-col gap-1";
    const spanClasses = isKuro ? "text-cyan-300 font-bold" : "text-white/80";

    return (
    <div key={v.id} className={containerClasses}>
              {editingMachineId === v.id ? (
  <div className="flex flex-col gap-3">
    <select value={editVCategory} onChange={e => setEditVCategory(e.target.value as any)} className="bg-[#050505] border border-white/10 p-2 text-sm text-white">
      <option value="vehicle">Veículos</option>
      <option value="appliance">Eletrodomésticos</option>
    </select>
    <input type="text" value={editVName} onChange={e => setEditVName(e.target.value)} placeholder={editVCategory === 'vehicle' ? "Apelido" : "Nome"} className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
    <input type="text" value={editVBrand} onChange={e => setEditVBrand(e.target.value)} placeholder="Marca" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
    
    {editVCategory === 'vehicle' ? (
      <>
        <input type="text" value={editVModel} onChange={e => setEditVModel(e.target.value)} placeholder="Modelo" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
        <input type="text" value={editVColor} onChange={e => setEditVColor(e.target.value)} placeholder="Cor" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
        <input type="text" value={editVPlate} onChange={e => setEditVPlate(e.target.value)} placeholder="Placa" className="bg-[#050505] border border-white/10 p-2 text-sm text-white uppercase" />
        <div className="flex gap-2">
          <div className="flex gap-2 items-center bg-[#050505] border border-white/10 p-2 text-sm flex-1 focus-within:border-emerald-500/50">
            <input type="text" inputMode="decimal" value={editVIpva} onChange={e => setEditVIpva(e.target.value.replace(/[^0-9.,]/g, ''))} disabled={editVIpvaExempt} placeholder={editVIpvaExempt ? "Isento" : "IPVA"} className="bg-transparent outline-none text-white w-full disabled:opacity-30" />
            <label className="flex items-center gap-1 text-white/50 text-[10px] whitespace-nowrap cursor-pointer">
              <input type="checkbox" checked={editVIpvaExempt} onChange={e => setEditVIpvaExempt(e.target.checked)} className="accent-emerald-500" /> Isento
            </label>
          </div>
          <input type="text" inputMode="decimal" value={editVLicensing} onChange={e => setEditVLicensing(e.target.value.replace(/[^0-9.,]/g, ''))} placeholder="Licenciamento" className="bg-[#050505] border border-white/10 p-2 text-sm text-white flex-1" />
        </div>
      </>
    ) : (
      <>
        <DateInput value={editVPurchaseDate} onChange={setEditVPurchaseDate} placeholder="Data de Compra" containerClassName="w-full" className="bg-[#050505] border border-white/10 p-2 text-sm text-white w-full" />
        <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer">
          <input type="checkbox" checked={editVExtendedWarranty} onChange={e => setEditVExtendedWarranty(e.target.checked)} className="accent-emerald-500" /> Garantia Estendida
        </label>
        {editVExtendedWarranty && (
          <select value={editVExtendedWarrantyTime} onChange={e => setEditVExtendedWarrantyTime(e.target.value)} className="bg-[#050505] border border-white/10 p-2 text-sm text-white">
            <option value="">Selecione o tempo...</option>
            <option value="12 meses">12 meses</option>
            <option value="24 meses">24 meses</option>
            <option value="36 meses">36 meses</option>
          </select>
        )}
      </>
    )}
    
    <div className="flex gap-2 mt-2">
      <button onClick={() => saveEditMachine(v)} className="flex-1 p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex justify-center"><Check className="w-4 h-4" /></button>
      <button onClick={() => setEditingMachineId(null)} className="flex-1 p-2 bg-white/5 text-white/40 hover:bg-white/10 transition-colors flex justify-center"><X className="w-4 h-4" /></button>
    </div>
  </div>
) : (
  <>
  <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {v.category === 'appliance' ? <Monitor className="w-4 h-4 text-white/50" /> : <Car className="w-4 h-4 text-white/50" />}
                  <h3 className={titleClasses}>{v.name}</h3>
                </div>
                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEditMachine(v)} className="text-white/40 hover:text-white p-1"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={() => onDeleteMachine(v.id)} className="text-rose-500/50 hover:text-rose-400 p-1"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
              <div className={infoContainerClasses}>
                <p>Marca: <span className={spanClasses}>{v.brand}</span></p>
                
                {v.category === 'appliance' ? (
                  <>
                    {v.purchaseDate && <p>Compra: <span className={spanClasses}>{v.purchaseDate.split('-').reverse().join('/')}</span></p>}
                    <p>Garantia Loja: <span className={spanClasses}>{v.purchaseDate ? `Até ${getCalculatedDate(v.purchaseDate, 90, 0)}` : '90 dias'}</span></p>
                    <p>Garantia Fábrica: <span className={spanClasses}>{v.purchaseDate ? `Até ${getCalculatedDate(v.purchaseDate, 0, 1)}` : '1 ano'}</span></p>
                    {v.extendedWarranty && v.extendedWarrantyTime && (
                      <p>Garantia Estendida: <span className={spanClasses}>{v.extendedWarrantyTime}</span></p>
                    )}
                  </>
                ) : (
                  <>
                    <p>Modelo: <span className={spanClasses}>{v.model}</span></p>
                    <p>Cor: <span className={spanClasses}>{v.color}</span></p>
                    <p>Placa: <span className={spanClasses}>{v.plate}</span></p>
                    
                    <div className="mt-4 pt-4 border-t border-white/10 text-xs flex flex-col gap-1 justify-between text-white/50">
                      <span>IPVA: {v.ipvaExempt ? 'Isento' : (v.ipvaValue ? formatCurrency(v.ipvaValue) : 'Não informado')}</span>
                      <span>LIC: {v.licensingValue ? formatCurrency(v.licensingValue) : 'Não informado'}</span>
                    </div>
                  </>
                )}
              </div>
  </>
)}
            </div>
          );
          })}
          {Object.keys(machines).length === 0 && !isMachineFormOpen && (
            <div className="col-span-full text-center py-8 text-white/40 text-sm">
              Nenhum máquina cadastrado.
            </div>
          )}
        </div>
      </div>
      )}
      {subTab === 'cards' && (
        <CardsManager cards={cards} people={people} onAddCard={onAddCard} onUpdateCard={onUpdateCard} onDeleteCard={onDeleteCard} />

      )}
      {subTab === 'housings' && (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Moradias</h2>
          <button 
            onClick={() => {
              if (isHousingFormOpen) {
                resetHousingForm();
              } else {
                setIsHousingFormOpen(true);
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-emerald-400 text-[10px] uppercase tracking-widest font-bold border border-white/10 transition-colors"
          >
            {isHousingFormOpen ? 'Cancelar' : 'Adicionar Moradia'}
          </button>
        </div>

        {isHousingFormOpen && (
          <form onSubmit={handleAddHousing} className="p-6 bg-white/5 border border-white/10 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={hName} onChange={e => setHName(e.target.value)} placeholder="Nome/Apelido (ex: Casa Principal)" required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={hZipCode} onChange={e => setHZipCode(e.target.value)} placeholder="CEP" required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={hAddress} onChange={e => setHAddress(e.target.value)} placeholder="Endereço (Rua, Av, etc)" required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={hNeighborhood} onChange={e => setHNeighborhood(e.target.value)} placeholder="Bairro" required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={hCity} onChange={e => setHCity(e.target.value)} placeholder="Cidade" required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={hComplement} onChange={e => setHComplement(e.target.value)} placeholder="Complemento (Opcional)" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
            </div>
            <button type="submit" className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-black p-3 text-xs uppercase tracking-widest font-bold transition-colors">
              Salvar Moradia
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(housings || {}).map((h) => {
            const isCastle = h.name.toUpperCase() === 'CASTELO';
            const isApartment = h.name.toUpperCase() === 'APARTAMENTO';
            
            const cardClasses = isCastle 
              ? "p-4 bg-stone-900 border-x-2 border-b-2 border-stone-800 relative group rounded-b-md shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] border-t-8 border-t-stone-700 border-dashed"
              : "p-4 bg-white/5 border border-white/10 relative group";

            const IconToUse = isCastle ? Castle : (isApartment ? Building : Home);

            return (
            <div key={h.id} className={cardClasses}>
              {editingHousingId === h.id ? (
  <div className="flex flex-col gap-3">
    <input type="text" value={editHName} onChange={e => setEditHName(e.target.value)} placeholder="Nome" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
    <input type="text" value={editHZipCode} onChange={e => setEditHZipCode(e.target.value)} placeholder="CEP" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
    <input type="text" value={editHAddress} onChange={e => setEditHAddress(e.target.value)} placeholder="Endereço" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
    <input type="text" value={editHComplement} onChange={e => setEditHComplement(e.target.value)} placeholder="Complemento" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
    <input type="text" value={editHNeighborhood} onChange={e => setEditHNeighborhood(e.target.value)} placeholder="Bairro" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
    <input type="text" value={editHCity} onChange={e => setEditHCity(e.target.value)} placeholder="Cidade" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
    <div className="flex gap-2">
      <button onClick={() => saveEditHousing(h)} className="flex-1 p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex justify-center"><Check className="w-4 h-4" /></button>
      <button onClick={() => setEditingHousingId(null)} className="flex-1 p-2 bg-white/5 text-white/40 hover:bg-white/10 transition-colors flex justify-center"><X className="w-4 h-4" /></button>
    </div>
  </div>
) : (
  <>
  <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <IconToUse className={`w-4 h-4 ${isCastle ? 'text-amber-500/70' : 'text-white/50'}`} />
                  <h3 className={`text-sm font-medium ${isCastle ? 'text-amber-100 font-serif' : 'text-white'}`}>{h.name}</h3>
                </div>
                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEditHousing(h)} className="text-white/40 hover:text-white p-1"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={() => onDeleteHousing && onDeleteHousing(h.id)} className="text-rose-500/50 hover:text-rose-400 p-1"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
              <div className={`text-[10px] uppercase tracking-widest flex flex-col gap-1 mt-3 ${isCastle ? 'text-stone-400' : 'text-white/40'}`}>
                <p>Endereço: <span className={isCastle ? 'text-stone-300' : 'text-white/80'}>{h.address}</span></p>
                {h.complement && <p>Complemento: <span className={isCastle ? 'text-stone-300' : 'text-white/80'}>{h.complement}</span></p>}
                <p>Bairro: <span className={isCastle ? 'text-stone-300' : 'text-white/80'}>{h.neighborhood}</span></p>
                <p>Cidade: <span className={isCastle ? 'text-stone-300' : 'text-white/80'}>{h.city}</span></p>
                <p>CEP: <span className={isCastle ? 'text-stone-300' : 'text-white/80'}>{h.zipCode}</span></p>
              </div>
  </>
)}
            </div>
          )})}
          {Object.keys(housings || {}).length === 0 && !isHousingFormOpen && (
            <div className="col-span-full text-center py-8 text-white/40 text-sm">
              Nenhuma moradia cadastrada.
            </div>
          )}
        </div>
      </div>
      )}

      {subTab === 'insurances' && (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Seguros</h2>
          <button 
            onClick={() => {
              if (isInsuranceFormOpen) {
                resetInsuranceForm();
              } else {
                setIsInsuranceFormOpen(true);
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-emerald-400 text-[10px] uppercase tracking-widest font-bold border border-white/10 transition-colors"
          >
            {isInsuranceFormOpen ? 'Cancelar' : 'Adicionar Seguro'}
          </button>
        </div>

        {isInsuranceFormOpen && (
          <form onSubmit={handleAddInsurance} className="p-6 bg-white/5 border border-white/10 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={iInsuredName} onChange={e => setIInsuredName(e.target.value)} placeholder="Nome do Segurado" required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={iBeneficiaries} onChange={e => setIBeneficiaries(e.target.value)} placeholder="Beneficiários" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={iCompany} onChange={e => setICompany(e.target.value)} placeholder="Seguradora" required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={iType} onChange={e => setIType(e.target.value)} placeholder="Tipo de Seguro (Vida, Auto, etc)" required className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={iContact} onChange={e => setIContact(e.target.value)} placeholder="Contato (Telefone/Email)" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
              <input type="text" value={iContractNumber} onChange={e => setIContractNumber(e.target.value)} placeholder="Número do Contrato/Apólice" className="bg-[#050505] border border-white/10 p-3 text-sm focus:border-emerald-500/50 outline-none text-white w-full" />
            </div>
            <button type="submit" className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-black p-3 text-xs uppercase tracking-widest font-bold transition-colors">
              Salvar Seguro
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(insurances || {}).map((i) => (
            <div key={i.id} className="p-4 bg-white/5 border border-white/10 relative group">
              {editingInsuranceId === i.id ? (
                <div className="flex flex-col gap-3">
                  <input type="text" value={editIInsuredName} onChange={e => setEditIInsuredName(e.target.value)} placeholder="Nome do Segurado" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
                  <input type="text" value={editIBeneficiaries} onChange={e => setEditIBeneficiaries(e.target.value)} placeholder="Beneficiários" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
                  <input type="text" value={editICompany} onChange={e => setEditICompany(e.target.value)} placeholder="Seguradora" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
                  <input type="text" value={editIType} onChange={e => setEditIType(e.target.value)} placeholder="Tipo de Seguro" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
                  <input type="text" value={editIContact} onChange={e => setEditIContact(e.target.value)} placeholder="Contato" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
                  <input type="text" value={editIContractNumber} onChange={e => setEditIContractNumber(e.target.value)} placeholder="Número do Contrato" className="bg-[#050505] border border-white/10 p-2 text-sm text-white" />
                  <div className="flex gap-2">
                    <button onClick={() => saveEditInsurance(i)} className="flex-1 p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex justify-center"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingInsuranceId(null)} className="flex-1 p-2 bg-white/5 text-white/40 hover:bg-white/10 transition-colors flex justify-center"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-white/50" />
                    <h3 className="text-sm font-medium text-white">{i.insuredName}</h3>
                  </div>
                  <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditInsurance(i)} className="text-white/40 hover:text-white p-1"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => onDeleteInsurance && onDeleteInsurance(i.id)} className="text-rose-500/50 hover:text-rose-400 p-1"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest flex flex-col gap-1 mt-3">
                  <p>Seguradora: <span className="text-white/80">{i.company}</span></p>
                  <p>Tipo: <span className="text-white/80">{i.type}</span></p>
                  {i.beneficiaries && <p>Beneficiários: <span className="text-white/80">{i.beneficiaries}</span></p>}
                  {i.contractNumber && <p>Apólice/Contrato: <span className="text-white/80">{i.contractNumber}</span></p>}
                  {i.contact && <p>Contato: <span className="text-white/80">{i.contact}</span></p>}
                </div>
                </>
              )}
            </div>
          ))}
          {Object.keys(insurances || {}).length === 0 && !isInsuranceFormOpen && (
            <div className="col-span-full text-center py-8 text-white/40 text-sm">
              Nenhum seguro cadastrado.
            </div>
          )}
        </div>
      </div>
      )}

    </div>
  );
};
