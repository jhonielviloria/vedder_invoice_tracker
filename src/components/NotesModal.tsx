import React, { useState, useEffect } from 'react';

interface Props {
  open: boolean;
  initial: string;
  onClose: () => void;
  onSave: (notes: string) => void;
}

export const NotesModal: React.FC<Props> = ({ open, initial, onClose, onSave }) => {
  const [value, setValue] = useState(initial);
  useEffect(()=> setValue(initial), [initial]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-4 space-y-4">
        <h3 className="font-semibold text-lg">Invoice Notes</h3>
        <textarea className="w-full border rounded px-2 py-1" rows={6} value={value} onChange={e=>setValue(e.target.value)} placeholder="Add notes for this invoice" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
          <button onClick={()=>{ onSave(value.trim()); onClose(); }} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};
