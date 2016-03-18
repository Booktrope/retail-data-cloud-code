// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

Parse.Cloud.define('amazonTopList', function(request, response) {

  var query = new Parse.Query("AmazonScoreBoard");
  query.include("book");
  query.descending(request.params.descending || "num_of_reviews" );
  query.limit(request.params.limit || 40);

  query.find({
    success: function(results) {
      if(request.params.c1 && request.params.c2) {
        var payload = {};
        payload.results = [];

        for(var i = 0; i < results.length; i++) {
          var salesRecord = {};

          salesRecord.average_stars  = results[i].get("average_stars");
          salesRecord.book           = results[i].get("book");
          salesRecord.num_of_reviews = results[i].get("num_of_reviews");

          salesRecord.crawl_date   = results[i].get("crawl_date");
          salesRecord.got_price    = results[i].get("got_price");
          salesRecord.kindle_price = results[i].get("kindle_price");
          salesRecord.sales_rank   = results[i].get("sales_rank");

          salesRecord.weight = ((results[i].get("num_of_reviews")/request.params.c1) *
                (results[i].get("average_stars")/request.params.c2));

          payload.results.push(salesRecord);

        }
        payload.results.sort(function(a,b) { return (a.weight < b.weight) ? 1 : ((b.weight < a.weight) ? -1 : 0); });
        response.success(payload);
      }
      else {
        response.success(results);
      }
    },
    error: function(error){
      response.error = error;
    }
  });

});



Parse.Cloud.define('amazonSalesByGenre', function(request, response) {
  var query = new Parse.Query("AmazonSalesData");

  query.descending("crawlDate");
  query.limit(1);

  return query.find().then(
    function(results) {

      var latestQueryDate = results[0].get("crawlDate");
      var latestQuery = new Parse.Query("AmazonSalesData");

      latestQuery.equalTo("crawlDate", latestQueryDate);
      latestQuery.limit(1000);
      latestQuery.include("book");
      var genreHash = {};
      latestQuery.find().then(
        function(results) {
          // our results payLoad we will sort this by count at the end
          var payLoad = Array();
          var genreCount = {}; // associative array which contains a genre and a count
          // looping through the results and grouping by genre
          results.forEach(function(salesRecord) {
            var book = salesRecord.get("book");
            // ignore books that haven't had their control numbers or genre set
            if(book !== undefined && book.get("genre") !== undefined && salesRecord.get('dailySales') !== undefined) {
              genre = salesRecord.get("book").get("genre");
              // sum the genre count if exists otherwise initialize it to one.
              if (genreCount[genre] !== undefined) { genreCount[genre]+= salesRecord.get("dailySales"); }
              else { genreCount[genre] = salesRecord.get("dailySales"); }
            }
          });
          // insert the genre/count into the payLoad array
          for( var genre in genreCount) {
            payLoad.push({ genre: genre, count: genreCount[genre] });
          }
          // sort by count descending and set success.
          response.success(payLoad.sort(function(a,b) { return (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0); }));
        }
      );

    },function(error) {
      response.error(error);
  });
});

Parse.Cloud.define('amazonTopSales', function(request, response) {
  var query = new Parse.Query("AmazonSalesData");
  query.equalTo("country", "US");
  query.include("book");
  query.descending("crawlDate");
  query.limit(request.params.limit || 20);

  query.find({
    success: function(results) {

      var previousDate = results[0].get("crawlDate").toUTCString();

      var recentResults = [];
      for(var i = 0; i < results.length; i++)
      {
        if(previousDate !== results[i].get("crawlDate").toUTCString())
           break;
        recentResults[i] = results[i];
      }

      response.success(recentResults);
    },
    error: function(error) {
      response.error("lookup failed");
    }
  });

});

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
