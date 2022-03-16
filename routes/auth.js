const express           = require('express')
const router            = express.Router()
const dotenv            = require('dotenv')
const middleware        = require('./../middleware/isAuth')


dotenv.config()

router.get('/login', middleware.isNotAuth, (req,res)=>{
    res.render('auth/login', {message:''})
})
router.post('/login', middleware.isNotAuth, async(req,res)=>{
    if(await String(req.body.username).toLowerCase() == String(process.env.user).toLowerCase()){
        if(await String(req.body.password).toLowerCase() == String(process.env.pass).toLowerCase()){
            req.session.isAuth = true
            res.redirect('/menu')
        }else{
            return res.render('auth/login', {message:'password salah'})
        }
    }else{
        return res.render('auth/login', {message: 'username salah'})
    }
})
router.delete('/logout', middleware.isAuth, (req,res)=>{
    req.session.destroy((err)=>{
        if (err) throw err
        res.redirect('/')
    })
})

module.exports = router
