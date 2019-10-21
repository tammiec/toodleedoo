const isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error_msg', 'Not allowed');
    res.redirect('/landing');
};
module.exports = isAuthenticated;
