const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const catchAsync = require("./utils/catchAsync");
const joi = require("joi");
const { campgroundSchema } = require("./schemas.js");
const ExpressError = require("./utils/expressError");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const campground = require("./models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res) => {
    // if (!req.body.campgrounds)
    //   throw new ExpressError("Invalid Campground Data", 400);

    const campgrounds = new campground(req.body.campgrounds);
    await campgrounds.save();
    res.redirect(`/campgrounds/${campgrounds._id}`);
  })
);

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const id = req.params.id;
    const campgroundInfo = await campground.findById(id);
    res.render("campgrounds/show", { campgroundInfo });
  })
);

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campgrounds = await campground.findById(id);
    res.render("campgrounds/edit", { campgrounds });
  })
);

app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campgrounds = await campground.findByIdAndUpdate(id, {
      ...req.body.campgrounds,
    });
    res.redirect(`/campgrounds/${campgrounds._id}`);
  })
);

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

//For Every request and every path that doesnt matches any of above
//For content that is not available
app.all("*", (req, res, next) => {
  //calling general error handler now
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("campgrounds/error", { error: err });
});

app.listen(3000, () => {
  console.log("Listening from port 3000");
});
