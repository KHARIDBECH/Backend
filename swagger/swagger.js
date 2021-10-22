const swaggerUi=require('swagger-ui-express');
const YAML=require('yamljs');
const path=require('path');
const router=require('express').Router();
const swaggerDocument=YAML.load(path.join(__dirname+'/swagger.yaml'));

router.use('/api-docs',swaggerUi.serve);
router.use('/api-docs',swaggerUi.setup(swaggerDocument));

module.exports=router;