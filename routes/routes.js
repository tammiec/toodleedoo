const bcrypt = require('bcrypt');
const passport = require('passport');
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../auth/is_auth');
const api = require('../lib/api/api');
const { upload, manageFile } = require('../lib/uploadFiles');

module.exports = (db, dbHandler) => {
  // Home page
  router.get('/', isAuthenticated, (req, res) => {
    res.render('home', { layout: 'layouts/main.ejs' });
  });
  // Login - Sign In page
  router.get('/login', (req, res) => {
    res.render('login', { layout: 'layouts/main.ejs' });
  });
  router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  }));

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
        res.redirect(307, '/login');
      }
    } catch (err) {
      console.error(err);
    }
  });

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
    function(req, res) {
      console.log('Worked FB!!!!!!')
      res.redirect('/');
    });

  // Landing page
  router.get('/landing', (req, res) => {
    res.render('landing', { layout: 'layouts/main.ejs' });
  });

  // User profile page
  router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { layout: 'layouts/main.ejs' });
  });

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

  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  router.get('/category', async (req, res) => {
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
      const task = await dbHandler.insertRecord('to_do_items', {
        user_id: res.locals.user.id,
        category_id: categoryNames[keyName],
        title: input,
        description: null,
        status_id: 1
      });
      result[0]['taskId'] = task.rows[0].id;
      console.log(result);
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
      const taskId = req.query.taskId;
      // const taskName = req.query.taskName;
      // const userId = res.locals.user.id;
      // await dbHandler.deleteTask(taskName, userId);
      await dbHandler.deleteTask('to_do_items', { status_id: 3 }, { id: taskId });
    } catch (err) {
      console.log('Error:', err.message);
    }
  });

  router.put('/todo/update', async (req, res) => {
    const key = req.query.catKey;
    const taskId = req.query.taskId;
    const important = req.query.important;
    const taskName = req.query.taskName;
    const taskDesc = req.query.taskDesc;
    console.log(req.query);
    let obj;

    try {
      if (key) {
        const cat = await dbHandler.isRecord('categories', { key }, true);
        obj = { category_id: cat.id };
      } else if (important) {
        obj = { important: important };
      } else if (taskName && taskDesc) {
        obj = { title: taskName, description: taskDesc };
      } else {
        const toDo = await dbHandler.isRecord('to_do_items', { id: taskId }, true);
        let newStatus = (toDo.status_id === 1) ? 2 : 1;
        obj = { status_id: newStatus };
      }

      await dbHandler.updateRecord('to_do_items', obj, { id: taskId });
      console.log('SOMETHING', await dbHandler.isRecord('to_do_items', { id: taskId }, true));
      res.send(true);
    } catch (err) {
      console.error(err);
    }
  });

  // 404 Page Not Found
  router.get('/*', (req, res) => {
    res.render('404', { layout: 'layouts/main.ejs' });
  });

  return router;
}
