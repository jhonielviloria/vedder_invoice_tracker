import React, { useMemo, useState } from 'react';
import { useApp } from '../context';
import { Client, InvoiceCellData } from '../types';
import { InvoiceCell } from './InvoiceCell';
import { NotesModal } from './NotesModal';

interface FocusedCell {
  clientId: string;
  year: number;
  month: number;
  existing?: InvoiceCellData;
}

function monthsRange(center: Date, pastMonths: number, futureMonths: number) {
  const out: { year: number; month: number; label: string; }[] = [];
  const cYear = center.getFullYear();
  const cMonth = center.getMonth();
  for (let offset = -pastMonths; offset <= futureMonths; offset++) {
    const date = new Date(cYear, cMonth + offset, 1);
    out.push({ year: date.getFullYear(), month: date.getMonth(), label: date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear() });
  }
  return out;
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

export const InvoiceGrid: React.FC = () => {
  const { data, updateInvoiceStatus, updateInvoiceNotes } = useApp();
  const [center] = useState(new Date());
  const months = useMemo(()=> monthsRange(center, 3, 9), [center]);
  const [focused, setFocused] = useState<FocusedCell | null>(null);

  function getCell(clientId: string, y: number, m: number) {
    const key = `${clientId}:${y}-${String(m+1).padStart(2,'0')}`;
    return data.invoices[key];
  }

  return (
    <div className="overflow-auto border rounded bg-white">
      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr>
            <th className="border px-2 py-1 text-left bg-gray-100">Client</th>
            {months.map(m => <th key={m.year+'-'+m.month} className="border px-1 py-1 text-xs font-medium text-center w-24">{m.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.clients.map(client => (
            <tr key={client.id} className="odd:bg-gray-50/40">
              <td className="border px-2 py-1 align-top min-w-[180px]">
                <div className="font-medium text-sm">{client.name}</div>
                <div className="text-[10px] text-gray-500">{client.frequency}</div>
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
          {data.clients.length === 0 && (
            <tr><td colSpan={months.length + 1} className="p-6 text-center text-sm text-gray-500">Add clients to begin tracking invoices.</td></tr>
          )}
        </tbody>
      </table>
      <NotesModal
        open={!!focused}
        initial={focused?.existing?.notes || ''}
        onClose={()=> setFocused(null)}
        onSave={(notes) => { if (focused) { updateInvoiceNotes(focused.clientId, focused.year, focused.month, notes); } }}
      />
    </div>
  );
};
