
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

Parse.Cloud.job("PriceChangerStaleStatusNotifier", function(request, status)
{
  var PriceChangeQueue = Parse.Object.extend("PriceChangeQueue");
  var query = new Parse.Query(PriceChangeQueue);
  query.notEqualTo("status", 0);
  query.lessThanOrEqualTo("status", 50);
  var today = new Date();
  var twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(today.getHours() - 24);
  query.lessThanOrEqualTo("updatedAt", twentyFourHoursAgo);
  count = 0;
  query.each(function(priceChange) {
    count++;
    var title = priceChange.get("title");
    var statusCode = priceChange.get("status");
    var channelName = priceChange.get("channelName");
    var modifiedDate = priceChange.updatedAt;
    var alertMessage = "ALERT: " + title + " has not changed from " + getChannelNameFromStatusCode(statusCode) + " on " + channelName + " since " + modifiedDate;
    Parse.Push.send({
      channels: ["PriceChanges"],
      data:
      {
        sound: "chime",
        alert: alertMessage
      }
    },
    {
      success: function()
      {},
      error: function()
      {}
    });
  }).then(function() {
    // Set the job's success status
    if (count > 0)
    {
      status.success("Notifications sent.");
    }
    else
    {
      status.success("No need to send notifications.");
    }
  }, function(error) {
    // Set the job's error status
    status.error("Uh oh, something went wrong.");
  });
});


function getChannelNameFromStatusCode(statusCode)
{
  result = "default";
  switch(statusCode)
  {
    case 0:
      result = "Scheduled";
      break;
    case 25:
      result = "Attempted";
      break;
    case 50:
      result = "Unconfirmed";
      break;
    case 99:
      result = "Confirmed";
      break;
  }
  return result;
}
