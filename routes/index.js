const express           = require('express')
const router            = express.Router()
const Category          = require('./../models/category')
const Journal           = require('./../models/journal')
const dotenv            = require('dotenv')
const isAuth            = require('./../middleware/isAuth')
const isNotAuth         = require('./../middleware/isNotAuth')

dotenv.config()
router.get('/', isNotAuth, async(req,res)=>{
    try{
        const categories = await Category.find()
        try{
            const newestjournals = await Journal.find().limit(8).sort({dateofjournal:-1}).populate('category_id').exec()
            try{
                const mostviewedjournals = await Journal.find().limit(8).sort({view:-1}).populate('category_id').exec()
                try{
                    const lastupdatedjournals = await Journal.find().limit(8).sort({createAt:-1}).populate('category_id').exec()
                    res.render('index', {
                        categories:categories, 
                        newestjournals:newestjournals,
                        mostviewedjournals:mostviewedjournals,
                        lastupdatedjournals:lastupdatedjournals
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
    }catch(e){
        return res.send("please reload your page")
    }
})

router.get('/:slugcat', isNotAuth, async(req,res)=>{
    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    try{
        let category = await Category.findOne({slug:req.params.slugcat})
        if (!category){return res.render('errors/pagenotfound')}
        try{
            let journals = await Journal.find({category_id:category.id}).skip((page-1)*limit).limit(limit).sort({dateofjournal:-1}).populate('category_id').exec()
            try{
                let alljournalbycategory = await Journal.find({category_id:category.id})
                try{
                    const categories = await Category.find()
                    res.render('category', {
                        categories:categories,
                        category:category, 
                        journals:journals,
                        limit:limit,
                        page:page,
                        count:alljournalbycategory.length,
                        typejournals:1
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
    }catch(e){
        return res.send("please reload your page")
    }
})
router.get('/:slugcat/most-viewed', isNotAuth, async(req,res)=>{
    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    try{
        let category = await Category.findOne({slug:req.params.slugcat})
        if (!category){return res.render('errors/pagenotfound')}
        try{
            let journals = await Journal.find({category_id:category.id}).skip((page-1)*limit).limit(limit).sort({view:-1}).populate('category_id').exec()
            try{
                let alljournalbycategory = await Journal.find({category_id:category.id})
                try{
                    const categories = await Category.find()
                    res.render('category', {
                        categories:categories,
                        category:category, 
                        journals:journals,
                        limit:limit,
                        page:page,
                        count:alljournalbycategory.length,
                        typejournals:2
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
    }catch(e){
        return res.send("please reload your page")
    }
})
router.get('/:slugcat/last-updated', isNotAuth, async(req,res)=>{
    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    try{
        let category = await Category.findOne({slug:req.params.slugcat})
        if (!category){return res.render('errors/pagenotfound')}
        try{
            let journals = await Journal.find({category_id:category.id}).skip((page-1)*limit).limit(limit).sort({createAt:-1}).populate('category_id').exec()
            try{
                let alljournalbycategory = await Journal.find({category_id:category.id})
                try{
                    const categories = await Category.find()
                    res.render('category', {
                        categories:categories,
                        category:category, 
                        journals:journals,
                        limit:limit,
                        page:page,
                        count:alljournalbycategory.length,
                        typejournals:3
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
    }catch(e){
        return res.send("please reload your page")
    }
})

router.get('/:slugcat/:slugjour', isNotAuth, async(req,res)=>{
    try{
        let category = await Category.findOne({slug:req.params.slugcat})
        if(!category){ return res.render('errors/pagenotfound')}
        try{
            let journal = await Journal.findOne({slug:req.params.slugjour}).populate('category_id').exec()
            if(!journal){ return res.render('errors/pagenotfound')}
            try{
                let journals = await Journal.find({category_id: category.id}).limit(4).sort({dateofjournal:-1}).populate('category_id').exec()
                res.render('journal', {journal:journal, journals:journals})
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

router.get('/:slugcat/:slugjour/ind', isNotAuth, async(req,res)=>{
    try{
        let category = await Category.findOne({slug:req.params.slugcat})
        if (!category){return res.render('errors/pagenotfound')}
        try{
            let journal = await Journal.findOne({slug:req.params.slugjour}).populate('category_id').exec()
            if (!journal){return res.render('errors/pagenotfound')}
            if(!category.id==journal.category_id.id){ return res.render('errors/pagenotfound')} 
            if(!journal.linkofind){ return res.render('errors/pagenotfound')}
            try{
                journal.view = journal.view + 1
                await journal.save()
                res.render('document', {pdf:journal.linkofind, category:category.slug, journal:journal.slug})
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

router.get('/:slugcat/:slugjour/eng', isNotAuth, async(req,res)=>{
    try{
        let category = await Category.findOne({slug:req.params.slugcat})
        try{
            let journal = await Journal.findOne({slug:req.params.slugjour}).populate('category_id').exec()
            journal && category && category.id==journal.category_id.id && journal.linkofeng ? res.render('document', {pdf:journal.linkofeng, category:category.slug, journal:journal.slug}) : res.render('errors/pagenotfound')
        }catch(e){
            return res.send("please reload your page")
        }
    }catch(e){
        return res.send("please reload your page")
    }
})


module.exports = router
