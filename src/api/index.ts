import { WsProvider, ApiPromise, Keyring } from "@polkadot/api"
import { ContractPromise } from "@polkadot/api-contract"
import { ApiBase } from "@polkadot/api/base"
import BN from "bn.js"

import metadata from "./contract.metadata.json"
import { Credential, Note } from "../models"

import {
  execContractCallWithResult,
  decryptPayloadFromHex,
  encryptPayloadToHex,
  delay,
  generateUUID,
} from "../utils"

const keyring = new Keyring({ type: "sr25519" })

export class API {
  client?: ApiBase<"promise">
  provider?: WsProvider
  apiUrl?: string

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl
  }

  async getProvider(url: string) {
    const provider = new WsProvider(url, false)
    await provider.connect()
    await delay(100)

    if (!provider.isConnected) {
      throw new Error(`Connect to '${this.apiUrl}' failed, try again later`)
    }

    return provider
  }

  async connect(url?: string) {
    if (url) {
      this.apiUrl = url
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
    return this.client
  }

  async disconnect() {
    await this.client?.disconnect()
  }

  async getCredentials(
    privateKey: string,
    contractAddress: string,
  ): Promise<Credential[]> {
    const contract = new ContractPromise(this.client as any, metadata, contractAddress)
    const signer = keyring.addFromUri(privateKey)

    const list = await contract.query
      .getCredentials(signer.address, { gasLimit: -1 })
      .then(response => response.output.toJSON())
      .then((data: any[]) =>
        data.map(credential => {
          credential._encrypted = credential.payload
          credential.payload = decryptPayloadFromHex(
            contract.address,
            privateKey,
            credential.payload,
          )

          return credential
        }),
      )

    return list
  }

  async updateCredential(
    privateKey: string,
    contractAddress: string,
    id: string,
    group: string,
    payload: any,
  ): Promise<Credential> {
    const contract = new ContractPromise(this.client as any, metadata, contractAddress)
    const signer = keyring.addFromUri(privateKey)

    const _payload = encryptPayloadToHex(contract.address, privateKey, payload)
    const _group = group

    await execContractCallWithResult(
      contract,
      signer,
      "updateCredential",
      id,
      _payload,
      _group,
    )

    return {
      _encrypted: _payload,
      payload,
      group,
      id,
    }
  }

  async addCredential(
    privateKey: string,
    contractAddress: string,
    group: string,
    payload: any,
  ): Promise<Credential> {
    const contract = new ContractPromise(this.client as any, metadata, contractAddress)
    const signer = keyring.addFromUri(privateKey)

    const _payload = encryptPayloadToHex(contract.address, privateKey, payload)
    const _group = group

    const id = generateUUID()

    await execContractCallWithResult(
      contract,
      signer,
      "addCredential",
      _payload,
      _group,
      id,
    )

    return {
      _encrypted: _payload,
      payload,
      group,
      id,
    }
  }

  async deleteCredential(privateKey: string, contractAddress: string, id: string) {
    const contract = new ContractPromise(this.client as any, metadata, contractAddress)
    const signer = keyring.addFromUri(privateKey)

    await execContractCallWithResult(contract, signer, "deleteCredential", id)

    return id
  }

  async getNotes(
    privateKey: string,
    contractAddress: string,
  ): Promise<Note[]> {
    const contract = new ContractPromise(this.client as any, metadata, contractAddress)
    const signer = keyring.addFromUri(privateKey)

    const list = await contract.query
      .getNotes(signer.address, { gasLimit: -1 })
      .then(response => response.output.toJSON())
      .then((data: any[]) =>
        data.map(note => {
          note._encrypted = note.payload
          note.payload = decryptPayloadFromHex(
            contract.address,
            privateKey,
            note.payload,
          )

          return note
        }),
      )

    return list
  }

  async updateNote(
    privateKey: string,
    contractAddress: string,
    id: string,
    payload: any,
  ): Promise<Note> {
    const contract = new ContractPromise(this.client as any, metadata, contractAddress)
    const signer = keyring.addFromUri(privateKey)

    const _payload = encryptPayloadToHex(contract.address, privateKey, payload)

    await execContractCallWithResult(
      contract,
      signer,
      "updateNote",
      id,
      _payload,
    )

    return {
      _encrypted: _payload,
      payload,
      id,
    }
  }

  async addNote(
    privateKey: string,
    contractAddress: string,
    payload: any,
  ): Promise<Note> {
    const contract = new ContractPromise(this.client as any, metadata, contractAddress)
    const signer = keyring.addFromUri(privateKey)

    const _payload = encryptPayloadToHex(contract.address, privateKey, payload)
    const id = generateUUID()

    await execContractCallWithResult(
      contract,
      signer,
      "addNote",
      _payload,
      id,
    )

    return {
      _encrypted: _payload,
      payload,
      id,
    }
  }

  async deleteNote(privateKey: string, contractAddress: string, id: string) {
    const contract = new ContractPromise(this.client as any, metadata, contractAddress)
    const signer = keyring.addFromUri(privateKey)

    await execContractCallWithResult(contract, signer, "deleteNote", id)

    return id
  }

  async accountBalance(address: string): Promise<BN> {
    if (!this.client) {
      throw new Error("Doesn't have api instance")
    }

    const {
      data: { free },
    } = (await this.client.query.system.account(address)) as any

    return free
  }
}

export const api = new API()
