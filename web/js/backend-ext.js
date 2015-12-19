Backend._requestCount = 0;
Backend._offerCount = 0;
Backend._negotiationCount = 0;

Backend.Events.NEGOTIATION_CHANGED = "NEGOTIATION_CHANGED";


//Backend.UserProfile = {login: null, password: null, user_id: null, nickname: null, zipcode: null, rating: null};



// REQUEST/RESPONSE management

Backend.Request = {};
Backend.Request.PICKUP_PICKUP = "pickup";
Backend.Request.PICKUP_DELIVERY = "delivery";
Backend.Request.PICKUP_ANY = "any";
/*
  Request.revision: number, automatic
  Request.user_id: number
  Request.star_rating: number, 0-5
  Request.timestamp: date
  Request.user_name: string
  Request.zipcode: number
  Request.geolocation: string, optional
  Request.category: string
  Request.text: string
  Request.pickup: ["pickup" | "delivery" | "any"]
  Request.get_on: date
  Request.return_by: date
  Request.payment: {
    payrate: ["free" | "daily" | "weekly" | "monthly"]
    payment: number
  };
*/

Backend.Offer = {}; //Offer
Backend.Offer.DELIVERY_PICKUP = Backend.Request.PICKUP_PICKUP;
Backend.Offer.DELIVERY_DELIVERY = Backend.Request.PICKUP_DELIVERY;
Backend.Offer.DELIVERY_ANT = Backend.Request.PICKUP_ANY;
/*
  Offer.revision: number, automatic
  Offer.user_id; number
  Offer.request_id: number
  Offer.timestamp: date
  Offer.user_name: string
  Offer.star_rating: number, 0-5
  Offer.zipcode: number
  Offer.geolocation: string, optional
  Offer.distance: number
  Offer.get_on: date
  Offer.return_by: date
  Offer.text: string, optional
  Offer.attachments: <array of strings (urls or base64-encoded data)>, optional
  Offer.delivery: ["pickup" | "delivery" | "any"]
  Offer.address: string, optional
  Offer.payment: {
    payrate: ["free" | "daily" | "weekly" | "monthly"]
    payment: number
    deposit: number
  };
  Offer.negotiations: <array of negotiation object>
*/

Backend.Negotiation = {};
Backend.Negotiation.TYPE_NEGOTIATE = "negotiation";
Backend.Negotiation.TYPE_ACCEPT = "accept";
Backend.Negotiation.TYPE_CONFIRM = "confirm";
Backend.Negotiation.TYPE_DECLINE = "decline";
Backend.Negotiation.TYPE_RECALL = "recall";
Backend.Negotiation.TYPE_DELIVERY = "delivery";
Backend.Negotiation.TYPE_DELIVERY_ACCEPT = "delivery_accept";
Backend.Negotiation.TYPE_RETURN = "return";
Backend.Negotiation.TYPE_CLOSE = "close";


Backend.Negotiation.DELIVERY_PICKUP = Backend.Request.PICKUP_PICKUP;
Backend.Negotiation.DELIVERY_DELIVERY = Backend.Request.PICKUP_DELIEVRY;
/*
  Negotiation.user_id; number
  Negotiation.timestamp: date
  Negotiation.user_name: string
  Negotiation.type: ["negotiation" | "accept" | "confirm" | "decline" | "delivery" | "delivery_accept" |"return" | "close"]
  Negotiation.text: string
  Negotiation.get_on: date
  Negotiation.return_by: date
  Negotiation.delivery: ["pickup" | "delivery"]
  Negotiation.address: string, optional
  Negotiation.payment: {
    payrate: ["free" | "daily" | "weekly" | "monthly"]
    payment: number
    deposit: number
  };
*/


Backend.getRequestIds = function(transactionCallback) {
  Backend.Cache.markOutgoingRequestIdsInUpdate();
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
  
  Backend.Cache.markOutgoingRequestIdsInUpdate(false);
  return Backend.Cache.getOutgoingRequestIds();
}

Backend.removeRequest = function(requestId, transactionCallback) {
  Backend.Cache.markOutgoingRequestIdsInUpdate();
  
  var outgoingRequestIds = Backend.Cache.getOutgoingRequestIds();
  var outgoingRequestIds = GeneralUtils.removeFromArray(outgoingRequestIds, requestId);
  Backend.Cache.setOutgoingRequestIds(outgoingRequestIds);
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
}

Backend.createRequest = function(request, transactionCallback) {
  Backend.Cache.markOutgoingRequestIdsInUpdate();
  
  var newRequestId = this._requestCount++;
  
  request.user_id = Backend.getUserProfile().user_id;
  request.star_rating = 0;
  request.timestamp = Date.now();
  request.user_name = Backend.getUserProfile().name;
  request.zipcode = 12345;
  
  var requestIds = Backend.Cache.getOutgoingRequestIds();
  if (requestIds.length == null) {
    requestIds = [newRequestId];
  } else {
    requestIds.splice(0, 0, newRequestId);
  }
  Backend.Cache.setOutgoingRequestIds(requestIds);

  Backend.Cache.setRequest(newRequestId, request);
  
  if (transactionCallback != null) {
    transactionCallback.success(newRequestId);
  }
}

Backend.updateRequest = function(requestId, request, transactionCallback) {
  Backend.Cache.markRequestInUpdate(requestId);
  Backend.Cache.setRequest(requestId, GeneralUtils.merge(Backend.Cache.getRequest(requestId), request));
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
}

Backend.getRequest = function(requestId, transactionCallback) {
  var request = Backend.Cache.getRequest(requestId);
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
  
  return request;
}



Backend.getOfferIds = function(requestId, transactionCallback) {
  Backend.Cache.markOutgoingResponseIdsInUpdate(requestId);
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
  
  Backend.Cache.markOutgoingResponseIdsInUpdate(requestId, false);
  return Backend.Cache.getOutgoingResponseIds(requestId);
}



Backend.createOffer = function(requestId, offer, transactionCallback) {
  Backend.Cache.markOutgoingResponseIdsInUpdate(requestId);
  
  var newOfferId = this._offerCount++;
  
  var offerIds = Backend.Cache.getOutgoingResponseIds(requestId);
  if (offerIds == null) {
    offerIds = [newOfferId];
  } else {
    offerIds.splice(0, 0, newOfferId);
  }
  Backend.Cache.setOutgoingResponseIds(requestId, offerIds);
  
  offer.user_id = Backend.getUserProfile().user_id;
  offer.star_rating = 0;
  offer.timestamp = Date.now();
  offer.user_name = Backend.getUserProfile().name;
  offer.zipcode = 12345;
  offer.distance = 10;
  offer.negotiations = [];
  
  Backend.Cache.setResponse(requestId, newOfferId, offer);

  if (transactionCallback != null) {
    transactionCallback.success(newOfferId);
  }
}

Backend.updateOffer = function(requestId, offerId, offer, transactionCallback) {
  Backend.Cache.markResponseInUpdate(requestId, offerId);
  Backend.Cache.setResponse(requestId, offerId, GeneralUtils.merge(Backend.Cache.getResponse(requestId, offerId), offer));
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
}

Backend.getOffer = function(requestId, offerId, transactionCallback) {
  var offer = Backend.Cache.getResponse(requestId, offerId);

  if (transactionCallback != null) {
    transactionCallback.success();
  }
  
  return offer;
}

Backend.removeOffer = function(requestId, offerId, transactionCallback) {
  Backend.Cache.markOutgoingResponseIdsInUpdate();
  
  var outgoingResponseIds = Backend.Cache.getOutgoingResponseIds();
  var outgoingResponseIds = GeneralUtils.removeFromArray(outgoingResponseIds, offerId);
  Backend.Cache.setOutgoingResponseIds(outgoingResponseIds);
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
}

Backend.declineOffer = function(requestId, offerId, transactionCallback) {
  var updateCallback = {
    success: function() {
      Backend.removeOffer(requestId, offerId, transactionCallback);
    },
    failure: function() {
      transactionCallback.failure();
    }
  }
  
  Backend.addNegotiation(requestId, offerId, Backend.Negotition.TYPE_DECLINE, updateCallback);
}

Backend.recallOffer = function(requestId, offerId, transactionCallback) {
  var updateCallback = {
    success: function() {
      Backend.removeOffer(requestId, offerId, transactionCallback);
    },
    failure: function() {
      transactionCallback.failure();
    }
  }
  
  Backend.addNegotiation(requestId, offerId, Backend.Negotition.TYPE_RECALL, updateCallback);
}

Backend.addNegotiation = function(requestId, offerId, negotiationType, transactionCallback) {
  var offer = Backend.Cache.getResponse(requestId, offerId);
  if (offer == null) {
    if (transactionCallback != null) {
      transactionCallback.failure();
    }
    return;
  }
  
  offer.negotiations.push(Backend._createNegotiation(offer, negotiationType));
  
  Backend.updateOffer(requestId, offerId, offer, transactionCallback);
}



Backend._createNegotiation = function(offer, type) {
  var sourceObject = offer.negotiations.length > 0 ? offer.negotiations[offer.negotiations.length - 1] : offer;
  
  var negotiation = {
    user_id: Backend.getUserProfile().user_id,
    timestamp: Date.now(),
    user_name: Backend.getUserProfile().name,
    get_on: sourceObject.get_on,
    return_by: sourceObject.return_by,
    delivery: sourceObject.delivery,
    address: sourceObject.address,
    payment: sourceObject.payment,
    type: type
  }
  
  return negotiation;
}




// TEMPORARY cache init
var __init = function() {
  Backend.Cache.setRequest(0, {
    user_id: Backend.getUserProfile().user_id,
    star_rating: 3,
    timestamp: Date.now(),
    user_name: Backend.getUserProfile().name,
    zipcode: 12345,
    category: "construction",
    text: "Give me a huammer!",
    pickup: "pickup",
    get_on: Date.now(),
    return_by: Date.now() + 24 * 60 * 60 * 1000,
    payment: {
      payrate: "free",
      payment: 0
    }
  });
  
  Backend.Cache.setRequest(1, {
    user_id: Backend.getUserProfile().user_id,
    star_rating: 3,
    timestamp: Date.now(),
    user_name: Backend.getUserProfile().name,
    zipcode: 12345,
    category: "general",
    text: "Give me pizduley!!!",
    pickup: "delivery",
    get_on: Date.now(),
    return_by: Date.now() + 3 * 24 * 60 * 60 * 1000,
    payment: {
      payrate: "free",
      payment: 0
    }
  });
  
  Backend.Cache.setRequest(2, {
    user_id: Backend.getUserProfile().user_id,
    star_rating: 3,
    timestamp: Date.now(),
    user_name: Backend.getUserProfile().name,
    zipcode: 12345,
    category: "medicine",
    text: "Give me a niddle!",
    pickup: "delivery",
    get_on: Date.now(),
    return_by: Date.now() + 24 * 60 * 60 * 1000,
    payment: {
      payrate: "day",
      payment: 1.56
    }
  });
  
  Backend.Cache.setRequest(3, {
    user_id: 10,
    star_rating: 5,
    timestamp: Date.now(),
    user_name: "Vasya",
    zipcode: 23456,
    category: "construction",
    text: "Give me a hammer!",
    pickup: "pickup",
    get_on: Date.now(),
    return_by: Date.now() + 24 * 60 * 60 * 1000,
    payment: {
      payrate: "free",
      payment: 0
    }
  });
  
  Backend.Cache.setRequest(4, {
    user_id: 8,
    star_rating: 2,
    timestamp: Date.now(),
    user_name: "Petya",
    zipcode: 12345,
    category: "general",
    text: "Give me pizduley!!!",
    pickup: "delivery",
    get_on: Date.now(),
    return_by: Date.now() + 3 * 24 * 60 * 60 * 1000,
    payment: {
      payrate: "free",
      payment: 0
    }
  });
  
  Backend.Cache.setRequest(5, {
    user_id: 10,
    star_rating: 5,
    timestamp: Date.now(),
    user_name: "Vasya",
    zipcode: 23456,
    category: "medicine",
    text: "Give me a niddle!",
    pickup: "delivery",
    get_on: Date.now(),
    return_by: Date.now() + 24 * 60 * 60 * 1000,
    payment: {
      payrate: "month",
      payment: 3.15
    }
  });
  
  Backend.Cache.setRequest(6, {
    user_id: 8,
    star_rating: 2,
    timestamp: Date.now(),
    user_name: "Petya",
    zipcode: 12345,
    category: "law",
    text: "Give me an advise",
    pickup: "pickup",
    get_on: Date.now(),
    return_by: Date.now() + 3 * 24 * 60 * 60 * 1000,
    payment: {
      payrate: "week",
      payment: 2.50
    }
  });
  
  Backend.Cache.setOutgoingRequestIds([6, 5, 4, 3, 2, 1, 0]);
  
  Backend._requestCount = 7;
  
}
setTimeout(__init, 2000);
