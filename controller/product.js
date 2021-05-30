const Product = require('../models/product');

exports.createProduct=(req,res)=>{
console.log(req.body)
const product = new Product({
    title: req.body.title,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
    price:req.body.price,

})
product.save()
.then(()=>{
res.status(201).json({message:"Your Ad posted succesfully!"})
})
.catch((error)=>{
res.status(400).json({error:error})
})
}

exports.getProduct = (req,res)=>{
    Product.find()
    .then((productData)=>{
        res.status(200).json(productData)
    })
    .catch((error)=>{
        res.status(400).json({error:error})
    })
}