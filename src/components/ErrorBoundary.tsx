import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, showDetails: false, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleSoftReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleFullReset = () => {
    try {
      localStorage.removeItem('loomi_pms_demo_state');
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = window.location.pathname;
  };

  private handleCopyError = () => {
    const errorText = `${this.state.error?.name || 'Error'}: ${this.state.error?.message || 'Unknown'}\n\nStack:\n${this.state.error?.stack || ''}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || ''}`;
    navigator.clipboard.writeText(errorText);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2500);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#141414] text-[#f4f2ee] p-4 sm:p-6 font-sans">
          <div className="max-w-lg w-full bg-[#1c1c1c] rounded-2xl p-6 border border-[#2e2e2e] shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-800/40 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">Detalle de Procesamiento</h2>
              <p className="text-xs text-[#a09d96]">
                Ocurrió un detalle al renderizar la vista. Podés recargar la interfaz o restablecer el estado.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 text-left">
                <p className="text-[11px] font-mono text-red-400 break-words font-semibold">
                  {this.state.error.name}: {this.state.error.message}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                onClick={this.handleSoftReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#d88d5e] hover:bg-[#c27c4f] text-[#141414] text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-98"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar Vista</span>
              </button>

              <button
                onClick={this.handleFullReset}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2a2a2a] hover:bg-[#333333] text-[#e0deda] text-xs font-bold transition-all cursor-pointer border border-[#3d3d3d]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restablecer Datos</span>
              </button>
            </div>

            {/* Diagnostic Details Toggle */}
            <div className="pt-2 border-t border-[#2a2a2a] text-left">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] text-[#8e8c87] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{this.state.showDetails ? 'Ocultar reporte técnico' : 'Ver reporte técnico'}</span>
                </button>

                {this.state.showDetails && (
                  <button
                    onClick={this.handleCopyError}
                    className="text-[10px] text-[#d88d5e] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {this.state.copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{this.state.copied ? '¡Copiado!' : 'Copiar error'}</span>
                  </button>
                )}
              </div>

              {this.state.showDetails && (
                <div className="mt-2.5 bg-black/60 border border-[#2c2c2c] rounded-lg p-3 max-h-48 overflow-y-auto text-[10px] font-mono text-zinc-400 space-y-2 select-text">
                  <div>
                    <strong className="text-zinc-200 block mb-0.5">Stack:</strong>
                    <pre className="whitespace-pre-wrap text-zinc-400 text-[9px]">{this.state.error?.stack || 'No stack available'}</pre>
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong className="text-zinc-200 block mb-0.5">Component Stack:</strong>
                      <pre className="whitespace-pre-wrap text-zinc-500 text-[9px]">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
