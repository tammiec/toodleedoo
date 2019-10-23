// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT                = process.env.PORT || 8080;
const ENV                 = process.env.ENV || 'development';
const express             = require('express');
const bodyParser          = require('body-parser');
const sass                = require('node-sass-middleware');
const morgan              = require('morgan');
const passport            = require('passport');
const session             = require('express-session');
const flash               = require('connect-flash');
const partials            = require('express-partials')
const methodOverride      = require('method-override');
const GoogleStrategy      = require('passport-google-oauth').OAuth2Strategy;
const app                 = express();
const facebookStrategy    = require('passport-facebook').Strategy;
const downloadAndSaveImg  = require('./lib/downloadSaveImage');

// PG database client/connection setup
const { Pool }        = require('pg');
const dbParams        = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

//New DB management
const dbHandler       = require('./lib/dbHandler');
dbHandler.db = db;

// Models
const User            = require('./models/usersModel');
User.dbHandler = dbHandler;

require('./auth/passport');
// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
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


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:8080/oauthCallback/"
},
async function(accessToken, refreshToken, profile, done) {
    try {
      const user = await User.findOrCreateGoogle(profile._json);
      console.log('user', user);
      return done(null, user);
    } catch (err) {
      console.log('err Strategy', err);
      return done(null, false, { message: 'Error from Google Auth' });
    }
}
));

passport.use(new facebookStrategy({
  clientID: process.env['FACEBOOK_CLIENT_ID'],
  clientSecret: process.env['FACEBOOK_CLIENT_SECRET'],
  callbackURL: '/return'
},
async function(accessToken, refreshToken, profile, done) {
  console.log('profile', profile);
  try {
    const prof = profile._json;
    prof['sub'] = prof.id;
    prof['picture'] = `assets/profile_photos/${prof.id}.jpg`;
    const user = await User.findOrCreateGoogle(prof);
    downloadAndSaveImg(`https://graph.facebook.com/${prof.id}/picture`, `public/assets/profile_photos/${prof.id}.jpg`, () => console.log('FB avatar saved!'));
    return done(null, user);
  } catch (err) {
    return done(null, false, { message: 'Error from Facebook Auth' });
  }
}));


// Global Variables
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

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/api_users");
const widgetsRoutes = require("./routes/api_widgets");
const mainRoutes = require("./routes/routes");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
app.use("/", mainRoutes(db, dbHandler));
// Note: mount other resources here, using the same pattern above

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
