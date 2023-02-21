import { createSlice } from '@reduxjs/toolkit';

// Slice

const slice = createSlice({
  name: 'login',
  initialState: {
    account: null,
    myName: null,
    email: [],
    connected: null,
    proxy: null,
    injectJs: '',
    user: null,
  },
  reducers: {
    setSocket: (state, action) => {
      state.connected = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setMyName: (state, action) => {
      state.myName = action.payload;
    },
    setAuth: (state, action) => {
      state.account = action.payload;
    },
    setEmails: (state, action) => {
      state.email = action.payload;
    },
    setProxy: (state, action) => {
      state.proxy = action.payload;
    },
    setInjectJs: (state, action) => {
      state.injectJs = action.payload;
    },
  },
});

export const {
  setSocket,
  setAuth,
  setMyName,
  setEmails,
  setProxy,
  setUser,
  setInjectJs,
} = slice.actions;

export default slice.reducer;
