import { Typer } from './typer'

const typerContainer = document.querySelector('.typer-container')
const typerPreview = document.getElementById('typer-preview')
const typerInput = document.getElementById('typer-input')

const typer = new Typer(30)

typer.install(typerContainer, typerPreview, typerInput)

// sync height of the overall container with the typer preview
typerContainer.style.height = typerPreview.style.height

typerInput.addEventListener('keyup', e => {
  typer.update(e.target.value)
  if(typer.hasReachedEnd()){
    typer.reset()
  }
})

window.addEventListener('resize', e => {
  typer.update('')
})

typer.init()
