const express = require('express')
const aws = require('aws-sdk')
const app = express()
const port = 8081

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})