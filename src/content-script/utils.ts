export function pick(obj: any, props: string[]) {
  const picked = {}

  for (const prop of props) {
    picked[prop] = obj[prop]
  }

  return picked
}

const randomMethods = {
  lowercase: () => String.fromCharCode(Math.floor(Math.random() * 26) + 97),
  uppercase: () => String.fromCharCode(Math.floor(Math.random() * 26) + 65),
  numbers: () => +String.fromCharCode(Math.floor(Math.random() * 10) + 48),
  symbols: () => {
    const symbols = "!@#$%^&*(){}[]=<>/,."
    return symbols[Math.floor(Math.random() * symbols.length)]
  },
}

export function generatePassword(options: {
  lowercase: boolean
  uppercase: boolean
  numbers: boolean
  symbols: boolean
  length: number
}) {
  let generated = ""

  if (!options.length) {
    throw new Error("You dont enter length")
  }

  const randoms = Object.entries(
    pick(options, ["lowercase", "uppercase", "numbers", "symbols"]),
  ).reduce((funcs, [name, value]: [string, boolean]) => {
    if (value) {
      funcs.push(randomMethods[name])
    }

    return funcs
  }, [] as (() => string)[])

  if (!randoms.length) {
    throw new Error("You must select minimum one of options")
  }

  for (let i = 0; i < options.length; i += randoms.length) {
    randoms.forEach(func => {
      generated += func()
    })
  }

  return generated.slice(0, options.length)
}