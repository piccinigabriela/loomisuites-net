/**
 * Channel manager desde el Panel de clientes (solo administración): habla con functions/api/channel/admin.js,
 * que verifica el token y escribe con la cuenta de servicio. Ver docs/channel-manager-aiosell.md.
 */
import { auth } from './firebase';

export interface ChannelUnitSetting {
  roomCode?: string;
  rateplanCode?: string;
  enabled?: boolean;
}

export interface ChannelAdminState {
  channelManager: {
    enabled?: boolean;
    hotelCode?: string;
    since?: string;
    units?: Record<string, ChannelUnitSetting>;
    rates?: { send?: boolean; percent?: number };
    /** Cuenta propia de la administración: se conecta sin abono */
    ownAccount?: boolean;
  } | null;
  /** Abono: solo 'paga' (Loomi Suite activo) puede conectar un hotel real */
  pay: 'paga' | 'loomi' | 'vencido' | 'prueba';
  /** Modo del hotel en channelHotels (null = no hay hotel conectado a esta cuenta) */
  hotel: { mode: 'real' | 'prueba' } | null;
  units: Array<{ id: string; name: string }>;
  log: Array<{ at: string; mode: string; action: string; channel: string; bookingId: string; summary: string[] }>;
  sync: { lastAt: string; lastAction: string; lastSendAt: string; lastSendError: string } | null;
}

export interface ChannelSaveInput {
  uid: string;
  hotelCode: string;
  mode: 'real' | 'prueba';
  units: Record<string, ChannelUnitSetting>;
  rates: { send: boolean; percent: number };
  /** Cuenta propia (Catalinas, deptos del retiro): se conecta aunque no tenga Loomi Suite pago */
  cuentaPropia: boolean;
}

async function call<T>(action: string, body: Record<string, unknown>): Promise<T> {
  const user = auth?.currentUser;
  if (!user) throw new Error('Tenés que entrar con la cuenta de administración.');
  const token = await user.getIdToken();
  const res = await fetch('/api/channel/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, ...body }),
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* sin cuerpo */
  }
  if (!res.ok) throw new Error((data && data.error) || `Error ${res.status}`);
  return data as T;
}

export const getChannelState = (uid: string) => call<ChannelAdminState>('get', { uid });
export const saveChannelSettings = (input: ChannelSaveInput) =>
  call<{ ok: boolean; message: string }>('save', input as unknown as Record<string, unknown>);
export const disconnectChannel = (uid: string) => call<{ ok: boolean; message: string }>('disconnect', { uid });

/** "13/11 10:42" en hora de Argentina */
export function fmtChannelTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const ACTION_LABEL: Record<string, string> = { book: 'Reserva', modify: 'Cambio', cancel: 'Cancelación' };
export const channelActionLabel = (a: string) => ACTION_LABEL[a] || a;
