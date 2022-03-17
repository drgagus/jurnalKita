module.exports = async(req,res,next)=>{
    req.session.isAuth ? next() : res.redirect('/auth/login')
}