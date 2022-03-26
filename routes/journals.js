const express           = require('express')
const router            = express.Router()
const Journal           = require('./../models/journal')
const Category          = require('./../models/category')
const isNotAuth            = require('./../middleware/isNotAuth') 

router.get('/newest', isNotAuth, async(req,res)=>{
    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    try{
        let journals = await Journal.find().skip((page-1)*limit).limit(limit).sort({dateofjournal:-1}).populate('category_id').exec()
        try{
            let count = await Journal.count()
            res.render('listofjournals',{
                journals:journals,
                limit:limit,
                page:page,
                count:count,
                typejournals:1
            })
        }catch(e){
            return res.send("please reload your page")
        }
    }catch(e){
        return res.send("please reload your page")
    }
})
router.get('/most-viewed', isNotAuth, async(req,res)=>{
    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    try{
        let journals = await Journal.find().skip((page-1)*limit).limit(limit).sort({view:-1}).populate('category_id').exec()
        try{
            let count = await Journal.count()
            res.render('listofjournals',{
                journals:journals,
                limit:limit,
                page:page,
                count:count,
                typejournals:2
            })
        }catch(e){
            return res.send("please reload your page")
        }
    }catch(e){
        return res.send("please reload your page")
    }
})
router.get('/last-updated', isNotAuth, async(req,res)=>{
    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    try{
        let journals = await Journal.find().skip((page-1)*limit).limit(limit).sort({createAt:-1}).populate('category_id').exec()
        try{
            let count = await Journal.count()
            res.render('listofjournals',{ 
                journals:journals,
                limit:limit,
                page:page,
                count:count,
                typejournals:3
            })
        }catch(e){
            return res.send("please reload your page")
        }
    }catch(e){
        return res.send("please reload your page")
    }
})

module.exports = router