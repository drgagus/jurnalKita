const express       = require('express')
const Category      = require('../models/category')
const router        = express.Router()
const dotenv        = require('dotenv')
const multer        = require('multer')
const path          = require('path')
const fs            = require('fs')
const slugify       = require('slugify')
const Journal       = require('../models/journal')
const pathUpload    = 'public/thumb/category'
const typeAllow     = ['images/jpeg', 'images/jpg', 'images/png', 'images/gif']
const upload        = multer({
    dest    : pathUpload
})

dotenv.config()
router.get('/:slugcat/thumb', async(req,res)=>{
    try{
        const category = await Category.findOne({slug:req.params.slugcat})
        if(category==null){ return res.render('errors/pagenotfound')}
        res.render('category/thumb', {
            category: category
        })
    }catch(e){
        return res.send("please reload your page")
    }
})
router.put('/:slugcat/thumb', upload.single('thumb'), async(req,res)=>{
    if (!req.file){ return res.redirect(`/category/${req.params.slugcat}/thumb`)}
    let newthumb = req.file.filename
    try{
        const category = await Category.findOne({slug:req.params.slugcat})
        let oldthumb = category.thumb
        category.thumb = newthumb
        try{
            await category.save()
            if (oldthumb !== 'default'){
                fs.unlink(path.join(pathUpload,oldthumb), (e)=> e && console.log(e))
            }
            res.redirect('/admin')
        }catch(e){
            fs.unlink(path.join(pathUpload,newthumb), (e)=> e && console.log(e))
            return res.send("please reload your page")
        }
    }catch(e){
        fs.unlink(path.join(pathUpload,newthumb), (e)=> e && console.log(e))
        return res.send("please reload your page")
    }
})
router.get('/:slugcat/detail', async(req,res)=>{
    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    try{
        const category = await Category.findOne({slug:req.params.slugcat})
        if(category==null){ return res.render('errors/pagenotfound')}
        try{
            const journals = await Journal.find({category_id:category.id}).skip((page-1)*limit).limit(limit).sort({dateofjournal:-1}).populate('category_id').exec()
            try{
                let alljournalbycategory = await Journal.find({category_id:category.id})
                res.render('category/detail', {
                        category: category ,
                        journals: journals,
                        limit:limit,
                        page:page,
                        count:alljournalbycategory.length
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

router.get('/', async(req,res)=>{
    res.render('category/create', {
        category: new Category,
        error: null
    })
})

router.post('/', async(req,res)=>{
    let category = new Category({
        title: req.body.title,
        slug: slugify(req.body.title,{lower: true,strict: true})
    })
    if(category.title==''){
        return res.render('category/create', {
            category:category,
            error:'title required'})
    }
    try{
        await category.save()
        res.redirect('/admin')
    }catch(e){
        return res.send("please reload your page")
    }
})

router.get('/:slugcat', async(req,res)=>{
    try{
        const category = await Category.findOne({slug:req.params.slugcat})
        if(category==null){ return res.render('errors/pagenotfound')}
        res.render('category/edit', {category: category, error:null})
    }catch(e){
        return res.send("please reload your page")
    }
})
router.put('/:slugcat', async(req,res)=>{
    try{
        let category = await Category.findOne({slug:req.params.slugcat})
        if(req.body.title==''){ 
            return res.render('category/edit', {
                category:category,
                error:'title required'})
            }
        try{
            await Category.findByIdAndUpdate(category.id, {
                title : req.body.title,
                slug: slugify(req.body.title,{lower: true,strict: true})
            })
            res.redirect('/admin')
        }catch(e){ 
            return res.send("please reload your page")
        }
    }catch(e){
        return res.send("please reload your page")            
    }
    
})
router.delete('/:slugcat', async(req,res)=>{
    try{
        const category = await Category.findOne({slug:req.params.slugcat})
        if (category == null){return res.render('errors/pagenotfound')}
        try{
            const journals = await Journal.find({category_id:category.id})
            if(journals.length > 0){
                res.redirect('/admin')
            }else{
                category.remove()
                category.thumb !== 'default' && fs.unlink(path.join(pathUpload,category.thumb), (e)=> e && console.log(e))
                return res.redirect('/admin')
            }
        }catch(e){
            return res.send("please reload your page")            
        }
    }catch(e){
        return res.send("please reload your page")            
    }
})

module.exports = router