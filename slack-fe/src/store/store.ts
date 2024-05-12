import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from "@reduxjs/toolkit";

import AuthReducer, { login, logout } from "./AuthStore";
import { STORE_KEY } from "../utils/base";

const localStorageMiddleware = createListenerMiddleware();

localStorageMiddleware.startListening({
  matcher: isAnyOf(login, logout),
  effect: (action, listenerApi) =>
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify(
        (listenerApi.getState() as ReturnType<typeof store.getState>)
          .AuthReducer
      )
    ),
});

export const store = configureStore({
  reducer: {
    AuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(localStorageMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
