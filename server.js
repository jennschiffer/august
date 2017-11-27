/*** pxonloop ***/

var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, resp) {
  resp.sendFile(__dirname + '/views/index.html');
});

app.listen(3000, function() {
  console.log('pxonloop is running');
});