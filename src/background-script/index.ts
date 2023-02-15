import { parseDomain, fromUrl, ParseResultType } from "parse-domain"
import { WsProvider, ApiPromise, Keyring } from "@polkadot/api"
import { initWasm } from "@polkadot/wasm-crypto/initOnlyAsm"
import { ContractPromise } from "@polkadot/api-contract"
import { KeyringPair } from "@polkadot/keyring/types"
import { ApiBase } from "@polkadot/api/base"

import { Credential, Note, RpcMessage, RpcMethod } from "../models"
import { addListener } from "../messaging"

import metadata from "./contract.metadata.json"

import {
  execContractCallWithResult,
  decryptPayloadFromHex,
  encryptPayloadToHex,
  generateUUID,
  delay,
} from "../utils"

import {
  DeleteCredentialPayload,
  UpdateCredentialPayload,
  SelectPasswordOptions,
  AddCredentialPayload,
  DeleteNotePayload,
  UpdateNotePayload,
  AddNotePayload,
  ConnectOptions,
  SaveCredentialOptions,
} from "./types"

const keyring = new Keyring({ type: "sr25519" })

export class API {
  contract?: ContractPromise
  signer?: KeyringPair
  privateKey?: string
  apiUrl?: string

  client?: ApiBase<"promise">
  provider?: WsProvider

  constructor() {
    this.isUnlocked = this.isUnlocked.bind(this)
    this.balance = this.balance.bind(this)
    this.disconnect = this.disconnect.bind(this)
    this.connect = this.connect.bind(this)

    this.selectPassword = this.selectPassword.bind(this)
    this.getCredentials = this.getCredentials.bind(this)
    this.updateCredential = this.updateCredential.bind(this)
    this.deleteCredential = this.deleteCredential.bind(this)
    this.saveCredential = this.saveCredential.bind(this)
    this.addCredential = this.addCredential.bind(this)

    this.getNotes = this.getNotes.bind(this)
    this.updateNote = this.updateNote.bind(this)
    this.deleteNote = this.deleteNote.bind(this)
    this.addNote = this.addNote.bind(this)

    this.checkContract = this.checkContract.bind(this)
    this.checkConnect = this.checkConnect.bind(this)
    this.checkUser = this.checkUser.bind(this)

    this.callContract = this.callContract.bind(this)
    this.setupEvents = this.setupEvents.bind(this)
    this.init = this.init.bind(this)
  }

  async getProvider(url: string) {
    const provider = new WsProvider(url, false)
    await provider.connect()
    await delay(100)

    if (!provider.isConnected) {
      throw new Error(`Connect to "${this.apiUrl}" failed, try again later`)
    }

    return provider
  }

  public async connect(options: ConnectOptions) {
    if (options.apiUrl) {
      this.apiUrl = options.apiUrl
    }

    if (!this.apiUrl) {
      throw new Error("RPC url for connection required")
    }

    const provider = await this.getProvider(this.apiUrl)
    this.provider?.disconnect()

    const client = await ApiPromise.create({ provider })

    this.provider = provider
    this.client = client

    const [chain, nodeName, nodeVersion] = await Promise.all([
      client.rpc.system.chain(),
      client.rpc.system.name(),
      client.rpc.system.version(),
    ])

    console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`)

    if (options.contract) {
      this.contract = new ContractPromise(this.client as any, metadata, options.contract)
    }

    if (options.privateKey) {
      this.signer = keyring.addFromUri(options.privateKey)
      this.privateKey = options.privateKey
    }

    return true
  }

  public async disconnect() {
    await this.client?.disconnect()

    Object.assign(this, {
      privateKey: undefined,
      contract: undefined,
      provider: undefined,
      signer: undefined,
      apiUrl: undefined,
      client: undefined,
    })
  }

  public async getCredentials(): Promise<Credential[]> {
    const _decode = (credential: any) => {
      credential._encrypted = credential.payload

      credential.payload = decryptPayloadFromHex(
        this.contract.address,
        this.privateKey,
        credential.payload,
      )

      return credential
    }

    const list = await this.contract.query
      .getCredentials(this.signer.address, { gasLimit: -1 })
      .then(response => response.output.toJSON())
      .then((data: any[]) => data.map(_decode))

    return list
  }

  public async updateCredential({
    id,
    group,
    payload,
  }: UpdateCredentialPayload): Promise<Credential> {
    const _payload = encryptPayloadToHex(this.contract.address, this.privateKey, payload)
    const _group = group

    await this.callContract("updateCredential", id, _payload, _group)

    return {
      _encrypted: _payload,
      payload,
      group,
      id,
    }
  }

  public async addCredential({ group, payload }: AddCredentialPayload): Promise<Credential> {
    const _payload = encryptPayloadToHex(this.contract.address, this.privateKey, payload)
    const id = generateUUID()
    const _group = group

    await this.callContract("addCredential", _payload, _group, id)

    return {
      _encrypted: _payload,
      payload,
      group,
      id,
    }
  }

  public async saveCredential(data: SaveCredentialOptions): Promise<Credential | undefined> {
    const result = parseDomain(fromUrl(data.host))

    if (result.type === ParseResultType.Listed) {
      const { domain, topLevelDomains } = result
      const host = `${domain}.${topLevelDomains[0]}`

      const credentials = await this.getCredentials()
      let exists = false

      for (const { payload } of credentials) {
        if (host === payload.host && data.login === payload.login) {
          exists = true
          break
        }
      }

      if (!exists) {
        const created = await this.addCredential({ group: "Default", payload: data })
        return created
      }
    }

    return undefined
  }

  public async deleteCredential({ id }: DeleteCredentialPayload) {
    await this.callContract("deleteCredential", id)
    return id
  }

  public async getNotes(): Promise<Note[]> {
    const _decode = (note: any) => {
      note._encrypted = note.payload
      note.payload = decryptPayloadFromHex(this.contract.address, this.privateKey, note.payload)

      return note
    }

    const list = await this.contract.query
      .getNotes(this.signer.address, { gasLimit: -1 })
      .then(response => response.output.toJSON())
      .then((data: any[]) => data.map(_decode))

    return list
  }

  public async updateNote({ id, payload }: UpdateNotePayload): Promise<Note> {
    const _payload = encryptPayloadToHex(this.contract.address, this.privateKey, payload)
    await this.callContract("updateNote", id, _payload)

    return {
      _encrypted: _payload,
      payload,
      id,
    }
  }

  public async addNote({ payload }: AddNotePayload): Promise<Note> {
    const _payload = encryptPayloadToHex(this.contract.address, this.privateKey, payload)
    const id = generateUUID()

    await this.callContract("addNote", _payload, id)

    return {
      _encrypted: _payload,
      payload,
      id,
    }
  }

  public async deleteNote({ id }: DeleteNotePayload) {
    await this.callContract("deleteNote", id)
    return id
  }

  public async selectPassword({ selectors, url }: SelectPasswordOptions) {
    const _parse = (url: string) => {
      const parsed = parseDomain(fromUrl(url))

      if (parsed.type === ParseResultType.Listed) {
        return `${parsed.domain}.${parsed.topLevelDomains[0]}`
      } else {
        throw new Error(`InvalidDomain = ${url}`)
      }
    }

    const credentials = await this.getCredentials()
    const domain = _parse(url)

    const matched = []

    for (const { payload } of credentials) {
      try {
        if (_parse(payload.host) === domain) {
          const data = { login: payload.login, password: payload.password }
          matched.push(data)
        }
      } catch (error) {
        // @PASS
      }
    }

    return {
      selectors,
      matched,
    }
  }

  public async balance(): Promise<string> {
    const {
      data: { free },
    } = (await this.client.query.system.account(this.signer.address)) as any

    return free.toString()
  }

  public async isUnlocked(): Promise<boolean> {
    const status = !!this.client?.isConnected && !!this.signer && !!this.contract
    return status
  }

  public async callContract<T = any>(method: string, ...args: any[]): Promise<T> {
    return execContractCallWithResult(this.contract, this.signer, method, ...args)
  }

  public checkConnect() {
    if (!this.client || !this?.client?.isConnected) {
      throw new Error("NOT_CONNECTED")
    }
  }

  public checkUser() {
    if (!this.privateKey || !this.signer) {
      throw new Error("SIGNER_NOT_FOUND")
    }
  }

  public checkContract() {
    if (!this.contract) {
      throw new Error("CONTRACT_NOT_FOUND")
    }
  }

  public setupEvents() {
    const methods = {
      [RpcMethod.Balance]: this.balance,
      [RpcMethod.Disconnect]: this.disconnect,
      [RpcMethod.Connect]: this.connect,
      [RpcMethod.IsUnlocked]: this.isUnlocked,

      [RpcMethod.GetCredentials]: this.getCredentials,
      [RpcMethod.UpdateCredential]: this.updateCredential,
      [RpcMethod.DeleteCredential]: this.deleteCredential,
      [RpcMethod.AddCredential]: this.addCredential,
      [RpcMethod.SaveCredential]: this.saveCredential,
      [RpcMethod.SelectPassword]: this.selectPassword,

      [RpcMethod.GetNotes]: this.getNotes,
      [RpcMethod.UpdateNote]: this.updateNote,
      [RpcMethod.DeleteNote]: this.deleteNote,
      [RpcMethod.AddNote]: this.addNote,
    }

    const _handle = async (type: RpcMethod, data: any, check = false) => {
      const response: any = {
        type,
      }

      try {
        if (check) {
          this.checkConnect()
          this.checkUser()
          this.checkContract()
        }

        const result = await methods[type](data)
        response.data = result
      } catch (error) {
        console.error(error)
        response.error = error.message
      }

      return response
    }

    addListener(function ({ type, data }: RpcMessage, sender, sendResponse) {
      const needCheck = ![RpcMethod.Connect, RpcMethod.Disconnect, RpcMethod.IsUnlocked].includes(
        type,
      )
      _handle(type, data, needCheck).then(sendResponse)
      return true
    })
  }

  public async init() {
    await initWasm()
    this.setupEvents()
  }
}

const api = new API()
api.init().then(() => console.log("API Was initialized"))
