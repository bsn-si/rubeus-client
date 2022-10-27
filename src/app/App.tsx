import { useSelector } from "react-redux"
import { clsx } from "clsx"

import { Credentials, Settings } from "../containers"
import * as selectors from "../selectors"
import { EXTENSION } from "../utils"
import "./App.css"

export function App() {
  const skipWelcomeScreen = useSelector(selectors.skipWelcomeScreen)
  const connected = useSelector(selectors.isConnected)

  return (
    <div className={clsx("app", { extension: EXTENSION })}>
      <div className="container">
        {connected ? <Credentials /> : !skipWelcomeScreen && <Settings action="connect" />}
      </div>
    </div>
  )
}
