import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { AppDataSchema, Client, InvoiceCellData, InvoiceStatus } from './types';
import { loadData, saveData, upsertClient, deleteClient, upsertInvoiceCell } from './storage';
import { v4 as uuid } from 'uuid';

interface AppContextValue {
  data: AppDataSchema;
  addClient: (partial: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
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

  const showToast = useCallback((message: string) => {
    const id = uuid();
    setToasts(ts => [...ts, { id, message }]);
    setTimeout(() => {
      setToasts(ts => ts.filter(t => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => { saveData(data); }, [data]);

  const addClient = useCallback((partial: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const client: Client = { ...partial, id: uuid(), createdAt: '', updatedAt: '' };
    setData(d => ({ ...upsertClient({ ...d }, client) }));
    showToast('Client added');
  }, []);

  const updateClient = useCallback((client: Client) => {
    setData(d => ({ ...upsertClient({ ...d }, client) }));
    showToast('Client updated');
  }, [showToast]);

  const removeClient = useCallback((id: string) => {
    setData(d => ({ ...deleteClient({ ...d }, id) }));
    showToast('Client deleted');
  }, [showToast]);

  function ensureCell(base: AppDataSchema, clientId: string, year: number, month: number): InvoiceCellData {
    const id = `${clientId}:${year}-${String(month+1).padStart(2,'0')}`;
    return base.invoices[id] || { id, clientId, year, month, status: 'NOT_DONE', updatedAt: new Date().toISOString(), notes: '' };
  }

  const updateInvoiceStatus = useCallback((clientId: string, year: number, month: number, status: InvoiceStatus) => {
    setData(d => {
      const cell = ensureCell(d, clientId, year, month);
      const next: InvoiceCellData = { ...cell, status };
      return { ...upsertInvoiceCell({ ...d }, next) };
    });
    showToast('Status updated');
  }, []);

  const updateInvoiceNotes = useCallback((clientId: string, year: number, month: number, notes: string) => {
    setData(d => {
      const cell = ensureCell(d, clientId, year, month);
      const next: InvoiceCellData = { ...cell, notes };
      return { ...upsertInvoiceCell({ ...d }, next) };
    });
    showToast('Notes saved');
  }, []);

  return <AppContext.Provider value={{ data, addClient, updateClient, removeClient, updateInvoiceStatus, updateInvoiceNotes, showToast, toasts }}>{children}</AppContext.Provider>;
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
