
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

var sales = require('cloud/sales.js');
var promo = require('cloud/promo.js');
var saveTriggers = require('cloud/saveTriggers.js');
var priceChangerBackgroundJobs = require('cloud/priceChangerBackgroundJob');

Parse.Cloud.define("getCrawlDataForAsin", function(request, response){
	var query = new Parse.Query("AmazonStats");
	query.equalTo("asin", request.params.asin);
	query.include("book");
	//getting the most recent results
	query.descending("crawl_date");
	if(request.params.skip)
	{
		query.skip(request.params.skip)
	}
	query.find({
		success: function(results){
			
			var payload = {};
			payload.title = "";
			payload.author = "";
			var crawlData = [];
			payload.crawl = crawlData;
			if(results[0] != null)
			{
				//Since all book data is the same, we only want to include it once, 
				//so we grab the 0th result's book 				
				var myBook = results[0].get("book");
			
				var payload = {};
				var crawlData = [];
				payload.title = myBook.get("title");   //setting the title
				payload.author = myBook.get("author"); //setting the author
				for(var i = 0; i < results.length; i++)
				{
					crawlData[i] = {};
					crawlData[i].asin           = results[i].get("asin");
					crawlData[i].sales_rank     = results[i].get("sales_rank");
					crawlData[i].average_stars  = results[i].get("average_stars");
					crawlData[i].kindle_price   = results[i].get("kindle_price");
					crawlData[i].num_of_reviews = results[i].get("num_of_reviews");				
					crawlData[i].crawl_date     = results[i].get("crawl_date");
					crawlData[i].got_price      = results[i].get("got_price");
				}
				//reversing the array so it's an ascending list of the most recent crawls
				payload.crawl = crawlData.reverse();
			}
			response.success(payload);
		},
		error: function()
		{
			response.error("lookup failed");
		}
	});

}); 
