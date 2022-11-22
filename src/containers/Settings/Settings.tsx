import { ChangeEvent, useCallback, useMemo, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { isAddress } from "@polkadot/util-crypto"
import { isHex } from "@polkadot/util"
import clsx from "clsx"

import { Input, Icons, Checkbox } from "../../components"
import * as selectors from "../../selectors"
import { AppDispatch } from "../../store"
import * as actions from "../../features"
import { keyring } from "../../utils"
import "./Settings.css"

const { assign } = Object

interface Props {
  action: "save" | "connect"
}

export function Settings({ action = "connect" }: Props) {
  const [password, setPassword] = useState("")
  const [save, setSave] = useState(false)

  const privateKey = useSelector(selectors.privateKey)
  const error = useSelector(selectors.settingsError)
  const contract = useSelector(selectors.contract)
  const rpcUrl = useSelector(selectors.rpcUrl)
  const dispatch = useDispatch<AppDispatch>()

  const isCanConnect = useMemo(() => {
    const hasCommon = privateKey && contract && rpcUrl
    const validPassword = !save ? true : !!password
    return hasCommon && validPassword
  }, [privateKey, contract, rpcUrl, password, save])

  const onConnect = useCallback(async () => {
    await dispatch(
      actions.connect(
        assign(
          {},
          save && {
            password,
          },
        ),
      ),
    ).unwrap()
  }, [privateKey, contract, save, password])

  const onReset = useCallback(async () => {
    await dispatch(actions.reset()).unwrap()
  }, [])

  const onChangeContract = useCallback((address: string) => {
    dispatch(actions.setContract(address))
  }, [])

  const onValidateContract = useCallback(
    (address: string) => (isAddress(address) ? undefined : "Invalid address"),
    [],
  )

  const onChangePrivateKey = useCallback((key: string) => {
    dispatch(actions.setPrivateKey(key))
  }, [])

  const onValidatePrivateKey = useCallback((key: string) => {
    try {
      if (!isHex(key)) {
        throw new Error()
      }

      keyring.addFromUri(key)
      return undefined
    } catch {
      return "Invalid sr25519 hex key"
    }
  }, [])

  const onChangeUrl = useCallback((address: string) => {
    dispatch(actions.setRpcUrl(address))
  }, [])

  const onChangePassword = useCallback((password: string) => {
    setPassword(password)
  }, [])

  const onValidateUrl = useCallback((url: string) => {
    try {
      return new URL(url).protocol !== "ws:" ? "Accepts only ws:// addresses" : undefined
    } catch (error) {
      return "Invalid URL"
    }
  }, [])

  const onValidatePassword = useCallback((password: string) => {
    if (!password || password.length < 3) {
      return "password min-length is 3"
    }
  }, [])

  const onChangeSave = useCallback(
    (_: ChangeEvent<HTMLInputElement>) => {
      setSave(!save)
    },
    [save],
  )

  return (
    <div className={clsx("settings", action)}>
      <h4 className="title">Settings</h4>

      <div className="inputs">
        <Input
          placeholder="Contract address"
          onValidate={onValidateContract}
          onChange={onChangeContract}
          className="contract"
          name="Contract"
          value={contract}
          icon={<Icons.Link />}
        />

        <Input
          placeholder="Private key (in hex)"
          onValidate={onValidatePrivateKey}
          onChange={onChangePrivateKey}
          className="private-key"
          name="Private Key"
          value={privateKey}
          icon={<Icons.Key />}
        />

        <Input
          placeholder="RPC url to Node"
          onValidate={onValidateUrl}
          onChange={onChangeUrl}
          className="rpc-url"
          name="RPC Url"
          value={rpcUrl}
          icon={<Icons.Globe />}
        />
      </div>

      {action === "connect" && (
        <div className="toggle-save">
          <Checkbox
            placeholder="Save this options"
            onChange={onChangeSave}
            checked={save}
            name="save"
            id="save"
          />

          {save && (
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
          )}
        </div>
      )}

      <div className="actions">
        {action === "save" && (
          <div className="button reset" onClick={onReset}>
            Reset Settings & Quit
          </div>
        )}

        <div
          className={clsx("button connect", { disabled: !isCanConnect })}
          onClick={onConnect}
        >
          {action === "connect" ? "Connect" : "Save"}
        </div>

        {error && <div className="error message">{error}</div>}
      </div>
    </div>
  )
}
