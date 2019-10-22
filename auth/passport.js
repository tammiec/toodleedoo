const bcrypt = require('bcrypt');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const dbHandler = require('../lib/dbHandler');

passport.use(new localStrategy({ usernameField: 'email',}, async (email, password, done) => {
    const user = await dbHandler.isRecord('users', {email}, true);
    console.log('user Passport >', user);
    if(!user){
        return done(null, false, {message: 'User not found!'});
    } else {
        console.log('user.password', user.password);
        console.log('password', password);
        const match = bcrypt.compareSync(password, user.password);
        console.log('match', match);
        if(match){
            done(null, user);
        } else {
            return done(null, false, {message: 'Wrong password'});
        }
    }
}));

passport.serializeUser((user, done) => {
    console.log('user from PASSPORT>>>', user);
    done(null, user.id || user.google_id);
});

passport.deserializeUser( async(id, done) => {
  try {
    console.log('id from PASSPORT>>>', id);
    let user = await dbHandler.isRecord('users', {id}, true);
    console.log('user from success 1', user);
    user = !user ? await dbHandler.isRecord('users', { google_id: id }, true) : user;
    console.log('user from success 2', user);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
