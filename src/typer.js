import randomWords from 'random-words'
import { debounce } from './lib/debounce'
import { keygen } from './lib/keygen'

function alignCaretToBox(node, caretNode) {
  const box = node.getBoundingClientRect()
  caretNode.style.height = box.height + 'px'
  caretNode.style.transform = `translate(${box.left}px,${box.top}px)`
}

const debouncedAligner = debounce(alignCaretToBox, 0)

export function Typer(wordCount = 5) {

  this.wordCount = wordCount

  this.install = function (
    container = document.getElementById('container'),
    preview = document.getElementById('preview'),
    editor = document.getElementById('editor')
  ) {
    this.container = container
    this.preview = preview
    this.editor = editor
    this.randomWords = randomWords(this.wordCount).join(' ').concat([" "])

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

    this.editor.addEventListener("focus",(e)=>{
      caretNode.style.visibility = 'visible'
    })

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
    this.editor.addEventListener("focus",()=>{
      this.caretNode.style.visibility = "block"
    })
    this.editor.addEventListener("blur",()=>{
      this.caretNode.style.visibility = "hidden"
    })
    debouncedAligner(this.preview.childNodes[0], this.caretNode)
  }

  this.hasReachedEnd = function(){
    if(this.editor.value.length >= this.randomWords.length){
      return true
    }
  }
  
  this.reset = function(){
    this.editor.value = ''
    removeAllChildNodes(this.preview)
    this.randomWords = randomWords(this.wordCount).join(' ').concat([" "])
    this.installNodes(this.preview)
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


function removeAllChildNodes(parent) {
  while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
  }
}