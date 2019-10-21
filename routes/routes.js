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
    failureRedirect: '/landing',
    failureFlash: true
  }))

  router.post('/signup', async (req, res) => {
    let { email, password } = req.body;
    try {
      const isEmail = await dbHandler.isRecord('users', { email });
      if (isEmail) {
        res.send('Email already exists');
        req.flash('error_msg', 'Mail already exists');
        console.log('Email already exists');
        res.redirect('/login');
      }
      else {
        password = bcrypt.hashSync(password, 12);
        const resInsert = await dbHandler.insertRecord('users', { email, password });
        res.redirect('/login');
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
    console.log('Update profile input >', { id, email, oldPassword, newPassword });
    try {
      {
        const userObj = await dbHandler.isRecord('users', {id}, true);
        //if (userObj)
        if (oldPassword) {
          const match = bcrypt.compareSync(oldPassword, userObj.password);
          console.log('match', match);
          if (match) {
            let update = {};
            if (userObj.email !== email) update['email'] = email;
            if (newPassword) update['password'] = bcrypt.hashSync(newPassword, 12);

            console.log('update FROM ROUTE', update);
            // const password = bcrypt.hashSync(newPassword, 12);
            const res = await dbHandler.updateRecord('users', update, { id });
          } else {
            console.log('Not valid password');
          }

        }
        // console.log('userObj', userObj);
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
    console.log('result', result[0].title);
    let keyName = result[0].key;
    const categoryNames = {
      toWatch: 1,
      toEat: 2,
      toRead: 3,
      toBuy: 4,
      misc: 5
    };

    //added
    await dbHandler.insertRecord('to_do_items', {
      user_id: res.locals.user.id,
      category_id: categoryNames[keyName],
      title: input,
      description: null,
      status_id: 1
    });

    // res.send('Cat from the server, your input: ' + result);
    res.json(result);
  });


  router.get('/test', (req, res) => {
    res.render('testAPI', {layout: 'layouts/main.ejs'});
  });

  return router;
}
