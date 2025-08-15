import React from 'react';
import { AppProvider } from './context';
import { InvoiceGrid } from './components/InvoiceGrid';
import { useApp } from './context';
import { AuthProvider, useAuth } from './auth';
import { isSupabaseConfigured } from './supabaseClient';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';

const Toasts: React.FC = () => {
  const { toasts } = useApp();
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div key={t.id} className="bg-green-600 text-white text-sm px-3 py-2 rounded shadow animate-fade-in">
          {t.message}
        </div>
      ))}
    </div>
  );
};

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading, signOut } = useAuth();
  const disableAuthFlag = import.meta.env.VITE_DISABLE_AUTH === '1';
  const authDisabled = disableAuthFlag || !isSupabaseConfigured;
  const location = useLocation();
  const navigate = useNavigate();

  if (!authDisabled) {
    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Invoice Status Tracker</h1>
        {!authDisabled && session && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{session.user?.email}</span>
            <button onClick={async ()=>{ await signOut(); navigate('/login', { replace: true }); }} className="text-xs px-2 py-1 border rounded">Logout</button>
          </div>
        )}
      </header>
      {children}
    </div>
  );
};

// On visiting /logout perform sign out then redirect to login
const LogoutRoute: React.FC = () => {
  const { signOut } = useAuth();
  React.useEffect(() => { (async () => { await signOut(); })(); }, [signOut]);
  return <Navigate to="/login" replace />;
};

const App: React.FC = () => (
  <AuthProvider>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedLayout>
              <main className="p-4 flex flex-col gap-6 max-w-7xl w-full mx-auto flex-1 w-full">
                <section aria-labelledby="invoices-heading" className="w-full">
                  <h2 id="invoices-heading" className="sr-only">Invoices</h2>
                  <InvoiceGrid />
                </section>
              </main>
              <footer className="mt-auto text-center py-4 text-xs text-gray-500">Data stored locally + auth via Supabase.</footer>
              <Toasts />
            </ProtectedLayout>
          } />
          <Route path="/logout" element={<LogoutRoute />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </AuthProvider>
);

export default App;
