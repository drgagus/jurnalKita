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
    const username = req.body.username
    const password = req.body.password
    try{
        if (await username.toLowerCase() == String(process.env.user).toLowerCase()){
            try{
                if(await password.toLowerCase() == String(process.env.pass).toLowerCase()){
                    req.session.isAuth = true
                    res.redirect('/admin')
                }else{
                    return res.render('auth/login', {message:'password salah'})
                }
            }catch(e){
                return res.send("please reload your page")
            }
        }else{
            return res.render('auth/login', {message: 'username salah'})
        }
    }catch(e){
        return res.send("please reload your page")
    }
})
router.delete('/logout', isAuth, (req,res)=>{
    req.session.destroy((err)=>{
        if (err) throw err
        res.redirect('/')
    })
})

module.exports = router
