const Listing = require("./models/listing")
const Review = require("./models/review")
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema} = require("./Schema.js")
const {reviewSchema} = require("./Schema.js")

module.exports.isLoggedin = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing")
        return res.redirect("/login")
    }
    next()
}


module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next()
}


module.exports.isOwner = async (req,res,next)=>{
    let {id} = req.params;
     let listing= await Listing.findById(id)
     if(!listing.owner._id.equals(res.locals.CurrUser._id)){
        req.flash("error", "You dont have permission to edit");
        return res.redirect(`/listings/${id}`)
     }
     next()
}


module.exports.ValidateListing = (req,res,next)=>{
    let {error}=  listingSchema.validate(req.body);
   
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg)
    } else{
        next();
    }
}


module.exports.Validatereview = (req,res,next)=>{
    let {error}=  reviewSchema.validate(req.body);
   
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg)
    } else{
        next();
    }
}

module.exports.isReviewauthor = async (req,res,next)=>{
    let {id, reviewId} = req.params;
     let review = await Review.findById(reviewId)
     if(!review.author._id.equals(res.locals.CurrUser._id)){
        req.flash("error", "You dont have permission to delete");
        return res.redirect(`/listings/${id}`)
     }
     next()
}
