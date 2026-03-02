import { useState, useEffect, useCallback, useRef } from "react";
import { homedir } from "node:os";
import { Store } from "../../core/store.js";
import type { StoreMode } from "../../core/store.js";
import type { TadaStore } from "../../core/types.js";

const emptyStore: TadaStore = { version: 1, todos: [], projects: [], areas: [] };

function abbreviatePath(path: string): string {
  const home = homedir();
  if (path === home || path === home + "/") return "~";
  if (path.startsWith(home + "/")) return "~/" + path.slice(home.length + 1);
  return path;
}

export function useStore() {
  const [mode, setMode] = useState<StoreMode>(Store.defaultMode);
  const [data, setData] = useState<TadaStore>(emptyStore);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [store, setStore] = useState<Store | null>(() => {
    try {
      return new Store(mode);
    } catch {
      return null;
    }
  });

  const storePath = store ? abbreviatePath(store.rootPath) : null;

  useEffect(() => {
    if (!store) {
      setError('No .tada/ directory found. Run "tada init" first.');
      setLoading(false);
      return;
    }
    store.load().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [store]);

  const prevData = useRef<TadaStore | null>(null);

  const mutate = useCallback(
    async (fn: (store: TadaStore) => void) => {
      if (!store) return;
      prevData.current = data;
      const clone = structuredClone(data);
      fn(clone);
      await store.save(clone);
      setData(clone);
    },
    [store, data],
  );

  const undo = useCallback(async (): Promise<boolean> => {
    if (!store || !prevData.current) return false;
    await store.save(prevData.current);
    setData(prevData.current);
    prevData.current = null;
    return true;
  }, [store]);

  const reload = useCallback(async () => {
    if (!store) return;
    const d = await store.load();
    setData(d);
  }, [store]);

  const toggleMode = useCallback(() => {
    const next: StoreMode = mode === "local" ? "global" : "local";
    try {
      const newStore = new Store(next);
      setStore(newStore);
      setMode(next);
      setError(null);
      setLoading(true);
      newStore.load().then((d) => {
        setData(d);
        setLoading(false);
      });
    } catch {
      // Can't switch (e.g. no local .tada/ found) — stay on current mode
    }
    return next;
  }, [mode]);

  return { data, loading, error, mutate, reload, mode, storePath, toggleMode, undo };
}
