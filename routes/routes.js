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
    try {
      const input = req.query.input;
      const result = await api(input);
      // console.log('result', result[0].title);
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
      res.json(result);
    } catch (err) {
      console.log('Error:', err.message);
    }
  });

  router.get('/todo', async (req, res) => {
    try {
      const tasks = await dbHandler.getUserTasks(res.locals.user.id);
      res.send(tasks.rows);
    } catch (err) {
      console.log('Error:', err.message);
    }
  });

  router.put('/todo/delete', async (req, res) => {
    try {
      const taskName = req.query.taskName;
      const userId = res.locals.user.id;
      await dbHandler.deleteTask(taskName, userId);
    } catch (err) {
      console.log('Error:', err.message);
    }
  });

  router.put('/todo/update', async (req, res) => {
    const key = req.query.catKey;
    const taskId = req.query.taskId;
    try {
      const cat = await dbHandler.isRecord('categories', {key}, true);
      await dbHandler.updateRecord('to_do_items', {category_id: cat.id}, {id: taskId});
      res.send(true);
    } catch (err) {
      console.error(err);
    }
  });
  // 404 Page Not Found
  router.get('/*', (req, res) => {
    res.render('404', {layout: 'layouts/main.ejs'});
  });

  return router;
}
