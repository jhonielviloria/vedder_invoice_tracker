import React, { useState, useEffect } from 'react';
import { Client, FREQUENCIES, InvoicingFrequency } from '../types';

interface Props {
  onSubmit: (client: Omit<Client, 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initial?: Client;
}

export const ClientForm: React.FC<Props> = ({ onSubmit, onCancel, initial }) => {
  const [name, setName] = useState(initial?.name || '');
  const [frequency, setFrequency] = useState<InvoicingFrequency>(initial?.frequency || 'Monthly');
  const [instructions, setInstructions] = useState(initial?.instructions || '');

  useEffect(()=>{
    setName(initial?.name || '');
    setFrequency(initial?.frequency || 'Monthly');
    setInstructions(initial?.instructions || '');
  }, [initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ id: initial?.id || crypto.randomUUID(), name: name.trim(), frequency, instructions: instructions.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Client Name</label>
        <input className="mt-1 w-full border rounded px-2 py-1" value={name} onChange={e=>setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">Frequency</label>
        <select className="mt-1 w-full border rounded px-2 py-1" value={frequency} onChange={e=>setFrequency(e.target.value as InvoicingFrequency)}>
          {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Instructions</label>
        <textarea className="mt-1 w-full border rounded px-2 py-1" rows={4} value={instructions} onChange={e=>setInstructions(e.target.value)} />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1 rounded border">Cancel</button>
        <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white">{initial ? 'Update' : 'Add'} Client</button>
      </div>
    </form>
  );
};
