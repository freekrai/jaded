var fs = require('fs');
var http = require('http');
var path = require('path');
var express = require('express');
var less = require('less-middleware');
var markdown = require('./markdown');

// Cache markdown pages in memory
var pages = {};

var app = express();
app.set('view engine', 'jade');

// Mount static file and less compiler middleware
var publicDir = path.join(__dirname, 'public');
var cssDir = path.join(__dirname, 'public/css');
app.use(less(cssDir));
app.locals.pretty = true;
app.use(express.static(publicDir));

//	any template globals we want to set and display go here...
app.use(function(req, res, next){
	res.locals.current_year = new Date().getFullYear();
	res.locals.posts = getPosts();
	res.locals.latest = getLatestPost();
	next();
});

// Handle named pages
app.get('/', function(request, response) {
	response.render('index', {
		title: 'Jaded'
	});
});

app.get('/about', function(request, response) {
	response.render('about', {
		title: 'About Jaded'
	});
});

app.get('/archive', function(request, response){
	response.render('archive', {
		title: 'Archives'
	});	
});


// catch-all handler for simple markdown posts
app.get('/:page', function(request, response, next) {
	var pageRequested = request.params.page;
	var content = pages[pageRequested] || markdown(request.params.page);
	if (!content) {
		return next();
	} else if (!pages[pageRequested]) {
		pages[pageRequested] = content;
	}

	response.render('markdown', {
		title: content.title,
		pageContent: content.html
	});
});

// 404
app.use(function(request, response, next) {
	response.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Create and run HTTP server
var server = http.createServer(app);
var port = process.env.PORT || 3000;
server.listen(port, function() {
	console.log('Express server running on *:'+port);
});

// Return formatted post info...
function getPostInfo( post ){
	var content = pages[post] || markdown(post);
	if (!content) {
		return next();
	} else if (!pages[post]) {
		pages[post] = content;
	}
	content.url = "/"+post;
	return content;
}

//	return latest post from markdown folder...
function getLatestPost(){
	var pageRequested = getNewestFile("./markdown/", new RegExp('.*\.md'));
	pageRequested = pageRequested.replace(".md","");
	var content = getPostInfo( pageRequested );
	return content;
}

// return all posts from markdown folder...
function getPosts(){
	var posts = getFiles("./markdown/", new RegExp('.*\.md'));
	for( var i in posts ){
		var pageRequested = posts[i];
		pageRequested = pageRequested.replace(".md","");
		var content = getPostInfo( pageRequested );
		posts[i] = content;
	}
	return posts;
}
//	var posts = getPosts();

// used to return the newest file in specified folder...
function getNewestFile(dir, regexp) {
	var newest = null;
	var files = fs.readdirSync(dir);
	var one_matched = 0;
	
	for (i = 0; i < files.length; i++) {
		if( files[i] !== "archive.md" && files[i] !== "speaking.md" ){
			if (regexp.test(files[i]) == false){
				continue
			}else if (one_matched == 0) {
				newest = files[i];
				one_matched = 1;
				continue;
			}
			var file = files[i];
			f1_time = fs.statSync(dir+file).mtime.getTime();
			f2_time = fs.statSync(dir+newest).mtime.getTime();
			if (f1_time > f2_time)	newest = file;
		}
	}
	
	if (newest != null)	return (newest);
	return null;
}

// used to return all files in specified folder...
function getFiles(dir, regexp) {
	var posts = [];
	var files = fs.readdirSync(dir);
	
	for (i = 0; i < files.length; i++) {
		if( files[i] !== "archive.md" && files[i] !== "speaking.md" ){
			if (regexp.test(files[i]) == false){
				continue
			}else{
				posts.push( files[i] );
			}
		}
	}
	if (posts != null)	return (posts);
	return null;
}