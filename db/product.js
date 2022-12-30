//importibng database as mongosee after npm install mongoose
const mongoose=require('mongoose');
//we are creating Product Schema for products and specifying fileds for colletion(Table) in database
const ProductSchema=new mongoose.Schema({
    //fields of collection (Table)
    name:String,
    price:String,
    category:String,
    userId:String,
    company:String

});

module.exports=mongoose.model("products",ProductSchema);