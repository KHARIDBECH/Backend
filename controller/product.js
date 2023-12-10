const Product = require('../models/product');
const globalConstant = require('../utils/globalConstant')
exports.createProduct=(req,res,next)=>{

const reqFiles = [];
    const url = req.protocol + '://' + req.get('host')
    req.files.map((item)=>{
        reqFiles.push(url + '/public/images/' + item.filename);
    })
let dateId = new Date();
let id = String(dateId.getTime());
id = id.slice(4)
const user=req.user;
console.log(user)
const product = new Product({
    title: req.body.title,
    description: req.body.description,
    price:req.body.price,
    iid:id,
    userId: user[globalConstant.UNDERSCOREID],
    image: reqFiles,
})
product.save()
.then(()=>{
res.status(201).json({title:req.body.title,iid:id})
})
.catch((error)=>{
res.status(400).json({error:error})
})
}

exports.getProduct = (req,res)=>{
    
    Product.find()
    .then((productData)=>{
        console.log(productData)
        res.status(200).json(productData)
    })
    .catch((error)=>{
        res.status(400).json({error:error})
    })
}
exports.getProductDetail = (req,res)=>{
    Product.find({iid:req.params.itemid})
    .then((productData)=>{
        res.status(200).json(productData)
    })
    .catch((error)=>{
        res.status(400).json({error:error})
    })
}