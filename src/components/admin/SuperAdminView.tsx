import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  Search,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Phone,
  Mail,
  Filter,
  Sparkles,
  ArrowLeft,
  Calendar,
  Lock,
  Unlock,
  Receipt,
  Copy,
  Check,
  Send,
  Edit3,
  Wallet,
  ChevronDown,
  ChevronUp,
  X,
  UserPlus,
  MapPin,
  Tag,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { LoomiLogo } from '../common/LoomiLogo';
import { fetchAllComplexesFromCloud, fetchAllLeadsFromCloud } from '../../lib/firebase';

interface SuperAdminViewProps {
  onBackToLanding: () => void;
  onOpenComplexAsAdmin: (complexId: string) => void;
  onOpenNewComplexModal: () => void;
  currentComplexId?: string;
  theme?: 'light' | 'dark';
}

interface BankingConfig {
  accountHolder: string;
  bankName: string;
  cuit: string;
  cbu: string;
  alias: string;
  contactEmail: string;
  dueDay: number;
}

export interface ComplexItem {
  id: string;
  name: string;
  ownerName?: string;
  type: string;
  city: string;
  adminEmail?: string;
  adminPhone?: string;
  propertiesCount: number;
  reservationsCount: number;
  plan: string;
  status: 'active' | 'trial' | 'suspended';
  monthlyFeeArs: number;
  createdAt: string;
  suspendedAt?: string;
  notes?: string;
  lastCloudSyncedAt?: string;
}

interface LeadItem {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  complexName: string;
  propertiesCount: number;
  planOrTopic?: string;
  createdAt: string;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  onBackToLanding,
  onOpenComplexAsAdmin,
  onOpenNewComplexModal,
  currentComplexId,
  theme = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<'complexes' | 'billing' | 'leads' | 'economics'>('complexes');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'suspended'>('all');
  const [loading, setLoading] = useState(false);
  const [complexes, setComplexes] = useState<ComplexItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);

  // Modal para Cargar Nuevo Cliente
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    ownerName: '',
    type: 'Cabañas Turísticas',
    city: '',
    adminEmail: '',
    adminPhone: '',
    propertiesCount: 6,
    feeTier: '35000', // '35000' | '55000' | '80000' | 'custom'
    customFeeArs: 35000,
    status: 'active' as 'active' | 'trial' | 'suspended',
    notes: '',
  });

  // Modal para Editar Cliente
  const [editingComplex, setEditingComplex] = useState<ComplexItem | null>(null);

  // Modal para Confirmar Eliminación
  const [complexToDelete, setComplexToDelete] = useState<ComplexItem | null>(null);

  // Modal para Suspender / Reactivar
  const [complexToToggleSuspend, setComplexToToggleSuspend] = useState<ComplexItem | null>(null);

  // Toast notice
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Configuración de Datos Bancarios para transferencias
  const [bankingConfig, setBankingConfig] = useState<BankingConfig>(() => {
    try {
      const raw = localStorage.getItem('loomi_superadmin_banking');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      accountHolder: 'Gabriela Piccini (Loomi Suite)',
      bankName: 'Banco Santander / Transferencia Bancaria',
      cuit: '27-XXXXXXXX-X',
      cbu: '0000003100000000000000',
      alias: 'LOOMI.SUITE.PAGOS',
      contactEmail: 'pagos@loomisuite.net',
      dueDay: 10,
    };
  });

  const [isEditingBanking, setIsEditingBanking] = useState(false);
  const [bankingEditForm, setBankingEditForm] = useState<BankingConfig>(bankingConfig);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Registro de cobranzas mensuales por complejo
  const [billingRecords, setBillingRecords] = useState<Record<string, { status: 'paid' | 'pending' | 'overdue'; paidAt?: string; note?: string }>>(() => {
    try {
      const raw = localStorage.getItem('loomi_superadmin_billing_records');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      default: { status: 'paid', paidAt: new Date().toISOString() },
    };
  });

  const showNotification = (msg: string) => {
    setActionSuccessNotice(msg);
    setTimeout(() => {
      setActionSuccessNotice(null);
    }, 4000);
  };

  const saveComplexesToLocalStorage = (list: ComplexItem[]) => {
    try {
      localStorage.setItem('loomi_registered_complexes', JSON.stringify(list));
    } catch (err) {
      console.error('Error saving complexes to localStorage:', err);
    }
  };

  const handleSaveBankingConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setBankingConfig(bankingEditForm);
    localStorage.setItem('loomi_superadmin_banking', JSON.stringify(bankingEditForm));
    setIsEditingBanking(false);
    showNotification('Datos bancarios de cobranza actualizados correctamente.');
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleBillingStatus = (complexId: string) => {
    setBillingRecords((prev) => {
      const current = prev[complexId]?.status || 'pending';
      const nextStatus: 'paid' | 'pending' = current === 'paid' ? 'pending' : 'paid';
      const updated: Record<string, { status: 'paid' | 'pending' | 'overdue'; paidAt?: string; note?: string }> = {
        ...prev,
        [complexId]: {
          status: nextStatus,
          paidAt: nextStatus === 'paid' ? new Date().toISOString() : undefined,
        },
      };
      localStorage.setItem('loomi_superadmin_billing_records', JSON.stringify(updated));
      return updated;
    });
  };

  const getBillingMessageWhatsApp = (complex: ComplexItem) => {
    const currentMonth = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    const text = 
`Hola ${complex.ownerName ? complex.ownerName : complex.name}! 🌟
Te enviamos el aviso de abono mensual de Loomi Suite correspondiente al período: *${currentMonth.toUpperCase()}*.

📌 *Detalle del Servicio:*
• Complejo: *${complex.name}*
• Plan: ${complex.plan}
• Unidades gestionadas: ${complex.propertiesCount}
• Importe total: *$${complex.monthlyFeeArs.toLocaleString('es-AR')} ARS*
• Vencimiento sugerido: Día ${bankingConfig.dueDay} de este mes

🏦 *Datos para Transferencia Bancaria:*
• Titular: ${bankingConfig.accountHolder}
• Banco: ${bankingConfig.bankName}
• Alias: *${bankingConfig.alias}*
• CBU/CVU: ${bankingConfig.cbu}
• CUIT/CUIL: ${bankingConfig.cuit}

Una vez realizada la transferencia, podés respondernos por este medio con el comprobante para emitir tu recibo.

¡Muchas gracias por confiar en Loomi Suite!`;
    return encodeURIComponent(text);
  };

  const getBillingMailtoUrl = (complex: ComplexItem) => {
    const currentMonth = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    const subject = encodeURIComponent(`Aviso de Abono Mensual Loomi Suite - ${complex.name} (${currentMonth})`);
    const body = encodeURIComponent(
`Estimado/a ${complex.ownerName || 'equipo de ' + complex.name},

Les enviamos los datos para el abono del servicio mensual de Loomi Suite correspondiente al período ${currentMonth}.

Detalle del abono:
• Complejo: ${complex.name}
• Plan: ${complex.plan}
• Cantidad de unidades: ${complex.propertiesCount}
• Importe total: $${complex.monthlyFeeArs.toLocaleString('es-AR')} ARS
• Fecha límite sugerida: Día ${bankingConfig.dueDay}

Datos para transferencia bancaria:
• Titular: ${bankingConfig.accountHolder}
• Banco: ${bankingConfig.bankName}
• Alias: ${bankingConfig.alias}
• CBU/CVU: ${bankingConfig.cbu}
• CUIT: ${bankingConfig.cuit}

Por favor responder a este correo adjuntando el comprobante de transferencia para actualizar su estado de cuenta.

Atentamente,
Administración Loomi Suite
contacto@loomisuite.net`
    );
    return `mailto:${complex.adminEmail || 'cliente@loomisuite.net'}?subject=${subject}&body=${body}`;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load local complexes
      let localList: any[] = [];
      try {
        const raw = localStorage.getItem('loomi_registered_complexes');
        if (raw) localList = JSON.parse(raw);
      } catch {}

      // Default demo complexes if empty
      if (!localList || localList.length === 0) {
        localList = [
          {
            id: 'default',
            name: 'Catalinas Apartamentos',
            ownerName: 'Gabriela Piccini',
            type: 'Departamentos Turísticos',
            city: 'Buenos Aires, CABA',
            adminEmail: 'contacto@catalinas.com',
            adminPhone: '+54 9 11 4092-5939',
            propertiesCount: 4,
            reservationsCount: 12,
            plan: 'Plan 4 a 10 ($35.000/mes)',
            status: 'active',
            monthlyFeeArs: 35000,
            createdAt: new Date().toISOString(),
          },
        ];
        saveComplexesToLocalStorage(localList);
      }

      // 2. Fetch cloud complexes from Firestore
      const cloudComplexes = await fetchAllComplexesFromCloud();

      // Merge and map
      const mergedMap = new Map<string, ComplexItem>();

      // Add local ones
      localList.forEach((c) => {
        const propsCount = c.propertiesCount || 4;
        const fee = c.monthlyFeeArs || (propsCount <= 10 ? 35000 : propsCount <= 20 ? 55000 : 80000);
        const planName = c.plan || (propsCount <= 10 ? 'Plan 4 a 10 ($35.000/mes)' : propsCount <= 20 ? 'Plan 10 a 20 ($55.000/mes)' : 'Plan 20 a 30 ($80.000/mes)');

        mergedMap.set(c.id, {
          id: c.id,
          name: c.name || 'Sin nombre',
          ownerName: c.ownerName || 'Titular',
          type: c.type || 'Alojamiento',
          city: c.city || 'Argentina',
          adminEmail: c.adminEmail || 'admin@complejo.com',
          adminPhone: c.adminPhone || '+54 9 11...',
          propertiesCount: propsCount,
          reservationsCount: c.reservationsCount || 6,
          plan: planName,
          status: c.status || 'active',
          monthlyFeeArs: fee,
          suspendedAt: c.suspendedAt,
          notes: c.notes || '',
          createdAt: c.createdAt || new Date().toISOString(),
        });
      });

      // Add cloud ones (with their real data)
      cloudComplexes.forEach((doc) => {
        const d = doc.data;
        const existing = mergedMap.get(doc.id);
        const propsCount = d.properties?.length || existing?.propertiesCount || 4;
        const resCount = d.reservations?.length || existing?.reservationsCount || 0;
        const fee = existing?.monthlyFeeArs || (propsCount <= 10 ? 35000 : propsCount <= 20 ? 55000 : 80000);
        const planName = existing?.plan || (propsCount <= 10 ? 'Plan 4 a 10 ($35.000/mes)' : propsCount <= 20 ? 'Plan 10 a 20 ($55.000/mes)' : 'Plan 20 a 30 ($80.000/mes)');

        mergedMap.set(doc.id, {
          id: doc.id,
          name: d.welcomeGuide?.complexName || existing?.name || `Complejo ${doc.id.substring(0, 6)}`,
          ownerName: existing?.ownerName || 'Administrador',
          type: existing?.type || 'Complejo de Alojamiento',
          city: d.welcomeGuide?.city || existing?.city || 'Argentina',
          adminEmail: existing?.adminEmail || 'admin@complejo.com',
          adminPhone: existing?.adminPhone || '+54 9 11...',
          propertiesCount: propsCount,
          reservationsCount: resCount,
          plan: planName,
          status: existing?.status || 'active',
          monthlyFeeArs: fee,
          suspendedAt: existing?.suspendedAt,
          notes: existing?.notes || '',
          createdAt: existing?.createdAt || d.lastCloudSyncedAt || new Date().toISOString(),
          lastCloudSyncedAt: d.lastCloudSyncedAt,
        });
      });

      setComplexes(Array.from(mergedMap.values()));

      // 3. Fetch leads from Firestore
      const cloudLeads = await fetchAllLeadsFromCloud();
      if (cloudLeads.length > 0) {
        setLeads(
          cloudLeads.map((l) => ({
            id: l.id,
            fullName: l.data.fullName || 'Lead Anónimo',
            phone: l.data.phone || '',
            email: l.data.email || '',
            complexName: l.data.complexName || 'Alojamiento',
            propertiesCount: l.data.propertiesCount || 4,
            planOrTopic: l.data.planOrTopic || 'Consulta General',
            createdAt: l.data.createdAt || new Date().toISOString(),
          }))
        );
      } else {
        // Sample leads if database is fresh
        setLeads([
          {
            id: 'lead-1',
            fullName: 'Ignacio Morales',
            phone: '+54 9 3544 55-6677',
            email: 'ignacio.cabanas@gmail.com',
            complexName: 'Cabañas Las Sierras',
            propertiesCount: 8,
            planOrTopic: 'Plan 4 a 10 Propiedades ($35.000/mes)',
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
          {
            id: 'lead-2',
            fullName: 'Valeria Soria',
            phone: '+54 9 294 412-3456',
            email: 'valeria.bariloche@posada.com',
            complexName: 'Posada del Lago Bariloche',
            propertiesCount: 14,
            planOrTopic: 'Plan 10 a 20 Propiedades ($55.000/mes)',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.error('Error loading SuperAdmin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handler: Crear nuevo cliente / cuenta
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.name.trim()) return;

    const newId = `cpx-${Date.now()}`;
    const propsCount = Number(newClientForm.propertiesCount) || 4;

    let fee = 35000;
    let planName = 'Plan 4 a 10 ($35.000/mes)';

    if (newClientForm.feeTier === '35000') {
      fee = 35000;
      planName = 'Plan 4 a 10 ($35.000/mes)';
    } else if (newClientForm.feeTier === '55000') {
      fee = 55000;
      planName = 'Plan 10 a 20 ($55.000/mes)';
    } else if (newClientForm.feeTier === '80000') {
      fee = 80000;
      planName = 'Plan 20 a 30 ($80.000/mes)';
    } else {
      fee = Number(newClientForm.customFeeArs) || 35000;
      planName = `Tarifa Personalizada ($${fee.toLocaleString('es-AR')}/mes)`;
    }

    const newClient: ComplexItem = {
      id: newId,
      name: newClientForm.name.trim(),
      ownerName: newClientForm.ownerName.trim() || 'Titular',
      type: newClientForm.type || 'Cabañas Turísticas',
      city: newClientForm.city.trim() || 'Argentina',
      adminEmail: newClientForm.adminEmail.trim() || 'cliente@loomisuite.net',
      adminPhone: newClientForm.adminPhone.trim() || '+54 9 11...',
      propertiesCount: propsCount,
      reservationsCount: 0,
      plan: planName,
      status: newClientForm.status,
      monthlyFeeArs: fee,
      notes: newClientForm.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newClient, ...complexes];
    setComplexes(updated);
    saveComplexesToLocalStorage(updated);

    // Initial state setup for PMS demo
    const initialDemoState = {
      complexName: newClient.name,
      properties: Array.from({ length: propsCount }).map((_, i) => ({
        id: `prop-${i + 1}`,
        name: `Unidad ${i + 1}`,
        type: 'cabin',
        basePrice: 85,
        cleaningFee: 25,
        capacity: 4,
        rooms: 2,
        bathrooms: 1,
        floor: 'PB',
        amenities: ['wifi', 'parking', 'kitchen', 'air_conditioning'],
      })),
      reservations: [],
      welcomeGuide: {
        complexName: newClient.name,
        city: newClient.city,
        wifiNetwork: `${newClient.name.replace(/\s+/g, '')}_Guest`,
        wifiPassword: 'loomi_guest_pass',
      },
    };
    try {
      localStorage.setItem(`loomi_demo_state_${newId}`, JSON.stringify(initialDemoState));
    } catch {}

    setIsAddClientModalOpen(false);
    setNewClientForm({
      name: '',
      ownerName: '',
      type: 'Cabañas Turísticas',
      city: '',
      adminEmail: '',
      adminPhone: '',
      propertiesCount: 6,
      feeTier: '35000',
      customFeeArs: 35000,
      status: 'active',
      notes: '',
    });

    showNotification(`Cliente "${newClient.name}" creado con éxito. Ahora podés abrir su panel PMS o gestionar su cobranza.`);
  };

  // Handler: Guardar edición de cliente
  const handleSaveEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplex) return;

    const updated = complexes.map((c) => (c.id === editingComplex.id ? { ...editingComplex } : c));
    setComplexes(updated);
    saveComplexesToLocalStorage(updated);
    setEditingComplex(null);
    showNotification(`Datos de "${editingComplex.name}" actualizados correctamente.`);
  };

  // Handler: Toggle Suspender / Reactivar Cuenta
  const handleToggleSuspendConfirm = () => {
    if (!complexToToggleSuspend) return;

    const isCurrentlySuspended = complexToToggleSuspend.status === 'suspended';
    const nextStatus: 'active' | 'suspended' = isCurrentlySuspended ? 'active' : 'suspended';

    const updated = complexes.map((c) => {
      if (c.id === complexToToggleSuspend.id) {
        return {
          ...c,
          status: nextStatus,
          suspendedAt: nextStatus === 'suspended' ? new Date().toISOString() : undefined,
        };
      }
      return c;
    });

    setComplexes(updated);
    saveComplexesToLocalStorage(updated);

    const complexName = complexToToggleSuspend.name;
    setComplexToToggleSuspend(null);

    if (nextStatus === 'suspended') {
      showNotification(`Cuenta "${complexName}" SUSPENDIDA temporalmente.`);
    } else {
      showNotification(`Cuenta "${complexName}" REACTIVADA y habilitada.`);
    }
  };

  // Handler: Eliminar Cuenta
  const handleDeleteConfirm = () => {
    if (!complexToDelete) return;

    const idToRemove = complexToDelete.id;
    const nameRemoved = complexToDelete.name;
    const updated = complexes.filter((c) => c.id !== idToRemove);

    setComplexes(updated);
    saveComplexesToLocalStorage(updated);

    try {
      localStorage.removeItem(`loomi_demo_state_${idToRemove}`);
    } catch {}

    setComplexToDelete(null);
    showNotification(`Cuenta de cliente "${nameRemoved}" eliminada del sistema.`);
  };

  // Filtered complexes
  const filteredComplexes = complexes.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.ownerName && c.ownerName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? c.status === 'active'
        : statusFilter === 'trial'
        ? c.status === 'trial'
        : c.status === 'suspended';

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalComplexes = complexes.length;
  const activeComplexesCount = complexes.filter((c) => c.status === 'active').length;
  const suspendedComplexesCount = complexes.filter((c) => c.status === 'suspended').length;
  const trialComplexesCount = complexes.filter((c) => c.status === 'trial').length;
  const totalProperties = complexes.reduce((acc, c) => acc + (c.status !== 'suspended' ? c.propertiesCount : 0), 0);
  const totalMonthlyArs = complexes.reduce((acc, c) => acc + (c.status !== 'suspended' ? c.monthlyFeeArs : 0), 0);
  const totalLeads = leads.length;

  // Billing Metrics
  const totalBilledArs = totalMonthlyArs;
  const totalCollectedArs = complexes.reduce((acc, c) => {
    if (c.status === 'suspended') return acc;
    const isPaid = billingRecords[c.id]?.status === 'paid';
    return acc + (isPaid ? c.monthlyFeeArs : 0);
  }, 0);
  const totalPendingArs = Math.max(0, totalBilledArs - totalCollectedArs);
  const paidCount = complexes.filter((c) => c.status !== 'suspended' && billingRecords[c.id]?.status === 'paid').length;

  return (
    <div className="min-h-screen bg-[#0f0e0d] text-[#f4f2ee] font-sans pb-16">
      {/* Toast Notification */}
      {actionSuccessNotice && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1e2a20] border border-[#2d4d33] text-[#88c492] px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold text-white">{actionSuccessNotice}</p>
        </div>
      )}

      {/* Top SuperAdmin Bar */}
      <header className="bg-[#181614] border-b border-[#2c2722] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <LoomiLogo size="sm" theme="dark" />
          <div className="h-4 w-px bg-[#332c25]" />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#351c14] border border-[#582a1d] text-[#e88863] text-xs font-bold tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5 text-[#e88863]" />
            <span>SUPERADMIN MASTER PANEL</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl text-[#8e8c87] hover:text-white bg-[#221e1a] border border-[#332d26] hover:bg-[#2c2621] transition-colors cursor-pointer"
            title="Actualizar datos desde Cloud Firestore"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-xs font-bold text-[#8e8c87] hover:text-white px-3 py-2 rounded-xl bg-[#221e1a] border border-[#332d26] hover:bg-[#2c2621] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la Web</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Welcome & Overview Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#25201a]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Gestión de Clientes & Cuentas</span>
              <span className="text-xs font-bold text-[#8e8c87] bg-[#1f1a16] border border-[#332a22] px-3 py-1 rounded-full">
                loomisuite.net
              </span>
            </h1>
            <p className="text-sm text-[#8e8c87] mt-1">
              Panel maestro para alta de clientes, cálculo de abonos ($35.000/mes base), suspensión, baja y cobranzas por transferencia.
            </p>
          </div>

          <button
            onClick={() => setIsAddClientModalOpen(true)}
            className="px-4 py-2.5 bg-[#d88d5e] hover:bg-[#c27c4f] text-[#141414] font-bold text-xs rounded-xl transition-all shadow-md shadow-[#d88d5e]/20 flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Cargar Datos del Cliente</span>
          </button>
        </div>

        {/* Global Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8e8c87] uppercase tracking-wider">Total de Cuentas</p>
              <p className="text-3xl font-extrabold text-white mt-1.5">{totalComplexes}</p>
              <p className="text-[11px] text-[#8e8c87] mt-1 flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">{activeComplexesCount} activas</span>
                {suspendedComplexesCount > 0 && (
                  <span className="text-amber-400">• {suspendedComplexesCount} susp.</span>
                )}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#281c15] text-[#d88d5e] border border-[#482e21] flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          {/* Metric 2 */}
          <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8e8c87] uppercase tracking-wider">Unidades Gestionadas</p>
              <p className="text-3xl font-extrabold text-white mt-1.5">{totalProperties}</p>
              <p className="text-[11px] text-[#8e8c87] mt-1">Cabañas y departamentos activos</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#1a232b] text-[#76aab8] border border-[#2a3c4c] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Metric 3 */}
          <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8e8c87] uppercase tracking-wider">Facturación Mensual (MRR)</p>
              <p className="text-3xl font-extrabold text-white mt-1.5">
                ${totalMonthlyArs.toLocaleString('es-AR')}
              </p>
              <p className="text-[11px] text-emerald-400 mt-1">Base $35.000 por cliente</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#1b271d] text-[#88c492] border border-[#2d4732] flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Metric 4 */}
          <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8e8c87] uppercase tracking-wider">Consultas & Leads</p>
              <p className="text-3xl font-extrabold text-white mt-1.5">{totalLeads}</p>
              <p className="text-[11px] text-[#e88863] mt-1">Interesados vía web / WhatsApp</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#2a1d17] text-[#e88863] border border-[#482c1f] flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#25201a] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('complexes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'complexes'
                ? 'bg-[#281c15] text-[#d88d5e] border border-[#482e21]'
                : 'text-[#8e8c87] hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Listado de Clientes y Cuentas ({complexes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'billing'
                ? 'bg-[#281c15] text-[#d88d5e] border border-[#482e21]'
                : 'text-[#8e8c87] hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Cobranzas por Transferencia ({paidCount}/{activeComplexesCount} al día)</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'leads'
                ? 'bg-[#281c15] text-[#d88d5e] border border-[#482e21]'
                : 'text-[#8e8c87] hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Oportunidades & Leads Web ({leads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('economics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'economics'
                ? 'bg-[#281c15] text-[#d88d5e] border border-[#482e21]'
                : 'text-[#8e8c87] hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Costos Cloud & Margen Neto</span>
          </button>
        </div>

        {/* Tab 1: Complexes Table */}
        {activeTab === 'complexes' && (
          <div className="space-y-4">
            {/* Search filter and status pills bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#8e8c87] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por complejo, titular o ciudad..."
                  className="w-full bg-[#181614] border border-[#2b251f] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-[#332b22] text-white border border-[#4d3d2e]'
                      : 'bg-[#181614] text-[#8e8c87] border border-[#2b251f] hover:text-white'
                  }`}
                >
                  Todos ({complexes.length})
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'active'
                      ? 'bg-[#1b271d] text-[#88c492] border border-[#2d4732]'
                      : 'bg-[#181614] text-[#8e8c87] border border-[#2b251f] hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Activos ({activeComplexesCount})
                </button>
                <button
                  onClick={() => setStatusFilter('trial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'trial'
                      ? 'bg-[#18232c] text-[#76aab8] border border-[#263c4c]'
                      : 'bg-[#181614] text-[#8e8c87] border border-[#2b251f] hover:text-white'
                  }`}
                >
                  <Clock className="w-3 h-3 text-cyan-400" />
                  Prueba ({trialComplexesCount})
                </button>
                <button
                  onClick={() => setStatusFilter('suspended')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'suspended'
                      ? 'bg-[#351c14] text-[#e88863] border border-[#582a1d]'
                      : 'bg-[#181614] text-[#8e8c87] border border-[#2b251f] hover:text-white'
                  }`}
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  Suspendidos ({suspendedComplexesCount})
                </button>
              </div>
            </div>

            {/* Complexes Table */}
            <div className="bg-[#181614] border border-[#2b251f] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#201d19] border-b border-[#2b251f] text-[#8e8c87] uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Cliente / Complejo</th>
                      <th className="px-4 py-3.5">Tipo & Ubicación</th>
                      <th className="px-4 py-3.5 text-center">Unidades</th>
                      <th className="px-4 py-3.5">Abono Mensual (ARS)</th>
                      <th className="px-4 py-3.5 text-center">Estado</th>
                      <th className="px-5 py-3.5 text-right">Acciones de Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#25201a]">
                    {filteredComplexes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-[#8e8c87]">
                          No se encontraron clientes con el filtro aplicado.
                        </td>
                      </tr>
                    ) : (
                      filteredComplexes.map((c) => {
                        const isSuspended = c.status === 'suspended';
                        const isTrial = c.status === 'trial';
                        const cleanPhone = (c.adminPhone || '').replace(/\D/g, '');
                        const waUrl = cleanPhone
                          ? `https://wa.me/${cleanPhone}?text=${getBillingMessageWhatsApp(c)}`
                          : undefined;

                        return (
                          <tr
                            key={c.id}
                            className={`transition-colors ${
                              isSuspended ? 'bg-[#181210]/60 hover:bg-[#201613]' : 'hover:bg-[#1e1a17]'
                            }`}
                          >
                            {/* Name, Owner & Contact */}
                            <td className="px-5 py-4">
                              <div className="font-bold text-white text-sm flex items-center gap-2">
                                <span>{c.name}</span>
                                {c.id === currentComplexId && (
                                  <span className="text-[10px] bg-[#33251c] text-[#d88d5e] border border-[#4d3224] px-2 py-0.5 rounded-md font-semibold">
                                    Abierto actualmente
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#8e8c87] mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                {c.ownerName && <span className="text-[#d88d5e] font-medium">{c.ownerName}</span>}
                                {c.ownerName && <span>•</span>}
                                <span>{c.adminEmail}</span>
                                {c.adminPhone && (
                                  <>
                                    <span>•</span>
                                    <span className="text-[#a4cca8] font-mono">{c.adminPhone}</span>
                                  </>
                                )}
                              </div>
                            </td>

                            {/* Type & City */}
                            <td className="px-4 py-4">
                              <p className="text-white font-medium">{c.type}</p>
                              <p className="text-[11px] text-[#8e8c87] mt-0.5">{c.city}</p>
                            </td>

                            {/* Units count */}
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#221e1a] border border-[#332d26] text-white font-bold">
                                {c.propertiesCount} unidades
                              </span>
                            </td>

                            {/* Plan & Fee ($35.000 / mes base) */}
                            <td className="px-4 py-4">
                              <p className="text-white font-bold text-sm">
                                ${c.monthlyFeeArs.toLocaleString('es-AR')} <span className="text-xs font-normal text-[#8e8c87]">/ mes</span>
                              </p>
                              <p className="text-[11px] text-[#8e8c87]">{c.plan}</p>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4 text-center">
                              {isSuspended ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#381813] text-[#f87171] border border-[#6b251a]">
                                  <Lock className="w-3 h-3 text-red-400" />
                                  Suspendido
                                </span>
                              ) : isTrial ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#18232c] text-[#76aab8] border border-[#263c4c]">
                                  <Clock className="w-3 h-3 text-cyan-400" />
                                  En Prueba
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1b271d] text-[#88c492] border border-[#2d4732]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                  Activo
                                </span>
                              )}
                            </td>

                            {/* Action Buttons: Impersonate, Edit, Suspend/Reactivate, Delete */}
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Abrir PMS */}
                                <button
                                  onClick={() => onOpenComplexAsAdmin(c.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#281c15] hover:bg-[#38261c] text-[#d88d5e] border border-[#482e21] font-bold text-xs transition-all cursor-pointer"
                                  title="Abrir panel PMS del cliente"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Ver PMS</span>
                                </button>

                                {/* Editar Datos */}
                                <button
                                  onClick={() => setEditingComplex(c)}
                                  className="p-1.5 rounded-lg bg-[#221e1a] hover:bg-[#2c2621] text-[#8e8c87] hover:text-white border border-[#332d26] transition-all cursor-pointer"
                                  title="Editar datos del cliente y tarifa"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {/* Suspender / Reactivar */}
                                <button
                                  onClick={() => setComplexToToggleSuspend(c)}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    isSuspended
                                      ? 'bg-[#1b271d] hover:bg-[#233527] text-[#88c492] border-[#2d4732]'
                                      : 'bg-[#2a1d17] hover:bg-[#38261e] text-[#e88863] border-[#482c1f]'
                                  }`}
                                  title={isSuspended ? 'Reactivar cuenta' : 'Suspender cuenta'}
                                >
                                  {isSuspended ? (
                                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                                  )}
                                </button>

                                {/* Eliminar Cuenta */}
                                <button
                                  onClick={() => setComplexToDelete(c)}
                                  className="p-1.5 rounded-lg bg-[#2a1818] hover:bg-[#3d1e1e] text-red-400 border border-[#502222] transition-all cursor-pointer"
                                  title="Eliminar cuenta de cliente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Billing & Bank Transfers */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Billing Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f]">
                <span className="text-[11px] font-bold text-[#8e8c87] uppercase tracking-wider">Abonos a Cobrar (Mes)</span>
                <p className="text-2xl font-black text-white mt-1">${totalBilledArs.toLocaleString('es-AR')}</p>
                <p className="text-xs text-[#8e8c87] mt-0.5">{activeComplexesCount} clientes activos</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Ya Cobrado</span>
                  <span className="text-xs font-bold text-emerald-400 bg-[#16271a] px-2 py-0.5 rounded-full border border-[#23422a]">
                    {totalBilledArs > 0 ? Math.round((totalCollectedArs / totalBilledArs) * 100) : 0}%
                  </span>
                </div>
                <p className="text-2xl font-black text-emerald-400 mt-1">${totalCollectedArs.toLocaleString('es-AR')}</p>
                <p className="text-xs text-emerald-400/80 mt-0.5">{paidCount} de {activeComplexesCount} al día</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f]">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pendiente de Cobro</span>
                <p className="text-2xl font-black text-amber-400 mt-1">${totalPendingArs.toLocaleString('es-AR')}</p>
                <p className="text-xs text-amber-400/80 mt-0.5">{activeComplexesCount - paidCount} pendientes</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f]">
                <span className="text-[11px] font-bold text-[#d88d5e] uppercase tracking-wider">Vencimiento Habitual</span>
                <p className="text-2xl font-black text-white mt-1">Día {bankingConfig.dueDay} del mes</p>
                <p className="text-xs text-[#8e8c87] mt-0.5">Transferencia CBU / CVU directa</p>
              </div>
            </div>

            {/* Bank Account Config Card */}
            <div className="bg-[#181614] border border-[#2b251f] rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#25201a] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#281c15] text-[#d88d5e] border border-[#482e21] flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                      <span>Cuenta Bancaria Receptora para Transferencias</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Cobro Directo
                      </span>
                    </h3>
                    <p className="text-xs text-[#8e8c87]">
                      Estos datos se insertan automáticamente al generar los avisos de WhatsApp y correo para el abono de $35.000
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setBankingEditForm(bankingConfig);
                    setIsEditingBanking(!isEditingBanking);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#221e1a] hover:bg-[#2c2621] text-white border border-[#332d26] text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#d88d5e]" />
                  <span>{isEditingBanking ? 'Cerrar Edición' : 'Editar Datos Bancarios'}</span>
                </button>
              </div>

              {/* Editing Form */}
              {isEditingBanking ? (
                <form onSubmit={handleSaveBankingConfig} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#201c18] border border-[#382b20]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#8e8c87] mb-1">Titular de la Cuenta</label>
                    <input
                      type="text"
                      value={bankingEditForm.accountHolder}
                      onChange={(e) => setBankingEditForm({ ...bankingEditForm, accountHolder: e.target.value })}
                      className="w-full bg-[#141210] border border-[#332b22] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#8e8c87] mb-1">Banco / Billetera</label>
                    <input
                      type="text"
                      value={bankingEditForm.bankName}
                      onChange={(e) => setBankingEditForm({ ...bankingEditForm, bankName: e.target.value })}
                      className="w-full bg-[#141210] border border-[#332b22] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#8e8c87] mb-1">Alias Bancario</label>
                    <input
                      type="text"
                      value={bankingEditForm.alias}
                      onChange={(e) => setBankingEditForm({ ...bankingEditForm, alias: e.target.value })}
                      className="w-full bg-[#141210] border border-[#332b22] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#8e8c87] mb-1">CBU / CVU (22 dígitos)</label>
                    <input
                      type="text"
                      value={bankingEditForm.cbu}
                      onChange={(e) => setBankingEditForm({ ...bankingEditForm, cbu: e.target.value })}
                      className="w-full bg-[#141210] border border-[#332b22] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#8e8c87] mb-1">CUIT / CUIL</label>
                    <input
                      type="text"
                      value={bankingEditForm.cuit}
                      onChange={(e) => setBankingEditForm({ ...bankingEditForm, cuit: e.target.value })}
                      className="w-full bg-[#141210] border border-[#332b22] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#8e8c87] mb-1">Día Vencimiento Mensual</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={bankingEditForm.dueDay}
                      onChange={(e) => setBankingEditForm({ ...bankingEditForm, dueDay: Number(e.target.value) })}
                      className="w-full bg-[#141210] border border-[#332b22] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                      required
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingBanking(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#221e1a] text-[#8e8c87] text-xs font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#d88d5e] text-[#141414] text-xs font-bold"
                    >
                      Guardar Datos Bancarios
                    </button>
                  </div>
                </form>
              ) : (
                /* Bank details preview grid */
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#201c18] border border-[#302820]">
                    <span className="text-[10px] text-[#8e8c87] block uppercase font-bold">Titular</span>
                    <span className="font-bold text-white mt-0.5 block truncate">{bankingConfig.accountHolder}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#201c18] border border-[#302820]">
                    <span className="text-[10px] text-[#8e8c87] block uppercase font-bold">Banco</span>
                    <span className="font-bold text-white mt-0.5 block truncate">{bankingConfig.bankName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#201c18] border border-[#302820] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8e8c87] block uppercase font-bold">Alias</span>
                      <span className="font-bold text-amber-300 mt-0.5 block">{bankingConfig.alias}</span>
                    </div>
                    <button
                      onClick={() => handleCopyText(bankingConfig.alias, 'alias')}
                      className="text-[#8e8c87] hover:text-white p-1"
                      title="Copiar Alias"
                    >
                      {copiedField === 'alias' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-[#201c18] border border-[#302820] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8e8c87] block uppercase font-bold">CBU / CVU</span>
                      <span className="font-bold text-white mt-0.5 block font-mono text-[11px] truncate max-w-[110px]">
                        {bankingConfig.cbu}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyText(bankingConfig.cbu, 'cbu')}
                      className="text-[#8e8c87] hover:text-white p-1"
                      title="Copiar CBU"
                    >
                      {copiedField === 'cbu' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-[#201c18] border border-[#302820]">
                    <span className="text-[10px] text-[#8e8c87] block uppercase font-bold">CUIT</span>
                    <span className="font-bold text-white mt-0.5 block font-mono">{bankingConfig.cuit}</span>
                  </div>
                </div>
              )}
            </div>

            {/* List of Complexes for Invoicing */}
            <div className="bg-[#181614] border border-[#2b251f] rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#25201a] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Estado de Cobro por Complejo (Mes en Curso)</h3>
                  <p className="text-xs text-[#8e8c87]">
                    Podés marcar como pagado cuando recibas la transferencia o enviar el recordatorio por WhatsApp
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#201d19] border-b border-[#2b251f] text-[#8e8c87] uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Complejo / Titular</th>
                      <th className="px-4 py-3.5">Plan Contratado</th>
                      <th className="px-4 py-3.5">Monto Mensual</th>
                      <th className="px-4 py-3.5 text-center">Estado del Pago</th>
                      <th className="px-5 py-3.5 text-right">Avisos de Cobro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#25201a]">
                    {complexes.map((c) => {
                      const isPaid = billingRecords[c.id]?.status === 'paid';
                      const cleanPhone = (c.adminPhone || '').replace(/\D/g, '');
                      const waUrl = cleanPhone
                        ? `https://wa.me/${cleanPhone}?text=${getBillingMessageWhatsApp(c)}`
                        : undefined;

                      return (
                        <tr key={c.id} className="hover:bg-[#1e1a17] transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-bold text-white text-sm">{c.name}</p>
                            <p className="text-[11px] text-[#8e8c87] mt-0.5">
                              {c.ownerName || 'Titular'} • {c.adminPhone || c.adminEmail}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <span className="font-medium text-white">{c.plan}</span>
                            <span className="block text-[11px] text-[#8e8c87]">{c.propertiesCount} unidades</span>
                          </td>

                          <td className="px-4 py-4">
                            <span className="font-bold text-white text-sm">
                              ${c.monthlyFeeArs.toLocaleString('es-AR')} ARS
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => toggleBillingStatus(c.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                isPaid
                                  ? 'bg-[#1b271d] hover:bg-[#233527] text-[#88c492] border border-[#2d4732]'
                                  : 'bg-[#352514] hover:bg-[#48321a] text-amber-300 border border-[#583a1d]'
                              }`}
                            >
                              {isPaid ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Transferencia Recibida</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Pendiente de Pago</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {waUrl ? (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b271d] hover:bg-[#233527] text-[#88c492] border border-[#2d4732] font-bold text-xs transition-all"
                                  title="Enviar aviso con datos bancarios a su WhatsApp"
                                >
                                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Aviso WhatsApp</span>
                                </a>
                              ) : (
                                <span className="text-[11px] text-[#8e8c87]">Sin WhatsApp</span>
                              )}

                              <a
                                href={getBillingMailtoUrl(c)}
                                className="p-2 rounded-xl bg-[#221e1a] hover:bg-[#2c2621] text-[#8e8c87] hover:text-white border border-[#332d26] transition-all"
                                title="Enviar aviso por correo electrónico"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Leads */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="bg-[#181614] border border-[#2b251f] rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#25201a] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Oportunidades Comerciales & Solicitudes</h3>
                  <p className="text-xs text-[#8e8c87]">
                    Consultas recibidas a través de la página web para contratar el servicio
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#201d19] border-b border-[#2b251f] text-[#8e8c87] uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Interesado / Contacto</th>
                      <th className="px-4 py-3.5">Complejo / Unidades</th>
                      <th className="px-4 py-3.5">Plan de Interés</th>
                      <th className="px-4 py-3.5">Fecha</th>
                      <th className="px-5 py-3.5 text-right">Contactar por WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#25201a]">
                    {leads.map((l) => {
                      const cleanPhone = l.phone.replace(/\D/g, '');
                      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `Hola ${l.fullName}! Te escribimos de Loomi Suite por tu consulta para ${l.complexName}. ¿Cómo estás?`
                      )}`;

                      return (
                        <tr key={l.id} className="hover:bg-[#1e1a17] transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-bold text-white text-sm">{l.fullName}</p>
                            <p className="text-[11px] text-[#8e8c87] mt-0.5">{l.email}</p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="text-white font-medium">{l.complexName}</p>
                            <p className="text-[11px] text-[#d88d5e]">{l.propertiesCount} unidades</p>
                          </td>

                          <td className="px-4 py-4">
                            <span className="px-2.5 py-1 rounded-lg bg-[#221e1a] border border-[#332d26] text-white font-semibold">
                              {l.planOrTopic}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-[#8e8c87]">
                            {new Date(l.createdAt).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1b271d] hover:bg-[#233527] text-[#88c492] border border-[#2d4732] font-bold text-xs transition-all"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Escribir por WhatsApp</span>
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Economics & Cloud Costs */}
        {activeTab === 'economics' && (
          <div className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Ingreso Bruto */}
              <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f] space-y-2">
                <span className="text-xs font-bold text-[#8e8c87] uppercase tracking-wider">Ingreso Mensual Bruto (MRR)</span>
                <p className="text-3xl font-extrabold text-white">${totalMonthlyArs.toLocaleString('es-AR')}</p>
                <p className="text-xs text-[#8e8c87]">Cobrado en ARS con {activeComplexesCount} clientes activos</p>
              </div>

              {/* Card 2: Costo Cloud */}
              <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f] space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Costo Estimado Google Cloud</span>
                <p className="text-3xl font-extrabold text-amber-300">
                  $0 USD <span className="text-sm font-normal text-[#8e8c87]">($0 ARS)</span>
                </p>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% Cubierto por la Capa Gratuita (Free Tier)</span>
                </p>
              </div>

              {/* Card 3: Margen Neto */}
              <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f] space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Margen Operativo Neto</span>
                <p className="text-3xl font-extrabold text-emerald-400">99.8%</p>
                <p className="text-xs text-[#8e8c87]">
                  Ganancia neta estimada: <strong>${totalMonthlyArs.toLocaleString('es-AR')} ARS/mes</strong>
                </p>
              </div>
            </div>

            {/* Cloud Firestore Quotas & Consumption Detail */}
            <div className="bg-[#181614] border border-[#2b251f] rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d88d5e]" />
                  <span>Detalle de Consumo y Capa Gratuita (Google Cloud Firestore)</span>
                </h3>
                <p className="text-xs text-[#8e8c87] mt-1">
                  Google Cloud incluye un paquete gratuito mensual permanente para la base de datos Firestore.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#201c19] border border-[#332a22] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8e8c87] font-medium">Lecturas de base de datos</span>
                    <span className="text-emerald-400 font-bold">50.000 / día gratis</span>
                  </div>
                  <div className="w-full bg-[#141210] h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(5, totalComplexes * 4))}%` }} />
                  </div>
                  <p className="text-[11px] text-[#8e8c87]">
                    Uso estimado: ~{(totalComplexes * 120).toLocaleString('es-AR')} lecturas/día (~{((totalComplexes * 120 / 50000) * 100).toFixed(1)}% de la cuota gratis)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#201c19] border border-[#332a22] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8e8c87] font-medium">Escrituras de reservas</span>
                    <span className="text-emerald-400 font-bold">20.000 / día gratis</span>
                  </div>
                  <div className="w-full bg-[#141210] h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(3, totalComplexes * 2))}%` }} />
                  </div>
                  <p className="text-[11px] text-[#8e8c87]">
                    Uso estimado: ~{(totalComplexes * 40).toLocaleString('es-AR')} escrituras/día (~{((totalComplexes * 40 / 20000) * 100).toFixed(1)}% de la cuota gratis)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#201c19] border border-[#332a22] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8e8c87] font-medium">Almacenamiento Cloud</span>
                    <span className="text-emerald-400 font-bold">1 GB gratis</span>
                  </div>
                  <div className="w-full bg-[#141210] h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '4%' }} />
                  </div>
                  <p className="text-[11px] text-[#8e8c87]">
                    Uso estimado: ~{(totalComplexes * 2.5).toFixed(1)} MB (&lt;1% de 1 GB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: CARGAR DATOS DEL CLIENTE (+ NUEVO CLIENTE)                       */}
      {/* ========================================================================= */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#181614] border border-[#2b251f] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#25201a] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#281c15] text-[#d88d5e] border border-[#482e21] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg">Cargar Datos del Cliente</h3>
                  <p className="text-xs text-[#8e8c87]">Alta de nuevo alojamiento en el ecosistema Loomi Suite</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8e8c87] hover:text-white bg-[#221e1a] border border-[#332d26] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre del Complejo */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">
                    Nombre del Complejo o Alojamiento <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Cabañas Los Álamos / Altos del Valle"
                    value={newClientForm.name}
                    onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>

                {/* Titular / Dueño */}
                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">
                    Nombre del Titular / Propietario <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Martín Gómez"
                    value={newClientForm.ownerName}
                    onChange={(e) => setNewClientForm({ ...newClientForm, ownerName: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>

                {/* Tipo de Alojamiento */}
                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Tipo de Alojamiento</label>
                  <select
                    value={newClientForm.type}
                    onChange={(e) => setNewClientForm({ ...newClientForm, type: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                  >
                    <option value="Cabañas Turísticas">Cabañas Turísticas</option>
                    <option value="Departamentos Turísticos">Departamentos Turísticos</option>
                    <option value="Hotel Boutique & Posada">Hotel Boutique & Posada</option>
                    <option value="Glamping & Complejo de Domos">Glamping & Complejo de Domos</option>
                    <option value="Casas de Alquiler Temporario">Casas de Alquiler Temporario</option>
                  </select>
                </div>

                {/* Teléfono / WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">
                    WhatsApp de Contacto <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: +54 9 3541 55-6677"
                    value={newClientForm.adminPhone}
                    onChange={(e) => setNewClientForm({ ...newClientForm, adminPhone: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Email de Facturación</label>
                  <input
                    type="email"
                    placeholder="Ej: martin@losalamos.com"
                    value={newClientForm.adminEmail}
                    onChange={(e) => setNewClientForm({ ...newClientForm, adminEmail: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>

                {/* Ciudad / Provincia */}
                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Ciudad y Provincia</label>
                  <input
                    type="text"
                    placeholder="Ej: Villa General Belgrano, Córdoba"
                    value={newClientForm.city}
                    onChange={(e) => setNewClientForm({ ...newClientForm, city: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>

                {/* Cantidad de Unidades */}
                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Cantidad de Unidades</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newClientForm.propertiesCount}
                    onChange={(e) => setNewClientForm({ ...newClientForm, propertiesCount: Number(e.target.value) })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>
              </div>

              {/* Plan y Abono Mensual */}
              <div className="p-4 rounded-xl bg-[#201c18] border border-[#382b20] space-y-3">
                <label className="block text-xs font-bold text-[#d88d5e] uppercase tracking-wider">
                  Plan Contratado & Tarifa Mensual (ARS)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${
                      newClientForm.feeTier === '35000'
                        ? 'bg-[#2a1d17] border-[#d88d5e] text-white'
                        : 'bg-[#141210] border-[#332b22] text-[#8e8c87]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feeTier"
                      value="35000"
                      checked={newClientForm.feeTier === '35000'}
                      onChange={() => setNewClientForm({ ...newClientForm, feeTier: '35000' })}
                      className="sr-only"
                    />
                    <span className="font-extrabold text-sm text-white">$35.000 / mes</span>
                    <span className="text-[10px] mt-0.5">Plan 4 a 10 Unidades</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${
                      newClientForm.feeTier === '55000'
                        ? 'bg-[#2a1d17] border-[#d88d5e] text-white'
                        : 'bg-[#141210] border-[#332b22] text-[#8e8c87]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feeTier"
                      value="55000"
                      checked={newClientForm.feeTier === '55000'}
                      onChange={() => setNewClientForm({ ...newClientForm, feeTier: '55000' })}
                      className="sr-only"
                    />
                    <span className="font-extrabold text-sm text-white">$55.000 / mes</span>
                    <span className="text-[10px] mt-0.5">Plan 10 a 20 Unidades</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${
                      newClientForm.feeTier === '80000'
                        ? 'bg-[#2a1d17] border-[#d88d5e] text-white'
                        : 'bg-[#141210] border-[#332b22] text-[#8e8c87]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feeTier"
                      value="80000"
                      checked={newClientForm.feeTier === '80000'}
                      onChange={() => setNewClientForm({ ...newClientForm, feeTier: '80000' })}
                      className="sr-only"
                    />
                    <span className="font-extrabold text-sm text-white">$80.000 / mes</span>
                    <span className="text-[10px] mt-0.5">Plan 20 a 30 Unidades</span>
                  </label>
                </div>
              </div>

              {/* Estado Inicial */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Estado de la Cuenta</label>
                  <select
                    value={newClientForm.status}
                    onChange={(e: any) => setNewClientForm({ ...newClientForm, status: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                  >
                    <option value="active">Activo (Facturación en curso)</option>
                    <option value="trial">En Prueba (Trial 14 días)</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Notas Internas</label>
                  <input
                    type="text"
                    placeholder="Ej: Recomendado por Hotel Pinar"
                    value={newClientForm.notes}
                    onChange={(e) => setNewClientForm({ ...newClientForm, notes: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#25201a]">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#221e1a] text-[#8e8c87] hover:text-white border border-[#332d26] text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#d88d5e] hover:bg-[#c27c4f] text-[#141414] text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar y Dar de Alta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDITAR DATOS DEL CLIENTE                                         */}
      {/* ========================================================================= */}
      {editingComplex && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#181614] border border-[#2b251f] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#25201a] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#281c15] text-[#d88d5e] border border-[#482e21] flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg">Editar Datos del Cliente</h3>
                  <p className="text-xs text-[#8e8c87]">Modificación de {editingComplex.name} (ID: {editingComplex.id})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingComplex(null)}
                className="p-1.5 rounded-lg text-[#8e8c87] hover:text-white bg-[#221e1a] border border-[#332d26] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Nombre del Complejo</label>
                  <input
                    type="text"
                    required
                    value={editingComplex.name}
                    onChange={(e) => setEditingComplex({ ...editingComplex, name: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Titular / Propietario</label>
                  <input
                    type="text"
                    value={editingComplex.ownerName || ''}
                    onChange={(e) => setEditingComplex({ ...editingComplex, ownerName: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Tipo de Alojamiento</label>
                  <input
                    type="text"
                    value={editingComplex.type}
                    onChange={(e) => setEditingComplex({ ...editingComplex, type: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={editingComplex.adminPhone || ''}
                    onChange={(e) => setEditingComplex({ ...editingComplex, adminPhone: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Email de Facturación</label>
                  <input
                    type="email"
                    value={editingComplex.adminEmail || ''}
                    onChange={(e) => setEditingComplex({ ...editingComplex, adminEmail: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Ciudad y Provincia</label>
                  <input
                    type="text"
                    value={editingComplex.city}
                    onChange={(e) => setEditingComplex({ ...editingComplex, city: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Cantidad de Unidades</label>
                  <input
                    type="number"
                    min={1}
                    value={editingComplex.propertiesCount}
                    onChange={(e) => setEditingComplex({ ...editingComplex, propertiesCount: Number(e.target.value) })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>
              </div>

              {/* Tarifa y Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#201c18] border border-[#382b20]">
                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Tarifa Mensual ARS ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={editingComplex.monthlyFeeArs}
                    onChange={(e) => setEditingComplex({ ...editingComplex, monthlyFeeArs: Number(e.target.value) })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-hidden focus:border-[#d88d5e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8e8c87] mb-1">Estado de la Cuenta</label>
                  <select
                    value={editingComplex.status}
                    onChange={(e: any) => setEditingComplex({ ...editingComplex, status: e.target.value })}
                    className="w-full bg-[#141210] border border-[#332b22] rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-hidden focus:border-[#d88d5e]"
                  >
                    <option value="active">Activo (Facturación regular)</option>
                    <option value="trial">En Prueba (Trial 14 días)</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#25201a]">
                <button
                  type="button"
                  onClick={() => setEditingComplex(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#221e1a] text-[#8e8c87] hover:text-white border border-[#332d26] text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#d88d5e] hover:bg-[#c27c4f] text-[#141414] text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRMAR SUSPENDER / REACTIVAR                                  */}
      {/* ========================================================================= */}
      {complexToToggleSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#181614] border border-[#382b20] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#351c14] text-[#e88863] border border-[#582a1d] flex items-center justify-center shrink-0">
                {complexToToggleSuspend.status === 'suspended' ? (
                  <Unlock className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Lock className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  {complexToToggleSuspend.status === 'suspended' ? 'Reactivar Cuenta de Cliente' : 'Suspender Cuenta de Cliente'}
                </h3>
                <p className="text-xs text-[#8e8c87]">{complexToToggleSuspend.name}</p>
              </div>
            </div>

            <p className="text-xs text-[#c8bfb7] leading-relaxed">
              {complexToToggleSuspend.status === 'suspended'
                ? 'Al reactivar la cuenta, el complejo volverá a tener acceso regular a su panel PMS y sincronizaciones.'
                : 'Al suspender la cuenta, el acceso al panel PMS quedará pausado por administración (por ejemplo, por falta de pago del abono mensual).'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#25201a]">
              <button
                onClick={() => setComplexToToggleSuspend(null)}
                className="px-4 py-2 rounded-xl bg-[#221e1a] text-[#8e8c87] hover:text-white border border-[#332d26] text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleToggleSuspendConfirm}
                className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer ${
                  complexToToggleSuspend.status === 'suspended'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
                    : 'bg-amber-500 hover:bg-amber-600 text-black'
                }`}
              >
                {complexToToggleSuspend.status === 'suspended' ? 'Confirmar Reactivación' : 'Confirmar Suspensión'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIRMAR ELIMINACIÓN DE CUENTA                                  */}
      {/* ========================================================================= */}
      {complexToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#181614] border border-[#4d1f1f] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#381616] text-red-400 border border-[#5c2424] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">¿Eliminar Cuenta de Cliente?</h3>
                <p className="text-xs text-red-400 font-bold">{complexToDelete.name}</p>
              </div>
            </div>

            <p className="text-xs text-[#c8bfb7] leading-relaxed">
              Esta acción eliminará el complejo de la lista maestra de clientes y su configuración local. Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#25201a]">
              <button
                onClick={() => setComplexToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#221e1a] text-[#8e8c87] hover:text-white border border-[#332d26] text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Sí, Eliminar Cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
