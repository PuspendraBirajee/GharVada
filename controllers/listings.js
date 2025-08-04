const Listing = require("../models/listing");

const axios = require("axios");

const maptilerGeocoding = {}; // Dummy placeholder to keep variable name
const mapToken = process.env.MAP_TOKEN;

// Set config manually
maptilerGeocoding.config = { apiKey: mapToken };

// Define geocoding object
maptilerGeocoding.geocoding = {
  forward: async function ({ query, limit = 1 }) {
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
      query
    )}.json?key=${mapToken}&limit=${limit}`;
    const response = await axios.get(url);
    return response.data;
  },
};

// Keep your variable name
const geocodingClient = maptilerGeocoding.geocoding;

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  //console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await maptilerGeocoding.geocoding.forward({
    query: req.body.listing.location,
    limit: 1,
  });

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.features[0].geometry;
  let savedListing = await newListing.save();
  // console.log(savedListing);
  // console.log(response.features[0].geometry);
  req.flash("success", "Your place added successfully!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_150,w_150");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  // Update listing fields
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // Update image if a new file was uploaded
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  // Update geometry based on new location
  if (req.body.listing.location) {
    let response = await maptilerGeocoding.geocoding.forward({
      query: req.body.listing.location,
      limit: 1,
    });
    listing.geometry = response.features[0].geometry;
    await listing.save();
  }

  req.flash("success", "Your place updated successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  // console.log(deletedListing);
  req.flash("success", "Your place deleted successfully!");
  res.redirect("/listings");
};
