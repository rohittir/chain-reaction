
/*
 * SWE 681 Project: Chain Reaction
 * Authors: Rohit Tirmanwar, Rohitaksh Vanaparthy
 * Main server file
**/

// Headers
const express = require("express")
const path = require('path')
const exphbs = require('express-handlebars')
var https = require('https')
var fs = require('fs')

// Define Variables
const app = express();
const port = 3010

// ssl/tsl secure key and self-signed certificate generated using openssl
var options = {
   key  : fs.readFileSync('server.key'),
   cert : fs.readFileSync('server.crt')
};

// Set the view to express
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))


// Empty request from client renders the home.hbs
app.get('/', (request, response) => {
  response.render('home', {
    name: 'Rohit'
  })
})

// Start the server
https.createServer(options, app).listen(port, function (err) {
if (err) {
    return console.log('something bad happened', err)
  }
   console.log(`server is listening on ${port}`)
});



// app.get('/', (request, response) => {
//   response.send('Hello from Express!')
// })

// app.use((err, request, response, next) => {
//   // log the error, for now just console.log
//   console.log(err)
//   response.status(500).send('Something broke!')
// })
