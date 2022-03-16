const express       = require('express')
const router        = express.Router()
const dotenv        = require('dotenv')
const Category      = require('./../models/category')
const Journal       = require('./../models/journal')

dotenv.config()
router.get('/', async(req,res)=>{
    req.query.keyword=='' && res.render('search/journal',{journals:[],keyword:"<empty>",count:0})
    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    const journals = await Journal.find({title:{$regex: ".*"+req.query.keyword+".*"}}).skip((page-1)*limit).limit(limit).sort({dateofjournal:-1}).populate('category_id').exec()
    const alljournalbykeyword = await Journal.find({title:{$regex: ".*"+req.query.keyword+".*"}})
    res.render('search/journal', {
        journals:journals, 
        keyword:String(req.query.keyword),
        count:alljournalbykeyword.length,
        limit:limit,
        page:page
    })
})
router.get('/:slugcat', async(req,res)=>{
    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    const category = await Category.findOne({slug:req.params.slugcat})
    const journals = await Journal.find({category_id:category.id, title:{$regex: ".*"+req.query.keyword+".*"}}).skip((page-1)*limit).limit(limit).sort({dateofjournal:-1}).populate('category_id').exec()
    const alljournalbycategorybykeyword = await Journal.find({category_id:category.id, title:{$regex: ".*"+req.query.keyword+".*"}})

    req.query.keyword=='' && res.render('search/category',{category:category,journals:[],keyword:"<empty>",count:0})
    res.render('search/category', {
        category:category, 
        journals:journals, 
        keyword:req.query.keyword,
        count:alljournalbycategorybykeyword.length,
        limit:limit,
        page:page
    })
})


module.exports = router