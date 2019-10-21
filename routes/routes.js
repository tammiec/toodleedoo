const bcrypt   = require('bcrypt');
const passport = require('passport');
const express  = require('express');
const router   = express.Router();
const isAuthenticated = require('../auth/is_auth');
const api = require('../lib/api/api');

module.exports = (db, dbHandler) => {
  // Home page
  router.get('/', isAuthenticated, (req, res) => {
    res.render('home', {layout: 'layouts/main.ejs'});
  });

  // Login - Sign In page
  router.get('/login', (req, res) => {
    res.render('login', {layout: 'layouts/main.ejs'});
  });
  router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  }));


  // router.get('/login', (req, res, next) => {
  //   passport.authenticate('local', (err, user, info) => {
  //     if (err) { return next(err); }
  //     if (!user) {
  //       return res.redirect('/login');
  //     }
  //     req.logIn(user, function(err) {
  //       if (err) { return next(err); }
  //       return res.redirect('/');
  //     });
  //   })(req, res, next);
  // });

  router.post('/signup', async (req, res) => {
    let { email, password } = req.body;
    try {
      const isEmail = await dbHandler.isRecord('users', {email});
      if (isEmail) {
        req.flash('error', 'Mail already exists');
        req.flash('regEmail', email);
        req.flash('regPwd', password);
        res.redirect('/login');
      } else {
        password = bcrypt.hashSync(password, 12);
        const resInsert = await dbHandler.insertRecord('users', { email, password });
        res.redirect(307, '/login');
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Landing page
  router.get('/landing', (req, res) => {
    res.render('landing', {layout: 'layouts/main.ejs'});
  });

  // User profile page
  router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', {layout: 'layouts/main.ejs'});
  });

  router.put('/profile', async (req, res) => {
    let { id, email, oldPassword, newPassword } = req.body;
    try {
      {
        const userObj = await dbHandler.isRecord('users', { id }, true);
        if (oldPassword) {
          const match = bcrypt.compareSync(oldPassword, userObj.password);
          if (match) {
            let update = {};
            if (userObj.email !== email) update['email'] = email;
            if (newPassword) update['password'] = bcrypt.hashSync(newPassword, 12);
            const res = await dbHandler.updateRecord('users', update, { id });
          } else {
            console.log('Not valid password');
          }
        }
        res.redirect('/login');
      }
    } catch (err) {
      console.error(err);
    }
  });

  router.get('/logout', (req,res) => {
    req.logout();
    res.redirect('/');
  });

  router.get('/category', async(req,res) => {
    const input = req.query.input;
    const result = await api(input);
    res.json(result);
  });

  router.get('/test', (req, res) => {
    res.render('testAPI', {layout: 'layouts/main.ejs'});
  });

  return router;
}
