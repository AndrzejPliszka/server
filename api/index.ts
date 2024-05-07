var express = require('express');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(require('./middlewares/cors'));

app.use('/', indexRouter);
app.use('/secure', require('./routes/secure'));

app.use(require('./middlewares/handleNotFound'));
app.use(require('./middlewares/handleGlobalError'));

module.exports = app;
