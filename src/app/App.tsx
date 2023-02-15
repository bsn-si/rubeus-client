import { useSelector } from "react-redux"
import { clsx } from "clsx"

import { Layout, Settings, Unlock } from "../containers"
import * as selectors from "../selectors"
import { EXTENSION } from "../config"
import "./App.css"

export function App() {
  const encryptedPrivateKey = useSelector(selectors.encryptedPrivateKey)
  const connected = useSelector(selectors.isConnected)
  const privateKey = useSelector(selectors.privateKey)

  const isUnlock = encryptedPrivateKey && !privateKey ? <Unlock /> : <Settings action="connect" />

  return (
    <div className={clsx("app", { extension: EXTENSION })}>
      <div className="container">{connected ? <Layout /> : isUnlock}</div>
    </div>
  )
}
