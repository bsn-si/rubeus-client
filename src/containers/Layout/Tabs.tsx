import { useSelector, useDispatch } from "react-redux"
import { useCallback } from "react"
import clsx from "clsx"

import * as selectors from "../../selectors"
import * as actions from "../../features"
import { Tab } from "../../features"

function Item({ type, title }: { type: Tab; title: string }) {
  const current = useSelector(selectors.tab)
  const dispatch = useDispatch()
  const active = type === current

  const onClick = useCallback(() => {
    dispatch(actions.setTab(type))
  }, [type])

  return (
    <div onClick={onClick} className={clsx("tab", type, { active })}>
      <div className="label">{title}</div>
    </div>
  )
}

export function Tabs() {
  const tabs = [
    {
      type: Tab.Credentials,
      title: "Credentials",
    },
    {
      type: Tab.Notes,
      title: "Notes",
    },
  ].map(props => <Item key={props.type} {...props} />)

  return <div className="tabs">{tabs}</div>
}
