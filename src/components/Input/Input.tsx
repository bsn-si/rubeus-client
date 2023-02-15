import React, { cloneElement, createElement, useCallback, useEffect, useRef, useState } from "react"
import { clsx } from "clsx"

import { useOutside } from "../../hooks"
import { delay } from "../../utils"

import "./Input.css"

interface Props {
  onValidate?: (value: string) => string | undefined
  onChange?: (value: string) => void
  placeholder?: string
  textarea?: boolean
  className?: string
  icon?: JSX.Element
  value?: string
  name?: string
  type?: string
}

export function Input(props: Props) {
  const [value, setValue] = useState(props.value)
  const [editable, setCredentialEditable] = useState(false)
  const [error, setError] = useState<string>()
  const inputRef = useRef<HTMLInputElement>()

  const onChangeValue = useCallback((event: any) => {
    const { value } = event.target
    setError(undefined)
    setValue(value)
  }, [])

  const onApply = useCallback(
    async (_value?: string) => {
      const handleValue = _value ? _value : value
      const hasError = props.onValidate?.(handleValue)

      if (hasError) {
        setError(hasError)
        setValue(props.value)
      } else {
        setError(undefined)
        setCredentialEditable(false)
        props.onChange(handleValue)
      }
    },
    [value, props.value],
  )

  const onKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        onApply()
      }
    },
    [value, onApply],
  )

  const onClickEdit = useCallback(async () => {
    setCredentialEditable(true)
    await delay(50)

    inputRef?.current?.focus()
  }, [])

  // @NOTE: outside click link error fix
  const onClickOutside = useCallback(async () => {
    const value = inputRef.current.value
    onApply(value)
  }, [onApply])

  useEffect(() => {
    setValue(props.value)
  }, [props.value])

  useOutside(inputRef, onClickOutside)

  const subclasses = {
    invalid: !!error,
    edit: editable,
    icon: !!props.icon,
    area: !!props.textarea,
  }

  const isPassword = props.type === "password"

  const input = createElement(props.textarea ? "textarea" : "input", {
    placeholder: props.placeholder,
    type: props.type || "text",
    onChange: onChangeValue,
    onKeyDown: onKeyDown,
    name: props.name,
    ref: inputRef,
    value: value,
  })

  return (
    <div className={clsx("input", props.className, subclasses)}>
      {props.icon && <div className="icon">{props.icon}</div>}

      {editable ? (
        <>
          {error && <div className="error">{error}</div>}
          {input}
        </>
      ) : (
        <div className="meta" onClick={onClickEdit}>
          <div className="label">{props.name}</div>
          <div className={clsx("value", { password: isPassword })}>
            {value ? (
              isPassword ? (
                <span>{new Array(value.length).join("⬤")}</span>
              ) : (
                value
              )
            ) : (
              props.placeholder
            )}
          </div>
        </div>
      )}
    </div>
  )
}
