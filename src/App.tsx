import React from 'react';
import { AppProvider } from './context';
import { ClientList } from './components/ClientList';
import { InvoiceGrid } from './components/InvoiceGrid';

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Invoice Status Tracker</h1>
        </header>
        <main className="p-4 flex flex-col gap-6 max-w-7xl w-full mx-auto">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-1">
              <ClientList />
            </div>
            <div className="md:col-span-2">
              <InvoiceGrid />
            </div>
          </div>
        </main>
        <footer className="mt-auto text-center py-4 text-xs text-gray-500">Data stored locally in your browser.</footer>
      </div>
    </AppProvider>
  );
};

export default App;
