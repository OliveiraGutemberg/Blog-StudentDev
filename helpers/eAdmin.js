module.exports = {
    eAdmin: function(req, res, next) {
        if(req.isAuthenticated() && req.user.admin == 1){
            return next()// = Pode segir
        }
        req.flash("error_msg", "Voce não é um admin")
        res.redirect("/")
    }
}