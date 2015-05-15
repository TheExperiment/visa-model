require('cloud/app.js');

var Card = Parse.Object.extend("Card");

Parse.Cloud.define("rateCards", function(request, response) {
  	var query = new Parse.Query(Card);
  	query.find().then(function(cards) {
    
    var aprCardSet = [];
    var param = "card_data_purchases_regular_apr_value"
    // eliminate invalid apr cards
    for (var i = 0; i < cards.length; ++i) {
    	var card = cards[i];
    	var apr = card.get(param)
		if (apr != 999 && isNumber(apr)) aprCardSet.push(card);
    }
    var results = bottomRankFromHighest(aprCardSet , param);

    var resultString = "";
    // results is {objects: [], ranks: []}

    
    for (var i = 0; i < results.objects.length; ++i) {
    	resultString += "apr " + results.objects[i].get(param) + " for card " + results.objects[i].get("name") + " is ranked " + results.ranks[i] + "\n";
    }
	
    response.success(resultString);

  }, function(error) {
    // Make sure to catch any errors, otherwise you may see a "success/error not called" error in Cloud Code.
    response.error("Could not complete, error " + error.code + ": " + error.message);
  });
});



var bottomRankFromHighest = function(set, param) {
	var clonedCollection = new Parse.Collection(set);
	clonedCollection.comparator = function(object) {
	  return 10000 - object.get(param);
	};
	clonedCollection.sort();
	var collectionObjects = clonedCollection.models;
	var arr = []
	for (var i = 0; i < collectionObjects.length; ++i) {
		var obj = collectionObjects[i];
		arr.push(obj.get(param));
	}
	var ranks = arr.map(function(v){ return arr.indexOf(v)+1 });
	return {objects: collectionObjects, ranks: ranks};
}

var isNumber = function(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

/*
	for (var i = 0; i < cards.length; ++i) {

		var card = cards[i];

    	var apr = card.get("card_data_purchases_regular_apr_value");
    	// valid?
    	if (apr != 999 && isNumber(apr)) aprCardSet.push(card);
    	var aprSetRanked = bottomRankFromHighest(aprCardSet, apr);

    	// var cardDataFeesAnnualValue = card.get("card_data_fees_annual_value");
    	// if (cardDataFeesAnnualValue != 999 && isNumber(cardDataFeesAnnualValue)) cardDataFeesAnnualValueSet.push(cardDataFeesAnnualValue);
    	// var cardDataFeesAnnualValueSetRanked = bottomRankFromHighest(cardDataFeesAnnualValueSet);

    	// var returnDump = "";
    	// for (var j = 0; j < aprSetRanked.length; ++j) {
    	// 	returnDump
    	// }
    }
	*/


