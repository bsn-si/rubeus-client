import { useCallback, useMemo, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import clsx from "clsx"

import { Input, Icons } from "../../components"
import * as selectors from "../../selectors"
import { AppDispatch } from "../../store"
import * as actions from "../../features"
import "./Unlock.css"

export function Unlock() {
  const [password, setPassword] = useState("")

  const error = useSelector(selectors.settingsError)
  const dispatch = useDispatch<AppDispatch>()

  const isCanConnect = useMemo(() => password && password.length >= 3, [password])

  const onConnect = useCallback(async () => {
    await dispatch(
      actions.connect({
        password,
      }),
    ).unwrap()
  }, [password])

  const onChangePassword = useCallback((password: string) => {
    setPassword(password)
  }, [])

  const onValidatePassword = useCallback((password: string) => {
    if (!password || password.length < 3) {
      return "password min-length is 3"
    }
  }, [])

  return (
    <div className="unlock">
      <h4 className="title">Settings</h4>

      <div className="inputs">
        <Input
          placeholder="Please enter password for encrypt"
          onValidate={onValidatePassword}
          onChange={onChangePassword}
          className="password"
          type="password"
          name="Password"
          value={password}
          icon={<Icons.Key />}
        />
      </div>

      <div className="actions">
        <div className={clsx("button connect", { disabled: !isCanConnect })} onClick={onConnect}>
          Unlock
        </div>

        {error && <div className="error message">{error}</div>}
      </div>
    </div>
  )
}