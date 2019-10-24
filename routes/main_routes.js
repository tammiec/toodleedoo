const apiVersion = process.env.CORE_API_VERSION;
const bcrypt = require('bcrypt');
const passport = require('passport');
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../auth/is_auth');
const { upload, manageFile } = require('../lib/uploadFiles');
const api = require('../lib/api/api' + apiVersion);

module.exports = (dbHandler) => {
  // Home page
  router.get('/', isAuthenticated, (req, res) => {
    console.log('API V', process.env.API_CORE_VERSION);
    res.render('home', { layout: 'layouts/main.ejs' });
  });
  // Login - Sign In / Sign Up page
  router.get('/login', (req, res) => {
    res.render('login', { layout: 'layouts/main.ejs' });
  });
  // Login - authentication
  router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  }));
  // Sing Up - Register user
  router.post('/signup', async (req, res) => {
    let { email, password, name } = req.body;
    try {
      const isEmail = await dbHandler.isRecord('users', { email });
      if (isEmail) {
        req.flash('error', 'Mail already exists');
        req.flash('regName', name);
        req.flash('regEmail', email);
        req.flash('regPwd', password);
        res.redirect('/login');
      } else {
        password = bcrypt.hashSync(password, 12);
        const resInsert = await dbHandler.insertRecord('users', { email, password, name });
        console.log('resInsert', resInsert);
        res.redirect(307, '/login');
      }
    } catch (err) {
      console.error(err);
    }
  });

  //test route (Delete eventually)
  router.get('/test', isAuthenticated, (req, res) => {
    console.log('API V', process.env.API_CORE_VERSION);
    res.render('test', { layout: 'layouts/main.ejs' });
  });

  // Landing page
  router.get('/landing', (req, res) => {
    res.render('landing', { layout: 'layouts/main.ejs' });
  });

  // Get Category
  router.get('/category', async (req, res) => {
    try {
      const input = req.query.input;
      let result = await api(input);
      result = !result ? [{ key: 'misc' }] : result;
      let keyName = result[0].key;
      const categoryNames = {
        toWatch: 1,
        toEat: 2,
        toRead: 3,
        toBuy: 4,
        misc: 5
      };
      //added
      const task = await dbHandler.insertRecord('to_do_items', {
        user_id: res.locals.user.id,
        category_id: categoryNames[keyName],
        title: input,
        description: null,
        status_id: 1
      });
      result[0]['taskId'] = task.rows[0].id;
      result[0]['createdDate'] = task.rows[0].date_created;
      console.log(result);
      res.json(result);
    } catch (err) {
      console.log('Error:', err.message);
    }
  });

  // #region User routes
  // User profile page
  router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { layout: 'layouts/main.ejs' });
  });

  // User profile update
  router.put('/profile', isAuthenticated, upload.single('file'), async (req, res) => {
    let { id, name, email, oldPassword, newPassword } = req.body;
    let newFileName = manageFile(req.file);
    try {
      const userObj = await dbHandler.isRecord('users', { id }, true);
      if (oldPassword) {
        const match = bcrypt.compareSync(oldPassword, userObj.password);
        if (match) {
          let update = {};
          if (userObj.email !== email) update['email'] = email;
          if (userObj.name !== name) update['name'] = name;
          if (newFileName) update['photo_url'] = newFileName;
          if (newPassword) update['password'] = bcrypt.hashSync(newPassword, 12);
          const res = await dbHandler.updateRecord('users', update, { id });
        } else {
          req.flash('error', 'Wrong password');
          res.redirect('/profile');
          return;
        }
        res.redirect('/');
      }
    } catch (err) {
      console.error(err);
    }
  });

  // User logout
  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  // #region FID routing management
  router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));
  router.get('/oauthCallback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
      res.redirect('/');
    });
  router.get('/login/facebook',
    passport.authenticate('facebook'));
  router.get('/return',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function (req, res) {
      res.redirect('/');
    });
  // #endregion
  // #endregion
  return router;
}
