const express = require("express")
const router = express.Router()
const wrapAsync = require("../utils/wrapAsync.js")

const Listing = require("../models/listing.js")

const {isLoggedin, isOwner, ValidateListing} = require("../middleware.js")

const  listingController = require("../controllers/listings.js")

const multer  = require('multer')
const {storage} = require("../cloudconfig.js")
const upload = multer({ storage })




//index
router.get("/", wrapAsync(listingController.index));
 //New
 router.get("/new", isLoggedin, listingController.new)
 //Show
 router.get("/:id", wrapAsync(listingController.showListing))
 

 

 
 //Create
 router.post("/", isLoggedin,
    upload.single('listing[image]'), ValidateListing,
     wrapAsync(listingController.createListing ))
     
//search
// router.get("/:id" , wrapAsync(listingController.searchListing))

 
 //Edit route
 router.get("/:id/edit", isLoggedin,isOwner, wrapAsync( listingController.editListing))


 
 //Update Route
 router.put("/:id",isLoggedin,isOwner, upload.single('listing[image]'),ValidateListing, wrapAsync(listingController.updateListing))
 
 //Delete Route
 router.delete("/:id",isLoggedin,isOwner, wrapAsync(listingController.destroyListing))


 module.exports = router;
 