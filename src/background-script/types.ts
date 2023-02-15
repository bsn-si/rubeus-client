import { Note, Credential } from "../models"

export interface ConnectOptions {
  privateKey?: string
  contract?: string
  apiUrl?: string
}

export interface SelectPasswordOptions {
  selectors: { login: string; password: string }
  url: string
}

export interface SelectPasswordResult extends SelectPasswordOptions {
  matched: { login: string; password: string }[]
}

export interface SaveCredentialOptions {
  password: string
  login: string
  host: string
}

export type AddCredentialPayload = Pick<Credential, "payload" | "group">
export type UpdateCredentialPayload = Omit<Credential, "_encrypted">
export type DeleteCredentialPayload = Pick<Credential, "id">

export type AddNotePayload = Pick<Note, "payload">
export type UpdateNotePayload = Omit<Note, "_encrypted">
export type DeleteNotePayload = Pick<Note, "id">