import { animate, linear } from 'popmotion';
import randomWords from 'random-words';
import { effect, reactive } from './rndr.js';

const queue = Promise.prototype.then.bind(Promise.resolve());
const ignoreKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'];
const input = document.querySelector('#typer-input');
const preview = document.querySelector('#typer-preview');
const caret = document.querySelector('#caret');
const speed = document.querySelector('#speed');

let autoTypeListner;
let startTime;

const state = reactive({ words: [], input: '', speed: 0 });

input.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') {
    e.preventDefault();
    resetState();
  }
  if (ignoreKeys.indexOf(e.code) > -1) {
    console.log('key to ignore');
    e.preventDefault();
    return;
  }
});

input.addEventListener(
  'keyup',
  (e) => {
    state.input = e.target.value;
  },
  false
);

function resetState() {
  state.input = '';
  startTime = null;
  input.value = '';
  preview.innerHTML = '';
  setupWords(randomWords(30));
}

function setupWords(words) {
  state.words = words.join(' ').split('').concat(' ');
}

function renderSpeed() {
  effect(() => {
    speed.innerHTML = state.speed + ' WPM';
  });
}

function renderWords() {
  effect(() => {
    if (state.input.length == 0) {
      if (!startTime) {
        startTime = Date.now();
      }
    }

    const elms = state.words.map((x, index) => {
      let exists = true;
      let elm = document.getElementById(`${x}-${index}`);
      if (!elm) {
        exists = false;
        elm = document.createElement('span');
        elm.classList.add('typer-letter');
        elm.id = `${x}-${index}`;
      }
      elm.textContent = x;

      if (!exists) {
        preview.append(elm);
      }

      elm.classList.remove('valid');
      elm.classList.remove('invalid');

      if (state.input[index]) {
        if (state.words[index] === state.input[index]) {
          elm.classList.add('valid');
          state.speed = calcSpeed(startTime, state.input.length);
        } else {
          elm.classList.add('invalid');
        }
      }

      return { elm };
    });

    const currentElm = elms[state.input.length ? state.input.length : 0];

    if (!currentElm) return;

    const box = currentElm.elm.getBoundingClientRect();
    const width = 3;
    const caretHeight = box.height / 1.4;
    Object.assign(caret.style, {
      top: box.y + (box.height - caretHeight * 1.22) + 'px',
      height: caretHeight + 'px',
      width: width + 'px',
      bottom: box.height + caretHeight + 'px',
    });
    animate({
      type: 'keyframes',
      ease: linear,
      duration: 125,
      from: caret.style.left,
      to: box.x - width + 'px',
      onUpdate: (latest) => (caret.style.left = latest),
    });
  });
}

function autoType() {
  effect(() => {
    let counter = 0;
    input.value = '';
    const statement = state.words.join('');
    if (autoTypeListner) {
      clearInterval(autoTypeListner);
    }
    autoTypeListner = setInterval(() => {
      if (!statement[counter + 1]) {
        clearInterval(autoTypeListner);
      }
      const char = statement[counter++];
      const evt = new KeyboardEvent('keyup', { key: char });
      input.value += char;
      input.dispatchEvent(evt);
    }, 30);
  });
}

function calcSpeed(startTime, typedCharacters) {
  const minutes = 60 * 1000;
  const totalTimeInMills = Date.now() - startTime;
  const totalTimeInMinutes = totalTimeInMills / minutes;
  const typedWords = typedCharacters / 5;
  return Math.floor(typedWords / totalTimeInMinutes);
}

(function main() {
  resetState();
  renderWords();
  renderSpeed();
  input.focus();
  // autoType();
})();
