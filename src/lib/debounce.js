export const debounce = (fn, delay) => {
  let timeout
  return (...args) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
