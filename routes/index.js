const express           = require('express')
const router            = express.Router()
const Category          = require('./../models/category')
const Journal           = require('./../models/journal')
const dotenv            = require('dotenv')
const isAuth            = require('./../middleware/isAuth')
const isNotAuth         = require('./../middleware/isNotAuth')

dotenv.config()
router.get('/', isNotAuth, async(req,res)=>{
    let page =  parseInt(await req.query.page ? req.query.page : 1)
    let limit =  parseInt(await req.query.limit ? req.query.limit : 4)
    try{
        const categories = await Category.find()
        try{
            const journals = await Journal.find().skip((page-1)*limit).limit(limit).sort({dateofjournal:-1}).populate('category_id').exec()
            res.render('index', {
                categories:categories, 
                journals:journals, 
                count:await Journal.count(),
                limit:limit,
                page:page
            })
        }catch(e){
            res.send("please reload your page")
        }
    }catch(e){
        res.send("please reload your page")
    }
})

router.get('/menu', isAuth, async(req,res)=>{
    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    const categories = await Category.find()
    const journals = await Journal.find().skip((page-1)*limit).limit(limit).sort({dateofjournal:-1}).populate('category_id').exec()
    res.render('menu',{
        categories : categories,
        journals : journals, 
        count:await Journal.count(),
        limit:limit,
        page:page
    })
})

router.get('/:slugcat', isNotAuth, async(req,res)=>{
    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    try{
        let category = await Category.findOne({slug:req.params.slugcat})
        try{
            let journals = await Journal.find({category_id:category.id}).skip((page-1)*limit).limit(limit).sort({dateofjournal:-1}).populate('category_id').exec()
            try{
                let alljournalbycategory = await Journal.find({category_id:category.id})
                res.render('category', {
                    category:category, 
                    journals:journals,
                    limit:limit,
                    page:page,
                    count:alljournalbycategory.length
                })
            }catch(e){
            res.send("please reload your page")
            }
        }catch(e){
            res.send("please reload your page")
        }
    }catch(e){
        res.send("please reload your page")
    }
})
router.get('/:slugcat/:slugjour', isNotAuth, async(req,res)=>{
    try{
        let category = await Category.findOne({slug:req.params.slugcat})
        try{
            let journal = await Journal.findOne({slug:req.params.slugjour}).populate('category_id').exec()
            try{
                let journals = await Journal.find({category_id: category.id}).limit(4).sort({dateofjournal:-1}).populate('category_id').exec()
                res.render('journal', {journal:journal, journals:journals})
            }catch(e){
                res.send("please reload your page")
            }
        }catch(e){
            res.send("please reload your page")
        }
    }catch(e){
        res.send("please reload your page")
    }
    
})

router.get('/:slugcat/:slugjour/ind', isNotAuth, async(req,res)=>{
    try{
        let category = await Category.findOne({slug:req.params.slugcat})
        try{
            let journal = await Journal.findOne({slug:req.params.slugjour}).populate('category_id').exec()
            journal && category && category.id==journal.category_id.id && journal.linkofind ? res.render('document', {pdf:journal.linkofind, category:category.slug, journal:journal.slug}) : res.render('errors/pagenotfound')
        }catch(e){
            res.send("please reload your page")
        }
    }catch(e){
        res.send("please reload your page")
    }
    
})

router.get('/:slugcat/:slugjour/eng', isNotAuth, async(req,res)=>{
    try{
        let category = await Category.findOne({slug:req.params.slugcat})
        try{
            let journal = await Journal.findOne({slug:req.params.slugjour}).populate('category_id').exec()
            journal && category && category.id==journal.category_id.id && journal.linkofeng ? res.render('document', {pdf:journal.linkofeng, category:category.slug, journal:journal.slug}) : res.render('errors/pagenotfound')
        }catch(e){
            res.send("please reload your page")
        }
    }catch(e){
        res.send("please reload your page")
    }
})




module.exports = router
