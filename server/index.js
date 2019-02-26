const path = require('path')
const express = require('express')
const app = express()
const port = 3000


// console.log(path.normalize(__dirname + '/..'))
// console.log(path.join(path.normalize(__dirname + '/..'), 'client', 'dist'))
// console.log('BOOM')
app.use(express.static(path.join(path.normalize(__dirname + '/..'), 'client', 'dist')))
app.get('/', (req, res) => res.send('skynet reporting for duty'))
app.listen(port, () => console.log(`skynet running at http://localhost:${ port }`))
