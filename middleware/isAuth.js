exports.isAuth = async(req,res,next)=>{
    req.session.isAuth? next() : res.redirect('/auth/login')
}

exports.isNotAuth = async(req,res,next)=>{
    req.session.isAuth? res.redirect('/menu') : next()
}

exports.cetak = async(req,res,next)=>{
    console.log(req.session.isAuth)
    next()
}

