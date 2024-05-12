import { createSlice } from "@reduxjs/toolkit";
import { STORE_KEY } from "../utils/base";

// Frontend Doesn't Store any Auth State
// All Auth State is stored in the Backend and in httpOnly Cookies
export interface AuthStore {
  isAuthenticated: boolean;
}

const initialState: AuthStore = localStorage.getItem(STORE_KEY)
  ? JSON.parse(localStorage.getItem(STORE_KEY) as string)
  : {
      isAuthenticated: false,
    };

export const authSlice = createSlice({
  name: "AuthStore",
  initialState,
  reducers: {
    login: (state) => {
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
