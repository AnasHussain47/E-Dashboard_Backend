//importing jwt token
const jwt = require("jsonwebtoken");
const jwtkey = "e-comm";

//import express
const express = require("express");
const app = express();

//importing cors for handle api errors
const cors = require("cors");
app.use(cors());
//import Database Config file which contain database configurations
require("./db/config");
//importing model file named as User
const User = require("./db/User");
//importing Addproduct model
const Product = require("./db/product");

//middleware to get the response
app.use(express.json());

//SignUp API's Post Method
app.post("/register", async (req, resp) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  jwt.sign({ result }, jwtkey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      resp.send({ result: "Email or Password is incorrect" });
    }
    resp.send({ result, auth: token });
  });



});
//login api post method
app.post("/login", async (req, resp) => {
  if (req.body.password && req.body.email) {
    //there is a  .select -password is working as it is not retriving password for security porpuse
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      //user for the data whish is going alogn with token
      //jwtkey is a key we declare upside of this page
      //expiryin is a expiry time that mean the token will expire in 2 hours
      jwt.sign({ user }, jwtkey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          resp.send({ result: "Email or Password is incorrect" });
        }
        resp.send({ user, auth: token });
      });
    } else {
      resp.send({ result: "Email or Password is incorrect" });
    }
  } else {
    resp.send({ result: "Email or Password Empty" });
  }
});

//Add Product APi Post method
app.post("/add-product",verifytoken, async (req, resp) => {
  //sending request with body daata in payload
  let product = new Product(req.body);
  //performing action as saving data into connection (Table)
  let result = await product.save();
  //sending respose
  resp.send(result);
});

// Get API for Fetching All Products from database Table (poducts)
app.get("/products",verifytoken, async (req, resp) => {
  const products = await Product.find();
  if (products.length > 0) {
    resp.send(products);
  } else {
    resp.send({ result: "No Product Found" });
  }
});

//delete api for delete products from product table
app.delete("/product/:id", verifytoken, async (req, resp) => {
  let result = await Product.deleteOne({ _id: req.params.id });
  resp.send(result);
});

//Update API to fetch data of single product regarding product id
app.get("/product/:id", verifytoken, async (req, resp) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    resp.send(result);
  } else {
    resp.send("No Data Found for update Produt");
  }
});

//put /update api for update product regarding id
app.put("/product/:id", verifytoken,async (req, resp) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    { $set: req.body }
  );
  resp.send(result);
});

//search APi for product
app.get("/search/:key",verifytoken, async (req, resp) => {
  let result = await Product.find({
    //when working on more than one record we use $or and reges is a standerd method
    $or: [
      { name: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
      { company: { $regex: req.params.key } },
    ],
  });
  resp.send(result);
});

//middelware for varifying token it has three parameter 
function verifytoken(req,resp,next){
  //taking token in variable via headers
let token=req.headers['authorization'];
if (token){
  // making apart token and bearer 
 token=token.split(' ')[1];
 //varifying token with verify menthod  
 jwt.verify (token,jwtkey,(err,valid)=>{
   if (err){
    resp.status(401).send({result:"Please provide valid token"})

   }else{
     // it will give aceess into next phase
        next();
   }

 })

}else{
    resp.status(403).send({result:"Please add token with header"})
}




}



 
//listening data onto post 5000
app.listen(5000);
