import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context';
import { Client, InvoiceCellData, FREQUENCIES, InvoicingFrequency } from '../types';
import { ClientModal } from './ClientModal';
import { ClientForm } from './ClientForm';
import { InvoiceCell } from './InvoiceCell';
import { NotesModal } from './NotesModal';

interface FocusedCell {
  clientId: string;
  year: number;
  month: number;
  existing?: InvoiceCellData;
}

function monthsOfYear(year: number) {
  return Array.from({ length: 12 }, (_, m) => ({
    year,
    month: m,
  // Header should display only month abbreviation (e.g., Jan, Feb...)
  label: new Date(year, m, 1).toLocaleString('default', { month: 'short' })
  }));
}

function applicable(client: Client, monthIndex: number, year: number): boolean {
  // monthIndex 0-11
  switch (client.frequency) {
    case 'Monthly': return true;
    case 'Quarterly': return monthIndex % 3 === 0; // Jan(0), Apr(3), Jul(6), Oct(9)
    case 'Semi-Annually': return monthIndex % 6 === 0; // Jan(0), Jul(6)
    case 'Annually': return monthIndex === 0; // Jan only
  }
}

const PREF_KEY = 'invoice_grid_prefs_v1';

function loadPrefs(): { year: number; frequency: InvoicingFrequency } {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.year === 'number' && parsed.frequency) {
        return parsed;
      }
    }
  } catch { /* ignore */ }
  return { year: new Date().getFullYear(), frequency: 'Monthly' };
}

export const InvoiceGrid: React.FC = () => {
  const { data, updateInvoiceStatus, updateInvoiceNotes, updateClient, removeClient, addClient } = useApp();
  const initial = useMemo(loadPrefs, []);
  const [year, setYear] = useState<number>(initial.year);
  const [frequencyFilter, setFrequencyFilter] = useState<InvoicingFrequency>(initial.frequency);
  const months = useMemo(()=> monthsOfYear(year), [year]);
  const [focused, setFocused] = useState<FocusedCell | null>(null);
  const [clientModal, setClientModal] = useState<Client | null>(null);
  const [adding, setAdding] = useState(false);

  // Persist preferences when they change
  useEffect(()=> {
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ year, frequency: frequencyFilter })); } catch { /* ignore */ }
  }, [year, frequencyFilter]);

  function getCell(clientId: string, y: number, m: number) {
    const key = `${clientId}:${y}-${String(m+1).padStart(2,'0')}`;
    return data.invoices[key];
  }

  const filteredClients: Client[] = useMemo(
    () => data.clients
      .filter((c: Client) => c.frequency === frequencyFilter)
      .slice()
      .sort((a: Client,b: Client) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
    [data.clients, frequencyFilter]
  );

  return (
    <div className="border rounded bg-white">
      {/* Controls (not part of scrollable area) */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <button aria-label="Previous Year" className="px-2 py-1 border rounded" onClick={()=> setYear(y => y - 1)}>&laquo; {year-1}</button>
          <div className="font-semibold text-sm">{year}</div>
          <button aria-label="Next Year" className="px-2 py-1 border rounded" onClick={()=> setYear(y => y + 1)}>{year+1} &raquo;</button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium" htmlFor="freqFilter">Frequency</label>
          <select id="freqFilter" className="border rounded px-2 py-1 text-sm" value={frequencyFilter} onChange={e=> setFrequencyFilter(e.target.value as InvoicingFrequency)}>
            {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>
  <div className="overflow-auto">
      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr>
            <th className="border px-2 py-1 text-left bg-gray-100 sticky left-0 z-30 shadow-sm">Client</th>
            {months.map(m => <th key={m.year+'-'+m.month} className="border px-1 py-1 text-xs font-medium text-center w-24">{m.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {filteredClients.map(client => (
            <tr key={client.id} className="odd:bg-gray-50/40">
              <td className="border px-2 py-1 align-top min-w-[220px] bg-white sticky left-0 z-20 shadow-sm cursor-pointer hover:bg-blue-50" onClick={()=> setClientModal(client)}>
                <div className="font-medium text-sm leading-snug underline decoration-dotted underline-offset-2">{client.name}</div>
                {client.instructions ? (
                  <div className="mt-0.5 text-[10px] text-gray-600 line-clamp-2 whitespace-pre-wrap" title={client.instructions}>{client.instructions}</div>
                ) : (
                  <div className="text-[10px] text-gray-500">{client.frequency}</div>
                )}
              </td>
              {months.map(m => {
                const isApplicable = applicable(client, m.month, m.year);
                const cell = isApplicable ? getCell(client.id, m.year, m.month) : undefined;
                return (
                  <td key={client.id + m.year + m.month} className="border p-0 align-top">
                    <InvoiceCell
                      disabled={!isApplicable}
                      cell={cell || null}
                      status={cell?.status || (isApplicable ? 'NOT_DONE' : 'NA')}
                      onChangeStatus={next => updateInvoiceStatus(client.id, m.year, m.month, next)}
                      onOpenNotes={() => setFocused({ clientId: client.id, year: m.year, month: m.month, existing: cell })}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
          {filteredClients.length === 0 && (
            <tr><td colSpan={months.length + 1} className="p-6 text-center text-sm text-gray-500">No clients with frequency "{frequencyFilter}".</td></tr>
          )}
        </tbody>
      </table>
  </div>
      <div className="p-3 border-t bg-gray-50 flex justify-end">
        <button onClick={()=> setAdding(true)} className="px-4 py-2 rounded bg-green-600 text-white text-sm font-medium">Add New Client</button>
      </div>
      <NotesModal
        open={!!focused}
        initial={focused?.existing?.notes || ''}
        onClose={()=> setFocused(null)}
        onSave={(notes) => { if (focused) { updateInvoiceNotes(focused.clientId, focused.year, focused.month, notes); } }}
      />
      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-lg p-5 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg">Add Client</h3>
              <button onClick={()=> setAdding(false)} aria-label="Close" className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <ClientForm
              onCancel={()=> setAdding(false)}
              onSubmit={(c) => { addClient(c); setAdding(false); }}
            />
          </div>
        </div>
      )}
      <ClientModal
        open={!!clientModal}
        client={clientModal}
        onClose={()=> setClientModal(null)}
        onUpdate={(c)=> updateClient(c)}
        onDelete={(id)=> removeClient(id)}
      />
    </div>
  );
};
