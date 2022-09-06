import { Typer } from './typer'

const maxContainer = document.querySelector('.typer-container')
const container = document.getElementById('typer-preview')
const input = document.getElementById('typer-input')

const typer = new Typer()

typer.install(maxContainer, container, input)

input.addEventListener('keyup', e => {
  typer.update(e.target.value)
})

window.addEventListener('resize', e => {
  typer.update('')
})

typer.init()
