import React, { useState } from 'react';
import {
  Save,
  Wifi,
  MapPin,
  Clock,
  Flame,
  QrCode,
  Share2,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Smartphone,
  Sparkles,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { WelcomeGuideData } from '../../types';

interface AdminGuideEditorProps {
  guideData: WelcomeGuideData;
  onSave: (updatedData: WelcomeGuideData) => void;
}

export const AdminGuideEditor: React.FC<AdminGuideEditorProps> = ({
  guideData,
  onSave,
}) => {
  const [formData, setFormData] = useState<WelcomeGuideData>(guideData);
  const [activeSection, setActiveSection] = useState<'general' | 'transport' | 'attractions' | 'dining' | 'directBooking' | 'qr'>('general');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleGeneralChange = (field: keyof WelcomeGuideData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBookingSettingsChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      directBookingSettings: {
        ...prev.directBookingSettings,
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const publicUrl = `https://woodcabiniguazu.com.ar/bienvenida.html`;

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Admin Header */}
      <div className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Panel de Control de Fernando • Los Bananos Wood Cabin</span>
          </div>
          <h2 className="text-xl font-bold font-['Outfit']">
            Editor de la Guía de Bienvenida & Portal del Huésped
          </h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-xl">
            Modifica aquí la clave de WiFi, precios de leña, traslados y excursiones. Los cambios se actualizan en vivo en el celular de tus huéspedes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyPublicUrl}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Link'}</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? '¡Guardado con Éxito!' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>

      {/* Editor Sub-navigation Tabs */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-xs font-medium scrollbar-none">
        <button
          onClick={() => setActiveSection('general')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'general'
              ? 'bg-zinc-900 text-white font-bold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          ⚙️ Datos Básicos & WiFi
        </button>

        <button
          onClick={() => setActiveSection('transport')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'transport'
              ? 'bg-zinc-900 text-white font-bold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          🚗 Cómo Llegar & Remises
        </button>

        <button
          onClick={() => setActiveSection('attractions')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'attractions'
              ? 'bg-zinc-900 text-white font-bold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          🌊 Cataratas & Excursiones
        </button>

        <button
          onClick={() => setActiveSection('dining')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'dining'
              ? 'bg-zinc-900 text-white font-bold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          🍽️ Restaurantes & Deliveries
        </button>

        <button
          onClick={() => setActiveSection('directBooking')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'directBooking'
              ? 'bg-zinc-900 text-white font-bold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          💳 Motor de Reservas & CBU
        </button>

        <button
          onClick={() => setActiveSection('qr')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'qr'
              ? 'bg-zinc-900 text-white font-bold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          📱 QR para Imprimir
        </button>
      </div>

      {/* Editor Body */}
      <div className="p-6">
        {/* SECTION 1: GENERAL & WIFI */}
        {activeSection === 'general' && (
          <div className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Nombre del Establecimiento
                </label>
                <input
                  type="text"
                  value={formData.propertyName}
                  onChange={(e) => handleGeneralChange('propertyName', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Subtítulo / Bajada
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleGeneralChange('tagline', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Nombre del Anfitrión
                </label>
                <input
                  type="text"
                  value={formData.hostName}
                  onChange={(e) => handleGeneralChange('hostName', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  WhatsApp del Anfitrión (con código de país)
                </label>
                <input
                  type="text"
                  value={formData.hostPhone}
                  onChange={(e) => handleGeneralChange('hostPhone', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="border-t border-zinc-200 pt-5">
              <h3 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-rose-600" />
                <span>Configuración de WiFi & Servicios</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Nombre de Red WiFi (SSID)
                  </label>
                  <input
                    type="text"
                    value={formData.wifiNetwork}
                    onChange={(e) => handleGeneralChange('wifiNetwork', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Clave de WiFi
                  </label>
                  <input
                    type="text"
                    value={formData.wifiPassword}
                    onChange={(e) => handleGeneralChange('wifiPassword', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Horario de Check-out
                  </label>
                  <input
                    type="text"
                    value={formData.checkoutHour}
                    onChange={(e) => handleGeneralChange('checkoutHour', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Horario de Piscina
                  </label>
                  <input
                    type="text"
                    value={formData.poolHours}
                    onChange={(e) => handleGeneralChange('poolHours', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Precio Bolsa de Leña / Carbón
                  </label>
                  <input
                    type="text"
                    value={formData.woodBagPrice}
                    onChange={(e) => handleGeneralChange('woodBagPrice', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Dirección Física / Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.locationAddress}
                    onChange={(e) => handleGeneralChange('locationAddress', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Aviso Especial o Mensaje de Bienvenida del Día
                </label>
                <textarea
                  rows={2}
                  value={formData.specialAnnouncement || ''}
                  onChange={(e) => handleGeneralChange('specialAnnouncement', e.target.value)}
                  placeholder="Ej: Bienvenidos a Los Bananos. Hoy la pileta abre a las 10:00 por limpieza matinal..."
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: TRANSPORTATION */}
        {activeSection === 'transport' && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Modos de Llegar, Remises y Colectivos
                </h3>
                <p className="text-xs text-zinc-500">
                  Agrega o edita los traslados desde aeropuerto, terminal o en auto con tarifas orientativas.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {formData.transportation.map((trans, idx) => (
                <div key={trans.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-700">Opción #{idx + 1}</span>
                    <button
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          transportation: prev.transportation.filter((t) => t.id !== trans.id),
                        }));
                      }}
                      className="text-xs text-red-500 hover:text-red-700 p-1"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Título</label>
                      <input
                        type="text"
                        value={trans.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            transportation: prev.transportation.map((t) =>
                              t.id === trans.id ? { ...t, title: val } : t
                            ),
                          }));
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-zinc-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Costo Estimado / Tarifa</label>
                      <input
                        type="text"
                        value={trans.estimatedCost || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            transportation: prev.transportation.map((t) =>
                              t.id === trans.id ? { ...t, estimatedCost: val } : t
                            ),
                          }));
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-zinc-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Instrucciones Detalladas</label>
                    <textarea
                      rows={2}
                      value={trans.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          transportation: prev.transportation.map((t) =>
                            t.id === trans.id ? { ...t, description: val } : t
                          ),
                        }));
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-300 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: ATTRACTIONS */}
        {activeSection === 'attractions' && (
          <div className="space-y-4 max-w-3xl">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Atracciones Locales & Recomendaciones de Cataratas
              </h3>
              <p className="text-xs text-zinc-500">
                Los huéspedes agradecen enormemente saber cómo evitar filas y comprar la entrada oficial.
              </p>
            </div>

            <div className="space-y-3">
              {formData.attractions.map((att) => (
                <div key={att.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800">{att.title}</span>
                    <span className="text-[11px] text-zinc-500">{att.distanceMinutes} min de viaje</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Descripción</label>
                    <textarea
                      rows={2}
                      value={att.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          attractions: prev.attractions.map((a) =>
                            a.id === att.id ? { ...a, description: val } : a
                          ),
                        }));
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Tip Clave del Anfitrión</label>
                    <input
                      type="text"
                      value={att.tips}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          attractions: prev.attractions.map((a) =>
                            a.id === att.id ? { ...a, tips: val } : a
                          ),
                        }));
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-300 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: DINING */}
        {activeSection === 'dining' && (
          <div className="space-y-4 max-w-3xl">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Gastronomía, Parrillas & Deliveries
              </h3>
              <p className="text-xs text-zinc-500">
                Recomienda tus lugares favoritos y deliveries que llegan hasta la tranquera de Wood Cabin.
              </p>
            </div>

            <div className="space-y-3">
              {formData.dining.map((din) => (
                <div key={din.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900">{din.name}</span>
                    <span className="text-xs font-mono font-bold text-zinc-600">{din.priceRange}</span>
                  </div>
                  <input
                    type="text"
                    value={din.specialty}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        dining: prev.dining.map((d) =>
                          d.id === din.id ? { ...d, specialty: val } : d
                        ),
                      }));
                    }}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-300 bg-white"
                    placeholder="Especialidad"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: DIRECT BOOKING SETTINGS */}
        {activeSection === 'directBooking' && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Configuración de Cobros y Reservas Directas</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Datos bancarios para recibir la seña del 50% directo a tu cuenta sin comisiones de Booking ni Airbnb.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 p-4 bg-gradient-to-r from-stone-50 to-amber-50/40 border border-amber-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌐</span>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">Dominio Propio para Motor Directo & Guía</h4>
                      <p className="text-[11px] text-zinc-500">
                        Opcional: el cliente abona su propio dominio (ej: en Nic.ar o DonWeb ~$10 USD/año) y Loomi lo vincula gratis con SSL automático.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold shrink-0 border border-emerald-300">
                    ● Conectado (SSL Activo)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Nombre del Dominio (.com / .com.ar)
                    </label>
                    <div className="flex items-center gap-1.5 bg-white border border-zinc-300 rounded-xl px-2.5 py-1.5">
                      <span className="text-xs text-zinc-400 font-mono">https://</span>
                      <input
                        type="text"
                        value={formData.directBookingSettings.customDomain || 'woodcabiniguazu.com.ar'}
                        onChange={(e) => handleBookingSettingsChange('customDomain', e.target.value)}
                        className="flex-1 text-xs font-mono font-bold text-zinc-900 outline-none"
                        placeholder="tudominio.com.ar"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Registro DNS CNAME de Loomi Suite
                    </label>
                    <div className="flex items-center justify-between bg-zinc-100 border border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-mono text-zinc-700">
                      <span>cname.loomisuite.com</span>
                      <span className="text-[10px] text-zinc-400 font-sans">Apunta aquí</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-600 bg-white/70 p-2.5 rounded-xl border border-zinc-200">
                  <span>
                    ✓ Certificado de seguridad <strong>Let's Encrypt SSL</strong> renovado automáticamente.
                  </span>
                  <a
                    href="https://woodcabiniguazu.com.ar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <span>Probar dominio en vivo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Alias Bancario / Mercado Pago
                </label>
                <input
                  type="text"
                  value={formData.directBookingSettings.bankAlias}
                  onChange={(e) => handleBookingSettingsChange('bankAlias', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  CBU / CVU (22 dígitos)
                </label>
                <input
                  type="text"
                  value={formData.directBookingSettings.cbu}
                  onChange={(e) => handleBookingSettingsChange('cbu', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Banco / Entidad
                </label>
                <input
                  type="text"
                  value={formData.directBookingSettings.bankName}
                  onChange={(e) => handleBookingSettingsChange('bankName', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Titular de la Cuenta
                </label>
                <input
                  type="text"
                  value={formData.directBookingSettings.accountHolder}
                  onChange={(e) => handleBookingSettingsChange('accountHolder', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Porcentaje de Seña Requerido (%)
                </label>
                <input
                  type="number"
                  value={formData.directBookingSettings.depositPercentage}
                  onChange={(e) => handleBookingSettingsChange('depositPercentage', parseInt(e.target.value, 10))}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Descuento por Reserva Directa (%)
                </label>
                <input
                  type="number"
                  value={formData.directBookingSettings.directDiscountPercent}
                  onChange={(e) => handleBookingSettingsChange('directDiscountPercent', parseInt(e.target.value, 10))}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: QR CODE TO PRINT */}
        {activeSection === 'qr' && (
          <div className="space-y-6 max-w-xl text-center mx-auto py-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Cartel con Código QR para la Cabaña
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Imprime este código y colócalo en el llavero de la cabaña, en el quincho o en el cuadro de la entrada. El huésped escanea con la cámara de su celular y accede al instante.
              </p>
            </div>

            <div className="p-8 bg-stone-900 text-white rounded-3xl inline-block shadow-2xl border-4 border-amber-500/40">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-extrabold text-xl mx-auto mb-3">
                W
              </div>
              <h4 className="font-extrabold text-lg text-white font-['Outfit']">
                {formData.propertyName}
              </h4>
              <p className="text-xs text-amber-400 font-medium">Escanea para WiFi, Cómo Llegar y Paseos</p>

              {/* Simulated QR Code Graphic */}
              <div className="my-6 p-4 bg-white rounded-2xl mx-auto w-48 h-48 flex flex-col items-center justify-center border-2 border-stone-700 shadow-inner">
                <QrCode className="w-36 h-36 text-stone-900" />
                <span className="text-[9px] font-mono text-zinc-600 mt-1 font-bold">woodcabiniguazu.com.ar</span>
              </div>

              <div className="text-xs space-y-1 text-stone-300">
                <div>Red WiFi: <strong className="text-white font-mono">{formData.wifiNetwork}</strong></div>
                <div>Clave: <strong className="text-amber-400 font-mono">{formData.wifiPassword}</strong></div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                🖨️ Imprimir Cartel para Cabaña
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
