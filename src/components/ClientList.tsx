import React, { useState } from 'react';
import { useApp } from '../context';
import { Client } from '../types';
import { ClientForm } from './ClientForm';

export const ClientList: React.FC = () => {
  const { data, removeClient, updateClient, addClient } = useApp();
  const [editing, setEditing] = useState<Client | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Clients</h2>
        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={()=>{ setAdding(true); setEditing(null); }}>Add Client</button>
      </div>
      <ul className="divide-y border rounded bg-white">
        {data.clients.map(c => (
          <li key={c.id} className="p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-gray-500">{c.frequency}</div>
              {c.instructions && <div className="text-xs text-gray-600 mt-1 line-clamp-2">{c.instructions}</div>}
            </div>
            <div className="flex gap-2">
              <button className="text-sm px-2 py-1 border rounded" onClick={()=>{ setEditing(c); setAdding(false); }}>Edit</button>
              <button className="text-sm px-2 py-1 border rounded text-red-600" onClick={()=> removeClient(c.id)}>Delete</button>
            </div>
          </li>
        ))}
        {data.clients.length === 0 && <li className="p-4 text-sm text-gray-500">No clients yet.</li>}
      </ul>

      {(adding || editing) && (
        <div className="p-4 border rounded bg-white">
          <h3 className="font-medium mb-2">{editing ? 'Edit Client' : 'Add Client'}</h3>
          <ClientForm
            initial={editing || undefined}
            onCancel={()=>{ setAdding(false); setEditing(null); }}
            onSubmit={cl => {
              if (editing) {
                updateClient({ ...editing, ...cl });
              } else {
                addClient(cl);
              }
              setAdding(false); setEditing(null);
            }}
          />
        </div>
      )}
    </div>
  );
};
