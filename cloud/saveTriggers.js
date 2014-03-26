// Cloud code for parse save triggers


// the after save hook for NookStats
// We are keeping score of the most recently scanned price for a book in a scoreboard class
// the class contains book and stats keys that point to the Book and NookStats objects respectively.
// The table is updated after NookStat so the scoreboard has the most recent score (NookStat)
// for the Boo, but either updating or creating a new record if one doesn't exist.
Parse.Cloud.afterSave("NookStats", function(request) 
{
	saveIntoScoreBoard("NookScoreBoard", ["salesRank","price","reviewCount", "averageCount", "crawlDate"], request);
});

Parse.Cloud.afterSave("AmazonStats", function(request) 
{
	saveIntoScoreBoard("AmazonScoreBoard", ["got_price", "kindle_price", "sales_rank", "crawl_date", "num_of_reviews", "average_stars"], request);
});

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
				var score = Parse.Object.extend(scoreBoard);
				score = new NookScore();
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