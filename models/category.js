const mongoose  = require('mongoose')
const Journal   = require('./journal')

const categorySchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    thumb:{
        type: String,
        required: true,
        default: 'default'
    },
    slug:{
        type: String,
        require: true,
        unique: true
    },
    createAt:{
        type: Date,
        required: true,
        default: Date.now
    }
})

// categorySchema.pre('validate', function(){
    // if(this.title){
    //     this.slug = slugify(this.title,{
    //         lower: true,
    //         strict: true
    //     })
    // }
// })
categorySchema.pre('remove', function(next){
    Journal.find({category_id:this.id}, (err,journals)=>{
        if (err){
            console.log(err)
        }else if(journals.length>0){
            console.log('category have journal')
        }else{
            next()
        }
    })
})

module.exports = mongoose.model('category', categorySchema)