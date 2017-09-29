// Include the axios package for performing HTTP requests (promise based alternative to request)
var axios = require("axios");

// Geocoder API
//var geocodeAPI = "35e5548c618555b1a43eb4759d26b260";

//var Story = require("../../../models/Story");

// Helper functions for making API Calls
var helper = {

  // This function hits our own server to retrieve the record of query results
  getStories: function() {
    console.log("get story helper");
    return axios.get("/stories");
  },

  updateHearts(id, hearts) {
    
    console.log("updating " + id +" " + hearts);
    return axios.post("/updateHearts", id);
  }

  // getClicks: function() {
  //   console.log("get click helper");
  //   return axios.get("/stories");
  // }


  // postClicks: function(clickData) {
  //   console.log("post story helper");
  //   return axios.post("/stories");
  // }
};

// We export the API helper
module.exports = helper;
