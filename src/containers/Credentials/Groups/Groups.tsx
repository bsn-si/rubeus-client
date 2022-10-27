import { useSelector, useDispatch } from "react-redux"
import { useCallback } from "react"
import clsx from "clsx"

import * as selectors from "../../../selectors"
import * as actions from "../../../features"
import { RootState } from "../../../store"

import { Balance } from "../../Balance"
import "./Groups.css"

function Item({ group }: { group: string }) {
  const dispatch = useDispatch()

  const selected = useSelector((state: RootState) =>
    selectors.isSelectedGroup(state, group),
  )

  const onClick = useCallback(() => {
    dispatch(actions.setSelectedGroup(group))
  }, [group])

  return (
    <div className={clsx("item", { selected })} onClick={onClick}>
      {group}
    </div>
  )
}

export function Groups() {
  const selectedGroup = useSelector(selectors.selectedGroup)
  const groups = useSelector(selectors.groups)
  const dispatch = useDispatch()

  const onShowAll = useCallback(() => {
    dispatch(actions.setSelectedGroup())
  }, [])

  const items = groups.map((name, index) => (
    <Item group={name} key={`${name}-${index}`} />
  ))

  return (
    <div className="groups">
      <div className="title">Groups</div>
      <div className="list">
        <div onClick={onShowAll} className={clsx("item", { selected: !selectedGroup })}>
          Show All
        </div>

        {items}
      </div>
      
      <Balance />
    </div>
  )
}
