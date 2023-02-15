export enum RpcMethod {
  IsUnlocked = "IS_UNLOCKED",
  Disconnect = "DISCONNECT",
  Connect = "CONNECT",
  Balance = "BALANCE",

  GetCredentials = "GET_CREDENTIALS",
  UpdateCredential = "UPDATE_CREDENTIAL",
  DeleteCredential = "DELETE_CREDENTIAL",
  SelectPassword = "SELECT_PASSWORD",
  AddCredential = "ADD_CREDENTIAL",
  SaveCredential = "SAVE_CREDENTIAL",

  GetNotes = "GET_NOTES",
  UpdateNote = "UPDATE_NOTE",
  DeleteNote = "DELETE_NOTE",
  AddNote = "ADD_NOTE",
}

export interface RpcMessage {
  type: RpcMethod
  data?: any
}

export interface Credential {
  _encrypted?: any
  group: string
  payload: any
  id: string
}

export interface Note {
  _encrypted?: any
  payload: any
  id: string
}
