module.exports = async(req,res,next)=>{
    await req.session.isAuth ? res.redirect('/menu') : next()
}