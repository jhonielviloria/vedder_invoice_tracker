import React, { useState } from 'react';
import { AppProvider } from './context';
import { ClientList } from './components/ClientList';
import { InvoiceGrid } from './components/InvoiceGrid';

const tabs = [
  { id: 'clients', label: 'Clients' },
  { id: 'invoices', label: 'Invoices' },
];

const App: React.FC = () => {
  const [active, setActive] = useState<string>('clients');
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white border-b px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl font-semibold">Invoice Status Tracker</h1>
          <nav className="flex gap-2" aria-label="Main Tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={
                  'px-4 py-2 text-sm font-medium rounded border transition ' +
                  (active === t.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow'
                    : 'bg-white text-gray-700 hover:bg-gray-50')
                }
              >
                {t.label}
              </button>
            ))}
          </nav>
        </header>
        <main className="p-4 flex flex-col gap-6 max-w-7xl w-full mx-auto flex-1 w-full">
          {active === 'clients' && (
            <section aria-labelledby="clients-heading" className="w-full">
              <h2 id="clients-heading" className="sr-only">Clients</h2>
              <ClientList />
            </section>
          )}
          {active === 'invoices' && (
            <section aria-labelledby="invoices-heading" className="w-full">
              <h2 id="invoices-heading" className="sr-only">Invoices</h2>
              <InvoiceGrid />
            </section>
          )}
        </main>
        <footer className="mt-auto text-center py-4 text-xs text-gray-500">Data stored locally in your browser.</footer>
      </div>
    </AppProvider>
  );
};

export default App;
