var express = require('express')
  , cookieParser = require('cookie-parser')
  , session = require('cookie-session')
  , express_sess = require('express-session')
  , app = express();

app.use(cookieParser())
app.use(session({ keys: ['abc'], name: 'user' }));
// app.use(express_sess({ secret: 'abc', key: 'user'}));
app.get('/', function (req, res, next) {
    res.end(JSON.stringify(req.cookies));
    console.log('req.session', req.session);
    console.log('req.cookies', req.cookies);
});

app.listen(3000);