import { useSelector, useDispatch } from "react-redux"
import { useCallback } from "react"
import Modal from "react-modal"
import clsx from "clsx"

import * as selectors from "../../selectors"
import * as actions from "../../features"
import * as Forms from "../Forms"

import { Spinner } from "../../components"
import { RootState } from "../../store"
import { Settings } from "../Settings"

import { Groups } from "./Groups"
import { List } from "./List"

import "./Credentials.css"

export function Credentials() {
  const settingsOpened = useSelector(selectors.settingsOpened)
  const modalOpened = useSelector(selectors.modalOpened)
  const editable = useSelector(selectors.editable)
  const dispatch = useDispatch()

  const loading = useSelector((state: RootState) =>
    selectors.credentialsLoading(state, "list"),
  )

  const onModalClose = useCallback(() => {
    dispatch(actions.setSettingsOpened())
    dispatch(actions.setEditable())
    dispatch(actions.setModalOpened())
  }, [modalOpened])

  const modalProps = {
    onRequestClose: onModalClose,
    isOpen: modalOpened,
    style: {
      content: {
        transform: "translate(-50%, -50%)",
        marginRight: "-50%",
        bottom: "auto",
        right: "auto",
        left: "50%",
        top: "50%",

        border: "1px solid rgba(0,0,0,0.05)",
        borderRadius: "6px",
        background: "#FFF",
        height: 400,
        width: 300,
        padding: 0,
      },
    },
  }

  return (
    <div className={clsx("content", { loading, blured: modalOpened })}>
      {loading && (
        <div className="overlay">
          <Spinner />
        </div>
      )}

      <div className={clsx("row", { loading })}>
        <Groups />
        <List />
      </div>

      <Modal {...modalProps}>
        {!modalOpened ? undefined : settingsOpened ? (
          <Settings action="save" />
        ) : !editable ? (
          <Forms.Create />
        ) : (
          <Forms.Update />
        )}
      </Modal>
    </div>
  )
}
