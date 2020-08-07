var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var mongoose = require("mongoose");


mongoose.connect('mongodb://localhost:27017/blog_site', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

// APP CONFIG
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// MONGOOSE MODEL/CONFIG

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

var blogSchema = new mongoose.Schema({
	title : String,
	image : String,
	body : String,
	created : {type : Date, default : Date.now}
});
var Blog = mongoose.model("Blog",blogSchema);

// RESTFUL ROUTES

// Index Route
app.get("/",function(req,res) {
	res.redirect("/blogs");
});

app.get("/blogs",function(req,res) {
	Blog.find({},function(err,blogs) {
		if(err) console.log("Error!");
		else res.render("index",{blogs : blogs});
	});
});

// New Route
app.get("/blogs/new",function(req,res){
	res.render("new");
});

// Create Route
app.post("/blogs",function(req,res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog,function(err,newBlog) {
		if(err) res.render("new");
		else res.redirect("/blogs");
	});
});

// Show Route
app.get("/blogs/:id",function(req,res) {
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err) res.redirect("/blogs");
		else res.render("show",{blog:foundBlog});
	});
});

// Edit Route
app.get("/blogs/:id/edit",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err) res.redirect("/blogs");
		else res.render("edit",{blog:foundBlog});
	});
});

// Update Route
app.put("/blogs/:id",function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
		if(err) res.redirect("/blogs");
		else res.redirect("/blogs/" + req.params.id);
	});
});

// Delete Route
app.delete("/blogs/:id",function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err){
		if(err) res.redirect("/blogs");
		else res.redirect("/blogs");
	})
});

app.listen(3000,function(){
	console.log("SERVER IS RUNNING");
});

