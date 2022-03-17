const express           = require('express')
const router            = express.Router()
const dotenv            = require('dotenv')
const Category          = require('./../models/category')
const Journal           = require('./../models/journal')
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
router.get('/:slugjour/detail', async(req,res)=>{
    res.render('journal/detail', {journal: await Journal.findOne({slug:req.params.slugjour}).populate('category_id').exec()})
})
router.get('/', async(req,res)=>{
    res.render('journal/create', { 
        categories : await Category.find(), 
        journal:new Journal,
        error:{}
    })
})
router.post('/', upload.single('thumb'), async(req,res)=>{
    let thumb = req.file ? req.file.filename : 'default'
    let journal = new Journal({
        thumb:thumb,
        title:req.body.title,
        abstract:req.body.abstract,
        category_id:req.body.category_id,
        slug:slugify(req.body.title,{lower: true,strict: true}),
        dateofjournal:new Date(req.body.dateofjournal),
        linkofind:req.body.linkofind,
        linkofeng:req.body.linkofeng,
    })
    try{
        if(Object.keys(validasi(req.body)).length !== 0){
            journal.thumb !== 'default' && fs.unlink(path.join(pathUpload,journal.thumb), (e)=> e && console.log(e))
            return res.render('journal/create', { 
                categories : await Category.find(),
                journal:journal,
                error: validasi(req.body)})
        }
        await journal.save()
        res.redirect(`/journal/${journal.slug}/detail`)
    }catch(e){
        if (journal.thumb !== 'default'){
            fs.unlink(path.join(pathUpload,journal.thumb), (e)=> e && console.log(e))
        } 
        res.render('journal/create', { 
            categories : await Category.find(), 
            journal:journal,
            error:{}
        })
    }

})
router.get('/:slugjour', async(req,res)=>{
    res.render('journal/edit', { 
        categories : await Category.find(), 
        journal:await Journal.findOne({slug:req.params.slugjour}),
        error:{}
    })
})
router.put('/:slugjour', upload.single('thumb'), async(req,res)=>{
    let journal = await Journal.findOne({slug:req.params.slugjour})
    journal.title = req.body.title
    journal.slug = slugify(journal.title,{lower: true,strict: true}),
    journal.category_id = req.body.category_id && req.body.category_id
    journal.dateofjournal = req.body.dateofjournal && new Date(req.body.dateofjournal)
    journal.linkofind = req.body.linkofind && req.body.linkofind
    journal.linkofeng = req.body.linkofeng && req.body.linkofeng
    journal.abstract = req.body.abstract && req.body.abstract
    let oldthumb = journal.thumb
    if (req.file){
        let thumb = req.file.filename
            if(Object.keys(validasi(req.body)).length !== 0){
                fs.unlink(path.join(pathUpload,thumb), (e)=> e && console.log(e))
                return res.render('journal/edit', { 
                        categories : await Category.find(),
                        journal:journal,
                        error: validasi(req.body)})
            }else{
                try{
                    journal.thumb = thumb
                    await journal.save()
                    oldthumb !== 'default' && fs.unlink(path.join(pathUpload,oldthumb), (e)=> e && console.log(e))
                    res.redirect(`/journal/${journal.slug}/detail`)
                }catch(e){
                    fs.unlink(path.join(pathUpload,thumb), (e)=> e && console.log(e))
                    return res.render('journal/edit', { 
                        categories: await Category.find(),
                        journal:journal,
                        error:e
                    })
                }
            }
    }else{
        if(Object.keys(validasi(req.body)).length !== 0){
            return res.render('journal/edit', { 
                    categories : await Category.find(),
                    journal:journal,
                    error: validasi(req.body)})
        }else{
            try{
                await journal.save()
                res.redirect(`/journal/${journal.slug}/detail`)
            }catch(e){
                return res.render('journal/edit', { 
                    categories: await Category.find(),
                    journal:journal,
                    error:e
                })
            }
        }
    }
})
router.delete('/:slugjour', async(req,res)=>{
    const journal = await Journal.findOne({slug:req.params.slugjour})
    if (journal == null){
        res.redirect('/menu')
    }else{
        journal.remove()
        journal.thumb !== 'default' && fs.unlink(path.join(pathUpload,journal.thumb), (e)=> e && console.log(e))
        res.redirect('/menu')
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