import randomWords from 'random-words'
import { debounce } from './lib/debounce'
import { keygen } from './lib/keygen'

function alignCaretToBox(node, caretNode) {
  const box = node.getBoundingClientRect()
  caretNode.style.top = box.top
  caretNode.style.left = box.left
  caretNode.style.bottom = box.bottom
  caretNode.style.transform = `translate(${box.left}px,${box.bottom}px)`
}

const debouncedAligner = debounce(alignCaretToBox, 0)

export function Typer(wordCount = 50) {
  this.install = function (
    container = document.getElementById('container'),
    preview = document.getElementById('preview'),
    editor = document.getElementById('editor')
  ) {
    this.container = container
    this.preview = preview
    this.editor = editor
    this.randomWords = randomWords(wordCount).join(' ')

    this.installCaret(document.body)
    this.installNodes(this.preview)
  }

  this.installCaret = function (host) {
    const caretNode = document.createElement('span')
    const box = host.getBoundingClientRect()

    caretNode.classList.add('caret-block')
    caretNode.style.left = 0
    caretNode.style.bottom = box.bottom + 'px'

    this.caretNode = caretNode

    host.appendChild(this.caretNode)
  }

  this.installNodes = function (host) {
    const nodes = this.randomWords.split('').map((x, index) => {
      const spanNode = document.createElement('span')
      spanNode.id = keygen(index)
      spanNode.innerText = x
      host.appendChild(spanNode)
      return spanNode
    })
    this.nodes = nodes
  }

  this.init = function () {
    debouncedAligner(this.preview.childNodes[0], this.caretNode)
  }

  this.update = function (value) {
    this.preview.childNodes.forEach(node => {
      node.className = ''
    })

    const inputValue = value
    const og = this.randomWords.split('')
    if (inputValue.length <= 0) {
      debouncedAligner(this.preview.childNodes[0], this.caretNode)
    }
    for (let i in inputValue) {
      this.preview.childNodes.forEach((node, nodeIndex) => {
        const toModify = node.id == keygen(i)
        if (toModify) {
          if (inputValue[i] == og[i]) {
            node.className = ''
            node.classList.add('correct')
          } else {
            node.className = ''
            node.classList.add('incorrect')
          }
          const nextNode = this.preview.childNodes[nodeIndex + 1]
          if (nextNode) {
            debouncedAligner(nextNode, this.caretNode)
          }
        }
      })
    }
  }
}
