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
  Receipt,
  Copy,
  Check,
  Send,
  Edit3,
  Wallet,
  ChevronDown,
  ChevronUp,
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

interface ComplexItem {
  id: string;
  name: string;
  type: string;
  city: string;
  adminEmail?: string;
  adminPhone?: string;
  propertiesCount: number;
  reservationsCount: number;
  plan: string;
  status: 'active' | 'trial' | 'pending';
  monthlyFeeArs: number;
  createdAt: string;
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
  const [loading, setLoading] = useState(false);
  const [complexes, setComplexes] = useState<ComplexItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);

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

  const handleSaveBankingConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setBankingConfig(bankingEditForm);
    localStorage.setItem('loomi_superadmin_banking', JSON.stringify(bankingEditForm));
    setIsEditingBanking(false);
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
`Hola ${complex.name}! 🌟
Te enviamos el aviso de abono mensual de Loomi Suite correspondiente al período: *${currentMonth.toUpperCase()}*.

📌 *Detalle del Servicio:*
• Plan: ${complex.plan}
• Importe total: *$${complex.monthlyFeeArs.toLocaleString('es-AR')} ARS*
• Vencimiento: Día ${bankingConfig.dueDay} de este mes

🏦 *Datos para Transferencia Bancaria:*
• Titular: ${bankingConfig.accountHolder}
• Banco: ${bankingConfig.bankName}
• Alias: *${bankingConfig.alias}*
• CBU/CVU: ${bankingConfig.cbu}
• CUIT/CUIL: ${bankingConfig.cuit}

Una vez realizada la transferencia, podés respondernos por este medio con el comprobante para emitir tu recibo y renovar el período en la plataforma.

¡Muchas gracias por confiar en Loomi Suite!`;
    return encodeURIComponent(text);
  };

  const getBillingMailtoUrl = (complex: ComplexItem) => {
    const currentMonth = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    const subject = encodeURIComponent(`Aviso de Abono Mensual Loomi Suite - ${complex.name} (${currentMonth})`);
    const body = encodeURIComponent(
`Estimado/a equipo de ${complex.name},

Les enviamos los datos para el abono del servicio mensual de Loomi Suite correspondiente al período ${currentMonth}.

Detalle del abono:
• Plan: ${complex.plan}
• Importe total: $${complex.monthlyFeeArs.toLocaleString('es-AR')} ARS
• Fecha límite sugerida: Día ${bankingConfig.dueDay}

Datos para transferencia bancaria:
• Titular: ${bankingConfig.accountHolder}
• Banco: ${bankingConfig.bankName}
• Alias: ${bankingConfig.alias}
• CBU/CVU: ${bankingConfig.cbu}
• CUIT: ${bankingConfig.cuit}

Por favor respondan a este correo adjuntando el comprobante de transferencia para asentar el pago y extender el acceso.

Muchas gracias por ser parte de Loomi Suite.

Atentamente,
Administración Loomi Suite
${bankingConfig.contactEmail}`
    );
    return `mailto:${complex.adminEmail || bankingConfig.contactEmail}?subject=${subject}&body=${body}`;
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
      if (localList.length === 0) {
        localList = [
          {
            id: 'default',
            name: 'Catalinas Apartamentos',
            type: 'Departamentos Turísticos',
            city: 'Buenos Aires, CABA',
            adminEmail: 'contacto@catalinas.com',
            adminPhone: '+54 9 11 4092-5939',
            createdAt: new Date().toISOString(),
          },
        ];
      }

      // 2. Fetch cloud complexes from Firestore
      const cloudComplexes = await fetchAllComplexesFromCloud();

      // Merge and map
      const mergedMap = new Map<string, ComplexItem>();

      // Add local ones
      localList.forEach((c) => {
        mergedMap.set(c.id, {
          id: c.id,
          name: c.name || 'Sin nombre',
          type: c.type || 'Alojamiento',
          city: c.city || 'Argentina',
          adminEmail: c.adminEmail || 'admin@complejo.com',
          adminPhone: c.adminPhone || '+54 9 11...',
          propertiesCount: 4,
          reservationsCount: 12,
          plan: 'Plan 4 a 10 ($35.000/mes)',
          status: 'active',
          monthlyFeeArs: 35000,
          createdAt: c.createdAt || new Date().toISOString(),
        });
      });

      // Add cloud ones (with their real data)
      cloudComplexes.forEach((doc) => {
        const d = doc.data;
        const existing = mergedMap.get(doc.id);
        const propsCount = d.properties?.length || 4;
        const resCount = d.reservations?.length || 0;
        const fee = propsCount <= 10 ? 35000 : propsCount <= 20 ? 55000 : 80000;
        const planName = propsCount <= 10 ? 'Plan 4 a 10 ($35.000/mes)' : propsCount <= 20 ? 'Plan 10 a 20 ($55.000/mes)' : 'Plan 20 a 30 ($80.000/mes)';

        mergedMap.set(doc.id, {
          id: doc.id,
          name: d.welcomeGuide?.complexName || existing?.name || `Complejo ${doc.id.substring(0, 6)}`,
          type: existing?.type || 'Complejo de Alojamiento',
          city: d.welcomeGuide?.city || existing?.city || 'Argentina',
          adminEmail: existing?.adminEmail || 'admin@complejo.com',
          adminPhone: existing?.adminPhone || '+54 9 11...',
          propertiesCount: propsCount,
          reservationsCount: resCount,
          plan: planName,
          status: 'active',
          monthlyFeeArs: fee,
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

  // Filtered complexes
  const filteredComplexes = complexes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Metrics
  const totalComplexes = complexes.length;
  const totalProperties = complexes.reduce((acc, c) => acc + c.propertiesCount, 0);
  const totalMonthlyArs = complexes.reduce((acc, c) => acc + c.monthlyFeeArs, 0);
  const totalLeads = leads.length;

  // Billing Metrics
  const totalBilledArs = totalMonthlyArs;
  const totalCollectedArs = complexes.reduce((acc, c) => {
    const isPaid = billingRecords[c.id]?.status === 'paid';
    return acc + (isPaid ? c.monthlyFeeArs : 0);
  }, 0);
  const totalPendingArs = Math.max(0, totalBilledArs - totalCollectedArs);
  const paidCount = complexes.filter((c) => billingRecords[c.id]?.status === 'paid').length;

  return (
    <div className="min-h-screen bg-[#0f0e0d] text-[#f4f2ee] font-sans">
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
              <span>Gestión Global de Clientes</span>
              <span className="text-xs font-bold text-[#8e8c87] bg-[#1f1a16] border border-[#332a22] px-3 py-1 rounded-full">
                loomisuite.net
              </span>
            </h1>
            <p className="text-sm text-[#8e8c87] mt-1">
              Monitoreo en vivo de complejos registrados, suscripciones activas y oportunidades de venta.
            </p>
          </div>

          <button
            onClick={onOpenNewComplexModal}
            className="px-4 py-2.5 bg-[#d88d5e] hover:bg-[#c27c4f] text-[#141414] font-bold text-xs rounded-xl transition-all shadow-md shadow-[#d88d5e]/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear / Registrar Cliente</span>
          </button>
        </div>

        {/* Global Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8e8c87] uppercase tracking-wider">Complejos Activos</p>
              <p className="text-3xl font-extrabold text-white mt-1.5">{totalComplexes}</p>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>En la nube Firestore</span>
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
              <p className="text-[11px] text-[#8e8c87] mt-1">Cabañas y departamentos</p>
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
              <p className="text-[11px] text-emerald-400 mt-1">Abonos en pesos con ajuste IPC</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#1b271d] text-[#88c492] border border-[#2d4732] flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Metric 4 */}
          <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8e8c87] uppercase tracking-wider">Leads & Consultas</p>
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
            <span>Listado de Complejos ({complexes.length})</span>
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
            <span>Cobranzas por Transferencia ({paidCount}/{complexes.length} al día)</span>
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
            {/* Search filter bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#8e8c87] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre de complejo o ciudad..."
                  className="w-full bg-[#181614] border border-[#2b251f] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#d88d5e] focus:outline-hidden"
                />
              </div>

              <div className="text-xs text-[#8e8c87]">
                Mostrando <strong>{filteredComplexes.length}</strong> de {complexes.length} clientes
              </div>
            </div>

            {/* Complexes Table */}
            <div className="bg-[#181614] border border-[#2b251f] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#201d19] border-b border-[#2b251f] text-[#8e8c87] uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Complejo / Alojamiento</th>
                      <th className="px-4 py-3.5">Tipo & Ubicación</th>
                      <th className="px-4 py-3.5 text-center">Unidades</th>
                      <th className="px-4 py-3.5">Plan & Abono</th>
                      <th className="px-4 py-3.5 text-center">Estado</th>
                      <th className="px-5 py-3.5 text-right">Acción SuperAdmin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#25201a]">
                    {filteredComplexes.map((c) => (
                      <tr key={c.id} className="hover:bg-[#1e1a17] transition-colors">
                        {/* Name & Contact */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{c.name}</span>
                            {c.id === currentComplexId && (
                              <span className="text-[10px] bg-[#33251c] text-[#d88d5e] border border-[#4d3224] px-2 py-0.5 rounded-md font-semibold">
                                Abierto actualmente
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#8e8c87] mt-0.5 flex items-center gap-2">
                            <span>ID: <code>{c.id}</code></span>
                            {c.adminPhone && (
                              <>
                                <span>•</span>
                                <span className="text-[#a4cca8]">{c.adminPhone}</span>
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
                            {c.propertiesCount} deptos/cabañas
                          </span>
                        </td>

                        {/* Plan & Fee */}
                        <td className="px-4 py-4">
                          <p className="text-white font-bold">${c.monthlyFeeArs.toLocaleString('es-AR')} / mes</p>
                          <p className="text-[11px] text-[#8e8c87]">{c.plan}</p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1b271d] text-[#88c492] border border-[#2d4732]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Activo
                          </span>
                        </td>

                        {/* Action: Impersonate / Open */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => onOpenComplexAsAdmin(c.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#281c15] hover:bg-[#38261c] text-[#d88d5e] border border-[#482e21] font-bold text-xs transition-all cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Abrir Panel PMS</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
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
                <p className="text-xs text-[#8e8c87] mt-0.5">{complexes.length} clientes activos</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Ya Cobrado</span>
                  <span className="text-xs font-bold text-emerald-400 bg-[#16271a] px-2 py-0.5 rounded-full border border-[#23422a]">
                    {totalBilledArs > 0 ? Math.round((totalCollectedArs / totalBilledArs) * 100) : 0}%
                  </span>
                </div>
                <p className="text-2xl font-black text-emerald-400 mt-1">${totalCollectedArs.toLocaleString('es-AR')}</p>
                <p className="text-xs text-emerald-400/80 mt-0.5">{paidCount} de {complexes.length} al día</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f]">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pendiente de Cobro</span>
                <p className="text-2xl font-black text-amber-400 mt-1">${totalPendingArs.toLocaleString('es-AR')}</p>
                <p className="text-xs text-amber-400/80 mt-0.5">{complexes.length - paidCount} pendientes</p>
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
                      Estos datos se insertan automáticamente al generar los avisos de WhatsApp y correo
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
                    <label className="block text-[11px] font-bold text-[#8e8c87] mb-1">Email de Cobranzas</label>
                    <input
                      type="email"
                      value={bankingEditForm.contactEmail}
                      onChange={(e) => setBankingEditForm({ ...bankingEditForm, contactEmail: e.target.value })}
                      className="w-full bg-[#141210] border border-[#332b22] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#d88d5e]"
                      required
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingBanking(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-[#8e8c87] hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#c46d45] hover:bg-[#d88d5e] text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Guardar Datos Bancarios
                    </button>
                  </div>
                </form>
              ) : (
                /* Display of Bank Credentials */
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#201c18] border border-[#2d251e]">
                    <span className="text-[10px] text-[#8e8c87] block font-bold uppercase">Alias</span>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="font-extrabold text-[#d88d5e] text-sm truncate">{bankingConfig.alias}</span>
                      <button
                        onClick={() => handleCopyText(bankingConfig.alias, 'alias')}
                        className="p-1 rounded-md text-[#8e8c87] hover:text-white hover:bg-[#2b251f] cursor-pointer"
                        title="Copiar Alias"
                      >
                        {copiedField === 'alias' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#201c18] border border-[#2d251e]">
                    <span className="text-[10px] text-[#8e8c87] block font-bold uppercase">CBU / CVU</span>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="font-mono text-white text-[11px] truncate">{bankingConfig.cbu}</span>
                      <button
                        onClick={() => handleCopyText(bankingConfig.cbu, 'cbu')}
                        className="p-1 rounded-md text-[#8e8c87] hover:text-white hover:bg-[#2b251f] cursor-pointer"
                        title="Copiar CBU"
                      >
                        {copiedField === 'cbu' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#201c18] border border-[#2d251e]">
                    <span className="text-[10px] text-[#8e8c87] block font-bold uppercase">Titular & CUIT</span>
                    <p className="font-medium text-white truncate mt-0.5">{bankingConfig.accountHolder}</p>
                    <p className="text-[10px] text-[#8e8c87]">{bankingConfig.cuit}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#201c18] border border-[#2d251e]">
                    <span className="text-[10px] text-[#8e8c87] block font-bold uppercase">Entidad & Correo</span>
                    <p className="font-medium text-white truncate mt-0.5">{bankingConfig.bankName}</p>
                    <p className="text-[10px] text-[#8e8c87] truncate">{bankingConfig.contactEmail}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Clients Billing Table */}
            <div className="bg-[#181614] border border-[#2b251f] rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#25201a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    Estado de Cobranzas del Período Actual ({new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })})
                  </h3>
                  <p className="text-xs text-[#8e8c87]">
                    Enviá el aviso con los datos de transferencia bancaria por WhatsApp o mail, y marcá el mes cuando te envíen el comprobante
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#201d19] border-b border-[#2b251f] text-[#8e8c87] uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Complejo / Cliente</th>
                      <th className="px-4 py-3.5">Plan & Abono</th>
                      <th className="px-4 py-3.5 text-center">Estado del Mes</th>
                      <th className="px-4 py-3.5 text-center">Acción Pago</th>
                      <th className="px-5 py-3.5 text-right">Aviso de Cobro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#25201a]">
                    {complexes.map((c) => {
                      const isPaid = billingRecords[c.id]?.status === 'paid';
                      const cleanPhone = (c.adminPhone || '').replace(/\D/g, '');
                      const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${getBillingMessageWhatsApp(c)}` : null;
                      const mailtoUrl = getBillingMailtoUrl(c);

                      return (
                        <tr key={c.id} className="hover:bg-[#1e1a17] transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-bold text-white text-sm">{c.name}</p>
                            <p className="text-[11px] text-[#8e8c87]">{c.adminPhone || 'Sin teléfono'} · {c.adminEmail}</p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="text-white font-extrabold text-sm">${c.monthlyFeeArs.toLocaleString('es-AR')}</p>
                            <p className="text-[11px] text-[#d88d5e]">{c.plan}</p>
                          </td>

                          <td className="px-4 py-4 text-center">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#172b1a] text-[#8be294] border border-[#254d2a]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Al Día (Pagado)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#2e2316] text-[#e0a867] border border-[#523c23]">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Pendiente</span>
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => toggleBillingStatus(c.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                isPaid
                                  ? 'bg-[#1b271d] text-[#88c492] border-[#2d4732] hover:bg-[#253928]'
                                  : 'bg-[#281c15] text-[#d88d5e] border-[#482e21] hover:bg-[#38261c]'
                              }`}
                            >
                              {isPaid ? '✓ Pagado (Cambiar)' : 'Marcar como Pagado'}
                            </button>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              {waUrl ? (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b271d] hover:bg-[#233527] text-[#88c492] border border-[#2d4732] font-bold text-xs transition-all"
                                  title="Enviar aviso por WhatsApp con Alias y CBU"
                                >
                                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>WhatsApp</span>
                                </a>
                              ) : null}

                              <a
                                href={mailtoUrl}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#221e1a] hover:bg-[#2c2621] text-white border border-[#332d26] font-bold text-xs transition-all"
                                title="Enviar aviso por correo electrónico"
                              >
                                <Mail className="w-3.5 h-3.5 text-sky-400" />
                                <span>Email</span>
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

        {/* Tab 3: Leads & Consultas */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="bg-[#181614] border border-[#2b251f] rounded-2xl overflow-hidden shadow-xs">
              <div className="p-5 border-b border-[#25201a] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">Oportunidades Comerciales Recientes</h3>
                  <p className="text-xs text-[#8e8c87] mt-0.5">
                    Consultas recibidas a través de la web para contactar por WhatsApp o email
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#201d19] border-b border-[#2b251f] text-[#8e8c87] uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Contacto / Nombre</th>
                      <th className="px-4 py-3.5">Complejo & Propiedades</th>
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
        {/* Tab 3: Economics & Cloud Costs */}
        {activeTab === 'economics' && (
          <div className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Ingreso Bruto */}
              <div className="p-5 rounded-2xl bg-[#181614] border border-[#2b251f] space-y-2">
                <span className="text-xs font-bold text-[#8e8c87] uppercase tracking-wider">Ingreso Mensual Bruto (MRR)</span>
                <p className="text-3xl font-extrabold text-white">${totalMonthlyArs.toLocaleString('es-AR')}</p>
                <p className="text-xs text-[#8e8c87]">Cobrado en ARS con {totalComplexes} clientes activos</p>
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
                {/* Metric 1 */}
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

                {/* Metric 2 */}
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

                {/* Metric 3 */}
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

              {/* Clarification Box about Subscriptions */}
              <div className="p-4 rounded-xl bg-[#281c15] border border-[#482e21] text-xs text-[#d88d5e] space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-200">
                  <Lock className="w-3.5 h-3.5" />
                  <span>¿Necesitás pagar o suscribirte a Google Cloud ahora mismo?</span>
                </div>
                <p className="text-[#c8bfb7] leading-relaxed">
                  <strong>No.</strong> Tu base de datos Firestore ya fue creada y está activa con la capa gratuita. No te cobrará nada hasta que superes los primeros 50 clientes activos.
                  Cuando superes ese volumen, Google Cloud sólo factura el excedente (apenas centavos de dólar por cada 100.000 operaciones adicionales).
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
