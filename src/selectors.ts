import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "./store"

const { keys } = Object

export const encryptedPrivateKey = (state: RootState) => state.settings.encryptedPrivateKey
export const privateKey = (state: RootState) => state.settings.privateKey
export const contract = (state: RootState) => state.settings.contract
export const balance = (state: RootState) => state.settings.balance
export const rpcUrl = (state: RootState) => state.settings.rpcUrl

export const isConnected = (state: RootState) => state.settings.connected
export const settingsLoading = (state: RootState) => state.settings.loading
export const settingsError = (state: RootState) => state.settings.error

export const settingsOpened = (state: RootState) => state.credentials.settingsOpened
export const selectedGroup = (state: RootState) => state.credentials.selectedGroup
export const modalOpened = (state: RootState) => state.credentials.modalOpened
export const credentialsError = (state: RootState) => state.credentials.error
export const editable = (state: RootState) => state.credentials.editable

export const isSelectedGroup = createSelector(
  [selectedGroup, (state: RootState, current: string | undefined) => current],
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