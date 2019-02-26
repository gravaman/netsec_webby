const path = require('path')
const express = require('express')
const app = express()
const port = 3000

app.use(express.static(path.join(__dirname, 'public')))
app.get('/', (req, res) => res.send('skynet reporting for duty'))
app.listen(port, () => console.log(`skynet running at http://localhost:${ port }`))
