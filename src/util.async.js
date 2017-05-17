function parallel(arr, iter, done) {
  var total = arr.length
  if (total === 0) return done()

  arr.forEach((item, index) => {
    iter(item, finish, index)
  })

  function finish() {
    if (--total === 0) done()
  }
}
