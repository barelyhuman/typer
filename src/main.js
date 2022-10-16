import randomWords from 'random-words'

function main() {
  const caret = document.getElementById('caret')
  const preview = document.getElementById('typer-preview')
  const editor = document.getElementById('typer-input')
  editor.value = ''
  preview.innerHTML = ''
  editor.style.resize = 'none'

  editor.focus()

  syncHeights(preview, editor)

  const characters = randomWords(10).join(' ').split('')
  characters.push(' ')
  const nodes = characters.map(x => new Node(x))
  const statement = characters.join('')

  nodes.forEach(node => {
    preview.appendChild(node.element)
  })

  pollValue(editor, value => {
    if (!value) {
      nodes.forEach(n => n.reset())
    }

    if (value.length >= statement.length) {
      // JS is cached, it's quick enough to avoid
      // having to get out of the callstack and recall this whole thing.
      window.location.reload()
    }

    for (let i = 0; i < statement.length; i++) {
      nodes[i].valid(value[i])
      updateCaret(caret, nodes[i].getCaretStyle())
      if (i >= value.length) {
        break
      }
    }
  })

  // autoType(statement, editor)
}

function autoType(statement, editor) {
  let counter = 0
  const id = setInterval(() => {
    editor.value += statement[counter++]
    if (counter > statement.length) {
      clearInterval(id)
    }
  }, 10)
}

// faster than waiting for keyboard events
// to reflect changes on the browser
function pollValue(editor, onUpdate) {
  let prev
  // faster than listening for events
  setInterval(() => {
    const v = editor.value
    if (v != prev) {
      onUpdate?.(v)
    }
  }, 30)
}

function syncHeights(from, to) {
  setInterval(() => {
    const box = from.getBoundingClientRect()
    to.style.width = box.width + 'px'
    to.style.height = box.height + 'px'
  }, 60)
}

function Node(word) {
  this._word = word
  this._elm = null

  Object.defineProperty(this, 'element', {
    get: () => {
      if (this._elm) {
        return this._elm
      }
      const elm = document.createElement('span')
      elm.classList.add('typer-letter')
      elm.innerText = this._word
      return (this._elm = elm)
    },
  })

  this.getCaretStyle = function () {
    const box = this._elm.getBoundingClientRect()
    const width = 3
    return {
      top: box.y + 'px',
      left: box.x - width + 'px',
      height: box.height + 'px',
      width: width + 'px',
    }
  }

  this.valid = function (value) {
    if (!value) {
      this.reset()
    } else if (value == this._word) {
      this._elm.classList.remove('invalid')
      this._elm.classList.add('valid')
    } else {
      this._elm.classList.remove('valid')
      this._elm.classList.add('invalid')
    }
  }

  this.reset = function () {
    this._elm.classList.remove('invalid')
    this._elm.classList.remove('valid')
  }
}

let chain = Promise.resolve()
let caretPositions = []

function updateCaret(caret, style) {
  caretPositions.push(() => Object.assign(caret.style, style))
  chain.then(processCaretQueue)
}

function processCaretQueue() {
  let style
  while ((style = caretPositions.shift())) {
    chain.then(style)
  }
}

main()
