import { useEffect, RefObject } from "react"

export function useOutside(ref: RefObject<HTMLElement>, onClickOutside?: () => void) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOutside?.()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ref])
}
