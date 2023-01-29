import { createSlice, createAsyncThunk, Store } from "@reduxjs/toolkit"
import { PayloadAction } from "@reduxjs/toolkit"
import { AES, enc } from "crypto-js"
import BN from "bn.js"

import { getCredentials, setInitialCredentials } from "./credentials"
import { CONTRACT, keyring, RPC_URL } from "../utils"
import { getNotes, setInitialNotes } from "./notes"
import * as selectors from "../selectors"
import { RootState } from "../store"
import { api } from "../api"

const { assign } = Object

export enum Tab {
  Credentials = "credentials",
  Notes = "notes",
}

export interface SettingsState {
  encryptedPrivateKey?: string
  privateKey?: string

  contract?: string
  rpcUrl?: string

  connected: boolean
  tab: Tab

  settingsOpened?: boolean 
  loading: boolean
  error?: string
  balance?: BN
}

const initialState: SettingsState = {
  contract: CONTRACT,
  rpcUrl: RPC_URL,

  tab: Tab.Credentials,
  connected: false,
  loading: false,
}

{
  try {
    const { encryptedPrivateKey, contract, rpcUrl } = JSON.parse(
      localStorage.data || "{}",
    )

    if (encryptedPrivateKey && contract && rpcUrl) {
      assign(initialState, {
        encryptedPrivateKey,
        contract,
        rpcUrl,
      })
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
  const tmp = JSON.parse(localStorage.temp || "{}")
  assign(tmp, obj)
  localStorage.setItem("temp", JSON.stringify(tmp))
}

export const watchBalance = (store: Store<RootState>) => {
  const requestBalance = async () => {
    const state = store.getState()
    const isConnected = selectors.isConnected(state)
    const privateKey = selectors.privateKey(state)

    if (isConnected && privateKey && api.client) {
      const signer = keyring.addFromUri(privateKey)
      const response = (await api.client.query.system.account(signer.address)) as any
      const balance = response.data.free.toString()
      store.dispatch(setBalance(balance))
    } else {
      store.dispatch(setBalance())
    }
  }

  setInterval(requestBalance, 2000)
}

export const setSetingsError = createAsyncThunk(
  "settings/setError",
  async (error: string | undefined | void, { dispatch }) => {
    // if (error) {
    //   setTimeout(() => dispatch(setSetingsError()), 2000)
    // }

    return error
  },
)

export const initialSetup = createAsyncThunk(
  "settings/initialSetup",
  async (_: void, { getState, dispatch }) => {
    // const state = getState() as RootState
    // dispatch(connect({}))
  },
)

export const reset = createAsyncThunk("settings/reset", async (_: void, { dispatch }) => {
  localStorage.removeItem("data")

  dispatch(setInitialCredentials())
  dispatch(setInitialSettings())
  dispatch(setInitialNotes())
})

export const connect = createAsyncThunk(
  "settings/connect",
  async (options: { password?: string }, { dispatch, getState }) => {
    const state = getState() as RootState

    const { rpcUrl, contract, encryptedPrivateKey } = state.settings
    let { privateKey } = state.settings

    await Promise.all([
      dispatch(setInitialCredentials()),
      dispatch(setInitialNotes()),
      dispatch(setSetingsError())
    ])

    if (privateKey && encryptedPrivateKey) {
      localStorage.setItem(
        "data",
        JSON.stringify({
          encryptedPrivateKey,
          contract,
          rpcUrl,
        }),
      )
    }

    if (options.password && privateKey && !encryptedPrivateKey) {
      const encryptedPrivateKey = AES.encrypt(privateKey, options.password).toString()

      localStorage.setItem(
        "data",
        JSON.stringify({
          encryptedPrivateKey,
          contract,
          rpcUrl,
        }),
      )
    }

    if (options.password && encryptedPrivateKey && !privateKey) {
      try {
        privateKey = AES.decrypt(encryptedPrivateKey, options.password).toString(enc.Utf8)
        dispatch(setPrivateKey(privateKey))
      } catch (error) {
        dispatch(setSetingsError("Invalid password"))
        console.error(error)
        return
      }
    }

    if (rpcUrl && contract && privateKey) {
      localStorage.removeItem("temp")

      try {
        await api.connect(rpcUrl)

        try {
          await Promise.all([
            await dispatch(getCredentials()).unwrap(),
            await dispatch(getNotes()).unwrap()
          ])
          dispatch(setConnected(true))
        } catch (error) {
          await api.disconnect()
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
    setTab(state, action: PayloadAction<Tab>) {
      state.tab = action.payload
    },
    setPrivateKey(state, action: PayloadAction<string | void | undefined>) {
      extendTmp({ privateKey: action.payload || undefined })
      state.privateKey = action.payload || undefined
    },
    setSettingsOpened(state, { payload }: PayloadAction<boolean | undefined | void>) {
      state.settingsOpened = !!payload
    },
    setConnected(state, action: PayloadAction<boolean | void | undefined>) {
      state.connected = !!action.payload
    },
    setInitialSettings(state) {
      assign(state, {
        encryptedPrivateKey: undefined,
        skipWelcomeScreen: false,
        settingsOpened: false,
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
  setSettingsOpened,
  setPrivateKey,
  setConnected,
  setContract,
  setBalance,
  setRpcUrl,
  setTab,
} = settingsSlice.actions as any

export const settingsReducer = settingsSlice.reducer