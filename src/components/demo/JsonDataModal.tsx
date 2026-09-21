import React, { useState } from 'react';
import { X, Copy, Check, Download, Upload, RotateCcw, FileJson, AlertCircle } from 'lucide-react';
import { DemoState } from '../../types';
import { copyToClipboard } from '../../utils/clipboard';

interface JsonDataModalProps {
  isOpen: boolean;
  demoState: DemoState;
  onClose: () => void;
  onImportData: (newState: DemoState) => void;
  onResetData: () => void;
}

export const JsonDataModal: React.FC<JsonDataModalProps> = ({
  isOpen,
  demoState,
  onClose,
  onImportData,
  onResetData,
}) => {
  const [jsonText, setJsonText] = useState(
    JSON.stringify(demoState, null, 2)
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    copyToClipboard(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loomisuite_datos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApply = () => {
    setError(null);
    setSuccess(null);
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.properties || !Array.isArray(parsed.properties)) {
        throw new Error('El JSON debe contener un arreglo de "properties".');
      }
      onImportData(parsed);
      setSuccess('¡Datos importados y guardados en localStorage exitosamente!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(`Error al procesar el JSON: ${err.message || 'Formato no válido'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="bg-[#1c1b18] dark:bg-[#141414] text-white p-5 flex items-center justify-between border-b border-[#2e2a25] dark:border-[#222]">
          <div className="flex items-center gap-2.5">
            <FileJson className="w-5 h-5 text-[#d88d5e]" />
            <div>
              <h3 className="text-base font-bold font-['Outfit']">
                Administrador de Datos (JSON / LocalStorage)
              </h3>
              <p className="text-[11px] text-[#8e8c87]">
                Pega tus propios datos para cargarlos en la demo o exporta los actuales.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8e8c87] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Estructura de Datos en LocalStorage:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-semibold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-semibold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .json</span>
              </button>
            </div>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={14}
            className="w-full p-3 font-mono text-xs bg-zinc-900 text-emerald-400 rounded-xl border border-zinc-700 focus:outline-hidden focus:border-[#d88d5e]"
            placeholder="Pega aquí el JSON con tus propiedades y reservas..."
          />

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onResetData();
              onClose();
            }}
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Volver a los datos de muestra iniciales</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs font-semibold px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="text-xs font-bold px-4 py-2 bg-[#c46d45] hover:bg-[#b55e37] text-white rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Guardar y Cargar en la Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
