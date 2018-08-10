const path = require('path')
const express = require('express')
const app = express()

app.use(express.static(path.join(__dirname, '..', 'frontend')))

app.listen(5000, () => {
  console.log('server listening at port 5000')
})