import { useCallback, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { clsx } from "clsx"

import { AppDispatch, RootState } from "../../../../store"
import { Input, Spinner } from "../../../../components"
import * as selectors from "../../../../selectors"
import * as actions from "../../../../features"
import "./Update.css"

export function Update() {
  const dispatch = useDispatch<AppDispatch>()

  const note = useSelector(selectors.noteEditable)
  const { payload } = note

  const loading = useSelector((state: RootState) => selectors.notesLoading(state, note.id))

  const [title, setTitle] = useState(payload.title)
  const [text, setText] = useState(payload.text)

  const isChanged = useMemo(
    () => title !== note.payload.title || text !== note.payload.text,
    [title, text, note],
  )

  const onUpdate = useCallback(async () => {
    if (isChanged) {
      await dispatch(
        actions.updateNote({
          id: note.id,

          payload: {
            title,
            text,
          },
        }),
      ).unwrap()

      dispatch(actions.setNotesModalOpened())
      dispatch(actions.setNoteEditable())
    }
  }, [isChanged, title, text, note.id])

  return (
    <div className={clsx("note update-form", { loading })}>
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
          className={clsx("button", { save: isChanged, disabled: !isChanged })}
          onClick={onUpdate}
        >
          Save
        </div>
      </div>
    </div>
  )
}
