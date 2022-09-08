import { Typer } from './typer'

const maxContainer = document.querySelector('.typer-container')
const container = document.getElementById('typer-preview')
const input = document.getElementById('typer-input')

const typer = new Typer(30)

typer.install(maxContainer, container, input)

input.addEventListener('keyup', e => {
  typer.update(e.target.value)
  if(typer.hasReachedEnd()){
    typer.reset()
  }
})

window.addEventListener('resize', e => {
  typer.update('')
})

typer.init()
