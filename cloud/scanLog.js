var payload = createScanLogPayload();
var scanLog = Parse.Object.extend("ScanLog");

// api for bundling all of the scan log types into one payload.
Parse.Cloud.define('latestScanLogs', function(request, response) {
  var type = "amazonSales";
  var amazonSalesQuery = buildQuery(type);

  amazonSalesQuery.find().then(
    function(results) {
      handleQueryResults(results, type);
      type = "appleSales";
      var appleSalesQuery = buildQuery(type);
      appleSalesQuery.find().then(
        function(results) {
          handleQueryResults(results, type);
          type = "nookSales";
          var nookSalesQuery = buildQuery(type);
          nookSalesQuery.find().then(
            function(results) {
              handleQueryResults(results, type);
              type = "amazonRanking";
              var amazonRankingQuery = buildQuery(type);
              amazonRankingQuery.find().then(
                function(results) {
                  handleQueryResults(results, type);
                  type = "appleRanking";
                  var appleRankingQuery = buildQuery(type);
                  appleRankingQuery.find().then(
                    function(results) {
                      handleQueryResults(results,type);
                      type = "priceChanger";
                      var priceChangerQuery = buildQuery(type);
                      priceChangerQuery.find().then(
                        function(results) {
                          handleQueryResults(results, type);
                          response.success(payload);
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    },
    function(error) {
      response.error(error);
    }
  );
});

// default payload
function createScanLogPayload() {
  var payload ={};
  payload.amazonSales = null;
  payload.appleSales = null;
  payload.nookSales = null;
  payload.amazonRanking = null;
  payload.appleRanking = null;
  payload.priceChanger = null;
  return payload;
}

// query factory for the scan log
function buildQuery(type) {
  var query = new Parse.Query(scanLog);

  query.equalTo('type', type);
  query.descending('scanDate');
  query.limit(1);
  return query;
}

// query results handler
function handleQueryResults(results, type) {
  if(results.length > 0) {
    payload[type] = results[0].get("scanDate");
  }
}
