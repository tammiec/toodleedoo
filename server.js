
// #region Web server config and imports
// load .env data into process.env
require('dotenv').config();
const PORT = process.env.PORT || 8080;
const ENV = process.env.ENV || 'development';
const express = require('express');
const bodyParser = require('body-parser');
const sass = require('node-sass-middleware');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const partials = require('express-partials')
const methodOverride = require('method-override');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const app = express();
const facebookStrategy = require('passport-facebook').Strategy;
const downloadAndSaveImg = require('./lib/downloadSaveImage');
const fs = require('fs');
const http = require('http');
const https = require('https');
// #endregion

// #region Database and Model management
// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();
//New DB management
const dbHandler = require('./lib/dbHandler');
dbHandler.db = db;
// Models
const User = require('./models/usersModel');
User.dbHandler = dbHandler;
// #endregion

// #region Middleware management
require('./auth/passport');
app.use(morgan('dev'));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));
app.use(partials());
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// #endregion

// #region FID strategies
const googleCallbackPath = process.env.SSL_KEY ? 'http://toodleedoo.com/oauthCallback/' : `http://localhost:${PORT}/oauthCallback/`;
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  googleCallbackPath
},
  async function (accessToken, refreshToken, profile, done) {
    try {
      const user = await User.findOrCreateGoogle(profile._json);
      return done(null, user);
    } catch (err) {
      return done(null, false, { message: 'Error from Google Auth' });
    }
  }
));

passport.use(new facebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: '/return'
},
  async function (accessToken, refreshToken, profile, done) {
    try {
      const prof = profile._json;
      prof['sub'] = prof.id;
      prof['picture'] = `assets/profile_photos/${prof.id}.jpg`;
      const user = await User.findOrCreateGoogle(prof);
      downloadAndSaveImg(`https://graph.facebook.com/${prof.id}/picture`, `public/assets/profile_photos/${prof.id}.jpg`, () => {});
      return done(null, user);
    } catch (err) {
      return done(null, false, { message: 'Error from Facebook Auth' });
    }
  }));
// #endregion

// #region Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.regEmail = req.flash('regEmail');
  res.locals.regPwd = req.flash('regPwd');
  res.locals.linEmail = req.flash('linEmail');
  res.locals.linPwd = req.flash('linPwd');
  res.locals.user = req.user || null;
  // res.locals.JWT_KEY = 'this is my key';
  next();
});
// #endregion

// #region Set Routes
const mainRoutes = require("./routes/main_routes");
const todoRoutes = require("./routes/todo_routes");
app.use("/todo", todoRoutes(dbHandler));
app.use("/", mainRoutes(dbHandler));
  // 404 Page Not Found
app.get('/*', (req, res) => res.render('404', { layout: 'layouts/main.ejs' }));
// #endregion

// #region Start Server Listening
app.listen(PORT, () => {
  console.log(`TOODLEEDOO listening on port ${PORT}`);
});
// http.createServer(app).listen(PORT);
if (process.env.SSL_KEY) {
  let opt;
  try {
    opt = {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
      passphrase: process.env.SSL_KEY
    };
    https.createServer(opt, app).listen(443);
  } catch (err) {
    console.error(err.message);
  }
}
// #endregion
