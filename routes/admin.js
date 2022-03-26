const express           = require('express')
const router            = express.Router()
const Journal           = require('./../models/journal')
const Category          = require('./../models/category')
const isAuth            = require('./../middleware/isAuth') 

router.get('/', isAuth, async(req,res)=>{
    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    try{
        const categories = await Category.find()
        try{
            const journals = await Journal.find().skip((page-1)*limit).limit(limit).sort({createAt:-1}).populate('category_id').exec()
            try{
                const count = await Journal.count()
                res.render('admin/dashboard',{
                    categories : categories,
                    journals : journals, 
                    count:count,
                    limit:limit,
                    page:page
                })
            }catch(e){
                return res.send("please reload your page")
            }
        }catch(e){
            return res.send("please reload your page")
        }
    }catch(e){
        return res.send("please reload your page")
    }
})

module.exports = router