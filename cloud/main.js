
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.define("getCrawlDataForAsin", function(request, response){
	var query = new Parse.Query("AmazonStats");
	query.equalTo("asin", request.params.asin);
	query.include("book");
	//query.descending("crawl_date,crawl_time");
	query.descending("crawl_date");
	if(request.params.skip)
	{
		query.skip(request.params.skip)
	}
	//query.limit(request.params.limit);
	query.find({
		success: function(results){
			
			var payLoad = {};
			payLoad.title = "";
			payLoad.author = "";
			var crawlData = [];
			payLoad.crawl = crawlData;
			if(results[0] != null)
			{
				var myBook = results[0].get("book");
			
				var payLoad = {};
				var crawlData = [];
				payLoad.title = myBook.get("title");
				payLoad.author = myBook.get("author");
				for(var i = 0; i < results.length; i++)
				{
					crawlData[i] = {};
					crawlData[i].asin           = results[i].get("asin");
					crawlData[i].sales_rank     = results[i].get("sales_rank");
					crawlData[i].average_stars  = results[i].get("average_stars");
					crawlData[i].kindle_price   = results[i].get("kindle_price");
					crawlData[i].num_of_reviews = results[i].get("num_of_reviews");				
					crawlData[i].crawl_date     = results[i].get("crawl_date");
					crawlData[i].createdAt      = results[i].get("createdAt");
				}
				payLoad.crawl = crawlData.reverse();
			}
			response.success(payLoad);
		},
		error: function()
		{
			response.error("lookup failed");
		}
	});

}); 