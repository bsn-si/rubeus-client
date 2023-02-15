import { RpcMessage } from "./models"
import { EXTENSION } from "./config"

type UniversalListener = (
  message: RpcMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (data: any) => void,
) => void

let CALLBACK: UniversalListener = () => {
  /* pass */
}

const getChromeRuntime = () => {
  if (typeof window === "undefined") {
    return globalThis.chrome.runtime
  } else {
    return window.chrome.runtime
  }
}

export async function sendMessage(message: RpcMessage) {
  let data

  if (EXTENSION) {
    data = await getChromeRuntime().sendMessage(message)
  } else {
    const action = new Promise((resolve, reject) => {
      CALLBACK(message, {} as any, resolve)
      setTimeout(() => reject(new Error("Response timed-out")), 6000)
    })

    data = await action
  }

  if (data.error) {
    throw new Error(data.error)
  }

  return data.data
}

export async function addListener(callback: UniversalListener) {
  if (EXTENSION) {
    getChromeRuntime().onMessage.addListener(callback)
  } else {
    CALLBACK = callback
  }
}
