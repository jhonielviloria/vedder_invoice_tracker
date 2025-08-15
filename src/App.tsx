import React from 'react';
import { AppProvider } from './context';
import { InvoiceGrid } from './components/InvoiceGrid';

const App: React.FC = () => (
  <AppProvider>
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Invoice Status Tracker</h1>
      </header>
      <main className="p-4 flex flex-col gap-6 max-w-7xl w-full mx-auto flex-1 w-full">
        <section aria-labelledby="invoices-heading" className="w-full">
          <h2 id="invoices-heading" className="sr-only">Invoices</h2>
          <InvoiceGrid />
        </section>
      </main>
      <footer className="mt-auto text-center py-4 text-xs text-gray-500">Data stored locally in your browser.</footer>
    </div>
  </AppProvider>
);

export default App;
