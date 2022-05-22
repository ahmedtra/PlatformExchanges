const express= require("express");
const app=express();
app.use(express.json())
const routerexchanger=require("./routers/routers.index")
const cors = require("cors");
app.use(cors());
app.use('/api',routerexchanger)

app.listen(5000,()=>{
    console.log("Backend is runing now on the port 5000")
})