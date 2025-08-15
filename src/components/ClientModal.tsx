import React from 'react';
import { Client } from '../types';
import { ClientForm } from './ClientForm';

interface ClientModalProps {
  open: boolean;
  client: Client | null;
  onClose: () => void;
  onUpdate: (c: Client) => void;
  onDelete: (id: string) => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({ open, client, onClose, onUpdate, onDelete }) => {
  if (!open || !client) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="client-edit-title">
      <div className="bg-white rounded shadow-lg w-full max-w-lg p-5 space-y-4">
        <div className="flex items-start justify-between">
          <h3 id="client-edit-title" className="font-semibold text-lg">Edit Client</h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <ClientForm
          initial={client}
          onCancel={onClose}
          onSubmit={(updated) => { onUpdate({ ...client, ...updated }); onClose(); }}
        />
        <div className="flex justify-between pt-2">
          <button onClick={()=>{ if (confirm('Delete this client and all related invoices?')) { onDelete(client.id); onClose(); } }} className="text-red-600 text-sm underline">Delete Client</button>
          <button onClick={onClose} className="text-sm text-gray-600 underline">Close</button>
        </div>
      </div>
    </div>
  );
};
