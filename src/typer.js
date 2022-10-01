import randomWords from 'random-words'
import { debounce } from './lib/debounce'
import { keygen } from './lib/keygen'

const debouncedAligner = debounce(alignCaretToBox, 0)

export class Typer {
  constructor(wordCount = 5) {
    this.wordCount = wordCount
  }

  install(
    container = document.getElementById('container'),
    preview = document.getElementById('preview'),
    editor = document.getElementById('editor')
  ) {
    this.container = container
    this.preview = preview
    this.editor = editor
    this.randomWords = randomWords(this.wordCount).join(' ').concat([' '])

    this.installCaret(this.container)
    this.installNodes(this.preview)
  }

  installCaret(host) {
    const caretNode = document.createElement('span')
    const box = host.getBoundingClientRect()

    caretNode.classList.add('caret-block')
    caretNode.style.left = 0
    caretNode.style.bottom = box.bottom + 'px'

    this.caretNode = caretNode

    this.editor.addEventListener('focus', e => {
      caretNode.style.visibility = 'visible'
    })

    host.appendChild(this.caretNode)
  }

  installNodes(host) {
    const nodes = this.randomWords.split('').map((x, index) => {
      const spanNode = document.createElement('span')
      spanNode.id = keygen(index)
      spanNode.innerText = x
      host.appendChild(spanNode)
      return spanNode
    })
    this.nodes = nodes
  }

  init() {
    this.editor.addEventListener('focus', () => {
      this.caretNode.style.visibility = 'block'
    })
    this.editor.addEventListener('blur', () => {
      this.caretNode.style.visibility = 'hidden'
    })
    debouncedAligner(this.container, this.preview.childNodes[0], this.caretNode)
  }

  hasReachedEnd() {
    if (this.editor.value.length >= this.randomWords.length) {
      return true
    }
  }

  reset() {
    this.editor.value = ''
    removeAllChildNodes(this.preview)
    this.randomWords = randomWords(this.wordCount).join(' ').concat([' '])
    this.installNodes(this.preview)
    debouncedAligner(this.container, this.preview.childNodes[0], this.caretNode)
  }

  update(value) {
    this.preview.childNodes.forEach(node => {
      node.className = ''
    })

    const inputValue = value
    const og = this.randomWords.split('')
    if (inputValue.length <= 0) {
      debouncedAligner(
        this.container,
        this.preview.childNodes[0],
        this.caretNode
      )
    }
    for (let i in inputValue) {
      const toModify = document.getElementById(keygen(i))
      if (!toModify) {
        continue
      }

      if (inputValue[i] == og[i]) {
        toModify.className = ''
        toModify.classList.add('correct')
      } else {
        toModify.className = ''
        toModify.classList.add('incorrect')
      }
      const nextNode = document.getElementById(keygen(+i + 1))
      if (nextNode) {
        debouncedAligner(this.container, nextNode, this.caretNode)
      }
    }
  }
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}

function alignCaretToBox(containerNode, node, caretNode) {
  const containerBox = containerNode.getBoundingClientRect()
  const box = node.getBoundingClientRect()
  const top = box.top - containerBox.top
  const left = box.left - containerBox.left
  caretNode.style.height = box.height + 'px'
  caretNode.style.transform = `translate(${left}px,${top}px)`
}
