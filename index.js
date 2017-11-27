/*** pxonloop ***/


// express
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));


// index
app.get('/', function(req, resp) {
  resp.sendFile(__dirname + '/views/index.html');
});


// server
var server = app.listen(3000, function() {
  console.log('pxonloop is running');
});