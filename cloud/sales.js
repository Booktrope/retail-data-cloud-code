// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
 
Parse.Cloud.define("getSalesDataForAsin", function(request, response){
    var query = new Parse.Query("AmazonSalesData");
    query.equalTo("asin", request.params.asin);
    query.equalTo("country","US");
    query.include("book");
    query.descending("crawlDate");
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
                payLoad.title = (myBook != null) ? myBook.get("title") : "";
                payLoad.author = (myBook != null) ? myBook.get("author") : "";
                for(var i = 0; i < results.length; i++)
                {
                    crawlData[i] = {};
                    crawlData[i].asin        = results[i].get("asin");
				    crawlData[i].dailySales  = results[i].get("dailySales");
				    crawlData[i].crawlDate   = results[i].get("crawlDate"); 
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
