import React from 'react';
import { InvoiceCellData, InvoiceStatus, STATUS_META } from '../types';
import clsx from 'clsx';

interface Props {
  cell: InvoiceCellData | null; // null means not created yet but applicable
  status: InvoiceStatus;
  disabled?: boolean; // not applicable
  onChangeStatus: (next: InvoiceStatus) => void;
  onOpenNotes: () => void;
}

const cycle: InvoiceStatus[] = ['NOT_DONE', 'COMPLETED', 'RECURRING_DONE'];

export const InvoiceCell: React.FC<Props> = ({ cell, status, disabled, onChangeStatus, onOpenNotes }) => {
  if (disabled) {
    return <div className="w-24 h-16 border text-xs flex items-center justify-center bg-gray-100 text-gray-400 select-none">N/A</div>;
  }
  const meta = STATUS_META[status];
  function handleClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button')) return; // ignore button clicks
    const idx = cycle.indexOf(status);
    const next = cycle[(idx + 1) % cycle.length];
    onChangeStatus(next);
  }
  return (
    <div onClick={handleClick} className={clsx('group relative w-24 h-16 border cursor-pointer flex flex-col items-center justify-center p-1 text-center text-[10px] leading-tight transition', meta.color, status === 'NOT_DONE' && 'text-white')}
      title={meta.description + (cell?.notes ? `\nNotes: ${cell.notes}` : '')}
    >
      <div className="font-semibold text-[11px]">{meta.label}</div>
      {cell?.notes && <div className="truncate w-full text-[9px] opacity-80">{cell.notes}</div>}
      <button onClick={onOpenNotes} className="absolute bottom-0 right-0 m-1 rounded bg-white/80 text-[9px] px-1 py-0.5 shadow hidden group-hover:block">Notes</button>
    </div>
  );
};
