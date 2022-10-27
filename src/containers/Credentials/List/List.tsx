import { useSelector, useDispatch } from "react-redux"
import { useCallback } from "react"
import { clsx } from "clsx"

import { AppDispatch, RootState } from "../../../store"
import * as selectors from "../../../selectors"
import * as actions from "../../../features"
import { Item } from "../Item"

import "./List.css"

export function List() {
  const selectedGroup = useSelector(selectors.selectedGroup)
  const error = useSelector(selectors.credentialsError)
  const dispatch = useDispatch<AppDispatch>()

  const collection = useSelector((state: RootState) =>
    selectors.credentials(state, selectedGroup),
  )

  const onReload = useCallback(() => {
    dispatch(actions.getCredentials())
  }, [])

  const onAddCredential = useCallback(() => {
    dispatch(actions.setEditable())
    dispatch(actions.setModalOpened(true))
  }, [])

  const onOpenSettings = useCallback(() => {
    dispatch(actions.setEditable())
    
    dispatch(actions.setSettingsOpened(true))
    dispatch(actions.setModalOpened(true))
  }, [])

  const items = collection.map((credential, idx) => (
    <Item credential={credential} key={`${credential.id}-${idx}`} />
  ))

  return (
    <div className="credentials">
      <div className="title">
        <span>Your Credentials</span>

        <div className="actions">
            <div className="button create" onClick={onOpenSettings}>
              Settings
            </div>

          <div className="button create" onClick={onAddCredential}>
            Add Credential
          </div>
        </div>
      </div>

      <div className={clsx("list", { empty: !items.length })}>
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

      {error && <div className="error message">{error}</div>}
    </div>
  )
}
