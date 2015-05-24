$( document ).ready(function() {
	var rs = new jadedSite();
	rs.start();
});


function hashCode( str ){
	if (Array.prototype.reduce){
		return str.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
	}
	var hash = 0;
	if (str.length === 0) return hash;
	for (var i = 0; i < str.length; i++) {
		var character  = str.charCodeAt(i);
		hash  = ((hash<<5)-hash)+character;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var jadedSite = function(){
	this.url = document.location.pathname;
	return this;
}

jadedSite.prototype.start = function(){
	if ( this.url === "/" ){
//		home page...
		var page = getParameterByName("p");
		if( page === "" || page === "1" ){
//			var popular = new mostPopular().getPages( $("#index") );
		}
	}else if ( this.url === "/support") {
//		any custom actions for this page?
	}
	return this;	
};

var mostPopular = function(){
	this.api_key = "74c8064f-cd6f-4c07-8baf-b1d241496eec";
	this.db = "rogerstringer";
	this.collection = "mostpopular";

	this.pages = [];

	this.datamcflyRef = new DataMcFly( this.api_key, this.db, this.collection );
	this.populate();
	return this;
};

mostPopular.prototype.populate = function(){
	var _this = this;

	//	let's get a list of pages for use later...
	this.datamcflyRef.orderBy( {"views":-1} ).on('value', function( data ){
		if( data.count() ){
			data.forEach( function(snapshot) {
				var item = snapshot.value();
				_this.pages[ item.key ] = item;
			});
		}
	});
};

mostPopular.prototype.getPages = function( div_id ){
	var _this = this;	
	var r={
		headline:"Recently popular posts&hellip;",
		clickhere:"(click to load)",
		loading:"(loading&hellip;)"
	};
//	this.pages.slice(1, 6);
	$('<aside id="popular"><header><h1>'+r.headline+"</h1></header></aside>").prependTo( div_id );
	this.datamcflyRef.orderBy({"views":-1}).limit(6).on('value',function( data ){
		if( data.count() ){
			var pages = [];
			data.forEach( function(snapshot) {
				var item = snapshot.value();
				pages[item._id] = item;
			});

			var aside = $("#popular");
			var header = $("header",aside);

			var ul = $("<ul />").attr("style","display:none");
			for( var i in pages ){
				var item = pages[i];
				$('<li/>').attr("id",item._id).prepend(
					$("<a>")
						.attr("href",item.url)
						.attr("title",item.title)
						.attr("data-count",item.views)						
						.text(item.title)
				).appendTo( ul );
				_this.pages[ item.key ] = item;
			}
			aside.append( ul );
			ul.slideDown(400);
			header.removeClass("loading").addClass("loaded");
			header.find("h1").html(r.headline);
		}
	});
	return this;
};

mostPopular.prototype.updatePage = function( url, title ){
//	create a unique key from the url by stripping out all non-alphanumeric characters...
	var key = url.replace(/[\/-]/g,'');
	//	get current count and increment it...
	var cnt = 0;
	var _this = this;
/*
	if ( this.pages[ key ] !== null ) {
		var item = this.pages[ key ];

		item.views = item.views + 1;

		this.pages[ key ] = item;

		this.datamcflyRef.update(item._id, item, function(resp) {
			console.log( key + " updated" );
		});
	}else{
		// no count, so never added before..
		var item = {
			"key":key,
			"url":url,
			"title":title,
			"views":1	
		};
		
		this.pages[ key ] = item;

		this.datamcflyRef.push(item, function(resp) {
			console.log( key + " added" );
		});
	}
*/
	this.datamcflyRef.where({ "key": key }).on('value',function( data ){
		if( data.count() ){
			data.forEach( function(snapshot) {
				var item = snapshot.value();
				item.views = item.views + 1;
				_this.datamcflyRef.update(item._id,item, function(resp) {
					console.log( key + " updated" );
				});
			});
		}else{
			// no count, so never added before..
			_this.datamcflyRef.push({
				"key":key,
				"url":url,
				"title":title,
				"views":1	
			}, function(resp) {
				console.log( key + " added" );
			});
		}
	});

	//	update page list...
//	this.populate();
	return this;
};

(function($){
/*
	$.fn.repo = function( options ){
		$("#repo-wp-bigfoot").parent().hide();
		return false;
	};
*/
})(jQuery);