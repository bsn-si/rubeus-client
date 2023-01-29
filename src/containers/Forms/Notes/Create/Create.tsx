import { useCallback, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { clsx } from "clsx"

import { AppDispatch, RootState } from "../../../../store"
import { Input, Spinner } from "../../../../components"
import * as selectors from "../../../../selectors"
import * as actions from "../../../../features"
import "./Create.css"

export function Create() {
  const dispatch = useDispatch<AppDispatch>()

  const loading = useSelector((state: RootState) => selectors.notesLoading(state, "add"))

  const [title, setTitle] = useState("")
  const [text, setText] = useState("")

  const isFilled = useMemo(() => !!title.length && !!text.length, [text, title])

  const onSubmit = useCallback(async () => {
    await dispatch(
      actions.addNote({
        payload: { title, text },
      }),
    ).unwrap()

    dispatch(actions.setNotesModalOpened(false))
  }, [text, title])

  return (
    <div className={clsx("note create-form", { loading })}>
      {loading && (
        <div className="overlay">
          <Spinner />
        </div>
      )}

      <div className="fields">
        <Input placeholder="Title of your note" onChange={setTitle} value={title} name="title" />
        <Input placeholder="Note text..." onChange={setText} value={text} name="text" textarea />
      </div>

      <div className="actions">
        <div
          className={clsx("button", { create: isFilled, disabled: !isFilled })}
          onClick={onSubmit}
        >
          Add Note
        </div>
      </div>
    </div>
  )
}
