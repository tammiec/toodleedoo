const isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error_msg', 'Not allowed');
    res.redirect('/login');
};
module.exports = isAuthenticated;
