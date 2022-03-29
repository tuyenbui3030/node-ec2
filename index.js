const express = require('express')
const app = express()
const port = 2608

app.get('/tuyenbui', (req, res) => {
  res.send('Tuyến ơi!!!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})