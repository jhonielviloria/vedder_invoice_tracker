import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { AppDataSchema, Client, InvoiceCellData, InvoiceStatus } from './types';
import { loadData, saveData, upsertClient, deleteClient, upsertInvoiceCell } from './storage';
import { v4 as uuid } from 'uuid';
import { fetchRemoteData, upsertRemoteClient, deleteRemoteClient, upsertRemoteInvoiceCell, localInvoiceId } from './remoteStorage';
import { useAuth } from './auth';

interface AppContextValue {
  data: AppDataSchema;
  addClient: (partial: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => string; // returns new id
  updateClient: (client: Client) => void;
  removeClient: (id: string) => void;
  updateInvoiceStatus: (clientId: string, year: number, month: number, status: InvoiceStatus) => void;
  updateInvoiceNotes: (clientId: string, year: number, month: number, notes: string) => void;
  showToast: (message: string) => void;
  toasts: { id: string; message: string }[];
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppDataSchema>(() => loadData());
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
  const { session } = useAuth() as any;
  const userId = session?.user?.id as string | undefined;
  const [remoteLoaded, setRemoteLoaded] = useState(false);

  const showToast = useCallback((message: string) => {
    const id = uuid();
    setToasts(ts => [...ts, { id, message }]);
    setTimeout(() => {
      setToasts(ts => ts.filter(t => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => { saveData(data); }, [data]);

  // Load remote data after auth
  useEffect(() => {
    (async () => {
      if (!userId) { setRemoteLoaded(false); return; }
      try {
        const remote = await fetchRemoteData(userId);
        setData(remote); // replace local with remote snapshot
        setRemoteLoaded(true);
      } catch (e) {
        console.warn('Remote load failed', e);
        showToast('Failed to load cloud data – using local');
      }
    })();
  }, [userId, showToast]);

  const addClient = useCallback((partial: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const client: Client = { ...partial, id: uuid(), createdAt: '', updatedAt: '' };
    setData(d => upsertClient(d, client));
    // Fire and forget remote
    if (userId) upsertRemoteClient(userId, client).catch(e => console.warn('Remote upsert client failed', e));
    showToast('Client added');
    return client.id;
  }, [showToast, userId]);

  const updateClient = useCallback((client: Client) => {
    setData(d => upsertClient(d, client));
    if (userId) upsertRemoteClient(userId, client).catch(e => console.warn('Remote update client failed', e));
    showToast('Client updated');
  }, [showToast, userId]);

  const removeClient = useCallback((id: string) => {
    setData(d => deleteClient(d, id));
    if (userId) deleteRemoteClient(userId, id).catch(e => console.warn('Remote delete client failed', e));
    showToast('Client deleted');
  }, [showToast, userId]);

  function ensureCell(base: AppDataSchema, clientId: string, year: number, month: number): InvoiceCellData {
    const id = localInvoiceId(clientId, year, month);
    return base.invoices[id] || { id, clientId, year, month, status: 'NOT_DONE', updatedAt: new Date().toISOString(), notes: '' };
  }

  const updateInvoiceStatus = useCallback(async (clientId: string, year: number, month: number, status: InvoiceStatus) => {
    console.log('[Context] updateInvoiceStatus called with:', { clientId, year, month, status });
    
    // Create the cell outside of setData to ensure it's captured properly
    const currentCell = ensureCell(data, clientId, year, month);
    const nextCell: InvoiceCellData = { ...currentCell, status };
    
    console.log('[Context] Current cell:', currentCell);
    console.log('[Context] Next cell with updated status:', nextCell);
    
    setData(d => {
      return upsertInvoiceCell(d, nextCell);
    });
    
    showToast('Status updated');
    
    if (userId && nextCell) {
      console.log('[Context] About to call upsertRemoteInvoiceCell with:', { userId, nextCell });
      try {
        await upsertRemoteInvoiceCell(userId, nextCell);
        console.log('[Context] Remote upsert completed successfully');
      } catch (e) {
        console.warn('Remote upsert invoice failed', e);
        showToast('Cloud sync failed (status kept locally)');
      }
    } else {
      console.warn('[Context] Skipping remote upsert - userId:', userId, 'nextCell:', nextCell);
    }
  }, [userId, showToast, data]);

  const updateInvoiceNotes = useCallback(async (clientId: string, year: number, month: number, notes: string) => {
    console.log('[Context] updateInvoiceNotes called with:', { clientId, year, month, notes });
    
    // Create the cell outside of setData to ensure it's captured properly
    const currentCell = ensureCell(data, clientId, year, month);
    const nextCell: InvoiceCellData = { ...currentCell, notes };
    
    console.log('[Context] Notes - Current cell:', currentCell);
    console.log('[Context] Notes - Next cell with updated notes:', nextCell);
    
    setData(d => {
      return upsertInvoiceCell(d, nextCell);
    });
    
    showToast('Notes saved');
    
    if (userId && nextCell) {
      console.log('[Context] Notes - About to call upsertRemoteInvoiceCell with:', { userId, nextCell });
      try {
        await upsertRemoteInvoiceCell(userId, nextCell);
        console.log('[Context] Notes - Remote upsert completed successfully');
      } catch (e) {
        console.warn('Remote upsert notes failed', e);
        showToast('Cloud sync failed (notes kept locally)');
      }
    } else {
      console.warn('[Context] Notes - Skipping remote upsert - userId:', userId, 'nextCell:', nextCell);
    }
  }, [userId, showToast, data]);

  return <AppContext.Provider value={{ data, addClient, updateClient, removeClient, updateInvoiceStatus, updateInvoiceNotes, showToast, toasts }}>{children}</AppContext.Provider>;
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
