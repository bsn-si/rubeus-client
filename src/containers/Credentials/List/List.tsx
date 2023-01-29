import { useSelector, useDispatch } from "react-redux"
import { useCallback } from "react"
import { clsx } from "clsx"

import { AppDispatch, RootState } from "../../../store"
import * as selectors from "../../../selectors"
import * as actions from "../../../features"
import { Item } from "../Item"

import "./List.css"

export function List() {
  const collection = useSelector(selectors.credentials)
  const dispatch = useDispatch<AppDispatch>()

  const onReload = useCallback(() => {
    dispatch(actions.getCredentials())
  }, [])

  const items = collection.map((credential, idx) => (
    <Item credential={credential} key={`${credential.id}-${idx}`} />
  ))

  return (
    <div className={clsx("credentials list", { empty: !items.length })}>
      {!items.length ? (
        <>
          <div className="title">Please reload list or add new credential</div>

          <div className="button reload" onClick={onReload}>
            Reload List
          </div>
        </>
      ) : (
        items
      )}
    </div>
  )
}
