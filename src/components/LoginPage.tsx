import React from 'react';
import { useAuth } from '../auth';
import { useNavigate, useLocation } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, session } = useAuth() as any;
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const action = mode === 'signin' ? signInWithEmail : signUpWithEmail;
    const { error } = await action(email, password) as any;
    if (error) setError(error.message || 'Authentication error');
    setLoading(false);
  }

  // Redirect to originally intended page (from state) or home once a session exists
  React.useEffect(() => {
    if (session) {
      const state = location.state as any;
      const dest = state?.from?.pathname || '/';
      navigate(dest, { replace: true });
    }
  }, [session, navigate, location.state]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-sm p-6 rounded shadow space-y-5">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">Invoice Tracker</h1>
          <p className="text-xs text-gray-500">{mode === 'signin' ? 'Sign in to continue' : 'Create an account'}</p>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Email</label>
          <input type="email" className="w-full border rounded px-2 py-1" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Password</label>
          <input type="password" className="w-full border rounded px-2 py-1" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
        <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>
        <div className="text-xs text-center text-gray-600">
          {mode === 'signin' ? (
            <>Need an account? <button type="button" onClick={()=>setMode('signup')} className="text-blue-600 underline">Sign up</button></>
          ) : (
            <>Have an account? <button type="button" onClick={()=>setMode('signin')} className="text-blue-600 underline">Sign in</button></>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
