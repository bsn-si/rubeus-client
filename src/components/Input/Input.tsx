import { useCallback, useEffect, useRef, useState } from "react"
import { clsx } from "clsx"

import { useOutside } from "../../hooks"
import { delay } from "../../utils"

import "./Input.css"

interface Props {
  onValidate?: (value: string) => string | undefined
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  icon?: JSX.Element
  value?: string
  name?: string
}

export function Input(props: Props) {
  const [value, setValue] = useState(props.value)
  const [editable, setEditable] = useState(false)
  const [error, setError] = useState<string>()
  const inputRef = useRef<HTMLInputElement>()

  const onChangeValue = useCallback((event: any) => {
    const { value } = event.target
    setError(undefined)
    setValue(value)
  }, [])

  const onApply = useCallback(async (_value?: string) => {
    const handleValue = _value ? _value : value
    const hasError = props.onValidate?.(handleValue)

    if (hasError) {
      setError(hasError)
      setValue(props.value)
    } else {
      setError(undefined)
      setEditable(false)
      props.onChange(handleValue)
    }
  }, [value, props.value])

  const onKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        onApply()
      }
    },
    [value, onApply],
  )

  const onClickEdit = useCallback(async () => {
    setEditable(true)
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

  const subclasses = { invalid: !!error, edit: editable, icon: !!props.icon }

  return (
    <div className={clsx("input", props.className, subclasses)}>
      {props.icon && <div className="icon">{props.icon}</div>}

      {editable ? (
        <>
          {error && <div className="error">{error}</div>}

          <input
            placeholder={props.placeholder}
            onChange={onChangeValue}
            onKeyDown={onKeyDown}
            name={props.name}
            ref={inputRef}
            value={value}
          />
        </>
      ) : (
        <div className="meta" onClick={onClickEdit}>
          <div className="label">{props.name}</div>
          <div className="value">{value || props.placeholder}</div>
        </div>
      )}
    </div>
  )
}
