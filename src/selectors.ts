import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "./store"

const { keys } = Object

export const encryptedPrivateKey = (state: RootState) => state.settings.encryptedPrivateKey
export const settingsModalOpened = (state: RootState) => state.settings.settingsOpened
export const privateKey = (state: RootState) => state.settings.privateKey
export const contract = (state: RootState) => state.settings.contract
export const balance = (state: RootState) => state.settings.balance
export const rpcUrl = (state: RootState) => state.settings.rpcUrl
export const tab = (state: RootState) => state.settings.tab

export const isConnected = (state: RootState) => state.settings.connected
export const settingsLoading = (state: RootState) => state.settings.loading
export const settingsError = (state: RootState) => state.settings.error

export const credentialsSelectedGroup = (state: RootState) => state.credentials.selectedGroup
export const credentialModalOpened = (state: RootState) => state.credentials.modalOpened
export const credentialEditable = (state: RootState) => state.credentials.editable
export const credentialsError = (state: RootState) => state.credentials.error

export const isSelectedGroup = createSelector(
  [credentialsSelectedGroup, (state: RootState, current: string | undefined) => current],
  (selected, current) => selected === current,
)

export const credentials = createSelector(
  [
    (state: RootState) => state.credentials.collection,
    (state: RootState) => state.credentials.selectedGroup,
    (state: RootState) => state.credentials.groups,
    (state: RootState) => state.credentials.ids,
  ],
  (collection, group, groups, allIds) => {
    const ids = group ? groups[group] : allIds

    if (!ids) {
      return []
    }

    return ids.map(id => collection[id])
  },
)

export const groups = createSelector(
  (state: RootState) => state.credentials.groups,
  map => keys(map),
)

export const credentialsLoading = createSelector(
  [(state: RootState) => state.credentials.loading, (_: RootState, name: string) => name],
  (loading, name) => loading[name],
)

export const noteModalOpened = (state: RootState) => state.notes.modalOpened
export const noteEditable = (state: RootState) => state.notes.editable
export const noteActive = (state: RootState) => state.notes.active
export const notesError = (state: RootState) => state.notes.error

export const notes = createSelector(
  [(state: RootState) => state.notes.collection, (state: RootState) => state.notes.ids],
  (collection, ids) => {
    return ids.map(id => collection[id])
  },
)

export const notesLoading = createSelector(
  [(state: RootState) => state.notes.loading, (_: RootState, name: string) => name],
  (loading, name) => loading[name],
)

export const someListIsLoading = createSelector(
  [
    (state: RootState) => credentialsLoading(state, "list"),
    (state: RootState) => notesLoading(state, "list"),
  ],
  (notes, credentials) => notes || credentials,
)

export const someModalIsOpened = createSelector(
  [credentialModalOpened, noteModalOpened, settingsModalOpened],
  (credential, note, settings) => credential || note || settings,
)
