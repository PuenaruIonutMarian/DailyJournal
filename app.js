//jshint esversion:6

const express = require("express"); // Import the express module
const bodyParser = require("body-parser"); // Import the body-parser module
const ejs = require("ejs"); // Import the ejs module
const _ = require("lodash"); // Import the lodash module
const date = require(__dirname + "/date.js"); // Import the custom date module
const mongoose = require("mongoose"); // Import the mongoose module

const homeStartingContent = "Welcome Home, Dear Writer! Embrace this canvas of endless possibilities, where every word you write holds the power to create, heal, and inspire. Pour your heart out, weave tales of joy, resilience, and growth, for here, your voice finds wings to soar. This is a sanctuary for the dreamers, the wanderers, and the seekers of solace in the written word. Let your thoughts dance across these pages, and together, let's weave a tapestry of shared experiences, a testament to the beauty of life's fleeting moments."; // Initial content for the home page
const aboutContent = "Welcome to our Daily Journal, a sanctuary for your thoughts, emotions, and memories. This space is dedicated to empowering you to embrace your inner voice, unleash your creativity, and paint your life's canvas with words. We believe that every story matters, and yours is a masterpiece waiting to be penned. So, step into this realm of self-expression and join us in celebrating the beauty of your unique journey."; // Content for the about page
const contactContent = "Let's Connect! We would love to hear from you and become a part of your journaling journey. Whether you want to share your thoughts, seek inspiration, or simply say hello, drop us a line. Our virtual doors are always open to welcome fellow dreamers, storytellers, and memory-makers. Reach out, and let your words find a home in this space of camaraderie and positivity."; // Content for the contact page
const currentYear = date.getYear();


const app = express(); // Create an instance of the express application

app.set('view engine', 'ejs'); // Set the view engine to use EJS

app.use(bodyParser.urlencoded({extended: true})); // Parse URL-encoded bodies
app.use(express.static("public")); // Serve static files from the "public" directory


mongoose.connect('mongodb://127.0.0.1:27017/blogDB', { // Connect to the MongoDB database
  useNewUrlParser: true, // Use new URL parser
  useUnifiedTopology: true // Use unified topology
})
  .then(() => console.log("Connected to MongoDB")) // Log a success message if the connection is successful
  .catch((err) => console.error(err)); // Log an error message if there is an error in the connection

const postSchema = { // Define the schema for a blog post
  title: String, // Title of the post
  content: String, // Content of the post
  date: { type: Date, default: Date.now }
};

const Post = mongoose.model("Post", postSchema); // Create a model named "Post" based on the schema

app.get("/", async function (req, res) {
  try {
    const posts = await Post.find({}).exec();
    if (posts.length === 0) {
      // If there are no existing posts, render the "home" view with just the starting content
      res.render("home", {
        startingContent: homeStartingContent,
        posts: [], // Pass an empty array for posts
        currentYear: currentYear,
      });
    } else {
      // If there are posts, render the "home" view with the starting content and retrieved posts
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts,
        currentYear: currentYear,
      });
    }
  } catch (err) {
    console.error(err);
  }
});



app.get("/about", function(req, res){ // Route handler for the about page ("/about")
  res.render("about", {aboutContent: aboutContent,currentYear: currentYear }); // Render the "about" view with the aboutContent
});

app.get("/contact", function(req, res){ // Route handler for the contact page ("/contact")
  res.render("contact", {contactContent: contactContent,currentYear: currentYear }); // Render the "contact" view with the contactContent
});

app.get("/compose", function(req, res){ // Route handler for the compose page ("/compose")
  res.render("compose", { currentYear: currentYear}); // Render the "compose" view
});

app.post("/compose", function(req, res){ // Route handler for the POST request to create a new blog post
  const post = new Post({ // Create a new post object based on the submitted data
    title: req.body.postTitle, // Get the title from the request body
    content: req.body.postBody // Get the content from the request body
  });

  post.save(); // Save the post to the database

  res.redirect("/"); // Redirect to the home page
});

app.get("/posts/:postId", async function(req, res) { // Route handler for viewing a specific post ("/posts/:postId")
  const requestedPostId = req.params.postId; // Get the requested post ID from the request parameters

  try {
    const post = await Post.findOne({ _id: requestedPostId }).exec(); // Find the post with the requested ID

    if (post) { // If the post is found, render the "post" view with the post's title and content
      res.render("post", {
        title: post.title,
        content: post.content,
        date: post.date.toLocaleString(),
        currentYear: currentYear // Pass currentYear as a variable to the template
      });
    } else {
      // Handle the case when the requested post is not found
      res.send("Post not found"); // Send a response indicating that the post was not found
    }
  } catch (err) {
    console.error(err); // Log an error if there is an error retrieving the post
    res.send("An error occurred"); // Send a generic error response
  }
});

app.listen(3000, function() { // Start the server and listen on port 3000
  console.log("Server started on port 3000"); // Log a message indicating that the server has started
});
