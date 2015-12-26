Backend._requestCount = 0;
Backend._offerCount = 0;
Backend._negotiationCount = 0;



Backend.CacheChangeEvent.TYPE_REQUEST_IDS = "request_ids_changed";
Backend.CacheChangeEvent.TYPE_REQUEST = "request_changed";
Backend.CacheChangeEvent.TYPE_OFFER_IDS = "offer_ids_changed";
Backend.CacheChangeEvent.TYPE_OFFER = "offer_changed";



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
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_REQUEST_IDS, 0);
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }

  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_REQUEST_IDS, 0, false);
  
  return Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_REQUEST_IDS, 0);
}

Backend.removeRequest = function(requestId, transactionCallback) {
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_REQUEST_IDS, 0);
  
  var requestIds = Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_REQUEST_IDS, 0);
  var requestIds = GeneralUtils.removeFromArray(requestIds, requestId);
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST_IDS, 0, requestIds);
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
}

Backend.createRequest = function(request, transactionCallback) {
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_REQUEST_IDS, 0);
  
  var newRequestId = this._requestCount++;
  
  request.user_id = Backend.getUserProfile().user_id;
  request.star_rating = 0;
  request.timestamp = Date.now();
  request.user_name = Backend.getUserProfile().name;
  request.zipcode = 12345;
  
  var requestIds = Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_REQUEST_IDS, 0);
  if (requestIds.length == null) {
    requestIds = [newRequestId];
  } else {
    requestIds.splice(0, 0, newRequestId);
  }
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST_IDS, 0, requestIds);

  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, newRequestId, request);
  
  if (transactionCallback != null) {
    transactionCallback.success(newRequestId);
  }
}

Backend.updateRequest = function(requestId, request, transactionCallback) {
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_REQUEST, requestId);
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, requestId, GeneralUtils.merge(Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_REQUEST, requestId), request));
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
}

Backend.getRequest = function(requestId, transactionCallback) {
  var request = Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_REQUEST, requestId);
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
  
  return request;
}



Backend.getOfferIds = function(requestId, transactionCallback) {
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_OFFER_IDS, requestId);
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_OFFER_IDS, requestId, false);
  return Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_OFFER_IDS, requestId);
}



Backend.createOffer = function(requestId, offer, transactionCallback) {
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_OFFER_IDS, requestId);
  
  var newOfferId = this._offerCount++;
  
  var offerIds = Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_OFFER_IDS, requestId);
  if (offerIds == null) {
    offerIds = [newOfferId];
  } else {
    offerIds.splice(0, 0, newOfferId);
  }
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_OFFER_IDS, requestId, offerIds);
  
  offer.user_id = Backend.getUserProfile().user_id;
  offer.star_rating = 0;
  offer.timestamp = Date.now();
  offer.user_name = Backend.getUserProfile().name;
  offer.zipcode = 12345;
  offer.distance = 10;
  offer.negotiations = [];
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_OFFER, newOfferId, offer);

  if (transactionCallback != null) {
    transactionCallback.success(newOfferId);
  }
}

Backend.updateOffer = function(requestId, offerId, offer, transactionCallback) {
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_OFFER, offerId);
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_OFFER, offerId, GeneralUtils.merge(Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_OFFER, offerId), offer));

  if (transactionCallback != null) {
    transactionCallback.success();
  }
}

Backend.getOffer = function(requestId, offerId, transactionCallback) {
  var offer = Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_OFFER, offerId);

  if (transactionCallback != null) {
    transactionCallback.success();
  }
  
  return offer;
}

Backend.removeOffer = function(requestId, offerId, transactionCallback) {
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_OFFER_IDS, requestId);
  
  var offerIds = Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_OFFER_IDS, requestId);
  var offerIds = GeneralUtils.removeFromArray(offerIds, offerId);
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_OFFER_IDS, requestId, offerIds);
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_OFFER, offerId, null);
  
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
  
  Backend.addNegotiation(requestId, offerId, Backend.Negotition.TYPE_DECLINE, null, updateCallback);
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

  Backend.addNegotiation(requestId, offerId, Backend.Negotiation.TYPE_RECALL, null, updateCallback);
}

Backend.addNegotiation = function(requestId, offerId, negotiationType, negotiation, transactionCallback) {
  var offer = Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_OFFER, offerId);
  if (offer == null) {
    if (transactionCallback != null) {
      transactionCallback.failure();
    }
    return;
  }
  
  offer.negotiations.push(GeneralUtils.merge(Backend._createNegotiation(offer, negotiationType), negotiation));

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



// Utils
Backend.isOwnedRequest = function(request) {
  return request.user_id == Backend.getUserProfile().user_id;  
}

Backend.isOwnedOffer = function(offer) {
  return offer.user_id == Backend.getUserProfile().user_id;  
}

Backend.isOwnedNegotiation = function(neg) {
  return neg.user_id == Backend.getUserProfile().user_id;  
}



// TEMPORARY cache init
var __init = function() {
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, 0, {
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
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, 1, {
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
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, 2, {
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
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, 3, {
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
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, 4, {
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
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, 5, {
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
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, 6, {
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
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST_IDS, 0, [6, 5, 4, 3, 2, 1, 0]);
  Backend._requestCount = 7;

  
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_OFFER, 0, {
    user_id: 10,
    request_id: 0,
    timestamp: Date.now(),
    user_name: "Vasya",
    star_rating: 5,
    zipcode: 12345,
    distance: 15,
    get_on: Date.now(),
    return_by: Date.now() + 3 * 24 * 60 * 60 * 1000,
    text: "Bery slushay!",
    attachments: [{name: "free", url: "file:///Users/aavtamonov/project/other/getit/web/imgs/free.jpeg", type: "image"}, {name: "paid", url: "file:///Users/aavtamonov/project/other/getit/web/imgs/paid.jpeg", type: "image"}],
    delivery: "any",
    payment: {
      payrate: "free",
      payment: 0,
      deposit: 5
    },
    negotiations: []
  });
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_OFFER_IDS, 0, [0]);
  Backend._offerCount = 1;
  
}
setTimeout(__init, 2000);
