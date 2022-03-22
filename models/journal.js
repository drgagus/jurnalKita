const mongoose = require('mongoose')

const journalSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    abstract:{
        type: String,
        required: true
    },
    category_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'category'
    },
    thumb:{
        type: String,
        required: true,
        default: 'default',
    },
    slug:{
        type: String,
        require: true,
        unique: true
    },
    dateofjournal:{
        type: Date,
        required: true
    },
    linkofind:{
        type: String
    },
    linkofeng:{
        type: String
    },
    view:{
        type: Number,
        default:0
    },
    createAt:{
        type: Date,
        required: true,
        default: Date.now
    }
})

// journalSchema.pre('validate', function(){
    // if(this.title){
    //     this.slug = slugify(this.title,{
    //         lower: true,
    //         strict: true
    //     })
    // }
// })

module.exports = mongoose.model('journal', journalSchema)