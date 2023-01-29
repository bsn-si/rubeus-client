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
  selectedGroup?: string
  modalOpened?: boolean
  editable?: Credential
  error?: string
  ids: string[]
}

interface setCredentialsCollectionPayload
  extends Pick<CredentialsState, "groups" | "collection" | "ids"> {}

interface setCredentialsLoadingPayload {
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
      setCredentialsLoading({
        item: "list",
        loading: true,
      }),
    )

    try {
      const credentials = await api.getCredentials(privateKey, contract)

      const action = credentials.reduce<setCredentialsCollectionPayload>(
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

      dispatch(setCredentialsCollection(action))
    } catch (error) {      
      if (connected) {
        dispatch(setCredentialsError("Failed load credentials"))
      }
      
      throw error
    } finally {
      dispatch(
        setCredentialsLoading({
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
      setCredentialsLoading({
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
        setCredentialsLoading({
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
  async (params: Pick<Credential, "group" | "payload">, { dispatch, getState }) => {
    const state = getState() as RootState
    const privateKey = selectors.privateKey(state)
    const contract = selectors.contract(state)

    dispatch(
      setCredentialsLoading({
        item: "add",
        loading: true,
      }),
    )

    try {
      const credential = await api.addCredential(privateKey, contract, params.group, params.payload)
      await delay(300)

      dispatch(setCredential(credential))

      dispatch(
        setCredentialsLoading({
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
      setCredentialsLoading({
        item: credential.id,
        loading: true,
      }),
    )

    try {
      await api.deleteCredential(privateKey, contract, credential.id)
      dispatch(unsetCredential(credential))

      dispatch(
        setCredentialsLoading({
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
    setCredentialsLoading(state, { payload }: PayloadAction<setCredentialsLoadingPayload>) {
      state.loading[payload.item] = !!payload.loading
    },
    setCredentialsModalOpened(state, { payload }: PayloadAction<boolean | undefined | void>) {
      state.modalOpened = !!payload
    },
    setCredentialsCollection(state, { payload }: PayloadAction<setCredentialsCollectionPayload>) {
      assign(state, payload)
    },
    setCredentialEditable(state, { payload }: PayloadAction<Credential | undefined | void>) {
      state.editable = payload ? payload : undefined
    },
    setSelectedNotesGroup(state, { payload }: PayloadAction<string | void | undefined>) {
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
      state.groups[payload.group] = state.groups[payload.group]
        .filter(id => id !== payload.id)
      
      if (!state.groups[payload.group].length) {
        delete state.groups[payload.group]
      }

      state.ids = state.ids.filter(id => id !== payload.id)
      delete state.collection[payload.id]
    },
    setInitialCredentials(state) {
      assign(state, {
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
  setCredentialsModalOpened,
  setCredentialsCollection,
  setCredentialEditable,
  setInitialCredentials,
  setSelectedNotesGroup,
  setCredentialsLoading,
  unsetCredential,
  setCredential,
} = credentialsSlice.actions as any

export const credentialsReducer = credentialsSlice.reducer