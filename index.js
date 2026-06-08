
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true })

const connectToMongo = require('./db')
const express = require('express')
var cors = require('cors')


connectToMongo()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

//available routes
app.use("/api/auth", require('./routes/auth.js'))
app.use('/api/notes', require('./routes/notes'))


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`iNotebook backend listening on port ${port}`)
})
