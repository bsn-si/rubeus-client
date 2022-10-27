import { useCallback, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { clsx } from "clsx"

import { AppDispatch, RootState } from "../../../store"
import { Input, Spinner } from "../../../components"
import * as selectors from "../../../selectors"
import * as actions from "../../../features"
import "./Create.css"

export function Create() {
  const dispatch = useDispatch<AppDispatch>()

  const loading = useSelector((state: RootState) =>
    selectors.credentialsLoading(state, "add"),
  )

  const [password, setPassword] = useState("")
  const [login, setLogin] = useState("")
  const [group, setGroup] = useState("")
  const [host, setHost] = useState("")

  const isFilled = useMemo(
    () => !!password.length && !!login.length && !!host.length && !!group.length,
    [login, password, host, group],
  )

  const onSubmit = useCallback(async () => {
    await dispatch(
      actions.addCredential({
        payload: { login, group, host, password },
        group,
      }),
    ).unwrap()

    dispatch(actions.setModalOpened(false))
  }, [login, password, host, group])

  return (
    <div className={clsx("create-form", { loading })}>
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

        <Input name="group" placeholder="Group name" value={group} onChange={setGroup} />
      </div>

      <div className="actions">
        <div
          className={clsx("button", { create: isFilled, disabled: !isFilled })}
          onClick={onSubmit}
        >
          Add Credential
        </div>
      </div>
    </div>
  )
}
