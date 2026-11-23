import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API = 'http://localhost:5000/api/auth';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(API + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const post = (path) => async (creds, { rejectWithValue }) => {
  try {
    return await request(path, { method: 'POST', body: JSON.stringify(creds) });
  } catch (e) {
    return rejectWithValue(e.message);
  }
};

export const signup = createAsyncThunk('auth/signup', post('/signup'));
export const signin = createAsyncThunk('auth/signin', post('/signin'));
export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    return await request('/me');
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const token = localStorage.getItem('token');

const authSlice = createSlice({
  name: 'auth',
  // `ready` = "have we finished checking the saved token?" (avoids a login-form flash)
  initialState: { user: null, token, ready: !token, loading: false, error: null },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    for (const thunk of [signup, signin]) {
      builder
        .addCase(thunk.pending, (s) => { s.loading = true; s.error = null; })
        .addCase(thunk.fulfilled, (s, a) => {
          s.loading = false;
          s.ready = true;
          s.user = a.payload.user;
          s.token = a.payload.token;
          localStorage.setItem('token', a.payload.token);
        })
        .addCase(thunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
    }
    builder
      .addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload.user; s.ready = true; })
      .addCase(fetchMe.rejected, (s) => {
        s.user = null; s.token = null; s.ready = true;
        localStorage.removeItem('token');
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;