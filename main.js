import { animate, linear } from 'popmotion'
import randomWords from 'random-words'
import { effect, reactive } from './rndr.js'

const ignoreKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp']
const allowedKeys = [
  'Space',
  'Semicolon',
  'Equal',
  'Comma',
  'Minus',
  'Period',
  'Slash',
  'Backquote',
  'BracketLeft',
  'BracketRight',
  'Backslash',
  'Quote',
]
const input = document.querySelector('#typer-input')
const preview = document.querySelector('#typer-preview')
const caret = document.querySelector('#caret')
const speed = document.querySelector('#speed')

const keyboardKeyCodeMap = {
  // not added all keys because out of scope as of now
  ' ': 'Space',
  '0': 'Digit0',
  '1': 'Digit1',
  '2': 'Digit2',
  '3': 'Digit3',
  '4': 'Digit4',
  '5': 'Digit5',
  '6': 'Digit6',
  '7': 'Digit7',
  '8': 'Digit8',
  '9': 'Digit9',
  'a': 'KeyA',
  'b': 'KeyB',
  'c': 'KeyC',
  'd': 'KeyD',
  'e': 'KeyE',
  'f': 'KeyF',
  'g': 'KeyG',
  'h': 'KeyH',
  'i': 'KeyI',
  'j': 'KeyJ',
  'k': 'KeyK',
  'l': 'KeyL',
  'm': 'KeyM',
  'n': 'KeyN',
  'o': 'KeyO',
  'p': 'KeyP',
  'q': 'KeyQ',
  'r': 'KeyR',
  's': 'KeyS',
  't': 'KeyT',
  'u': 'KeyU',
  'v': 'KeyV',
  'w': 'KeyW',
  'x': 'KeyX',
  'y': 'KeyY',
  'z': 'KeyZ',
  ';': 'Semicolon',
  '=': 'Equal',
  ',': 'Comma',
  '.': 'Period',
  '/': 'Slash',
  '`': 'Backquote',
  '[': 'BracketLeft',
  '\\': 'Backslash',
  ']': 'BracketRight',
  "'": 'Quote',
}

let autoTypeListener
let startTime

const state = reactive({ words: [], input: '', speed: 0 })

input.addEventListener('keydown', e => {
  if (e.code === 'Escape') {
    e.preventDefault()
    resetState()
  }
  if (e.code === 'Backspace') {
    e.preventDefault()
    handleBackspacePress()
  }
  if (ignoreKeys.indexOf(e.code) > -1) {
    console.log('key to ignore')
    e.preventDefault()
    return
  }
})

input.addEventListener('keyup', e => handleKeyUp(e), false)

function getCurrentElmAndIndex() {
  const currentIndex = state.input.length ? state.input.length - 1 : 0
  const currentChar = state.words[currentIndex]
  const currentElm = document.getElementById(`${currentChar}-${currentIndex}`)
  return { currentElm, currentIndex }
}

function handleBackspacePress() {
  const { currentElm } = getCurrentElmAndIndex()
  ;['valid', 'invalid'].forEach(clsName => currentElm.classList.remove(clsName))
  state.input = state.input.slice(0, -1)
}

function handleKeyUp(e) {
  if (
    !(
      allowedKeys.includes(e.code) ||
      ['Key', 'Digit', 'Numpad'].includes(e.code.slice(0, -1))
    )
  ) {
    return
  }
  input.value = ''
  state.input += e.key
}

function resetState() {
  state.input = ''
  state.speed = 0
  startTime = null
  input.value = ''
  preview.innerHTML = ''
  setupWords(randomWords(30))
  renderWords()
}

function setupWords(words) {
  state.words = words.join(' ').split('').concat(' ')
}

function renderSpeed() {
  effect(() => {
    speed.innerHTML = state.speed + ' WPM'
  })
}

function checkAndMarkLetter() {
  effect(() => {
    if (!state.input) {
      renderWords()
      return
    }

    const { currentElm, currentIndex } = getCurrentElmAndIndex()
    const isCorrectChar =
      state.words[currentIndex] === state.input[currentIndex]
    currentElm.classList.add(isCorrectChar ? 'valid' : 'invalid')

    if (isCorrectChar) {
      state.speed = calcSpeed(startTime, state.input.length)
    }

    // cursor movement
    const box = currentElm.getBoundingClientRect()
    const width = 3
    const caretHeight = box.height / 1.4
    Object.assign(caret.style, {
      top: box.y + (box.height - caretHeight * 1.22) + 'px',
      height: caretHeight + 'px',
      width: width + 'px',
      bottom: box.height + caretHeight + 'px',
    })
    animate({
      type: 'keyframes',
      ease: linear,
      duration: 125,
      from: caret.style.left,
      to: box.left - width + box.width + 'px',
      onUpdate: latest => (caret.style.left = latest),
    })
  })
}

function renderWords() {
  if (state.input.length == 0) {
    if (!startTime) {
      startTime = Date.now()
    }
  }
  state.words.forEach((x, index) => {
    let exists = true
    let elm = document.getElementById(`${x}-${index}`)
    if (!elm) {
      exists = false
      elm = document.createElement('span')
      elm.classList.add('typer-letter')
      elm.id = `${x}-${index}`
    }
    elm.textContent = x

    if (!exists) {
      preview.append(elm)
    }
  })

  const { currentElm } = getCurrentElmAndIndex()

  if (!currentElm) return

  const box = currentElm.getBoundingClientRect()
  const width = 3
  const caretHeight = box.height / 1.4
  Object.assign(caret.style, {
    top: box.y + (box.height - caretHeight * 1.22) + 'px',
    height: caretHeight + 'px',
    width: width + 'px',
    bottom: box.height + caretHeight + 'px',
  })
  animate({
    type: 'keyframes',
    ease: linear,
    duration: 125,
    from: caret.style.left,
    to: box.x - width + 'px',
    onUpdate: latest => (caret.style.left = latest),
  })
}

function autoType() {
  effect(() => {
    let counter = 0
    const statement = state.words.join('')
    if (autoTypeListener) {
      clearInterval(autoTypeListener)
    }
    autoTypeListener = setInterval(() => {
      if (!statement[counter + 1]) {
        clearInterval(autoTypeListner);
      }
      const char = statement[counter++]
      const evt = new KeyboardEvent('keyup', {
        key: char,
        code: keyboardKeyCodeMap[char],
      })
      input.dispatchEvent(evt)
    }, 30)
  })
}

function calcSpeed(startTime, typedCharacters) {
  const minutes = 60 * 1000
  const totalTimeInMills = Date.now() - startTime
  const totalTimeInMinutes = totalTimeInMills / minutes
  const typedWords = typedCharacters / 5
  return Math.floor(typedWords / totalTimeInMinutes)
}

;(function main() {
  resetState()
  checkAndMarkLetter()
  renderSpeed()
  input.focus()
  // autoType();
})()
