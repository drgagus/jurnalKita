const express       = require('express')
const Category      = require('./../models/category')
const router        = express.Router()
const dotenv           = require('dotenv')
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
router.get('/:slugcat/detail', async(req,res)=>{
    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    const category = await Category.findOne({slug:req.params.slugcat})
    const journals = await Journal.find({category_id:category.id}).skip((page-1)*limit).limit(limit).sort({dateofjournal:-1}).populate('category_id').exec()
    let alljournalbycategory = await Journal.find({category_id:category.id})
    res.render('category/detail', {
            category: category ,
            journals: journals,
            limit:limit,
            page:page,
            count:alljournalbycategory.length
        })
})

router.get('/', async(req,res)=>{
    const categories = await Category.find()
    res.render('category/create', {
        categories: categories,
        category : new Category,
        error: null
    })
})

router.post('/', upload.single('thumb'), async(req,res)=>{
    let thumb = req.file ? req.file.filename : 'default'
    let category = new Category({
        title: req.body.title,
        thumb: thumb,
        slug: slugify(req.body.title,{lower: true,strict: true})
    })
    if(category.title==''){
        category.thumb != 'default' && fs.unlink(path.join(pathUpload,thumb), (e)=> e && console.log(e))
        return res.render('category/create', {
            categories: await Category.find(), 
            category:category, 
            error:'title required'})
    }
    try{
        await category.save()
        res.redirect('/menu')
    }catch(er){
        if (category.thumb != 'default'){
            fs.unlink(path.join(pathUpload,thumb), (e)=> e && console.log(e))
        }
        return res.render('category/create', { 
            categories: await Category.find(),
            category:category,
            error:er
        })
    }
})

router.get('/:slugcat', async(req,res)=>{
    res.render('category/edit', {
            categories : await Category.find(), 
            category: await Category.findOne({slug:req.params.slugcat})
        })
})
router.put('/:slugcat', upload.single('thumb'),async(req,res)=>{
    let category = await Category.findOne({slug:req.params.slugcat})
    let oldthumb = category.thumb
    if (req.file){
        let thumb = req.file.filename
        if(req.body.title==''){
            fs.unlink(path.join(pathUpload,thumb), (e)=> e && console.log(e))
            return res.redirect(`/category/${category.slug}`)
        }else{
            try{
                await Category.findByIdAndUpdate(category.id, {
                    title : req.body.title,
                    thumb : thumb,
                    slug: slugify(req.body.title,{lower: true,strict: true})
                })
                oldthumb !== 'default' && fs.unlink(path.join(pathUpload,oldthumb), (e)=> e && console.log(e))
                res.redirect('/menu')
            }catch(e){
                fs.unlink(path.join(pathUpload,thumb), (e)=> e && console.log(e))
                return res.render('category/edit', { 
                    categories: await Category.find(),
                    category:category})
            }
        }
    }else{
        if(req.body.title==''){
            return res.redirect(`/category/${category.slug}`)
        }else{
            try{
                await Category.findByIdAndUpdate(category.id, {
                    title : req.body.title,
                    slug: slugify(req.body.title,{lower: true,strict: true})
                })
                res.redirect('/menu')
            }catch(e){ 
                return res.render('category/edit', { 
                    categories: await Category.find(),
                    category:category})
            }
        }
    }
})
router.delete('/:slugcat', async(req,res)=>{
    const category = await Category.findOne({slug:req.params.slugcat})
    if (category == null){
        return res.redirect('/menu')
    }else{
        const journals = await Journal.find({category_id:category.id})
        if(journals.length > 0){
            res.redirect('/menu')
        } else{
            category.remove()
            category.thumb !== 'default' && fs.unlink(path.join(pathUpload,category.thumb), (e)=> e && console.log(e))
            return res.redirect('/menu')
        }
    }
})

module.exports = router