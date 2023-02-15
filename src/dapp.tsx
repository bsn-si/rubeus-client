import { initWasm } from "@polkadot/wasm-crypto/initOnlyAsm"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import Modal from "react-modal"
import React from "react"

import { EXTENSION } from "./config"
import { store } from "./store"
import "reseter.css"
import "./index.css"

import { App } from "./app"

if (!EXTENSION) {
  require("./background-script/index")
}

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
