export type InvoicingFrequency = 'Monthly' | 'Quarterly' | 'Semi-Annually' | 'Annually';

export interface Client {
  id: string;
  name: string;
  frequency: InvoicingFrequency;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'NOT_DONE' | 'COMPLETED' | 'RECURRING_DONE' | 'NA';

export interface InvoiceCellData {
  id: string; // clientId:YYYY-MM
  clientId: string;
  year: number;
  month: number; // 0-11
  status: InvoiceStatus;
  notes?: string;
  updatedAt: string;
}

export interface AppDataSchema {
  clients: Client[];
  invoices: Record<string, InvoiceCellData>; // key = clientId:YYYY-MM
  version: number;
}

export const FREQUENCIES: InvoicingFrequency[] = ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'];

export const STATUS_META: Record<InvoiceStatus, { label: string; color: string; description: string; }>= {
  NOT_DONE: { label: 'Not Done', color: 'bg-status-notdone', description: 'Invoice not yet prepared' },
  COMPLETED: { label: 'Completed', color: 'bg-status-completed', description: 'Invoice created and sent' },
  RECURRING_DONE: { label: 'Recurring Done', color: 'bg-status-recurring', description: 'Recurring invoice handled' },
  NA: { label: 'N/A', color: 'bg-status-na', description: 'Not applicable for this period' }
};
