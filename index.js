require('babel-register');
const app = require('./server/app').app;
const express = require('express');
const path = require('path');

app.set('port', (process.env.PORT || 3001));
app.set('views', path.join( __dirname, '/views' ));
app.set('view engine', 'ejs');

const server = app.listen(app.get('port'), ()=> {
  console.log('listening on port ' + app.get('port'));
});
