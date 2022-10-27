import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { PayloadAction } from "@reduxjs/toolkit"
import * as selectors from "../selectors"
import { Credential } from "../models"
import { RootState } from "../store"
import { delay } from "../utils"
import { api } from "../api"

const { assign } = Object

export interface CredentialsState {
  collection: Record<string, Credential>
  loading: Record<string, boolean>
  groups: Record<string, string[]>
  settingsOpened?: boolean 
  selectedGroup?: string
  modalOpened?: boolean
  editable?: Credential
  error?: string
  ids: string[]
}

interface SetCollectionPayload
  extends Pick<CredentialsState, "groups" | "collection" | "ids"> {}

interface SetLoadingPayload {
  loading?: boolean
  item: string
}

const initialState: CredentialsState = {
  collection: {},
  loading: {},
  groups: {},
  ids: [],
}

export const setCredentialsError = createAsyncThunk(
  "credentials/setError",
  async (error: string, { dispatch }) => {
    setTimeout(() => dispatch({ type: "credentials/setError" }), 2000)
    return error
  },
)

export const getCredentials = createAsyncThunk(
  "credentials/getCredentials",
  async (data: void, { dispatch, getState }) => {
    const state = getState() as RootState

    const connected = selectors.isConnected(state)
    const privateKey = selectors.privateKey(state)
    const contract = selectors.contract(state)

    dispatch(
      setLoading({
        item: "list",
        loading: true,
      }),
    )

    try {
      const credentials = await api.getCredentials(privateKey, contract)

      const action = credentials.reduce<SetCollectionPayload>(
        (rec, credential) => {
          const { id, group } = credential

          if (!rec.groups[group]) {
            rec.groups[group] = []
          }

          rec.collection[id] = credential
          rec.groups[group].push(id)
          rec.ids.push(id)

          return rec
        },
        {
          collection: {},
          groups: {},
          ids: [],
        },
      )

      dispatch(setCollection(action))
    } catch (error) {
      if (connected) {
        dispatch(setCredentialsError("Failed load credentials"))
      }
      
      throw error
    } finally {
      dispatch(
        setLoading({
          item: "list",
          loading: false,
        }),
      )
    }
  },
)

export const updateCredential = createAsyncThunk(
  "credentials/updateCredential",
  async (credential: Credential, { dispatch, getState }) => {
    const state = getState() as RootState
    const privateKey = selectors.privateKey(state)
    const contract = selectors.contract(state)

    dispatch(
      setLoading({
        item: credential.id,
        loading: true,
      }),
    )

    try {
      await api.updateCredential(
        privateKey,
        contract,
        credential.id,
        credential.group,
        credential.payload,
      )

      await delay(300)
      dispatch(setCredential(credential))

      dispatch(
        setLoading({
          item: credential.id,
          loading: false,
        }),
      )
    } catch (error) {
      console.error(error)
      dispatch(setCredentialsError("Failed update credential"))
    }
  },
)

export const addCredential = createAsyncThunk(
  "credentials/addCredential",
  async (credential: Pick<Credential, "group" | "payload">, { dispatch, getState }) => {
    const state = getState() as RootState
    const privateKey = selectors.privateKey(state)
    const contract = selectors.contract(state)

    dispatch(
      setLoading({
        item: "add",
        loading: true,
      }),
    )

    try {
      await api.addCredential(privateKey, contract, credential.group, credential.payload)
      await delay(300)

      dispatch(setCredential(credential))

      dispatch(
        setLoading({
          item: "add",
          loading: false,
        }),
      )
    } catch (error) {
      console.error(error)
      dispatch(setCredentialsError("Failed create credential"))
    }
  },
)

export const deleteCredential = createAsyncThunk(
  "credentials/deleteCredential",
  async (credential: Credential, { dispatch, getState }) => {
    const state = getState() as RootState
    const privateKey = selectors.privateKey(state)
    const contract = selectors.contract(state)

    dispatch(
      setLoading({
        item: credential.id,
        loading: true,
      }),
    )

    try {
      await api.deleteCredential(privateKey, contract, credential.id)
      dispatch(unsetCredential(credential))

      dispatch(
        setLoading({
          item: credential.id,
          loading: false,
        }),
      )
    } catch (error) {
      console.error(error)
      dispatch(setCredentialsError("Failed delete credential"))
    }
  },
)

export const credentialsSlice = createSlice({
  name: "credentials",
  initialState,
  reducers: {
    setLoading(state, { payload }: PayloadAction<SetLoadingPayload>) {
      state.loading[payload.item] = !!payload.loading
    },
    setModalOpened(state, { payload }: PayloadAction<boolean | undefined | void>) {
      state.modalOpened = !!payload
    },
    setSettingsOpened(state, { payload }: PayloadAction<boolean | undefined | void>) {
      state.settingsOpened = !!payload
    },
    setCollection(state, { payload }: PayloadAction<SetCollectionPayload>) {
      assign(state, payload)
    },
    setEditable(state, { payload }: PayloadAction<Credential | undefined | void>) {
      state.editable = payload ? payload : undefined
    },
    setSelectedGroup(state, { payload }: PayloadAction<string | void | undefined>) {
      state.selectedGroup = payload ? payload : undefined
    },
    setCredential(state, { payload }: PayloadAction<Credential>) {
      state.collection[payload.id] = payload

      if (!state.groups[payload.group]) {
        state.groups[payload.group] = []
      }

      if (!state.groups[payload.group].includes(payload.id)) {
        state.groups[payload.group].push(payload.id)
      }

      if (!state.ids.includes(payload.id)) {
        state.ids.push(payload.id)
      }
    },
    unsetCredential(state, { payload }: PayloadAction<Credential>) {
      // prettier-ignore
      state.groups[payload.group] = state.groups[payload.group].filter(id => id !== payload.id)
      state.ids = state.ids.filter(id => id !== payload.id)
      delete state.collection[payload.id]
    },
    setInitialCredentials(state) {
      assign(state, {
        settingsOpened: false,
        modalOpened: false,
        collection: {},
        loading: {},
        groups: {},
        ids: [],
      })
    },
  },

  extraReducers: {
    [setCredentialsError.fulfilled.toString()]: (
      state,
      action: PayloadAction<string | void | undefined>,
    ) => {
      state.error = action.payload || undefined
    },
  },
})

export const {
  setInitialCredentials,
  setSettingsOpened,
  setSelectedGroup,
  unsetCredential,
  setModalOpened,
  setCollection,
  setCredential,
  setEditable,
  setLoading,
} = credentialsSlice.actions as any

export const credentialsReducer = credentialsSlice.reducer