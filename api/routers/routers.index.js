const router = require("express").Router();
const apiWeb=require('../WSapi/index')
const value={}
router.get("/",async(req,res)=>{

      try{
        const value=await apiWeb;
        res.status(200).json(value)
      }catch(err){
        res.status(400).json(err)
      }
        })



module.exports=router
