const bcrypt   = require('bcrypt');
const passport = require('passport');
const express  = require('express');
const router   = express.Router();
const isAuthenticated = require('../auth/is_auth');

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
    let {email, password} = req.body;
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
  router.get('/profile',isAuthenticated, (req, res) => {
    res.render('profile', {layout: 'layouts/main.ejs'});
  });

  router.get('/logout', (req,res) => {
    req.logout();
    res.redirect('/');
  });
  return router;
};

// const pgHandler = {
//   async isRecord(tableName, obj, DB) {
//     try {
//     const condition = Object.keys(obj).map(k => `${k}='${obj[k]}'`).join(` AND `);
//     const query = `SELECT * FROM ${tableName} WHERE ${condition}`;
//     const res = await DB.query(query);
//     return res.rows.length > 0;
//     } catch (err) {
//       console.error('Error:', err);
//     }
//   },
//   async insertRecord(tableName, obj, DB) {
//     const _query = this.queryInsert(tableName, obj);
//     console.log('_query', _query);
//     try {
//       const res = await DB.query(_query);
//       return res;
//     } catch (err) {
//       console.error('Error:', err);
//     }
//   },
//   queryInsert(tableName, obj) {
//     const keys = Object.keys(obj).join(',');
//     const values = Object.values(obj).map(v => `'${v}'`).join(',');
//     return `INSERT INTO ${tableName} (${keys}) VALUES (${values});`;
//   },
//   querySelect(tableName, filter, logical, obj) {
//     const condition = Object.keys(obj).map(k => `${k}='${obj[k]}'`).join(` ${logical} `);
//     return `SELECT ${filter} FROM ${tableName} WHERE ${condition};`;
//   }
// };
