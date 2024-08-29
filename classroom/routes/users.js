const express = require("express");
const router = express.Router();

router.get("/", (req,res)=>{
    res.send("Get for Users")
})

router.get("/:id", (req,res)=>{
    res.send("Get for Show Users")
})

router.post("/", (req,res)=>{
    res.send("Post for  Users")
})

router.delete("/:id" , (req,res)=>{
    res.send("Delete for users")
})


module.exports = router;