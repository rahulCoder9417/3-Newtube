import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: null,
  id: null,
  fullName: null,
  avatar: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.username = action.payload.username;
      state.fullName = action.payload.fullName;
      state.id = action.payload.id;
      state.avatar = action.payload.avatar;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.username = null;
      state.id = null;
      state.fullName = null;
      state.avatar = null;
      state.isAuthenticated = false;
    }
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
