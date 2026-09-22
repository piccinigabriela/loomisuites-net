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
  const [activeTab, setActiveTab] = useState<'complexes' | 'leads' | 'settings'>('complexes');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [complexes, setComplexes] = useState<ComplexItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);

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
        <div className="flex items-center gap-2 border-b border-[#25201a] pb-2">
          <button
            onClick={() => setActiveTab('complexes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'complexes'
                ? 'bg-[#281c15] text-[#d88d5e] border border-[#482e21]'
                : 'text-[#8e8c87] hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Listado de Complejos / Clientes ({complexes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'leads'
                ? 'bg-[#281c15] text-[#d88d5e] border border-[#482e21]'
                : 'text-[#8e8c87] hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Oportunidades & Leads Web ({leads.length})</span>
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

        {/* Tab 2: Leads & Consultas */}
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
      </main>
    </div>
  );
};
