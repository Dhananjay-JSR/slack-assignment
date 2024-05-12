import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { STORE_KEY } from "../utils/constants";

export interface AuthStore {
  isAuthenticated: boolean;
  session_id: string | null;
}

const initialState: AuthStore = localStorage.getItem(STORE_KEY)
  ? JSON.parse(localStorage.getItem(STORE_KEY) as string)
  : {
      isAuthenticated: false,
      session_id: null,
    };

export const authSlice = createSlice({
  name: "AuthStore",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.session_id = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.session_id = null;
    },
  },
});

// Action creators are generated for each case reducer function
export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
