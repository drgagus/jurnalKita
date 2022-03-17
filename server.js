const express           = require('express')
const app               = express()
const mongoose          = require('mongoose')
const ejs               = require('ejs')
const dotenv            = require('dotenv')
const session           = require('express-session')
const methodOverRide    = require('method-override')
const authRouter        = require('./routes/auth')
const searchRouter      = require('./routes/search')
const journalRouter     = require('./routes/journals')
const categoryRouter    = require('./routes/categories')
const isAuth            = require('./middleware/isAuth')
const isNotAuth         = require('./middleware/isNotAuth')
const indexRouter       = require('./routes')
const PORT              = process.env.PORT || 8000
const HOST              = process.env.HOST || '127.0.0.1'

dotenv.config()
mongoose.connect(process.env.dbConnect)
app.set('view engine', 'ejs')
app.use(methodOverRide('_method'))
app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))
app.use(session({
    secret: 'rahasia',
    resave: false,
    saveUninitialized: false,
    cookie:{
        httpOnly : false
    }
}))


app.get('/session', async(req,res)=>{
    console.log(await req.session.isAuth)
})
app.use('/auth', authRouter)
app.use('/search', isNotAuth, searchRouter)
app.use('/journal', isAuth, journalRouter)
app.use('/category', isAuth, categoryRouter)
app.use('/', indexRouter)

app.listen(PORT,HOST)