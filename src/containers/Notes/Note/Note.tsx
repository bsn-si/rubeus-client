import { useDispatch, useSelector } from "react-redux"
import { useCallback } from "react"
import { clsx } from "clsx"

import { AppDispatch, RootState } from "../../../store"
import * as selectors from "../../../selectors"
import * as actions from "../../../features"
import { Icons } from "../../../components"

import "./Note.css"

export function Note() {
  const dispatch = useDispatch<AppDispatch>()

  const collection = useSelector(selectors.notes)
  const note = useSelector(selectors.noteActive)
  const { title, text } = note?.payload || {}

  const loading = useSelector((state: RootState) => selectors.notesLoading(state, note?.id))

  const onUpdate = useCallback(() => {
    dispatch(actions.setNoteEditable(note))
    dispatch(actions.setNotesModalOpened(true))
  }, [note])

  const onDelete = useCallback(() => {
    dispatch(actions.deleteNote(note))
  }, [note])

  const onReload = useCallback(() => {
    dispatch(actions.getCredentials())
  }, [])

  return !note ? (
    <div className="note details empty">
      {!collection.length ? (
        <>
          <div className="title">
            Please reload list or add new note
          </div>

          <div className="button reload" onClick={onReload}>
            Reload
          </div>
        </>
      ) : (
        <>
          <div className="title">Select note from list</div>
        </>
      )}
    </div>
  ) : (
    <div className={clsx("note details", { loading })}>
      <div className="header">
        <div className="title">{title}</div>
        <div className="actions">
          <div className="button action" onClick={onUpdate}>
            <Icons.Edit />
          </div>
          <div className="button action" onClick={onDelete}>
            <Icons.Trash />
          </div>
        </div>
      </div>
      <div className="text">{text}</div>
    </div>
  )
}
