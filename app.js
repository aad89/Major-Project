
if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}





const express = require("express")
const app = express();
const mongoose = require("mongoose")
const Listing = require("./models/listing")


const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const ExpressError = require("./utils/ExpressError.js")
const session = require("express-session")
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")



const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"
const dbUrl = process.env.ATLASDB_URL;


main().then(()=>{
    console.log("connected to db")
}).catch((err)=>{
    console.log(err)
})
async function main(){
    await mongoose.connect(dbUrl)
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
    secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
})

store.on("error", ()=>{
    console.log("Error in mongo store", err)
})

const sessionOptions ={
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}



// app.get("/", (req,res)=>{
//     res.send("Hi i am root")
// })


app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.CurrUser = req.user;
    res.locals.listing = req.body.listing;
    res.locals.searchQuery = req.query.q || ''; 
    next();
})

// app.get("/demouser", async(req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     })

//     let registeredUser = await User.register(fakeUser, "helloworld")
//     res.send(registeredUser)
// })


app.use("/listings", listingRouter)
app.use("/listings/:id/reviews", reviewRouter)
app.use("/", userRouter)
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.redirect('/listings');
    }

    try {
        const listings = await Listing.find({ title: { $regex: query, $options: 'i' } });
        const allListings = await Listing.find({}); // To keep the code consistent

        res.render('listings/index.ejs', { listings, allListings, searchQuery: query });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});




// app.get('/search', async (req, res) => {
//     try {
//         const searchQuery = req.query.q;
//         const results = await Listing.find({
//             $or: [
//                 { name: { $regex: searchQuery, $options: 'i' } },  // Adjust according to your schema
//                 { location: { $regex: searchQuery, $options: 'i' } }
//             ]
//         });
//         res.render('index', { results, searchQuery });  // Pass the searchQuery to the template
//     } catch (error) {
//         console.error('Error during search:', error);
//         res.status(500).send('An error occurred while searching.');
//     }
// });

//Review
//Post Route



// app.get("/testlisting", (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the Beach",
//         price : 1200,
//         location: "Karachi",
//         country: "Pakistan"
//     })
//     sampleListing.save();
//     res.send("sample was saved")
//     console.log("successful")
// })


app.all("*", (req,res,next)=>{
    next(new ExpressError(404, "Page Not Found"))
})


app.use((err,req,res,next)=>{
   let {statuscode = 500, message ="Something went Wrong"} =err;
    res.status(statuscode).render("error.ejs", {err})

   //    res.status(statuscode).send(message)
})
app.listen(8080, () =>{
    console.log("listening to port 8080")
})