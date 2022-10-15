import { Typer } from './typer'

const triggerBtns = []
const appContainer = document.getElementById('app')
const typerContainer = document.querySelector('.typer-container')
const typerPreview = document.getElementById('typer-preview')
const typerInput = document.getElementById('typer-input')

const ignoreKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

const typer = new Typer(0)
typer.install(typerContainer, typerPreview, typerInput)

function main() {
  setupTyper()
  createWordCountTriggers()
  triggerBtns[0].click()
}
main()

typerInput.addEventListener(
  'keydown',
  e => {
    if (ignoreKeys.indexOf(e.code) > -1) {
      e.preventDefault()
    }
  },
  false
)

function syncHeights() {
  // sync height of the overall container with the typer preview
  const firstNodeBox = typerPreview.firstChild.getBoundingClientRect()
  const lastNodeBox = typerPreview.lastChild.getBoundingClientRect()
  typerContainer.style.height = lastNodeBox.bottom - firstNodeBox.top + 'px'
}

function createWordCountTriggers() {
  const container = document.createElement('div')
  container.classList.add('button-container')
  const triggers = [30, 50, 100, 1000, 10000]

  triggers.forEach(item => {
    const button = document.createElement('button')
    button.classList.add('trigger-btn')
    button.textContent = item
    button.addEventListener('click', () => {
      typer.wordCount = item
      triggerBtns.forEach(x => {
        x.classList.remove('active')
      })
      typerInput.focus()
      button.classList.add('active')
    })
    container.append(button)
    triggerBtns.push(button)
  })
  appContainer.prepend(container)
}

function setupTyper() {
  typer.init()
  typer.onInit(syncHeights)

  typerInput.addEventListener('keyup', e => {
    typer.update(e.target.value)
    if (typer.hasReachedEnd()) {
      typer.reset()
      syncHeights()
    }
  })

  window.addEventListener('resize', e => {
    typer.update('')
  })
}
