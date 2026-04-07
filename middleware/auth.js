exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/auth/login');
};

exports.hasRole = (role) => {
    return (req, res, next) => {
        if (req.session.user && req.session.user.role === role) return next();
        res.status(403).send('Brak uprawnień');
    };
};