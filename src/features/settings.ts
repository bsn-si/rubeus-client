import { createSlice, createAsyncThunk, Store } from "@reduxjs/toolkit"
import { PayloadAction } from "@reduxjs/toolkit"
import BN from "bn.js"

import { getCredentials, setInitialCredentials } from "./credentials"
import { CONTRACT, keyring, RPC_URL } from "../utils"
import * as selectors from "../selectors"
import { RootState } from "../store"
import { api } from "../api"

const { assign } = Object

export interface SettingsState {
  skipWelcomeScreen?: boolean

  privateKey?: string
  contract?: string
  rpcUrl?: string

  connected: boolean
  loading: boolean
  error?: string
  balance?: BN
}

const initialState: SettingsState = {
  contract: CONTRACT,
  rpcUrl: RPC_URL,

  connected: false,
  loading: false
}

{
  try {
    const saved = JSON.parse(localStorage.data || "{}")
    Object.assign(initialState, saved)
  
    if (saved.privateKey && saved.contract && saved.rpcUrl) {
      initialState.skipWelcomeScreen = true
    }
  } finally {
    // @PASS
  }
}

// @FIX: unfocus extension
{
  try {
    const temp = JSON.parse(localStorage.temp || "{}")
    Object.assign(initialState, temp)
  } finally {
    // @PASS
  }
}

const extendTmp = (obj: any) => {
  const temp = JSON.parse(localStorage.temp || "{}")
  Object.assign(temp, obj)
  localStorage.setItem("temp", JSON.stringify(temp))
}

export const watchBalance = (store: Store<RootState>) => {
  const requestBalance = async () => {
    const state = store.getState()
    const isConnected = selectors.isConnected(state)
    const privateKey = selectors.privateKey(state)

    if (isConnected && privateKey && api.client) {
      const signer = keyring.addFromUri(privateKey)
      const response = await api.client.query.system.account(signer.address) as any
      const balance = response.data.free.toString()
      store.dispatch(setBalance(balance))
    } else {
      store.dispatch(setBalance())
    }
  }

  setTimeout(requestBalance, 2000)
}

export const setSetingsError = createAsyncThunk(
  "settings/setError",
  async (error: string | undefined | void, { dispatch }) => {
    if (error) {
      setTimeout(() => dispatch(setSetingsError()), 2000)
    }
    
    return error
  },
)

export const initialSetup = createAsyncThunk(
  "settings/initialSetup",
  async (_: void, { getState, dispatch }) => {
    const state = getState() as RootState

    const { skipWelcomeScreen } = state.settings

    if (skipWelcomeScreen) {
      dispatch(connect(true))
    }
  },
)

export const reset = createAsyncThunk(
  "settings/reset",
  async (_: void, { dispatch }) => {
    localStorage.removeItem("data")
    
    dispatch(setInitialCredentials())
    dispatch(setInitialSettings())
  },
)

export const connect = createAsyncThunk(
  "settings/connect",
  async (save: boolean, { dispatch, getState }) => {
    const state = getState() as RootState

    const { rpcUrl, contract, privateKey, connected } = state.settings
    dispatch(setInitialCredentials())

    if (save || connected) {
      localStorage.setItem(
        "data",
        JSON.stringify({
          privateKey,
          contract,
          rpcUrl,
        }),
      )
    }

    if (rpcUrl && contract && privateKey) {
      localStorage.removeItem("temp")

      try {
        await api.connect(rpcUrl)

        try {
          await dispatch(getCredentials()).unwrap()
          dispatch(setConnected(true))
        } catch (error) {
          await api.disconnect()
          dispatch(setSkipWelcome(false))
          dispatch(setSetingsError("Connect to contract failed"))
        }
      } catch (error) {
        console.error(error)
        dispatch(setSetingsError("Connect to RPC failed"))
      }
    } else {
      dispatch(setSetingsError("Pleae fill contract, private key and rpc"))
    }
  },
)

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setContract(state, action: PayloadAction<string | void | undefined>) {
      extendTmp({ contract: action.payload || undefined })
      state.contract = action.payload || undefined
    },
    setRpcUrl(state, action: PayloadAction<string | void | undefined>) {
      extendTmp({ rpcUrl: action.payload || undefined })
      state.rpcUrl = action.payload || undefined
    },
    setBalance(state, action: PayloadAction<BN | void | undefined>) {
      state.balance = action.payload || undefined
    },
    setPrivateKey(state, action: PayloadAction<string | void | undefined>) {
      extendTmp({ privateKey: action.payload || undefined })
      state.privateKey = action.payload || undefined
    },
    setConnected(state, action: PayloadAction<boolean | void | undefined>) {
      state.connected = !!action.payload
    },
    setSkipWelcome(state, action: PayloadAction<boolean | void | undefined>) {
      state.skipWelcomeScreen = !!action.payload
    },
    setInitialSettings(state) {
      assign(state, {
        skipWelcomeScreen: false,
        privateKey: undefined,
        contract: CONTRACT,
        rpcUrl: RPC_URL,

        connected: false,
        loading: false,
      })
    },
  },

  extraReducers: {
    [setSetingsError.fulfilled.toString()]: (
      state,
      action: PayloadAction<string | void | undefined>,
    ) => {
      state.error = action.payload || undefined
    },
  },
})

export const {
  setInitialSettings,
  setSkipWelcome,
  setPrivateKey,
  setConnected,
  setContract,
  setBalance,
  setRpcUrl,
} = settingsSlice.actions as any

export const settingsReducer = settingsSlice.reducer