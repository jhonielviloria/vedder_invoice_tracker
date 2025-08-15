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
  const existing = data.clients.find(c => c.id === client.id);
  const now = new Date().toISOString();
  if (existing) {
    Object.assign(existing, client, { updatedAt: now });
  } else {
    data.clients.push({ ...client, createdAt: now, updatedAt: now });
  }
  saveData(data);
  return data;
}

export function deleteClient(data: AppDataSchema, clientId: string): AppDataSchema {
  data.clients = data.clients.filter(c => c.id !== clientId);
  // Remove invoices for client
  Object.keys(data.invoices).forEach(key => {
    if (key.startsWith(clientId + ':')) delete data.invoices[key];
  });
  saveData(data);
  return data;
}

export function upsertInvoiceCell(data: AppDataSchema, cell: InvoiceCellData): AppDataSchema {
  data.invoices[cell.id] = { ...cell, updatedAt: new Date().toISOString() };
  saveData(data);
  return data;
}
