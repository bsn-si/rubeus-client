import { useDispatch, useSelector } from "react-redux"
import { useCallback } from "react"
import { clsx } from "clsx"

import { AppDispatch, RootState } from "../../../store"
import * as selectors from "../../../selectors"
import * as actions from "../../../features"
import { Credential } from "../../../models"
import { Icons } from "../../../components"
import "./Item.css"

interface Props {
  credential: Credential
}

export function Item({ credential }: Props) {
  const dispatch = useDispatch<AppDispatch>()

  const loading = useSelector((state: RootState) =>
    selectors.credentialsLoading(state, credential.id),
  )

  const onUpdate = useCallback(() => {
    dispatch(actions.setCredentialEditable(credential))
    dispatch(actions.setCredentialsModalOpened(true))
  }, [credential])

  const onDelete = useCallback(() => {
    dispatch(actions.deleteCredential(credential))
  }, [credential])

  return (
    <div className={clsx("item credential", { loading })}>
      <div className="details">
        <div className="field">
          <strong>Group:</strong>
          <span>{credential.group}</span>
        </div>
        <div className="field">
          <strong>Host:</strong>
          <span>{credential.payload.host}</span>
        </div>
        <div className="field">
          <strong>Login:</strong>
          <span>{credential.payload.login}</span>
        </div>
        <div className="field">
          <strong>Password:</strong>
          <span>{credential.payload.password}</span>
        </div>
      </div>
      <div className="actions">
        <div className="button action" onClick={onUpdate}>
          <Icons.Edit />
        </div>
        <div className="button action" onClick={onDelete}>
          <Icons.Trash />
        </div>
      </div>
    </div>
  )
}
