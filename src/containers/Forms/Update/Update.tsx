import { useCallback, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { clsx } from "clsx"

import { AppDispatch, RootState } from "../../../store"
import { Input, Spinner } from "../../../components"
import * as selectors from "../../../selectors"
import * as actions from "../../../features"
import "./Update.css"

export function Update() {
  const credential = useSelector(selectors.editable)
  const { payload, group: _group } = credential
  const dispatch = useDispatch<AppDispatch>()

  const loading = useSelector((state: RootState) =>
    selectors.credentialsLoading(state, credential.id),
  )

  const [password, setPassword] = useState(payload.password)
  const [login, setLogin] = useState(payload.login)
  const [host, setHost] = useState(payload.host)
  const [group, setGroup] = useState(_group)

  const isChanged = useMemo(
    () =>
      password !== credential.payload.password ||
      login !== credential.payload.login ||
      host !== credential.payload.host ||
      group !== credential.group,
    [login, password, host, group, credential],
  )

  const onUpdate = useCallback(async () => {
    if (isChanged) {
      await dispatch(
        actions.updateCredential({
          id: credential.id,
          group,

          payload: {
            password,
            login,
            host,
          },
        }),
      ).unwrap()

      dispatch(actions.setModalOpened())
      dispatch(actions.setEditable())
    }
  }, [isChanged, login, password, host, group, credential.id])

  return (
    <div className={clsx("update-form", { loading })}>
      {loading && (
        <div className="overlay">
          <Spinner />
        </div>
      )}

      <div className="fields">
        <Input name="host" placeholder="Host" value={host} onChange={setHost} />

        <Input
          placeholder="Login or email"
          onChange={setLogin}
          value={login}
          name="login"
        />

        <Input
          placeholder="Password"
          onChange={setPassword}
          value={password}
          name="password"
        />

        <Input name="group" placeholder="Group" value={group} onChange={setGroup} />
      </div>

      <div className="actions">
        <div
          className={clsx("button", { save: isChanged, disabled: !isChanged })}
          onClick={onUpdate}
        >
          Save
        </div>
      </div>
    </div>
  )
}
