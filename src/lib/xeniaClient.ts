/**
 * Una sola forma de preguntarle a Xenia, en este orden:
 *  1. Claude (functions/api/xenia/chat.js): solo en la app real y con sesión. Si todavía no está la clave, responde 503 y se sigue.
 *  2. El backend viejo de AI Studio (Gemini).
 *  3. Las respuestas fijas de xeniaLocalEngine.ts.
 */
import type { DemoState } from '../types';
import { auth } from './firebase';
import { isAppMode } from './appMode';
import { getApiUrl } from '../utils/apiConfig';
import { getClientXeniaReply } from '../components/xenia/xeniaLocalEngine';
import { buildXeniaContext } from './xeniaContext';

export interface XeniaTurn {
  role: 'user' | 'assistant';
  content: string;
}

export async function askXenia(opts: {
  message: string;
  history?: XeniaTurn[];
  demoState: DemoState | any;
  signal?: AbortSignal;
}): Promise<string> {
  const { message, history = [], demoState, signal } = opts;
  const recent = history
    .filter((h) => h && h.content)
    .slice(-8)
    .map((h) => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: String(h.content).slice(0, 1500) }));

  // 1. Claude
  if (isAppMode() && auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/xenia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        signal,
        body: JSON.stringify({ message: message.slice(0, 1500), history: recent, context: buildXeniaContext(demoState) }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.reply) return String(data.reply);
      }
    } catch {
      if (signal?.aborted) return getClientXeniaReply(message, demoState);
    }
  }

  // 2. AI Studio (Gemini)
  try {
    const res = await fetch(getApiUrl('/api/xenia/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        message,
        history: recent,
        contextData: {
          properties: demoState?.properties || [],
          reservations: demoState?.reservations || [],
          cleaningTasks: demoState?.cleaningTasks || [],
          addons: demoState?.addons || [],
        },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.reply) return String(data.reply);
    }
  } catch {}

  // 3. Respuestas fijas
  return getClientXeniaReply(message, demoState);
}
