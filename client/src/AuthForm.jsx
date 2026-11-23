import { useState } from 'react';
import { useAuth } from './useAuth';

export default function AuthForm() {
  const { signin, signup, loading, error } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e) => {
    e.preventDefault();
    (mode === 'signin' ? signin : signup)({ email, password });
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 320, margin: '80px auto', display: 'grid', gap: 12 }}>
      <h2>{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
      <input type="email" placeholder="Email" value={email}
             onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password (min 8)" value={password}
             onChange={(e) => setPassword(e.target.value)} required />
      {error && <p style={{ color: 'crimson', margin: 0 }}>{error}</p>}
      <button disabled={loading}>
        {loading ? '...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
      </button>
      <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
      </button>
    </form>
  );
}