/**
 * Botón "atrás" del celular o del navegador dentro de la app: en vez de salir de Loomi,
 * primero cierra lo que esté abierto (una ficha, una ventana) y después vuelve al inicio.
 * En el inicio, sin nada abierto, el atrás funciona normal.
 *
 * Cada pantalla registra sus "capas" con useBackLayer(abierta, cerrar, prioridad). Mientras haya alguna
 * abierta se deja un paso extra en el historial (con la misma dirección); al tocar atrás se consume ese
 * paso y se cierra la capa de mayor prioridad. Solo en la app real (no en la landing ni en la demo).
 */
import { useEffect, useRef } from 'react';
import { isAppMode } from '../lib/appMode';

type Layer = { active: boolean; close: () => void; priority: number };

const layers = new Map<number, Layer>();
let seq = 0;
let armed = false;
let skipNext = false;
let installed = false;

const isOurEntry = () => {
  try {
    return !!(window.history.state && window.history.state.loomiBack);
  } catch {
    return false;
  }
};

function sync() {
  const needed = [...layers.values()].some((l) => l.active);
  try {
    if (needed && !armed) {
      window.history.pushState({ ...(window.history.state || {}), loomiBack: true }, '');
      armed = true;
    } else if (!needed && armed) {
      armed = false;
      // Se cerró todo con los botones de la pantalla: sacar el paso extra para que el próximo atrás no quede "muerto"
      if (isOurEntry()) {
        skipNext = true;
        window.history.back();
      }
    }
  } catch {}
}

function onPopState() {
  if (skipNext) {
    skipNext = false;
    return;
  }
  if (!armed) return;
  armed = false;
  const top = [...layers.values()].filter((l) => l.active).sort((a, b) => b.priority - a.priority)[0];
  if (top) top.close();
  // Si después de cerrar sigue habiendo algo que volver (por ejemplo, no estamos en el inicio), se vuelve a armar
  setTimeout(sync, 0);
}

function install() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('popstate', onPopState);
}

/** Registra algo que el botón atrás debe cerrar mientras `active` sea true. Mayor prioridad = se cierra primero. */
export function useBackLayer(active: boolean, close: () => void, priority = 0) {
  const id = useRef(0);
  if (!id.current) id.current = ++seq;
  const closeRef = useRef(close);
  closeRef.current = close;
  const enabled = typeof window !== 'undefined' && isAppMode();

  useEffect(() => {
    if (!enabled) return;
    install();
    layers.set(id.current, { active, close: () => closeRef.current(), priority });
    sync();
  }, [active, priority, enabled]);

  useEffect(() => {
    const key = id.current;
    return () => {
      if (layers.delete(key)) sync();
    };
  }, []);
}
