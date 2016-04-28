export default (value, ms, reject = false) => (
  new Promise((res, rej) => {
    setTimeout(() => reject ? rej(value) : res(value), ms)
  })
)
