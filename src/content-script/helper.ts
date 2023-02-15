import { fromUrl, parseDomain, ParseResultType } from "parse-domain"
import unique from "unique-selector"

import { FormElements, getFormViaSitemap, FormType } from "./sitemaps"
import { ListItem, Ui } from "./ui"
import * as api from "../api"

function isPassword(element: HTMLElement) {
  return element.tagName === "INPUT" && element.attributes["type"]?.nodeValue === "password"
}

export class PasswordHelper {
  saveTask: Promise<any>
  ui: Ui

  constructor() {
    this.ui = new Ui()

    this.onActionGeneratePassword = this.onActionGeneratePassword.bind(this)
    this.onActionSelectPassword = this.onActionSelectPassword.bind(this)
    this.onSelectItem = this.onSelectItem.bind(this)
    this.onSubmitForm = this.onSubmitForm.bind(this)

    this.onFocusIn = this.onFocusIn.bind(this)
    this.init = this.init.bind(this)
  }

  public async onActionGeneratePassword(event: MouseEvent) {
    event.stopPropagation()
    this.ui.drawForm()
  }

  public async onActionSelectPassword(event: MouseEvent) {
    event.stopPropagation()

    const credentials = await api.selectPassword({
      url: window.location.toString(),
      selectors: {
        password: unique(this.ui.elements.password),
        login: unique(this.ui.elements.login),
      },
    })

    this.ui.drawList(credentials.matched)
  }

  public async onSelectItem(item: ListItem) {
    this.ui.fillLoginForm(item)
    this.ui.clear()
  }

  public onSubmitForm(elements: FormElements) {
    return async (/* event: SubmitEvent */) => {
      const result = parseDomain(fromUrl(window.location.toString()))

      if (
        !this.saveTask && elements.type !== FormType.Unknown &&
        result.type === ParseResultType.Listed
      ) {
        const { domain, topLevelDomains } = result
        const host = `${domain}.${topLevelDomains[0]}`

        const payload = {
          password: elements?.password.value,
          login: elements?.login.value,
          host,
        }

        this.saveTask = api.saveCredential(payload).finally(() => {
          this.saveTask = undefined
        })

        await this.saveTask
      }
    }
  }

  public async onFocusIn(event: FocusEvent) {
    const { target } = event as any

    if (isPassword(target)) {
      const isUnlocked = await api.isUnlocked()
      const url = window.location.toString()

      const elements = getFormViaSitemap(url, target)
      elements?.submit?.addEventListener("click", this.onSubmitForm(elements))

      this.ui.draw(elements, isUnlocked)
    }
  }

  public init() {
    this.ui.addListeners({
      onClickSelectPassword: this.onActionSelectPassword,
      onClickGenerate: this.onActionGeneratePassword,
      onSelectItem: this.onSelectItem,
    })

    document.addEventListener("focusin", this.onFocusIn)
    window.addEventListener("click", this.ui.clear)
  }
}
