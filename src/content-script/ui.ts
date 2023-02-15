import { fireEvent } from "@testing-library/dom/dist/events"
import { FormElements, FormType } from "./sitemaps"
import { generatePassword } from "./utils"
import * as styles from "./styles"

const { assign } = Object

export type MouseEventCallback = (event: MouseEvent) => void
export type ListItem = { login: string; password: string }

export class Ui {
  elements?: FormElements
  type?: FormType

  onClickGeneratePassword?: MouseEventCallback
  onClickSelectPassword?: MouseEventCallback
  onSelectItem?: (item: ListItem) => void

  container?: HTMLElement
  overlay?: HTMLElement

  constrcutor() {
    this.fillLoginForm = this.fillLoginForm.bind(this)

    this.getPasswordGeneratorForm = this.getPasswordGeneratorForm.bind(this)
    this.getContainer = this.getContainer.bind(this)
    this.getActions = this.getActions.bind(this)
    this.getAlert = this.getAlert.bind(this)
    this.getList = this.getList.bind(this)

    this.addListeners = this.addListeners.bind(this)
    this.drawContainer = this.drawContainer.bind(this)
    this.drawOverlay = this.drawOverlay.bind(this)
    this.drawAlert = this.drawAlert.bind(this)
    this.drawForm = this.drawForm.bind(this)
    this.drawList = this.drawList.bind(this)
    this.clear = this.clear.bind(this)
    this.draw = this.draw.bind(this)
  }

  public fillLoginForm({ login, password }: ListItem) {
    if (this.elements.login) {
      fireEvent.input(this.elements.login, { target: { value: login } })
    }

    if (this.elements.password) {
      fireEvent.input(this.elements.password, { target: { value: password } })
    }
  }

  public getContainer(element: HTMLElement) {
    const { top, left, width } = element.getBoundingClientRect()

    const container = document.createElement("div")
    assign(container.style, styles.container)

    container.style.left = `${left + width + 12}px`
    container.style.top = `${top}px`

    return container
  }

  public getActions() {
    const generate = document.createElement("div")
    generate.addEventListener("click", this.onClickGeneratePassword)
    generate.innerText = "Generate"

    const select = document.createElement("div")
    select.addEventListener("click", this.onClickSelectPassword)
    select.innerText = "Select"

    assign(generate.style, styles.button)
    assign(select.style, styles.button)

    const actions = []

    if (this.type === FormType.Login) {
      actions.push(select)
    } else if (this.type === FormType.Register) {
      actions.push(generate)
    } else {
      actions.push(generate)
      actions.push(select)
    }

    if (actions.length > 1) {
      actions[1].style.borderTop = "1px solid rgba(0,0,0, 0.1)"
    }

    return actions
  }

  public getPasswordGeneratorForm() {
    const onSubmit = (event: SubmitEvent) => {
      event.preventDefault()
      const form = event.target as HTMLFormElement

      const result = form.querySelector("div[type=\"result\"]")
      while (result.firstChild) {
        result.removeChild(result.lastChild)
      }

      try {
        const options = {
          length: parseInt(form.querySelector<HTMLInputElement>("input[name=\"length\"]").value),
          uppercase: form.querySelector<HTMLInputElement>("input[name=\"uppercase\"]").checked,
          lowercase: form.querySelector<HTMLInputElement>("input[name=\"lowercase\"]").checked,
          numbers: form.querySelector<HTMLInputElement>("input[name=\"numbers\"]").checked,
          symbols: form.querySelector<HTMLInputElement>("input[name=\"symbols\"]").checked,
        }

        const password = generatePassword(options)

        const onCopy = async () => {
          await navigator.clipboard.writeText(password)
        }

        const onCopyAndClose = async () => {
          await onCopy()

          if (this?.elements?.password) {
            // this.elements.password.removeAttribute("autocomplete")
            this.elements.password.value = password
          }

          this.clear()
        }

        const copy = document.createElement("div")
        copy.addEventListener("click", onCopy)
        assign(copy.style, styles.formResultButton)
        copy.innerText = "Copy"
        result.appendChild(copy)

        const setAndClose = document.createElement("div")
        setAndClose.addEventListener("click", onCopyAndClose)
        assign(setAndClose.style, styles.formResultButton)
        setAndClose.innerText = "Copy & Set"
        result.appendChild(setAndClose)

        const text = document.createElement("div")
        assign(text.style, styles.formPassword)
        text.innerText = password
        result.appendChild(text)
      } catch (error) {
        const message = document.createElement("span")
        assign(message.style, styles.formError)
        message.innerText = error.message

        result.appendChild(message)
      }
    }

    const form = document.createElement("form")
    form.addEventListener("submit", onSubmit)
    assign(form.style, styles.form)

    const title = document.createElement("h4")
    title.innerText = "Password Generator"
    assign(title.style, styles.formTitle)
    form.appendChild(title)

    const close = document.createElement("div")
    close.addEventListener("click", () => this.clear())
    assign(close.style, styles.formClose)
    close.innerText = "✖"
    form.appendChild(close)

    const _input = (name: string, placeholder: string, attributes: Record<string, string>) => {
      const container = document.createElement("div")
      assign(container.style, styles.formInputContainer)

      const id = `rubeus__checkbox__${name}`
      const label = document.createElement("label")
      label.setAttribute("for", id)
      label.innerText = placeholder
      assign(label.style, styles.formLabel)

      const input = document.createElement("input")
      input.setAttribute("name", name)
      input.setAttribute("id", id)

      for (const [key, value] of Object.entries(attributes)) {
        input.setAttribute(key, value)
      }

      if (attributes["type"] !== "checkbox") {
        container.style.flexDirection = "column"
        assign(input.style, styles.formInput)
      } else {
        container.style.flexDirection = "row"
        input.style.marginLeft = "10px"
      }

      container.appendChild(label)
      container.appendChild(input)

      return container
    }

    const inputLength = _input("length", "Password length", {
      type: "number",
      value: "10",
      max: "40",
      min: "8",
    })

    form.appendChild(inputLength)

    const checkboxes = [
      { name: "uppercase", placeholder: "Include uppercase letters" },
      { name: "lowercase", placeholder: "Include lowercase letters" },
      { name: "numbers", placeholder: "Include numbers" },
      { name: "symbols", placeholder: "Include symbols" },
    ]

    for (const { name, placeholder } of checkboxes) {
      form.appendChild(
        _input(name, placeholder, {
          type: "checkbox",
          checked: "true",
        }),
      )
    }

    const result = document.createElement("div")
    result.setAttribute("type", "result")
    assign(result.style, styles.formResult)

    form.appendChild(result)

    const button = document.createElement("button")
    button.setAttribute("type", "submit")
    button.innerText = "Generate"
    assign(button.style, styles.formSubmitButton)

    form.appendChild(button)

    return form
  }

  public getList(items: ListItem[]) {
    const list = document.createElement("div")
    assign(list.style, styles.list)

    for (const data of items) {
      const item = document.createElement("div")

      item.addEventListener("click", () => this.onSelectItem(data))
      assign(item.style, styles.button)
      item.innerText = data.login

      list.appendChild(item)
    }

    return list
  }

  public getAlert(message: string) {
    const alert = document.createElement("span")
    assign(alert.style, styles.button, styles.alert)
    alert.innerText = message

    return alert
  }

  public addListeners(methods: {
    onClickSelectPassword?: MouseEventCallback
    onClickGenerate?: MouseEventCallback
    onSelectItem?: (item: ListItem) => void
  }) {
    this.onClickSelectPassword = methods.onClickSelectPassword
    this.onClickGeneratePassword = methods.onClickGenerate
    this.onSelectItem = methods.onSelectItem
  }

  public drawOverlay() {
    const overlay = document.createElement("div")
    assign(overlay.style, styles.overlay)
    this.overlay = document.body.appendChild(overlay)
  }

  public drawContainer() {
    const container = this.getContainer(this.elements.password)
    this.container = this.overlay?.appendChild(container)
  }

  public drawForm() {
    this.clear()
    this.drawContainer()

    const form = this.getPasswordGeneratorForm()
    this.container?.appendChild(form)
  }

  public drawList(items: ListItem[]) {
    this.clear()
    this.drawContainer()

    if (items.length > 0) {
      const list = this.getList(items)
      this.container?.appendChild(list)
    } else {
      this.drawAlert("Not Found")
    }
  }

  public drawAlert(message: string) {
    const alert = this.getAlert(message)

    this.clear()
    this.drawContainer()

    this.container?.appendChild(alert)
  }

  public clear() {
    this?.container?.remove()
    this.container = undefined
  }

  public draw(elements: FormElements, isConnected = false) {
    this.clear()

    this.type = elements.type
    this.elements = elements

    if (!this.overlay) {
      this.drawOverlay()
    }

    if (!this.container) {
      this.drawContainer()
    }

    if (isConnected) {
      const actions = this.getActions()

      for (const button of actions) {
        this.container?.appendChild(button)
      }
    } else {
      this.drawAlert("Please Unlock Rubeus")
    }
  }
}
