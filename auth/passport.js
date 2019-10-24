const bcrypt = require('bcrypt');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const dbHandler = require('../lib/dbHandler');

passport.use(new localStrategy({ usernameField: 'email',}, async (email, password, done) => {
    const user = await dbHandler.isRecord('users', {email}, true);
    if(!user){
        return done(null, false, {message: 'User not found!'});
    } else {
        const match = bcrypt.compareSync(password, user.password);
        if(match){
            done(null, user);
        } else {
            return done(null, false, {message: 'Wrong password'});
        }
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id || user.google_id);
});

passport.deserializeUser( async(id, done) => {
  try {
    let user = await dbHandler.isRecord('users', {id}, true);
    user = !user ? await dbHandler.isRecord('users', { google_id: id }, true) : user;
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
