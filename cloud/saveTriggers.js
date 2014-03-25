// Cloud code for parse save triggers


// the after save hook for NookStats
// We are keeping score of the most recently scanned price for a book in a scoreboard class
// the class contains book and stats keys that point to the Book and NookStats objects respectively.
// The table is updated after NookStat so the scoreboard has the most recent score (NookStat)
// for the Boo, but either updating or creating a new record if one doesn't exist.
Parse.Cloud.afterSave("NookStats", function(request) 
{
	query = new Parse.Query("NookScoreBoard");
	var Book = Parse.Object.extend("Book")
	var book = new Book();
	
	book.id = request.object.get("book").id;
	query.equalTo("book", book);
	query.first(
	{
		success: function(nookScore) 
		{
			// first returns success if there's no error and the object if one exists
			// otherwise it's null, so we check for not null and update, otherwise we create new.
			if(nookScore != null)
			{	
				nookScore.set("stats",request.object);
				nookScore.save();
			}
			else
			{
				var NookScore = Parse.Object.extend("NookScoreBoard");
				nookScore = new NookScore();
				nookScore.set("book", book);
				nookScore.set("stats", request.object);
				nookScore.save();
			}
		},
		error: function(error)
		{
			console.error("Got an error " + error.code + " : " + error.message);
		}
	});
});


//TODO:: The scoreboard functions are exactly the same, make a base function to cut down on duplicate code.
Parse.Cloud.afterSave("AmazonStats", function(request) 
{
	query = new Parse.Query("AmazonScoreBoard");
	var Book = Parse.Object.extend("Book")
	var book = new Book();
	
	book.id = request.object.get("book").id;
	query.equalTo("book", book);
	query.first(
	{
		success: function(amazonScore) 
		{
			// first returns success if there's no error and the object if one exists
			// otherwise it's null, so we check for not null and update, otherwise we create new.
			if(amazonScore != null)
			{	
				amazonScore.set("stats",request.object);
				amazonScore.save();
			}
			else
			{
				var amazonScore = Parse.Object.extend("AmazonScoreBoard");
				amazonScore = new amazonScore();
				amazonScore.set("book", book);
				amazonScore.set("stats", request.object);
				amazonScore.save();
			}
		},
		error: function(error)
		{
			console.error("Got an error " + error.code + " : " + error.message);
		}
	});
});
