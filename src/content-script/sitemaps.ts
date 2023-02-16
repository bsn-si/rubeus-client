import { parseDomain, fromUrl, ParseResultType } from "parse-domain"
import { pick } from "./utils"

export enum FormType {
  Register = "register",
  Unknown = "unknown",
  Login = "login",
}

export interface FormElements {
  password?: HTMLInputElement
  login?: HTMLInputElement
  form?: HTMLFormElement
  submit?: HTMLElement
  type?: FormType
}

export interface Methods extends FormElements {
  setup(input: HTMLInputElement): Methods
  getForm(): FormElements

  // getData: (input: HTMLInputElement) => Info
}

class Pinterest implements Methods {
  password?: HTMLInputElement
  login?: HTMLInputElement
  form?: HTMLFormElement
  submit?: HTMLElement
  type?: FormType

  selectors = {
    form: "form[data-test-id=\"registerForm\"]",
    password: "input[name=\"password\"]",
    login: "input[name=\"id\"]",
    age: "input[name=\"age\"]",
    submit: "button.red",
  }

  constructor() {
    this.getForm = this.getForm.bind(this)
    this.setup = this.setup.bind(this)

    return this
  }

  // NOTE: by default required input[type="password"]
  public setup(input: HTMLInputElement): Methods {
    const { form } = input
    this.form = form

    if (form && document.querySelector(this.selectors.form) === form) {
      this.type = form.querySelector(this.selectors.age) ? FormType.Register : FormType.Login

      this.password = form.querySelector(this.selectors.password)
      this.login = form.querySelector(this.selectors.login)
      this.submit = form.querySelector(this.selectors.submit)
    } else {
      this.type = FormType.Unknown
      this.password = input
    }

    return this
  }

  public getForm(): FormElements {
    return pick(this, ["login", "password", "form", "type", "submit"]) as any
  }

  static getData = (input: HTMLInputElement): FormElements => {
    const data = new Pinterest().setup(input).getForm()
    return data
  }
}

class Infura implements Methods {
  password?: HTMLInputElement
  login?: HTMLInputElement
  form?: HTMLFormElement
  submit?: HTMLElement
  type?: FormType

  selectors = {
    password: "input[name=\"password\"]",
    login: "input[name=\"email\"]",
    submit: "button[type=\"submit\"]",
    submitText: "button[type=\"submit\"] > span",
    form: "form.text-lg",
  }

  constructor() {
    this.getForm = this.getForm.bind(this)
    this.setup = this.setup.bind(this)

    return this
  }

  // NOTE: by default required input[type="password"]
  public setup(input: HTMLInputElement): Methods {
    const { form } = input
    this.form = form

    if (form && document.querySelector(this.selectors.form) === form) {
      this.type = form.querySelector(this.selectors.submitText).innerHTML.includes("Create")
        ? FormType.Register
        : FormType.Login

      this.password = form.querySelector(this.selectors.password)
      this.login = form.querySelector(this.selectors.login)
      this.submit = form.querySelector(this.selectors.submit)
    } else {
      this.type = FormType.Unknown
      this.password = input
    }

    return this
  }

  public getForm(): FormElements {
    return pick(this, ["login", "password", "form", "type", "submit"]) as any
  }

  static getData = (input: HTMLInputElement): FormElements => {
    const data = new Infura().setup(input).getForm()
    return data
  }
}

class LinkedIn implements Methods {
  password?: HTMLInputElement
  login?: HTMLInputElement
  form?: HTMLFormElement
  submit?: HTMLElement
  type?: FormType

  selectors = {
    submit: "button[type=\"submit\"]",

    authPassword: "#password",
    authLogin: "#username",
    authForm: "form.login__form",

    registerForm: "form.join-form",
    registerLogin: "input[name=\"email-address\"]",
    registerPassword: "input[name=\"password\"]",
  }

  constructor() {
    this.getForm = this.getForm.bind(this)
    this.setup = this.setup.bind(this)

    return this
  }

  // NOTE: by default required input[type="password"]
  public setup(input: HTMLInputElement): Methods {
    const { form } = input
    this.form = form

    if (form) {
      const registerForm = document.querySelector(this.selectors.registerForm)
      const authForm = document.querySelector(this.selectors.authForm)

      if (registerForm === form) {
        this.password = form.querySelector(this.selectors.registerPassword)
        this.login = form.querySelector(this.selectors.registerLogin)
        this.submit = form.querySelector(this.selectors.submit)
        this.type = FormType.Register
        return this
      }

      if (authForm === form) {
        this.password = form.querySelector(this.selectors.authPassword)
        this.login = form.querySelector(this.selectors.authLogin)
        this.submit = form.querySelector(this.selectors.submit)
        this.type = FormType.Login
        return this
      }

      this.type = FormType.Unknown
      this.password = input
    } else {
      this.type = FormType.Unknown
      this.password = input
    }

    return this
  }

  public getForm(): FormElements {
    return pick(this, ["login", "password", "form", "type", "submit"]) as any
  }

  static getData = (input: HTMLInputElement): FormElements => {
    const data = new LinkedIn().setup(input).getForm()
    return data
  }
}

class StackOverflow implements Methods {
  password?: HTMLInputElement
  login?: HTMLInputElement
  form?: HTMLFormElement
  submit?: HTMLElement
  type?: FormType

  selectors = {
    form: "form#login-form",
    password: "input#password",
    login: "input#email",
    name: "input#display-name",
    submit: "#submit-button"
  }

  constructor() {
    this.getForm = this.getForm.bind(this)
    this.setup = this.setup.bind(this)

    return this
  }

  // NOTE: by default required input[type="password"]
  public setup(input: HTMLInputElement): Methods {
    const { form } = input
    this.form = form

    if (form && document.querySelector(this.selectors.form) === form) {
      this.type = form.querySelector(this.selectors.name) ? FormType.Register : FormType.Login
      this.submit = form.querySelector(this.selectors.submit)
      this.password = form.querySelector(this.selectors.password)
      this.login = form.querySelector(this.selectors.login)
    } else {
      this.type = FormType.Unknown
      this.password = input
    }

    return this
  }

  public getForm(): FormElements {
    return pick(this, ["login", "password", "form", "type"]) as any
  }

  static getData = (input: HTMLInputElement): FormElements => {
    const data = new StackOverflow().setup(input).getForm()
    return data
  }
}

class Dribbble implements Methods {
  password?: HTMLInputElement
  login?: HTMLInputElement
  form?: HTMLFormElement
  submit?: HTMLElement
  type?: FormType

  selectors = {
    submit: "[type=\"submit\"]",

    authPassword: "input#password",
    authLogin: "input#login",
    authForm: "form[action=\"/session\"]",

    registerForm: "form#new_user",
    registerLogin: "input#user_email",
    registerPassword: "input#user_password",
  }

  constructor() {
    this.getForm = this.getForm.bind(this)
    this.setup = this.setup.bind(this)

    return this
  }

  // NOTE: by default required input[type="password"]
  public setup(input: HTMLInputElement): Methods {
    const { form } = input
    this.form = form

    if (form) {
      const registerForm = document.querySelector(this.selectors.registerForm)
      const authForm = document.querySelector(this.selectors.authForm)

      if (registerForm === form) {
        this.password = form.querySelector(this.selectors.registerPassword)
        this.login = form.querySelector(this.selectors.registerLogin)
        this.submit = form.querySelector(this.selectors.submit)
        this.type = FormType.Register
        return this
      }

      if (authForm === form) {
        this.password = form.querySelector(this.selectors.authPassword)
        this.login = form.querySelector(this.selectors.authLogin)
        this.submit = form.querySelector(this.selectors.submit)
        this.type = FormType.Login
        return this
      }

      this.type = FormType.Unknown
      this.password = input
    } else {
      this.type = FormType.Unknown
      this.password = input
    }

    return this
  }

  public getForm(): FormElements {
    return pick(this, ["login", "password", "form", "type", "submit"]) as any
  }

  static getData = (input: HTMLInputElement): FormElements => {
    const data = new Dribbble().setup(input).getForm()
    return data
  }
}

class Zara implements Methods {
  password?: HTMLInputElement
  login?: HTMLInputElement
  form?: HTMLFormElement
  submit?: HTMLElement
  type?: FormType

  selectors = {
    submit: "button.zds-button",

    authForm: "form.logon-form",
    authPassword: "input[name=\"password\"]",
    authLogin: "input[name=\"logonId\"]",

    registerForm: "form.address-form",
    registerPassword: "input[name=\"password\"]",
    registerLogin: "input[name=\"email\"]",
  }

  constructor() {
    this.getForm = this.getForm.bind(this)
    this.setup = this.setup.bind(this)

    return this
  }

  // NOTE: by default required input[type="password"]
  public setup(input: HTMLInputElement): Methods {
    const { form } = input
    this.form = form

    if (form) {
      const registerForm = document.querySelector(this.selectors.registerForm)
      const authForm = document.querySelector(this.selectors.authForm)

      if (registerForm === form) {
        this.password = form.querySelector(this.selectors.registerPassword)
        this.login = form.querySelector(this.selectors.registerLogin)
        this.submit = form.querySelector(this.selectors.submit)
        this.type = FormType.Register
        return this
      }

      if (authForm === form) {
        this.password = form.querySelector(this.selectors.authPassword)
        this.login = form.querySelector(this.selectors.authLogin)
        this.submit = form.querySelector(this.selectors.submit)
        this.type = FormType.Login
        return this
      }

      this.type = FormType.Unknown
      this.password = input
    } else {
      this.type = FormType.Unknown
      this.password = input
    }

    return this
  }

  public getForm(): FormElements {
    return pick(this, ["login", "password", "form", "type", "submit"]) as any
  }

  static getData = (input: HTMLInputElement): FormElements => {
    const data = new Zara().setup(input).getForm()
    return data
  }
}

const SITEMAPS: Record<string, any> = {
  "stackoverflow.com": StackOverflow,
  "pinterest.com": Pinterest,
  "linkedin.com": LinkedIn,
  "dribbble.com": Dribbble,
  "infura.io": Infura,
  "zara.com": Zara,
}

export function getFormViaSitemap(url: string, input: HTMLInputElement): FormElements | undefined {
  const result = parseDomain(fromUrl(url))

  if (result.type === ParseResultType.Listed) {
    const { domain, topLevelDomains } = result
    const host = `${domain}.${topLevelDomains[0]}`
    const sitemap = SITEMAPS[host] as any
    return sitemap?.getData(input)
  }

  return undefined
}
