import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { PayloadAction } from "@reduxjs/toolkit"
import * as selectors from "../selectors"
import { RootState } from "../store"
import { Note } from "../models"
import { delay } from "../utils"
import { api } from "../api"

const { assign } = Object

export interface NotesState {
  collection: Record<string, Note>
  loading: Record<string, boolean>
  modalOpened?: boolean
  editable?: Note
  error?: string
  active?: Note
  ids: string[]
}

interface setCredentialsCollectionPayload
  extends Pick<NotesState, "collection" | "ids"> {}

interface SetLoadingPayload {
  loading?: boolean
  item: string
}

const initialState: NotesState = {
  collection: {},
  loading: {},
  ids: [],
}

export const setNotesError = createAsyncThunk(
  "notes/setError",
  async (error: string, { dispatch }) => {
    setTimeout(() => dispatch({ type: "notes/setError" }), 2000)
    return error
  },
)

export const getNotes = createAsyncThunk(
  "notes/getNotes",
  async (data: void, { dispatch, getState }) => {
    const state = getState() as RootState

    const connected = selectors.isConnected(state)
    const privateKey = selectors.privateKey(state)
    const contract = selectors.contract(state)

    dispatch(
      setNotesLoading({
        item: "list",
        loading: true,
      }),
    )

    try {
      const notes = await api.getNotes(privateKey, contract)

      const action = notes.reduce<setCredentialsCollectionPayload>(
        (rec, note) => {
          const { id } = note
          rec.collection[id] = note
          rec.ids.push(id)

          return rec
        },
        {
          collection: {},
          ids: [],
        },
      )

      dispatch(setNotesCollection(action))
    } catch (error) {      
      if (connected) {
        dispatch(setNotesError("Failed load notes"))
      }
      
      throw error
    } finally {
      dispatch(
        setNotesLoading({
          item: "list",
          loading: false,
        }),
      )
    }
  },
)

export const updateNote = createAsyncThunk(
  "notes/updateNote",
  async (note: Note, { dispatch, getState }) => {
    const state = getState() as RootState
    const privateKey = selectors.privateKey(state)
    const contract = selectors.contract(state)

    dispatch(
      setNotesLoading({
        item: note.id,
        loading: true,
      }),
    )

    try {
      await api.updateNote(
        privateKey,
        contract,
        note.id,
        note.payload,
      )

      await delay(300)
      
      dispatch(setActiveNote(note))
      dispatch(setNote(note))

      dispatch(
        setNotesLoading({
          item: note.id,
          loading: false,
        }),
      )
    } catch (error) {
      console.error(error)
      dispatch(setNotesError("Failed update note"))
    }
  },
)

export const addNote = createAsyncThunk(
  "notes/addNote",
  async (params: Pick<Note, "payload">, { dispatch, getState }) => {
    const state = getState() as RootState
    const privateKey = selectors.privateKey(state)
    const contract = selectors.contract(state)

    dispatch(
      setNotesLoading({
        item: "add",
        loading: true,
      }),
    )

    try {
      const note = await api.addNote(privateKey, contract, params.payload)
      await delay(300)

      dispatch(setNote(note))

      dispatch(
        setNotesLoading({
          item: "add",
          loading: false,
        }),
      )
    } catch (error) {
      console.error(error)
      dispatch(setNotesError("Failed create note"))
    }
  },
)

export const deleteNote = createAsyncThunk(
  "notes/deleteNote",
  async (note: Note, { dispatch, getState }) => {
    const state = getState() as RootState
    const privateKey = selectors.privateKey(state)
    const contract = selectors.contract(state)

    dispatch(
      setNotesLoading({
        item: note.id,
        loading: true,
      }),
    )

    try {
      await api.deleteNote(privateKey, contract, note.id)
      dispatch(setActiveNote())
      dispatch(unsetNote(note))

      dispatch(
        setNotesLoading({
          item: note.id,
          loading: false,
        }),
      )
    } catch (error) {
      console.error(error)
      dispatch(setNotesError("Failed delete note"))
    }
  },
)

export const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    setNotesLoading(state, { payload }: PayloadAction<SetLoadingPayload>) {
      state.loading[payload.item] = !!payload.loading
    },
    setNotesModalOpened(state, { payload }: PayloadAction<boolean | undefined | void>) {
      state.modalOpened = !!payload
    },
    setNotesCollection(state, { payload }: PayloadAction<setCredentialsCollectionPayload>) {
      assign(state, payload)
    },
    setNoteEditable(state, { payload }: PayloadAction<Note | undefined | void>) {
      state.editable = payload ? payload : undefined
    },
    setActiveNote(state, { payload }: PayloadAction<Note | undefined | void>) {
      state.active = payload ? payload : undefined
    },
    setNote(state, { payload }: PayloadAction<Note>) {
      state.collection[payload.id] = payload

      if (!state.ids.includes(payload.id)) {
        state.ids.push(payload.id)
      }
    },
    unsetNote(state, { payload }: PayloadAction<Note>) {
      state.ids = state.ids.filter(id => id !== payload.id)
      delete state.collection[payload.id]
    },
    setInitialNotes(state) {
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
    [setNotesError.fulfilled.toString()]: (
      state,
      action: PayloadAction<string | void | undefined>,
    ) => {
      state.error = action.payload || undefined
    },
  },
})

export const {
  setNotesModalOpened,
  setNotesCollection,
  setNotesLoading,
  setInitialNotes,
  setNoteEditable,
  setActiveNote,
  unsetNote,
  setNote,
} = notesSlice.actions as any

export const notesReducer = notesSlice.reducer