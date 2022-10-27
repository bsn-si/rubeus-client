import { formatBalance } from "@polkadot/util"
import { useSelector } from "react-redux"

import * as selectors from "../../selectors"
import "./Balance.css"

export function Balance() {
  const balance = useSelector(selectors.balance)

  return (
    balance && (
      <div className="balance">
        <div className="title">Balance</div>
        <div className="amount">{formatBalance(balance)}</div>
      </div>
    )
  )
}
