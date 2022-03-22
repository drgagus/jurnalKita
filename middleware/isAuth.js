module.exports = async(req,res,next)=>{
    await req.session.isAuth ? next() : res.redirect('/auth/login')
}