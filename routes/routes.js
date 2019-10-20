const express = require('express');
const router  = express.Router();

module.exports = (db, dbHandler) => {
  // Home page
  router.get('/', (req, res) => {
    //must send temlateVars to be used in header
    //hard coded for now
    let templateVars = {
      user: 'user@email.com'
    };
    res.render('home', templateVars);
  });

  // Login - Sign In page
  router.get('/login', (req, res) => {
    // let templateVars = {
    //   user: null
    // };
    res.render('login');
  });
  router.post('/login', async (req, res) => {
    const _query = queryBuilder.querySelect('users', '*', 'AND', req.body);
    try {
      const result = await db.query(_query);
      res.send(result.rows.length > 0 ? true : false);
    } catch (err) {
      console.error(err);
    }
  });

  router.post('/signup', async (req, res) => {
    const {email, password} = req.body;
    try {
      const isEmail = await dbHandler.isRecord('users', {email});
      if (isEmail) {
        // res.send('Email already exists');
        //req.flash('error_msg', 'Mail already exists');
        console.log('Email already exists');
        res.redirect('/login');
      }
      else {
        const resInsert = await dbHandler.insertRecord('users', req.body);
        res.send(resInsert);
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Landing page
  router.get('/landing', (req, res) => {
    //must send temlateVars to be used in header
    //hard coded for now
    let templateVars = {
      user: null
    };
    res.render('landing', templateVars);
  });

  // User profile page
  router.get('/profile', (req, res) => {
    let templateVars = {
      user: 'user@email.com'
    };
    res.render('profile', templateVars);
  });

  return router;
}

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
