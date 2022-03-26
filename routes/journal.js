const express           = require('express')
const router            = express.Router()
const dotenv            = require('dotenv')
const Category          = require('../models/category')
const Journal           = require('../models/journal')
const multer            = require('multer')
const path              = require('path')
const fs                = require('fs')
const slugify           = require('slugify')
const pathUpload        = 'public/thumb/journal'
const typeAllow         = ['images/jpeg', 'images/jpg', 'images/png', 'images/gif']
const upload            = multer({
                            dest    : pathUpload
                        })



dotenv.config()
router.get('/:slugjour/thumb', async(req,res)=>{
    try{
        const journal = await Journal.findOne({slug:req.params.slugjour})
        if(journal==null){ return res.render('errors/pagenotfound')}
        res.render('journal/thumb', {journal:journal})
    }catch(e){
        res.send("please reload your page")
    }
})
router.put('/:slugjour/thumb', upload.single('thumb'), async(req,res)=>{
    if (!req.file){ return res.redirect(`/journal/${req.params.slugjour}/thumb`)}
    let newthumb = req.file.filename
    try{
        const journal = await Journal.findOne({slug:req.params.slugjour})
        if(journal==null){ return res.render('errors/pagenotfound')}
        let oldthumb = journal.thumb
        journal.thumb = newthumb
        try{
            await journal.save()
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
router.get('/:slugjour/ind', async(req,res)=>{
    try{
        const journal = await Journal.findOne({slug:req.params.slugjour}).populate('category_id').exec()
        if(journal==null){ return res.render('errors/pagenotfound')}
        res.render('journal/document', {pdf: journal.linkofind, slug:journal.slug})
    }catch(e){
        return res.send("please reload your page")
    }
})
router.get('/:slugjour/eng', async(req,res)=>{
    try{
        const journal = await Journal.findOne({slug:req.params.slugjour}).populate('category_id').exec()
        if(journal==null){ return res.render('errors/pagenotfound')}
        res.render('journal/document', {pdf: journal.linkofeng, slug:journal.slug})
    }catch(e){
        return res.send("please reload your page")
    }
})
router.get('/:slugjour/detail', async(req,res)=>{
    try{
        const journal = await Journal.findOne({slug:req.params.slugjour}).populate('category_id').exec()
        if(journal==null){ return res.render('errors/pagenotfound')}
        res.render('journal/detail', {journal: journal})
    }catch(e){
        res.send("please reload your page")
    }
})
router.get('/', async(req,res)=>{
    try{
        const categories = await Category.find()
        res.render('journal/create', { 
            categories : categories, 
            journal:new Journal,
            error:{}
        })
    }catch(e){
        res.send("please reload your page")
    }
})
router.post('/', async(req,res)=>{
    let journal = new Journal({
        title:req.body.title,
        abstract:req.body.abstract,
        category_id:req.body.category_id,
        slug:slugify(req.body.title,{lower: true,strict: true}),
        dateofjournal:new Date(req.body.dateofjournal),
        linkofind:req.body.linkofind,
        linkofeng:req.body.linkofeng,
    })
    if(Object.keys(validasi(req.body)).length !== 0){
        try{
            const categories = await Category.find()
            return res.render('journal/create', { 
                categories : categories,
                journal:journal,
                error: validasi(req.body)})
        }catch(e){
            return res.send("please reload your page")
        }
    }
    try{
        await journal.save()
        res.redirect(`/journal/${journal.slug}/detail`)
    }catch(e){
        try{
            const categories = await Category.find()
            res.render('journal/create', { 
                categories : categories, 
                journal:journal,
                error:{}
            })
        }catch(e){
            res.send("please reload your page")
        }
    }

})
router.get('/:slugjour', async(req,res)=>{
    try{
        const journal = await Journal.findOne({slug:req.params.slugjour})
        if(journal==null){ return res.render('errors/pagenotfound')}
        try{
            const categories = await Category.find()
            res.render('journal/edit', { 
                categories : categories, 
                journal: journal,
                title : journal.title,
                slug: journal.slug,
                error:{}
            })
        }catch(e){
            return res.send("please reload your page")
        }
    }catch(e){
        return res.send("please reload your page")
    }
})
router.put('/:slugjour', async(req,res)=>{
    try{
        let journal = await Journal.findOne({slug:req.params.slugjour})
        if(journal==null){ return res.render('errors/pagenotfound')}
        const title = journal.title
        const slug = journal.slug
        journal.title = req.body.title
        journal.slug = slugify(journal.title,{lower: true,strict: true}),
        journal.category_id = req.body.category_id && req.body.category_id
        journal.dateofjournal = req.body.dateofjournal && new Date(req.body.dateofjournal)
        journal.linkofind = req.body.linkofind && req.body.linkofind
        journal.linkofeng = req.body.linkofeng && req.body.linkofeng
        journal.abstract = req.body.abstract && req.body.abstract
        if(Object.keys(validasi(req.body)).length !== 0){
            try{
                const categories = await Category.find()
                return res.render('journal/edit', { 
                        categories : categories,
                        journal:journal,
                        title: title,
                        slug:slug,
                        error: validasi(req.body)})
            }catch(e){
                return res.send("please reload your page")
            }
        }else{
            try{
                await journal.save()
                res.redirect(`/journal/${journal.slug}/detail`)
            }catch(e){
                try{
                    const categories = await Category.find()
                    return res.render('journal/edit', { 
                        categories: categories,
                        journal:journal,
                        title: title,
                        slug:slug,
                        error:e
                    })
                }catch(e){
                    return res.send("please reload your page")
                }
            }
        }
    }catch(e){
        return res.send("please reload your page")
    }
})
router.delete('/:slugjour', async(req,res)=>{
    try{
        const journal = await Journal.findOne({slug:req.params.slugjour})
        if(journal==null){ return res.render('errors/pagenotfound')}
        journal.remove()
        journal.thumb !== 'default' && fs.unlink(path.join(pathUpload,journal.thumb), (e)=> e && console.log(e))
        res.redirect('/admin')
    }catch(e){
        return res.send("please reload your page")
    }
})

const validasi = (fields)=>{
    let error = {}
    if (fields.category_id==''){ error.category_id = 'error' }
    if (fields.title==''){ error.title = 'error' }
    if (fields.dateofjournal==''){ error.dateofjournal = 'error' }
    if (fields.abstract==''){ error.abstract = 'error' }
    return error
}

module.exports = router