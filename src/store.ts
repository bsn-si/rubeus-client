import { configureStore } from "@reduxjs/toolkit"
import logger from "redux-logger"

import {
  credentialsReducer,
  CredentialsState,
  settingsReducer,
  SettingsState,
  initialSetup,
  watchBalance,
} from "./features"

export const store = configureStore({
  reducer: {
    credentials: credentialsReducer,
    settings: settingsReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger),
})

store.dispatch(initialSetup())
watchBalance(store)

export interface RootState {
  credentials: CredentialsState
  settings: SettingsState
}

export type AppDispatch = typeof store.dispatch