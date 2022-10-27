import { initWasm } from "@polkadot/wasm-crypto/initOnlyAsm"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import Modal from "react-modal"
import React from "react"

import { store } from "./store"
import "reseter.css"
import "./index.css"

import { App } from "./app"

const container = document.getElementById("root") as HTMLElement
Modal.setAppElement(container)

async function main() {
  await initWasm()

  const root = ReactDOM.createRoot(container)

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
  )
}

main()
