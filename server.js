const fs = require('fs');
const path = require('path');
const https = require('https');
const helmet = require('helmet');
const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const { Strategy } = require('passport-google-oauth20');
require('dotenv').config();
var session = require('express-session');
const underScore = require('./public/underscore');
const app = express();
const port = 3000;

app.use(cookieParser());

const AUTH_OPTIONS = {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://localhost:3000/auth/google/callback",
}

console.log("process.env.CLIENT_SECRET: ", process.env.CLIENT_SECRET);

passport.use(new Strategy(AUTH_OPTIONS,
    function (accessToken, refreshToken, profile, done) {
        // User.findOrCreate({ googleId: profile.id },
        //     function (err, user) {
        console.log("PROFILE: ", profile);
        // console.log("Strategy::",req.user);
        underScore('Strategy', 50)
        return done(null, profile);
        // });
    }
));
//save the session to the cookie
passport.serializeUser(function (user, done) {
    console.log("serializeUser: ", user);
    done(null, user.id); //creetes req.user && 
    //save user.id to the req.session.passport.user
    underScore('serialize', 50)
});
//read the session from the cookie
passport.deserializeUser(function (id, done) {
    console.log("deserializeUser: ", id);
    done(null, id);
    underScore('deserialize', 50)
});

app.use(function (req, res, next) {
    console.log("req.user{bfrsession}:", req.user);
    console.log("req.session{bfrsession}:", req.session);
    console.log("req.sessionID{bfrsession}: ", req.sessionID);
    console.log("req.cookies{bfrsession}:", req.cookies);
    next()
}, session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secureProxy: true, maxAge: 10 * 60 * 1000, name: 'Fathi' }
}), function (req, res, next) {
    console.log("req.user{session}:", req.user);
    console.log("req.session{session}:", req.session);
    console.log("req.cookies{session}:", req.cookies);
    underScore('keyboard', 50)
    next();
});
app.use(passport.initialize(), function (req, res, next) {
    console.log("req.user{initialize}: ", req.user);
    console.log("req.session{initialize}: ", req.session);
    console.log("req.cookies{initialize}: ", req.cookies);
    underScore('initialize', 50)
    next();
}); //initialize passport
app.use(passport.session(), function (req, res, next) {
    console.log("req.user{session}: ", req.user);
    console.log("req.session{session}: ", req.session);
    console.log("req.cookies{session}: ", req.cookies);
    underScore('session', 50)
    next();
}) //creates req.user


function checkLoggedIn(req, res, next) {
    // console.log("req.sessionANDuser" + req.session,req.user);
    console.log("req.user: ", req.user);
    console.log("req.session: ", req.session);
    console.log('req.cookies: ', req.cookies);
    // console.log('req.isAuthenticated()', req.isAuthenticated());
    const isLoggedIn = req.user && req.isAuthenticated();
    console.log("isLoggedIn: ", isLoggedIn);
    if (req.path === '/auth/google' && isLoggedIn) {
        return res.json({ message: 'You are already logged in' });
    }
    if (!isLoggedIn && req.path === '/secret') {
        return res.status(401).json({
            error: 'You are not logged in'
        });
    }
    underScore('checkLogedIn', 50)
    next();
}

app.get('/secret', checkLoggedIn, (req, res) => {
    res.send('This is a secret message:42');
});

app.get('/auth/google', checkLoggedIn,
    passport.authenticate("google", { scope: ['email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/failure',
        session: true,
    }), function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/");  //redirect to the home page
    }
);
app.get('/failure', (req, res) => {
    res.send('Authentication failed');
});

app.get('/auth/logout', (req, res) => {
    req.logOut(); //removes req.user
    console.log("req.session(logOut): ", req.session);
    console.log("req.cookies(logOut): ", req.cookies);
    underScore(50)
    // req.cookies = null; //removes req.cookies
    // req.session = null; //removes req.session
    res.redirect('/');
});


app.get('/',
    (req, res, next) => {
        console.log("req.user{home}:  ", req.user);
        console.log("req.session{home}: ", req.session);
        console.log("req.cookies{home}: ", req.cookies);
        console.log("req.sessionID{home}: ", req.sessionID);
        console.log('req.session.views: ', req.session.views);
        underScore('Home', 50)
        // res.sendFile(path.join(__dirname, 'public', 'index.html'));
        res.setHeader('Content-Type', 'text/html')
        res.write('<h1 style="text-align: center">Hello World</h1>')
        res.write('<a href="/secret" >Show secretCode!</a> <br>')
        res.write('<a href="/auth/google" >' + "Google Login" + '</a> <br>')
        res.write('<a href="/auth/logout" >' + 'Sign out' + '</a> <br>')
        if (req.session.views) {
            req.session.views.counter++
            res.write('<p>views: ' + req.session.views.counter + '</p>')
            res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
            res.end()
        } else {
            req.session.views={counter : 1}
            console.log('req.session.views: ', req.session.views.counter);
            res.end('     welcome to the session demo. refresh!')
        }
    }
);

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


