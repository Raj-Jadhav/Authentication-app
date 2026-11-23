import { useDispatch, useSelector } from 'react-redux';
import { signin, signup, logout } from './store/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  return {
    ...auth,
    signin: (creds) => dispatch(signin(creds)),
    signup: (creds) => dispatch(signup(creds)),
    logout: () => dispatch(logout()),
  };
}