const express       = require('express')
const router        = express.Router()
const dotenv        = require('dotenv')
const Category      = require('./../models/category')
const Journal       = require('./../models/journal')

dotenv.config()
router.get('/', async(req,res)=>{
    if(req.query.keyword==''){return res.render('search/journal',{journals:[],keyword:"<empty>",count:0})}
    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    const keywords = req.query.keyword.split(' ')
    let results = []
    for(let key=0;key<keywords.length;key++){
        try{
            let journals = await Journal.find({slug:{$regex: ".*"+String(keywords[key]).toLowerCase()+".*"}}).sort({dateofjournal:-1}).populate('category_id').exec()
            for(let j=0;j<journals.length;j++){
                let check = 0
                for(let r=0;r<results.length;r++){
                    if(results[r].title == journals[j].title){ check++ }
                }
                if(check==0){results.push(journals[j])}
            }
        }catch(e){
            return res.send("please reload your page")
        }
    }
    res.render('search/journal', {
        journals:results.slice((page-1)*limit,page*limit), 
        keyword:String(req.query.keyword),
        count:results.length,
        limit:limit,
        page:page
    })
})
router.get('/:slugcat', async(req,res)=>{
    if(req.query.keyword==''){
        try{
            const category = await Category.findOne({slug:req.params.slugcat})
            return res.render('search/category',{
                category:category,
                journals:[],
                keyword:"<empty>",
                count:0})
        }catch(e){
            return res.send("please reload your page")
        }  
    }

    let page = await parseInt(req.query.page ? req.query.page : 1)
    let limit = await parseInt(req.query.limit ? req.query.limit : 4)
    try{
        const category = await Category.findOne({slug:req.params.slugcat})
        const keywords = req.query.keyword.split(' ')
        let results = []
        for(let key=0;key<keywords.length;key++){
            try{
                let journals = await Journal.find({category_id:category.id, slug:{$regex: ".*"+String(keywords[key]).toLowerCase()+".*"}}).sort({dateofjournal:-1}).populate('category_id').exec()
                for(let j=0;j<journals.length;j++){
                    let check = 0
                    for(let r=0;r<results.length;r++){
                        if(results[r].title == journals[j].title){ check++ }
                    }
                    if(check==0){results.push(journals[j])}
                }
            }catch(e){
                return res.send("please reload your page")
            }
        }
        res.render('search/category', {
            category:category, 
            journals:results.slice((page-1)*limit,page*limit), 
            keyword:String(req.query.keyword),
            count:results.length,
            limit:limit,
            page:page
        })
    }catch(e){
        return res.send("please reload your page")
    }

    
})


module.exports = router