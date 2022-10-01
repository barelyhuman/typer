import { Typer } from './typer'

const typerContainer = document.querySelector('.typer-container')
const typerPreview = document.getElementById('typer-preview')
const typerInput = document.getElementById('typer-input')

const typer = new Typer(30)
const ignoreKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

typer.install(typerContainer, typerPreview, typerInput)
syncHeights()

typerInput.addEventListener(
  'keydown',
  e => {
    if (ignoreKeys.indexOf(e.code) > -1) {
      e.preventDefault()
    }
  },
  false
)

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

typer.init()

function syncHeights() {
  // sync height of the overall container with the typer preview
  const firstNodeBox = typerPreview.firstChild.getBoundingClientRect()
  const lastNodeBox = typerPreview.lastChild.getBoundingClientRect()
  typerContainer.style.height = lastNodeBox.bottom - firstNodeBox.top + 'px'
}
