// Cloud code for parse save triggers


function sendPriceChangePush(request)
{
	var statusCode = request.object.get("status");
	var channelName = request.object.get("channelName");
	var title = request.object.get("title");
	var price = request.object.get("price");
	var alertMessage = "";
	switch(statusCode)
	{
		case 0:
			alertMessage = title + " was added to the queue for " + channelName + " and the price will be changed to $" +  price +".";
			break;
		case 25:
			alertMessage = "Attempted to set the price of " + title + " to $" + price + " on " + channelName + ".";
			break;
		case 50:
			alertMessage = "Price for " + title + " was set to $" + price + " on " + channelName + " waiting for confirmation.";
			break;
		case 99:
			alertMessage = "Price change confirmed: " + title + " was set to $" + price + " on " + channelName + ".";
			break;
		case 404:
			alertMessage = "Not Found: " + title + " was not found on " + channelName;
			break;
	}

	Parse.Push.send(
	{
		channels: [ "PriceChanges" ],
		data:
		{
			alert: alertMessage
		}
	},
	{
		success: function()
		{
    	// Push was successful
  		},
		error: function(error)
		{
		// Handle error
		}
	});
}

Parse.Cloud.afterSave("PriceChangeQueue", function(request)
{
	sendPriceChangePush(request);
});

Parse.Cloud.afterSave("PrefunkQueue", function(request)
{
	sendPriceChangePush(request);
});

// the afterSave hook for AmazonSalesData
Parse.Cloud.afterSave("AmazonSalesData", function(request)
{
	aggregateSales("amazonSales", request);
});

// the afterSave hook for AppleSalesData
Parse.Cloud.afterSave("AppleSalesData", function(request)
{
	aggregateSales("appleSales", request);
});

// the afterSave hook for NookSalesData
Parse.Cloud.afterSave("NookSalesData", function(request)
{
	aggregateSales("nookSales", request);
});

Parse.Cloud.afterSave("GooglePlaySalesData", function(request)
{
	aggregateSales("googleplaySales", request);
});

//Base function for aggregating daily sales data into the AggregateSales class.
function aggregateSales(salesFieldName, request)
{
	if(request.object.get("book") == null) { return; }

	query = new Parse.Query("AggregateSales");
	var Book = Parse.Object.extend("Book")
	var book = new Book();

	date = request.object.get("crawlDate");
	searchDate = new Date(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "Z00:00:00.000");

	book.id = request.object.get("book").id;
	query.equalTo("book", book);
	query.equalTo("crawlDate", searchDate);
	query.first(
	{
		success: function(aggregate)
		{
			// first returns success if there's no error and the object if one exists
			// otherwise it's null, so we check for not null and update, otherwise we create new.
			if(aggregate == null)
			{
				var Aggregate = Parse.Object.extend("AggregateSales");
				aggregate = new Aggregate();
				aggregate.set("crawlDate", searchDate);
			}
			prevTotal = aggregate.get(salesFieldName) != null ? aggregate.get(salesFieldName) : 0;

			aggregate.set("book", book);
			aggregate.set(salesFieldName, prevTotal + request.object.get("dailySales"));

			aggregate.save();
		},
		error: function(error)
		{
			console.error("Got an error " + error.code + " : " + error.message);
		}
	});
}


// the afterSave hook for NookStats
Parse.Cloud.afterSave("NookStats", function(request)
{
	saveIntoScoreBoard("NookScoreBoard", ["salesRank","price","reviewCount", "averageCount", "crawlDate"], request);
});

Parse.Cloud.afterDelete("NookStats", function(request)
{
	deleteFromScoreBoard("NookScoreBoard", "NookStats", request);
});


//afterSave hook for AmazonStats
Parse.Cloud.afterSave("AmazonStats", function(request)
{
	saveIntoScoreBoard("AmazonScoreBoard", ["got_price", "kindle_price", "sales_rank", "crawl_date", "num_of_reviews", "average_stars"], request);
});

Parse.Cloud.afterDelete("AmazonStats", function(request)
{
	deleteFromScoreBoard("AmazonScoreBoard", "AmazonStats", request);
});

//afterSave hook for AppleStats
Parse.Cloud.afterSave("AppleStats", function(request)
{
	saveIntoScoreBoard("AppleScoreBoard", ["price", "numOfReviews", "averageStars", "crawlDate"], request);
});

Parse.Cloud.afterDelete("AppleStats", function(request)
{
	deleteFromScoreBoard("AppleScoreBoard", "AppleStats", request);
});

//afterSave hook for GooglePlayStats
Parse.Cloud.afterSave("GooglePlayStats", function(request)
{
	saveIntoScoreBoard("GooglePlayScoreBoard", ["price", "numOfReviews", "averageReviews", "crawlDate"], request);
});

Parse.Cloud.afterDelete("GooglePlayStats", function(request)
{
	deleteFromScoreBoard("GooglePlayScoreBoard", "GooglePlayStats", request);
});

// base function for saving stats into a scoreboard.
// We are keeping score of the most recently scanned price for a book in a scoreboard class
// the class contains book and stats keys that point to the Book and [class_name]Stats objects respectively.
// The table is updated after a Stat has been saved so the scoreboard has the most recent score (NookStat, AppleStat, AmazonStat,etc.)
// for the Book, but either updating or creating a new record if one doesn't exist.
function saveIntoScoreBoard(scoreBoard, fields, request)
{
	query = new Parse.Query(scoreBoard);
	var Book = Parse.Object.extend("Book")
	var book = new Book();

	book.id = request.object.get("book").id;
	query.equalTo("book", book);
	query.include("stats");
	query.first(
	{
		success: function(score)
		{
			// first returns success if there's no error and the object if one exists
			// otherwise it's null, so we check for not null and update, otherwise we create new.
			if(score == null)
			{
				var Score = Parse.Object.extend(scoreBoard);
				score = new Score();
			}
			score.set("book", book);
			score.set("stats",request.object);
			for(var i = 0; i < fields.length; i++)
			{
				score.set(fields[i], score.get("stats").get(fields[i]));
			}
			score.save();
		},
		error: function(error)
		{
			console.error("Got an error " + error.code + " : " + error.message);
		}
	});
}

//base function for deleting stats from the scoreboard.
//if the stat is deleted, we delete it from the scoreboard.
function deleteFromScoreBoard(scoreBoard, stats, request)
{
	query = new Parse.Query(scoreBoard);

	var Stats = Parse.Object.extend(stats)
	var stats = new Stats();
	stats.id = request.object.id;

	query.equalTo("stats", stats);
	query.first({
		success: function(stat)
		{
			if(stat != null)
			{
				stat.destroy();
			}
		},
		error: function(error)
		{
			console.error("Got an error " + error.code + " : " + error.message);
		}
	});
}
