export function Deferred() {
  const defer = {}

  defer.promise = new Promise(function (resolve, reject) {
    defer.resolve = resolve
    defer.reject = reject
  })

  return defer
}

export function delay(ms) {
  if (typeof setTimeout === 'undefined') {
    // In App Service context, return a never-resolving promise
    return new Promise(function () {})
  }

  const defer = Deferred()
  setTimeout(defer.resolve, ms)
  return defer.promise
}

export function timeout(ms, cb) {
  if (typeof setTimeout === 'undefined') {
    // In App Service context, return a never-resolving promise.
    // Promise.race in MessageBuilder.request() will resolve
    // via the actual BLE response instead.
    return new Promise(function () {})
  }

  const defer = Deferred()
  ms = ms || 1000

  const wait = setTimeout(() => {
    clearTimeout(wait)

    if (cb) {
      cb && cb(defer.resolve, defer.reject)
    } else {
      defer.reject('Timed out in ' + ms + 'ms.')
    }
  }, ms)

  return defer.promise
}
