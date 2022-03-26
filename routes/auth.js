const express           = require('express')
const router            = express.Router()
const dotenv            = require('dotenv')
const isAuth            = require('./../middleware/isAuth')
const isNotAuth         = require('./../middleware/isNotAuth')


dotenv.config()
router.get('/login', isNotAuth, (req,res)=>{
    res.render('auth/login', {message:''})
})
router.post('/login', isNotAuth, async(req,res)=>{
    const username = await req.body.username
    const password = await req.body.password
    if(username.toLowerCase() == String(process.env.user).toLowerCase()){
        if(password.toLowerCase() == String(process.env.pass).toLowerCase()){
            req.session.isAuth = true
            res.redirect('/admin')
        }else{
            return res.render('auth/login', {message:'password salah'})
        }
    }else{
        return res.render('auth/login', {message: 'username salah'})
    }
})
router.delete('/logout', isAuth, (req,res)=>{
    req.session.destroy((err)=>{
        if (err) throw err
        res.redirect('/')
    })
})

module.exports = router
