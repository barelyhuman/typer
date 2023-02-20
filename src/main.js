import randomWords from 'random-words'
;(function () {
  const ignoreKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp']
  const caret = document.getElementById('caret')
  const preview = document.getElementById('typer-preview')
  const speedView = document.getElementById('speed')
  const editor = document.getElementById('typer-input')
  const container = document.querySelector('.typer-container')
  let listeners = []
  let autoTypeListner
  let nodes = []
  let startTime = null
  let statement = ''
  let speed = 0

  function initialState() {
    nodes = []
    speed = 0
    statement = ''
    editor.value = ''
    startTime = null

    speedView.innerHTML = localStorage.getItem('score') || 0

    while (preview.firstChild) {
      preview.removeChild(preview.firstChild)
    }

    editor.style.resize = 'none'
    syncHeights(preview, preview)
    syncHeights(preview, editor)
    syncHeights(preview, container)
    const searchParams = new URLSearchParams(window.location.search)
    const charCount = searchParams.get('wordCount')
    if (!charCount) {
      changeWords(30)
    }
    const characters = randomWords(Number(charCount)).join(' ').split('')
    characters.push(' ')
    nodes = characters.map(x => new Node(x))
    statement = characters.join('')
    nodes.forEach(node => {
      preview.appendChild(node.element)
    })
    // autoType(statement, editor)
  }

  function main() {
    editor.focus()

    editor.addEventListener('keyup', e => {
      if (ignoreKeys.indexOf(e.code) > -1) {
        e.preventDefault()
      }
    })

    pollValue(editor, value => {
      if (!value) {
        nodes.forEach(n => n.reset())
      }

      if (value.length >= statement.length) {
        localStorage.setItem('score', speed)
        initialState()
        return
      }

      if (!startTime) {
        startTime = Date.now()
      }

      speed = calcSpeed(startTime, value.length)

      for (let i = 0; i < statement.length; i++) {
        const isValid = nodes[i].valid(value[i])
        updateCaret(caret, nodes[i].getCaretStyle())
        if (isValid) {
          updateSpeed(speed)
        }
        if (i >= value.length) {
          break
        }
      }
    })

    setupTriggerButtons()
  }

  function setupTriggerButtons() {
    const group = document.getElementById('trigger-group')
    for (const node of group.childNodes) {
      if (node.dataset) {
        node.classList.remove('active')
        if (getActiveWordCount() === node.dataset.value) {
          node.classList.add('active')
        }
      }
      node.addEventListener('click', () => {
        changeWords(node.dataset.value)
      })
    }
  }

  function getActiveWordCount() {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('wordCount')
  }

  function changeWords(count) {
    const urlParams = new URLSearchParams()
    urlParams.append('wordCount', count)
    window.location.search = urlParams.toString()
  }

  function autoType(statement, editor) {
    let counter = 0
    if (autoTypeListner) {
      clearInterval(autoTypeListner)
    }
    autoTypeListner = setInterval(() => {
      editor.value += statement[counter++]
      if (counter > statement.length) {
        clearInterval(id)
      }
    }, 30)
  }

  // faster than waiting for keyboard events
  // to reflect changes on the browser
  function pollValue(editor, onUpdate) {
    let prev
    // faster than listening for events
    let listener = setInterval(() => {
      const v = editor.value
      if (v != prev) {
        onUpdate?.(v)
      }
    }, 30)
    listeners.push(listener)
  }

  function syncHeights(from, to) {
    let id = setInterval(() => {
      const box = from.getBoundingClientRect()
      const height = getHeightByChildren(from)
      const padding = 10
      to.style.width = box.width + 'px'
      to.style.height = height + padding + 'px'
    }, 60)

    listeners.push(id)
  }

  function getHeightByChildren(forElem) {
    if (!forElem.childNodes.length) {
      return 0
    }
    const boxOne = forElem.firstChild.getBoundingClientRect()
    const boxTwo = forElem.lastChild.getBoundingClientRect()
    return boxTwo.y + boxTwo.height - boxOne.y
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
        return true
      } else {
        this._elm.classList.remove('valid')
        this._elm.classList.add('invalid')
        return false
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

  function updateSpeed(speed) {
    speedView.innerHTML = speed
  }

  function calcSpeed(startTime, typedCharacters) {
    const minutes = 60 * 1000
    const totalTimeInMills = Date.now() - startTime
    const totalTimeInMinutes = totalTimeInMills / minutes
    const typedWords = typedCharacters / 5
    return Math.floor(typedWords / totalTimeInMinutes)
  }

  initialState()
  main()
})()
