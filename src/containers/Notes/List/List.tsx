import { useSelector, useDispatch } from "react-redux"
import { useCallback } from "react"
import { clsx } from "clsx"

import { AppDispatch, RootState } from "../../../store"
import * as selectors from "../../../selectors"
import * as actions from "../../../features"
import { Note } from "../../../models"

import "./List.css"

function Item(note: Note) {
  const active = useSelector(selectors.noteActive)
  const dispatch = useDispatch<AppDispatch>()

  const {
    payload: { title },
    id,
  } = note
  const selected = active?.id === id

  const onClick = useCallback(() => {
    dispatch(actions.setActiveNote(note))
  }, [note])

  return (
    <div className={clsx("item", { selected })} onClick={onClick}>
      <span>{title}</span>
    </div>
  )
}

export function List() {
  const collection = useSelector(selectors.notes)

  const items = collection.map((note, idx) => <Item {...note} key={`${note.id}-${idx}`} />)

  return (
    <div className={clsx("notes list", { empty: !items.length })}>
      {!items.length ? (
        <>
          <div className="title">Notes empty</div>
        </>
      ) : (
        items
      )}
    </div>
  )
}
