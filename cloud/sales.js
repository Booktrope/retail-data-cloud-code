// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

Parse.Cloud.define("getSalesDataForAsin", function(request, response){
    var query = new Parse.Query("AmazonSalesData");
    query.equalTo("asin", request.params.asin);
    query.equalTo("country","US");
    query.include("book");
    query.descending("crawlDate");
    query.limit(999);
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
                    crawlData[i].dailyKdpUnlimited = results[i].get("dailyKdpUnlimited");
                    crawlData[i].dailyFreeUnitsPromo = results[i].get("dailyFreeUnitsPromo")
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

Parse.Cloud.define("getSalesDataForApple", function(request, response){
	var query = new Parse.Query("AggregateSales");
  query.limit(999);
  var Book = Parse.Object.extend("Book")
  var book = new Book();

  book.id = request.params.book;
//  book.id = "S5attdRKzW";
//  book.id = "K0lzhELnzG";
  query.equalTo("book", book);
  query.descending("crawlDate");

  query.find({
	success: function(results)
	{
		var payLoad = {};
		payLoad.size = results.length;

		var crawlData = [];
		payLoad.crawl = crawlData;
		if(results[0] != null)
		{
			var myBook = results[0].get("book");

			var payLoad = {};
			var crawlData = [];
			payLoad.title = (myBook.id != null) ? myBook.get("title") : "";
			payLoad.author = (myBook.id != null) ? myBook.get("author") : "";
			j = 0;
			for(var i = 0; i < results.length; i++)
			{
				if(results[i].get("appleSales") !=null)
				{
					crawlData[j] = {};
					crawlData[j].objectId   = results[i].get("objectId");
					crawlData[j].appleSales = results[i].get("appleSales");
					crawlData[j].crawlDate  = results[i].get("crawlDate");
					j++;
				}
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

Parse.Cloud.define("getSalesDataForNook", function(request, response){
	var query = new Parse.Query("AggregateSales");
  query.limit(999);
  var Book = Parse.Object.extend("Book")
  var book = new Book();

  book.id = request.params.book;
//  book.id = "S5attdRKzW";
//  book.id = "K0lzhELnzG";
  query.equalTo("book", book);
  query.descending("crawlDate");

  query.find({
	success: function(results)
	{
		var payLoad = {};
		payLoad.size = results.length;

		var crawlData = [];
		payLoad.crawl = crawlData;
		if(results[0] != null)
		{
			var myBook = results[0].get("book");

			var payLoad = {};
			var crawlData = [];
			payLoad.title = (myBook.id != null) ? myBook.get("title") : "";
			payLoad.author = (myBook.id != null) ? myBook.get("author") : "";
			j = 0;
			for(var i = 0; i < results.length; i++)
			{
				if(results[i].get("nookSales") !=null)
				{
					crawlData[j] = {};
					crawlData[j].objectId   = results[i].get("objectId");
					crawlData[j].nookSales = results[i].get("nookSales");
					crawlData[j].crawlDate  = results[i].get("crawlDate");
					j++;
				}
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
