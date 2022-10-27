import { DetailedHTMLProps, InputHTMLAttributes } from "react"
import "./Checkbox.css"

interface Props
  extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {}

export function Checkbox({ placeholder, ...props }: Props) {
  return (
    <label className="checkbox">
      <input type="checkbox" {...props} />
      <span>{placeholder}</span>
    </label>
  )
}
