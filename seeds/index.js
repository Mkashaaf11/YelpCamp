const mongoose = require("mongoose");
const campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelper");
mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seed = async () => {
  await campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new campground({
      location: `${cities[random1000].city} , ${cities[random1000].state}`,
      title: `${sample(descriptors)}  ${sample(places)}`,
      image: "https://source.unsplash.com/collection/483251",
      description: `Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vel voluptatem sunt sit esse officiis enim eaque odit quasi accusantium ex! Fugit ad sapiente quos veritatis explicabo, odio dolor ducimus dolore?`,
      price,
    });
    await camp.save();
  }
};

seed().then(() => {
  mongoose.connection.close();
});
