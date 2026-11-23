import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchMe } from './store/authSlice';
import { useAuth } from './useAuth';
import AuthForm from './AuthForm';

export default function App() {
  const dispatch = useDispatch();
  const { user, token, ready, logout } = useAuth();

  // On page load: if a saved token exists, ask the server who we are
  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, []); // eslint-disable-line

  if (!ready) return <p>Loading...</p>;
  if (!user) return <AuthForm />;

  return (
    <div style={{ textAlign: 'center', marginTop: 80 }}>
      <h2>Welcome, {user.email} 🎉</h2>
      <p>You're authenticated with a JWT.</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}