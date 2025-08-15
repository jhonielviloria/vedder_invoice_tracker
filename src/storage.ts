import { AppDataSchema, Client, InvoiceCellData } from './types';

const STORAGE_KEY = 'invoice_status_tracker_v1';

const defaultData: AppDataSchema = {
  clients: [],
  invoices: {},
  version: 1,
};

export function loadData(): AppDataSchema {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as AppDataSchema;
    return { ...defaultData, ...parsed };
  } catch (e) {
    console.warn('Failed to load data', e);
    return defaultData;
  }
}

export function saveData(data: AppDataSchema) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save data', e);
  }
}

export function upsertClient(data: AppDataSchema, client: Client): AppDataSchema {
  const now = new Date().toISOString();
  const idx = data.clients.findIndex(c => c.id === client.id);
  let nextClients: Client[];
  if (idx >= 0) {
    nextClients = data.clients.map(c => c.id === client.id ? { ...c, ...client, updatedAt: now } : c);
  } else {
    nextClients = [...data.clients, { ...client, createdAt: now, updatedAt: now }];
  }
  const next: AppDataSchema = { ...data, clients: nextClients };
  saveData(next);
  return next;
}

export function deleteClient(data: AppDataSchema, clientId: string): AppDataSchema {
  const prunedInvoices: Record<string, InvoiceCellData> = {};
  for (const [key, val] of Object.entries(data.invoices)) {
    if (!key.startsWith(clientId + ':')) prunedInvoices[key] = val;
  }
  const next: AppDataSchema = { ...data, clients: data.clients.filter(c => c.id !== clientId), invoices: prunedInvoices };
  saveData(next);
  return next;
}

export function upsertInvoiceCell(data: AppDataSchema, cell: InvoiceCellData): AppDataSchema {
  const next: AppDataSchema = {
    ...data,
    invoices: {
      ...data.invoices,
      [cell.id]: { ...cell, updatedAt: new Date().toISOString() }
    }
  };
  saveData(next);
  return next;
}
