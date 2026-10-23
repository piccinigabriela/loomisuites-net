import React, { useEffect, useState } from 'react';
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
import QRCode from 'qrcode';
import { WelcomeGuideData } from '../../types';
import { isAppMode } from '../../lib/appMode';

interface AdminGuideEditorProps {
  guideData: WelcomeGuideData;
  onSave: (updatedData: WelcomeGuideData) => void;
  /** Link real de la guía (sin unidad). Para una unidad se le agrega /{id}. */
  guideUrl?: string;
  /** Unidades, para imprimir el cartel QR de cada una (con su wifi) */
  units?: Array<{ id: string; name: string; wifiNetwork?: string; wifiPassword?: string }>;
}

export const AdminGuideEditor: React.FC<AdminGuideEditorProps> = ({
  guideData,
  onSave,
  guideUrl,
  units = [],
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

  const publicUrl = guideUrl || (typeof window !== 'undefined' ? `${window.location.origin}/guia` : 'https://app.loomisuite.net/guia');

  // Cartel QR: de la guía general o de una unidad (con su wifi). QR real, generado en el navegador.
  const [qrUnitId, setQrUnitId] = useState('');
  const qrUnit = units.find((u) => u.id === qrUnitId);
  const qrUrl = qrUnit ? `${publicUrl}/${qrUnit.id}` : publicUrl;
  const qrWifi = qrUnit?.wifiNetwork || formData.wifiNetwork;
  const qrPass = qrUnit?.wifiNetwork ? qrUnit.wifiPassword : formData.wifiPassword;
  const [qrImage, setQrImage] = useState('');
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(qrUrl, { width: 480, margin: 1, errorCorrectionLevel: 'M' })
      .then((data) => alive && setQrImage(data))
      .catch(() => alive && setQrImage(''));
    return () => {
      alive = false;
    };
  }, [qrUrl]);

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
      {/* Admin Header */}
      <div className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Panel de Administración • {formData.propertyName || 'Mi Complejo'}</span>
          </div>
          <h2 className="text-xl font-bold font-['Outfit']">
            Editor de la Guía de Bienvenida & Portal del Huésped
          </h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-xl">
            Modifica aquí la clave de WiFi, normas, traslados, recomendaciones locales y datos bancarios para reservas directas. Los cambios se actualizan en vivo en el celular de tus huéspedes.
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
      <div className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700 px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-xs font-medium scrollbar-none">
        <button
          onClick={() => setActiveSection('general')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'general'
              ? 'bg-zinc-900 text-white font-bold dark:bg-white dark:text-zinc-900'
              : 'text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          ⚙️ Datos Básicos & WiFi
        </button>

        <button
          onClick={() => setActiveSection('transport')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'transport'
              ? 'bg-zinc-900 text-white font-bold dark:bg-white dark:text-zinc-900'
              : 'text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          🚗 Cómo Llegar & Remises
        </button>

        <button
          onClick={() => setActiveSection('attractions')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'attractions'
              ? 'bg-zinc-900 text-white font-bold dark:bg-white dark:text-zinc-900'
              : 'text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          ✨ Atracciones & Paseos
        </button>

        <button
          onClick={() => setActiveSection('dining')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'dining'
              ? 'bg-zinc-900 text-white font-bold dark:bg-white dark:text-zinc-900'
              : 'text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          🛍️ Despensa & Proveeduría
        </button>

        <button
          onClick={() => setActiveSection('directBooking')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'directBooking'
              ? 'bg-zinc-900 text-white font-bold dark:bg-white dark:text-zinc-900'
              : 'text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          💳 Pagos & CBU
        </button>

        <button
          onClick={() => setActiveSection('qr')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'qr'
              ? 'bg-zinc-900 text-white font-bold dark:bg-white dark:text-zinc-900'
              : 'text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white'
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
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                  Nombre del Establecimiento
                </label>
                <input
                  type="text"
                  value={formData.propertyName}
                  onChange={(e) => handleGeneralChange('propertyName', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                  Subtítulo / Bajada
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleGeneralChange('tagline', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                  Nombre del Anfitrión
                </label>
                <input
                  type="text"
                  value={formData.hostName}
                  onChange={(e) => handleGeneralChange('hostName', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                  WhatsApp del Anfitrión (con código de país)
                </label>
                <input
                  type="text"
                  value={formData.hostPhone}
                  onChange={(e) => handleGeneralChange('hostPhone', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-5">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-rose-600" />
                <span>Configuración de WiFi & Servicios</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                    Nombre de Red WiFi (SSID)
                  </label>
                  <input
                    type="text"
                    value={formData.wifiNetwork}
                    onChange={(e) => handleGeneralChange('wifiNetwork', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden font-mono bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                    Clave de WiFi
                  </label>
                  <input
                    type="text"
                    value={formData.wifiPassword}
                    onChange={(e) => handleGeneralChange('wifiPassword', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden font-mono bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                    Horario de Check-in (ingreso)
                  </label>
                  <input
                    type="text"
                    value={formData.checkinHour || ''}
                    placeholder="Ej: 14:00 hs"
                    onChange={(e) => handleGeneralChange('checkinHour', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                    Horario de Check-out
                  </label>
                  <input
                    type="text"
                    value={formData.checkoutHour}
                    onChange={(e) => handleGeneralChange('checkoutHour', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                  />
                </div>

                {!isAppMode() && (
                <>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                    Horario de Piscina
                  </label>
                  <input
                    type="text"
                    value={formData.poolHours}
                    onChange={(e) => handleGeneralChange('poolHours', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                    Precio Bolsa de Leña / Carbón
                  </label>
                  <input
                    type="text"
                    value={formData.woodBagPrice}
                    onChange={(e) => handleGeneralChange('woodBagPrice', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                  />
                </div>
                </>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                    Dirección Física / Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.locationAddress}
                    onChange={(e) => handleGeneralChange('locationAddress', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30 space-y-2">
                <label className="block text-xs font-bold text-zinc-900 dark:text-white">
                  🔑 ¿Cómo es el ingreso? (instrucciones de llegada)
                </label>
                <p className="text-[11px] text-zinc-800 dark:text-zinc-100">
                  Se muestra destacado en la guía del huésped y se agrega a los mensajes de confirmación y del día de llegada.
                </p>
                <textarea
                  rows={3}
                  value={formData.arrivalInstructions || ''}
                  onChange={(e) => handleGeneralChange('arrivalInstructions', e.target.value)}
                  placeholder="Ej: Al llegar, anunciate en Tres Sargentos 431 (la casa de al lado). Ahí te entregan las llaves y te acompañan al departamento."
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
                <label className="block text-xs font-bold text-zinc-900 dark:text-white">In English (opcional, para huéspedes que no hablan español)</label>
                <textarea
                  rows={3}
                  value={formData.arrivalInstructionsEn || ''}
                  onChange={(e) => handleGeneralChange('arrivalInstructionsEn', e.target.value)}
                  placeholder="E.g.: When you arrive, please check in at Tres Sargentos 431 (the house next door). They will give you the keys and take you to the apartment."
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>

              <div className="mt-4 p-3 rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30 space-y-2">
                <label className="block text-xs font-bold text-zinc-900 dark:text-white">
                  ⭐ Link para reseña en Google
                </label>
                <p className="text-[11px] text-zinc-800 dark:text-zinc-100">
                  Se agrega al mensaje de despedida. En Google Maps buscá tu complejo, tocá "Compartir" o "Pedir reseñas" y pegá el link acá. Si lo dejás vacío, el mensaje sale sin esa línea.
                </p>
                <input
                  type="url"
                  value={formData.googleReviewUrl || ''}
                  onChange={(e) => handleGeneralChange('googleReviewUrl', e.target.value)}
                  placeholder="https://g.page/r/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                  Aviso Especial o Mensaje de Bienvenida del Día
                </label>
                <textarea
                  rows={2}
                  value={formData.specialAnnouncement || ''}
                  onChange={(e) => handleGeneralChange('specialAnnouncement', e.target.value)}
                  placeholder="Ej: Bienvenidos a nuestro complejo. El check-out es a las 10:00 AM..."
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:outline-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
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
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Modos de Llegar, Remises y Colectivos
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-200">
                  Agrega o edita los traslados desde aeropuerto, terminal o en auto con tarifas orientativas.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {formData.transportation.map((trans, idx) => (
                <div key={trans.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-100">Opción #{idx + 1}</span>
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
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-200 mb-1">Título</label>
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
                        className="w-full text-xs p-2 rounded-lg border border-zinc-300 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-200 mb-1">Costo Estimado / Tarifa</label>
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
                        className="w-full text-xs p-2 rounded-lg border border-zinc-300 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-200 mb-1">Instrucciones Detalladas</label>
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
                      className="w-full text-xs p-2 rounded-lg border border-zinc-300 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
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
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Atracciones Locales & Recomendaciones de Paseos
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-200">
                Recomendá los mejores lugares turísticos y cómo conseguir entradas oficiales de forma directa.
              </p>
            </div>

            <div className="space-y-3">
              {formData.attractions.map((att) => (
                <div key={att.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{att.title}</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-200">{att.distanceMinutes} min de viaje</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-200 mb-1">Descripción</label>
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
                      className="w-full text-xs p-2 rounded-lg border border-zinc-300 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-200 mb-1">Tip Clave del Anfitrión</label>
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
                      className="w-full text-xs p-2 rounded-lg border border-zinc-300 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
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
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Proveeduría, Despensa & Minimercados
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-200">
                Detallá dónde pueden abastecerse de insumos básicos o alimentos para cocinar en su unidad, o la proveeduría interna del complejo.
              </p>
            </div>

            <div className="space-y-3">
              {formData.dining.map((din) => (
                <div key={din.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900 dark:text-white">{din.name}</span>
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
                    className="w-full text-xs p-2 rounded-lg border border-zinc-300 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                    placeholder="Descripción del comercio, cercanía o insumos disponibles"
                  />
                  <input
                    type="text"
                    value={din.address}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        dining: prev.dining.map((d) =>
                          d.id === din.id ? { ...d, address: val } : d
                        ),
                      }));
                    }}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-300 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                    placeholder="Ubicación o dirección"
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
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Configuración de Cobros y Reservas Directas</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-200 mt-0.5">
                Datos bancarios para recibir la seña del 50% directo a tu cuenta sin comisiones de Booking ni Airbnb.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                  Alias Bancario / CBU / CVU (para señas)
                </label>
                <input
                  type="text"
                  value={formData.directBookingSettings.bankAlias}
                  onChange={(e) => handleBookingSettingsChange('bankAlias', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 font-mono uppercase bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                  CBU / CVU (22 dígitos)
                </label>
                <input
                  type="text"
                  value={formData.directBookingSettings.cbu}
                  onChange={(e) => handleBookingSettingsChange('cbu', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 font-mono bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                  Banco / Entidad
                </label>
                <input
                  type="text"
                  value={formData.directBookingSettings.bankName}
                  onChange={(e) => handleBookingSettingsChange('bankName', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                  Titular de la Cuenta
                </label>
                <input
                  type="text"
                  value={formData.directBookingSettings.accountHolder}
                  onChange={(e) => handleBookingSettingsChange('accountHolder', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>

              {/* Guest Payment Gateways: Mercado Pago & PayPal */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                  Pasarelas de Cobro para tus Huéspedes (Opcional)
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-200 mt-0.5">
                  Tus huéspedes te pagan directo a tu cuenta sin intermediarios. Podés pegar tu link de cobro de Mercado Pago, PayPal o Payoneer:
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1 flex items-center justify-between">
                  <span>Link de Cobro / Checkout Mercado Pago</span>
                  <span className="text-[10px] text-sky-600 dark:text-sky-300 font-normal">Para cobrar con tarjeta o dinero en cuenta</span>
                </label>
                <input
                  type="url"
                  placeholder="https://link.mercadopago.com.ar/tucomplejo"
                  value={formData.directBookingSettings.mercadoPagoLink || ''}
                  onChange={(e) => handleBookingSettingsChange('mercadoPagoLink', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 font-mono bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1 flex items-center justify-between">
                  <span>Link de Cobro PayPal (PayPal.me)</span>
                  <span className="text-[10px] text-blue-600 dark:text-sky-300 font-normal">Para turistas extranjeros</span>
                </label>
                <input
                  type="url"
                  placeholder="https://paypal.me/tucomplejo"
                  value={formData.directBookingSettings.paypalLink || ''}
                  onChange={(e) => handleBookingSettingsChange('paypalLink', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 font-mono bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1 flex items-center justify-between">
                  <span>Link de Cobro Payoneer</span>
                  <span className="text-[10px] text-blue-600 dark:text-sky-300 font-normal">Para cobros del exterior</span>
                </label>
                <input
                  type="url"
                  placeholder="Pegá el link de pago que te genera Payoneer"
                  value={formData.directBookingSettings.payoneerLink || ''}
                  onChange={(e) => handleBookingSettingsChange('payoneerLink', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 font-mono bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                  Porcentaje de Seña Requerido (%)
                </label>
                <input
                  type="number"
                  value={formData.directBookingSettings.depositPercentage}
                  onChange={(e) => handleBookingSettingsChange('depositPercentage', parseInt(e.target.value, 10))}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-100 mb-1">
                  Descuento por Reserva Directa (%)
                </label>
                <input
                  type="number"
                  value={formData.directBookingSettings.directDiscountPercent}
                  onChange={(e) => handleBookingSettingsChange('directDiscountPercent', parseInt(e.target.value, 10))}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 dark:border-zinc-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: QR CODE TO PRINT */}
        {activeSection === 'qr' && (
          <div className="space-y-6 max-w-xl text-center mx-auto py-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Cartel con Código QR para la Cabaña
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-200 mt-1">
                Imprime este código y colócalo en el llavero de la cabaña, en la mesa ratona o en el marco de la entrada. El huésped escanea con la cámara de su celular y accede al instante.
              </p>
            </div>

            {units.length > 0 && (
              <label className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                Cartel para:
                <select
                  value={qrUnitId}
                  onChange={(e) => setQrUnitId(e.target.value)}
                  className="text-sm font-semibold p-2 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white cursor-pointer"
                >
                  <option value="">Guía general</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="p-8 bg-stone-900 text-white rounded-3xl inline-block shadow-2xl border-4 border-amber-500/40">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-extrabold text-xl mx-auto mb-3">
                {(formData.propertyName || 'L').trim().charAt(0).toUpperCase()}
              </div>
              <h4 className="font-extrabold text-lg text-white font-['Outfit']">
                {formData.propertyName}
              </h4>
              {qrUnit && <p className="text-sm font-bold text-white">{qrUnit.name}</p>}
              <p className="text-xs text-amber-300 font-semibold">Escaneá para ver WiFi, cómo llegar y paseos</p>

              <div className="my-6 p-3 bg-white rounded-2xl mx-auto w-52 flex flex-col items-center justify-center border-2 border-stone-700 shadow-inner">
                {qrImage ? <img src={qrImage} alt="Código QR de la guía" className="w-full h-auto" /> : <QrCode className="w-36 h-36 text-stone-900" />}
              </div>

              {qrWifi && (
                <div className="text-sm space-y-1 text-stone-100">
                  <div>
                    Red WiFi: <strong className="text-white font-mono">{qrWifi}</strong>
                  </div>
                  {qrPass && (
                    <div>
                      Clave: <strong className="text-amber-300 font-mono">{qrPass}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-sm font-semibold text-zinc-900 dark:text-white break-all">{qrUrl.replace(/^https?:\/\//, '')}</p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-colors"
              >
                🖨️ Imprimir Cartel del Complejo / Unidad
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
