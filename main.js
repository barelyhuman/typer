import { animate, linear } from 'popmotion'
import randomWords from 'random-words'
import {
  compose,
  curry,
  fromEvent,
  fromSubscription,
  IO,
  map,
  prop,
  run,
  unary,
} from './fp.js'

// Steams and subscriptions to reset when state resets
let charStream, keydownUnsub, keyupUnsub

const ignoreKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp']
const wordsToChars = words => words.join(' ').split('').concat(' ')
const generateRandomWords = () => wordsToChars(randomWords(30))
const charKey = (char, id) => `#${char.trim() || 'space'}-${id}`

const $ = sel => IO.of(() => document.querySelector(sel))

const resetInput = input => {
  input.value = ''
  return input
}

const resetPreview = preview => {
  preview.innerHTML = ''
  return preview
}

const focusInput = input => {
  input.focus()
  return input
}

const setMaxLength = curry((maxLength, input) => {
  input.maxLength = maxLength
  return input
})

const pickEvCode = compose(e => [e.code, e])

const isEscape = ([code, e]) => {
  return [code === 'Escape', e]
}

const isIgnoredKey =
  keysToIgnore =>
  ([code, e]) =>
    [keysToIgnore.indexOf(code) > -1, e]

const resetIfEscape = compose(pickEvCode, isEscape, ([stop, e]) => {
  if (stop) {
    e.preventDefault()
    e.stopPropagation()
    charStream.next(generateRandomWords())
  }
  return e
})

const stopIfIgnoredKey = compose(
  pickEvCode,
  isIgnoredKey(ignoreKeys),
  ([stop, e]) => {
    if (stop) {
      e.preventDefault()
      e.stopPropagation()
    }
    return e
  }
)

const isCharlistValid = curry((charList, val) =>
  map((char, index) => {
    if (!val[index]) {
      return { char, valid: null, index }
    }
    if (char === val[index]) {
      return { char, valid: true, index }
    } else {
      return { char, valid: false, index }
    }
  }, charList)
)

const onKeydownOnInput = compose(resetIfEscape, stopIfIgnoredKey)

// TODO: Impure, can be ignored if `elm` is considered a dependency adaptor
const updateSpanElement = charState => elm => {
  elm.classList.remove('valid')
  elm.classList.remove('invalid')

  if (charState.valid === null) {
    return [false, elm]
  }

  if (charState.valid) {
    elm.classList.add('valid')
  } else {
    elm.classList.add('invalid')
  }
  return [true, elm]
}

// TODO: Impure
const updateSpanStateAndCaret = curry((charSet, node) =>
  compose(
    map(updateSpanElement(charSet)),
    map(([move, e]) => {
      if (move) {
        moveCaretTo(e)
      }
    })
  )(node)
)

const updateSpanByValue = curry((charList, val) => {
  // TODO: Impure
  map(
    charSet =>
      run(
        updateSpanStateAndCaret(
          charSet,
          $(charKey(charSet.char, charSet.index))
        )
      ),
    isCharlistValid(charList, val)
  )

  return val
})

const respositionCaret = curry((toNodeIO, val) => {
  // TODO: Impure
  !val.length && run(map(e => moveCaretTo(e, true), toNodeIO))
  return val
})

const onKeyupOnInput = charList =>
  compose(
    prop('target'),
    prop('value'),
    updateSpanByValue(charList),
    respositionCaret($(charKey(charList[0], 0)))
  )

const charsToPreview = charList => elm =>
  charList.map((char, index) =>
    IO.of(() => {
      const span = document.createElement('span')
      span.id = `${char.trim() || 'space'}-${index}`
      span.classList.add('typer-letter')
      span.innerText = char
      elm.appendChild(span)
      return span
    })
  )

function moveCaretTo(node, before) {
  const effect = map(caret => {
    const box = node.getBoundingClientRect()
    const width = 3
    const caretHeight = box.height / 1.4
    Object.assign(caret.style, {
      top: box.y + (box.height - caretHeight * 1.22) + 'px',
      height: caretHeight + 'px',
      width: width + 'px',
      bottom: box.height + caretHeight + 'px',
    })
    let target = box.x - width
    if (!before) {
      target += box.width
    }
    animate({
      type: 'keyframes',
      ease: linear,
      duration: 125,
      from: caret.style.left,
      to: target + 'px',
      onUpdate: latest => (caret.style.left = latest),
    })
  })($('#caret'))

  run(effect)
}

// Effect Executions
charStream = fromSubscription({
  next: charList => {
    keydownUnsub && keydownUnsub()
    keyupUnsub && keyupUnsub()

    run(
      map(
        compose(resetPreview, charsToPreview(charList), map(run)),
        $('#typer-preview')
      )
    )

    run(
      map(e => {
        moveCaretTo(e, true)
      }, $(charKey(charList[0], 0)))
    )

    run(
      map(e => {
        compose(resetInput, focusInput, setMaxLength(charList.length - 1))(e)

        keydownUnsub = fromEvent(e, 'keydown').subscribe(
          unary(onKeydownOnInput)
        )

        keyupUnsub = fromEvent(e, 'keyup').subscribe(
          unary(onKeyupOnInput(charList))
        )
      }, $('#typer-input'))
    )
  },
  complete: () => {},
})

charStream.next(generateRandomWords())
