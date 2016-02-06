// Cloud code for promo eval

// - Priced at $2.99 or higher
// - At least 10 reviews
// - Averaging 3.5 stars or more

Parse.Cloud.define("getPromoReady", function(request, response){
  var _ = require('underscore');
  var payload = [];
  var query = new Parse.Query("Book");
  query.exists("asin");
  query.limit(1000); //todo get books in batches once we publish more than 999

  query.find().then(function(results)
  {
    var promises = [];
    _.each(results, function(result)
    {
      var crawlQuery = new Parse.Query("AmazonStats");
      crawlQuery.equalTo("asin", result.get("asin"));
      crawlQuery.greaterThan("kindle_price", 2.98);
      crawlQuery.greaterThan("num_of_reviews",9);
      crawlQuery.greaterThan("average_stars",3.4);
      crawlQuery.limit(1);
      crawlQuery.include("book");
      promises.push(crawlQuery.first().then(function(crawlResult)
      {
        if(crawlResult != null)
        {
          crawlData = {};
           var myBook = crawlResult.get("book");
          crawlData.title = myBook.get("title");
          crawlData.author = myBook.get("author");
          crawlData.asin  = crawlResult.get("asin");
          crawlData.kindle_price    = crawlResult.get("kindle_price");
          crawlData.average_stars   = crawlResult.get("average_stars");
          crawlData.num_of_reviews = crawlResult.get("num_of_reviews");
          crawlData.crawl_date    = crawlResult.get("crawl_date");

          payload.push(crawlData);

        }
      }));
    });
    return Parse.Promise.when(promises);

  }).then(function(result)
  {
    response.success(payload);

  });

});
