import { useSelector, useDispatch } from "react-redux"
import { useCallback } from "react"
import Modal from "react-modal"
import clsx from "clsx"

import * as selectors from "../../selectors"
import * as actions from "../../features"

import * as Credentials from "../Credentials"
import * as Notes from "../Notes"
import * as Forms from "../Forms"

import { AppDispatch } from "../../store"
import { Spinner } from "../../components"
import { Settings } from "../Settings"
import { Tab } from "../../features"
import { Balance } from "../Balance"
import { Tabs } from "./Tabs"

import objectSwitch from "../../utils"

import "./Layout.css"

export function Layout() {
  const dispatch = useDispatch<AppDispatch>()

  const credentialOpened = useSelector(selectors.credentialModalOpened)
  const settingsOpened = useSelector(selectors.settingsModalOpened)
  const noteOpened = useSelector(selectors.noteModalOpened)

  const credentialEditable = useSelector(selectors.credentialEditable)
  const noteEditable = useSelector(selectors.noteEditable)

  const modalOpened = useSelector(selectors.someModalIsOpened)
  const loading = useSelector(selectors.someListIsLoading)
  const error = useSelector(selectors.credentialsError)
  const tab = useSelector(selectors.tab)

  const onModalClose = useCallback(() => {
    dispatch(actions.setCredentialsModalOpened())
    dispatch(actions.setNotesModalOpened())
    dispatch(actions.setSettingsOpened())

    dispatch(actions.setCredentialEditable())
    dispatch(actions.setNoteEditable())
  }, [])

  const onOpenCreate = useCallback(() => {
    dispatch(
      objectSwitch(tab, {
        [Tab.Credentials]: actions.setCredentialEditable(),
        [Tab.Notes]: actions.setNoteEditable(),
      }),
    )
    dispatch(
      objectSwitch(tab, {
        [Tab.Credentials]: actions.setCredentialsModalOpened(true),
        [Tab.Notes]: actions.setNotesModalOpened(true),
      }),
    )
  }, [tab])

  const onOpenSettings = useCallback(() => {
    dispatch(actions.setCredentialEditable())
    dispatch(actions.setSettingsOpened(true))
  }, [])

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

  const sidebarTitle = objectSwitch(tab, {
    [Tab.Credentials]: "Groups",
    [Tab.Notes]: "List",
  })

  const Sidebar = objectSwitch(tab, {
    [Tab.Credentials]: Credentials.Groups,
    [Tab.Notes]: Notes.List,
  })

  const Content = objectSwitch(tab, {
    [Tab.Credentials]: Credentials.List,
    [Tab.Notes]: Notes.Note,
  })

  return (
    <div className={clsx("frame", { loading, blured: modalOpened })}>
      {loading && (
        <div className="overlay">
          <Spinner />
        </div>
      )}

      <div className={clsx("row", { loading })}>
        <div className="sidebar">
          <div className="title">{sidebarTitle}</div>
          
          <div className="content">
            <Sidebar />
          </div>
          
          <Balance />
        </div>

        <div className="active-zone">
          <div className="header">
            <Tabs />

            <div className="actions">
              <div className="button create" onClick={onOpenSettings}>
                Settings
              </div>

              <div className="button create" onClick={onOpenCreate}>
                Create
              </div>
            </div>
          </div>

          <div className="content">
            <Content />
          </div>

          {error && <div className="error message">{error}</div>}
        </div>
      </div>

      {/* prettier-ignore */}
      <Modal {...modalProps}>
        {settingsOpened && <Settings action="save" />}

        {credentialOpened && (credentialEditable ? <Forms.Credentials.Update /> : <Forms.Credentials.Create />)}
        {noteOpened && (noteEditable ? <Forms.Notes.Update /> : <Forms.Notes.Create />)}
      </Modal>
    </div>
  )
}
