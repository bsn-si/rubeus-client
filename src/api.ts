import BN from "bn.js"

import { RpcMethod, Note, Credential } from "./models"
import { sendMessage } from "./messaging"

import {
  UpdateCredentialPayload,
  DeleteCredentialPayload,
  AddCredentialPayload,
  DeleteNotePayload,
  UpdateNotePayload,
  AddNotePayload,
  ConnectOptions,
  SelectPasswordOptions,
  SaveCredentialOptions,
  SelectPasswordResult,
} from "./background-script/types"

export async function balance(): Promise<BN> {
  const bigint = await sendMessage({ type: RpcMethod.Balance })
  return new BN(bigint)
}

export async function disconnect() {
  return sendMessage({ type: RpcMethod.Disconnect })
}

export async function isUnlocked(): Promise<boolean> {
  return sendMessage({ type: RpcMethod.IsUnlocked })
}

export async function connect(data: ConnectOptions): Promise<boolean> {
  return sendMessage({ type: RpcMethod.Connect, data })
}

export async function getCredentials(): Promise<Credential[]> {
  return sendMessage({ type: RpcMethod.GetCredentials })
}

export async function selectPassword(data: SelectPasswordOptions): Promise<SelectPasswordResult> {
  return sendMessage({ type: RpcMethod.SelectPassword, data })
}

export async function updateCredential(data: UpdateCredentialPayload): Promise<Credential> {
  return sendMessage({ type: RpcMethod.UpdateCredential, data })
}

export async function deleteCredential(data: DeleteCredentialPayload): Promise<string> {
  return sendMessage({ type: RpcMethod.DeleteCredential, data })
}

export async function addCredential(data: AddCredentialPayload): Promise<Credential> {
  return sendMessage({ type: RpcMethod.AddCredential, data })
}

export async function saveCredential(data: SaveCredentialOptions): Promise<Credential | undefined> {
  return sendMessage({ type: RpcMethod.SaveCredential, data })
}

export async function getNotes(): Promise<Note[]> {
  return sendMessage({ type: RpcMethod.GetNotes })
}

export async function updateNote(data: UpdateNotePayload): Promise<Note> {
  return sendMessage({ type: RpcMethod.UpdateNote, data })
}

export async function deleteNote(data: DeleteNotePayload): Promise<string> {
  return sendMessage({ type: RpcMethod.DeleteNote, data })
}

export async function addNote(data: AddNotePayload): Promise<Note> {
  return sendMessage({ type: RpcMethod.AddNote, data })
}
