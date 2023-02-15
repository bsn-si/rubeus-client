import { configureStore } from "@reduxjs/toolkit"
import logger from "redux-logger"
import { EXTENSION } from "./config"

import {
  credentialsReducer,
  CredentialsState,
  settingsReducer,
  SettingsState,
  initialSetup,
  watchBalance,
  notesReducer,
  NotesState,
} from "./features"

export const store = configureStore({
  reducer: {
    credentials: credentialsReducer,
    settings: settingsReducer,
    notes: notesReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger),
})

store.dispatch(initialSetup())
watchBalance(store)

export interface RootState {
  credentials: CredentialsState
  settings: SettingsState
  notes: NotesState
}

export type AppDispatch = typeof store.dispatch