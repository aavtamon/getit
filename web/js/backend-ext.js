Backend._requestCount = 0;
Backend._streamCount = 0;


Backend.CacheChangeEvent.TYPE_REQUEST_IDS = "request_ids_changed";
Backend.CacheChangeEvent.TYPE_REQUEST = "request_changed";
Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM_IDS = "negotiation_stream_ids_changed";
Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM = "negotiation_stream_changed";

Backend.CacheChangeEvent.TYPE_OFFER_IDS = "offer_ids_changed";
Backend.CacheChangeEvent.TYPE_OFFER = "offer_changed";




// REQUEST/RESPONSE management

Backend.Request = {};
Backend.Request.PICKUP_PICKUP = "pickup";
Backend.Request.PICKUP_DELIVERY = "delivery";
Backend.Request.PICKUP_ANY = "any";

Backend.Request.STATUS_ACTIVE = "active";
Backend.Request.STATUS_CLOSED = "closed";
Backend.Request.STATUS_RECALLED = "recalled";
/*
  Request.revision: number, automatic
  Request.user_id: number
  Request.star_rating: number, 0-5
  Request.creation_time: date
  Request.user_name: string
  Request.zipcode: number
  Request.geolocation: string, optional
  Request.category: string
  Request.text: string
  Request.pickup: ["pickup" | "delivery" | "any"]
  Request.get_on: date
  Request.return_by: date
  Request.payment: number
  Request.payrate: ["free" | "daily" | "weekly" | "monthly"]
  Request.status: ["active" | "closed" | "recalled"]
*/

Backend.NegotiationStream = {};
Backend.NegotiationStream.STATUS_ACTIVE = "active";
Backend.NegotiationStream.STATUS_CLOSED = "closed";
Backend.NegotiationStream.STATUS_DENIED = "denied";
Backend.NegotiationStream.STATUS_RECALLED = "recalled";
Backend.NegotiationStream.STATUS_ACCEPTED = "accepted";
Backend.NegotiationStream.STATUS_ACCEPTANCE_CONFIRMED = "acceptance_confirmed";
Backend.NegotiationStream.STATUS_DELIVERED = "delivered";
Backend.NegotiationStream.STATUS_DELIVERY_CONFIRMED = "delivery_confirmed";
Backend.NegotiationStream.STATUS_RETURNED = "returned";
Backend.NegotiationStream.STATUS_RETURN_CONFIRMED = "return_confirmed";
/*
  NegotiationStream.revision: number, automatic
  NegotiationStream.user_id: number
  NegotiationStream.request_id: number
  NegotiationStream.creation_time: date
  NegotiationStream.user_name: string
  NegotiationStream.star_rating: number, 0-5
  NegotiationStream.zipcode: number
  NegotiationStream.geolocation: string, optional
  NegotiationStream.distance: number
  NegotiationStream.status: ["active" | "closed" | "recalled"]
  NegotiationStream.negotiations: <array of negotiation object>
*/


Backend.Negotiation = {};
Backend.Negotiation.TYPE_MESSAGE = "message";
Backend.Negotiation.TYPE_OFFER = "offer";

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
  Negotiation.user_id: number
  Negotiation.creation_time: date
  Negotiation.user_name: string
  Negotiation.type: ["recall" | "negotiation" | "accept" | "confirm" | "decline" | "delivery" | "delivery_accept" |"return" | "close"]
  Negotiation.text: string, optional
  Negotiation.attachments: <array of attachments>
  Negotiation.get_on: date
  Negotiation.return_by: date
  Negotiation.delivery: ["pickup" | "delivery" | "any"]
  Negotiation.address: string, optional
  Negotiation.payment: number,
  Negotiation.payrate: ["free" | "daily" | "weekly" | "monthly"]
  Negotiation.deposit: number
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
  var request = Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_REQUEST, requestId);
  
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
  request.creation_time = Date.now();
  request.user_name = Backend.getUserProfile().name;
  request.zipcode = 12345;
  request.status = Backend.Request.STATUS_ACTIVE;
  
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
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, requestId, 
                          GeneralUtils.merge(Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_REQUEST, requestId), request));
  
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



Backend.getNegotiationStreamIds = function(requestId, transactionCallback) {
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM_IDS, requestId);
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM_IDS, requestId, false);
  return Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM_IDS, requestId);
}

Backend.createNegotiationStream = function(requestId, transactionCallback) {
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM_IDS, requestId);
  
  var newStreamId = requestId + "-" + this._streamCount++;
  var streamIds = Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM_IDS, requestId);
  if (streamIds == null) {
    streamIds = [newStreamId];
  } else {
    streamIds.splice(0, 0, newStreamId);
  }
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM_IDS, requestId, streamIds);
  
  
  var stream = {
    user_id: Backend.getUserProfile().user_id,
    request_id: requestId,
    creation_time: Date.now(),
    user_name: Backend.getUserProfile().name,
    star_rating: 0,
    zipcode: 12345,
    distance: 10,
    status: Backend.NegotiationStream.STATUS_ACTIVE,
    negotiations: []
  }
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM, newStreamId, stream);
  if (transactionCallback != null) {
    transactionCallback.success(newStreamId);
  }
}

Backend.removeNegotiationStream = function(requestId, streamId, transactionCallback) {
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM_IDS, requestId);
  
  var streamIds = Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM_IDS, requestId);
  if (streamIds != null) {
    streamIds = GeneralUtils.removeFromArray(streamIds, streamId);
    Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM_IDS, requestId, streamIds);
  }
  
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM, streamId);
  var stream = Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM, streamId);
  stream.status = Backend.NegotiationStream.STATUS_DENIED;
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM, streamId, stream);
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
}

Backend.updateNegotiationStream = function(requestId, streamId, stream, transactionCallback) {
  Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM, streamId);
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM, streamId,
                          GeneralUtils.merge(Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM, streamId), stream));
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
}

Backend.getNegotiationStream = function(requestId, streamId, transactionCallback) {
  var stream = Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM, streamId);
  
  if (transactionCallback != null) {
    transactionCallback.success();
  }
  
  return stream;
}




Backend.addNegotiation = function(requestId, streamId, negotiation, transactionCallback) {
  negotiation.user_id = Backend.getUserProfile().user_id;
  negotiation.creation_time = Date.now();
  negotiation.user_name = Backend.getUserProfile().name;

  
  var addNegotiationToStream = function(streamId) {
    var stream = Backend.Cache.getObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM, streamId);

    Backend.Cache.markObjectInUpdate(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM, streamId);
    if (stream.negotiations == null) {
      stream.negotiations = [negotiation];
    } else {
      stream.negotiations.push(negotiation);
    }

    Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM, streamId, stream);

    if (transactionCallback != null) {
      transactionCallback.success();
    }
  }
  
  
  if (streamId == null) {
    var streamCreationCallback = {
      success: function(newStreamId) {
        addNegotiationToStream(newStreamId);
      },
      failure: function() {
        transactionCallback.failure();
      },
      error: function() {
        transactionCallback.error();
      }
    }

    Backend.createNegotiationStream(requestId, streamCreationCallback);
  } else {
    addNegotiationToStream(streamId);
  }
}

Backend.addNegotiationMessage = function(requestId, streamId, message, attachments, transactionCallback) {
  var negotiation = {
    type: Backend.Negotiation.TYPE_MESSAGE,
    text: message,
    attachments: attachments
  }
  Backend.addNegotiation(requestId, streamId, negotiation, transactionCallback);
}

Backend.addNegotiationOffer = function(requestId, streamId, offer, transactionCallback) {
  var negotiation = {
    type: Backend.Negotiation.TYPE_OFFER,
    text: offer.text,
    attachments: offer.attachments,
    get_on: offer.get_on,
    return_by: offer.return_by,
    delivery: offer.delivery,
    payment: offer.payment,
    payrate: offer.payrate,
    deposit: offer.deposit
  }
  
  Backend.addNegotiation(requestId, streamId, negotiation, transactionCallback);
}




Backend.getMatchingTools = function(searchText, transactionCallback) {
  setTimeout(function() {

    var result = null;

    if (searchText == null || searchText == "") {
      result = [];
    } else {
      result = [
        {display: "Molotok", description: "Horoshiy molotok!", attachments: [], payment: 10, payrate: Application.Configuration.PAYMENT_RATES[1], deposit: 10},
        {display: "Huynya", description: "Horoshaya huynya!", attachments: [], payment: 0, payrate: Application.Configuration.PAYMENT_RATES[0], deposit: 30},
        {display: "Polnaya Huynya", description: "Horoshaya no sovershenno polnaya huynya! Ne beri ee!", attachments: [], payment: 0, payrate: Application.Configuration.PAYMENT_RATES[0], deposit: 30},
        {display: "Molotok", description: "Horoshiy molotok!", attachments: [], payment: 10, payrate: Application.Configuration.PAYMENT_RATES[1], deposit: 10},
        {display: "Huynya", description: "Horoshaya huynya!", attachments: [], payment: 0, payrate: Application.Configuration.PAYMENT_RATES[0], deposit: 30},
        {display: "Polnaya Huynya", description: "Horoshaya no sovershenno polnaya huynya! Ne beri ee!", attachments: [], payment: 0, payrate: Application.Configuration.PAYMENT_RATES[0], deposit: 30},
      ];
    }

    if (transactionCallback != null && transactionCallback.success != null) {
      transactionCallback.success(result);
    }
  }, 3000);
}




// Utils
Backend.isOwnedRequest = function(request) {
  return request.user_id == Backend.getUserProfile().user_id;  
}

Backend.isOwnedStream = function(stream) {
  return stream.user_id == Backend.getUserProfile().user_id;  
}

Backend.isOwnedNegotiation = function(neg) {
  return neg.user_id == Backend.getUserProfile().user_id;  
}

Backend.offerHasNegotiationType = function(offer, type) {
  for (var i in offer.negotiations) {
    if (offer.negotiations[i].type == type) {
      return true;
    }
  }
  
  return false;
}




// TEMPORARY cache init
var __init = function() {
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, 0, {
    user_id: Backend.getUserProfile().user_id,
    star_rating: 3,
    creation_time: Date.now(),
    user_name: Backend.getUserProfile().name,
    zipcode: 12345,
    category: "construction",
    text: "Give me a huammer!",
    pickup: "pickup",
    get_on: Date.now(),
    return_by: Date.now() + 24 * 60 * 60 * 1000,
    payrate: "free",
    payment: 0,
    status: Backend.Request.STATUS_ACTIVE
  });
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, 1, {
    user_id: Backend.getUserProfile().user_id,
    star_rating: 3,
    creation_time: Date.now(),
    user_name: Backend.getUserProfile().name,
    zipcode: 12345,
    category: "general",
    text: "Give me pizduley!!!",
    pickup: "delivery",
    get_on: Date.now(),
    return_by: Date.now() + 3 * 24 * 60 * 60 * 1000,
    payrate: "free",
    payment: 0,
    status: Backend.Request.STATUS_ACTIVE
  });
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, 2, {
    user_id: Backend.getUserProfile().user_id,
    star_rating: 3,
    creation_time: Date.now(),
    user_name: Backend.getUserProfile().name,
    zipcode: 12345,
    category: "medicine",
    text: "Give me a niddle!",
    pickup: "delivery",
    get_on: Date.now(),
    return_by: Date.now() + 24 * 60 * 60 * 1000,
    payrate: "day",
    payment: 1.56,
    status: Backend.Request.STATUS_ACTIVE
  });
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, 3, {
    user_id: 10,
    star_rating: 5,
    creation_time: Date.now(),
    user_name: "Vasya",
    zipcode: 23456,
    category: "construction",
    text: "Give me a hammer!",
    pickup: "pickup",
    get_on: Date.now(),
    return_by: Date.now() + 24 * 60 * 60 * 1000,
    payrate: "free",
    payment: 0,
    status: Backend.Request.STATUS_ACTIVE
  });
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, 4, {
    user_id: 8,
    star_rating: 2,
    creation_time: Date.now(),
    user_name: "Petya",
    zipcode: 12345,
    category: "general",
    text: "Give me pizduley!!!",
    pickup: "delivery",
    get_on: Date.now(),
    return_by: Date.now() + 3 * 24 * 60 * 60 * 1000,
    payrate: "free",
    payment: 0,
    status: Backend.Request.STATUS_ACTIVE
  });
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, 5, {
    user_id: 10,
    star_rating: 5,
    creation_time: Date.now(),
    user_name: "Vasya",
    zipcode: 23456,
    category: "medicine",
    text: "Give me a niddle!",
    pickup: "delivery",
    get_on: Date.now(),
    return_by: Date.now() + 24 * 60 * 60 * 1000,
    payrate: "month",
    payment: 3.15,
    status: Backend.Request.STATUS_ACTIVE
  });
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST, 6, {
    user_id: 8,
    star_rating: 2,
    creation_time: Date.now(),
    user_name: "Petya",
    zipcode: 12345,
    category: "law",
    text: "Give me an advise",
    pickup: "pickup",
    get_on: Date.now(),
    return_by: Date.now() + 3 * 24 * 60 * 60 * 1000,
    payrate: "week",
    payment: 2.50,
    status: Backend.Request.STATUS_RECALLED
  });
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_REQUEST_IDS, 0, [6, 5, 4, 3, 2, 1, 0]);
  Backend._requestCount = 7;

  
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM, "5-0", {
    user_id: Backend.getUserProfile().user_id,
    request_id: 5,
    creation_time: Date.now(),
    user_name: Backend.getUserProfile().name,
    star_rating: 3,
    zipcode: 12345,
    distance: 10,
    status: Backend.NegotiationStream.STATUS_ACTIVE,
    negotiations: [
      {
        user_id: Backend.getUserProfile().user_id,
        creation_time: Date.now(),
        user_name: Backend.getUserProfile().name,
        type: Backend.Negotiation.TYPE_MESSAGE,
        text: "Che za fignya tebe nuzna?"
      },
      {
        user_id: Backend.getUserProfile().user_id,
        creation_time: Date.now(),
        user_name: Backend.getUserProfile().name,
        type: Backend.Negotiation.TYPE_MESSAGE,
        text: "Ovechay davay!"
      },
      {
        user_id: 10,
        creation_time: Date.now(),
        user_name: "Vasya",
        type: Backend.Negotiation.TYPE_MESSAGE,
        text: "Huy tebe!"
      }
    ]
  });
  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM_IDS, 5, ["5-0"]);
  Backend._streamCount = 1;
  
  
/*  
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_OFFER, 0, {
    user_id: 10,
    request_id: 0,
    creation_time: Date.now(),
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
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_OFFER, 1, {
    user_id: Backend.getUserProfile().user_id,
    request_id: 6,
    creation_time: Date.now(),
    user_name: Backend.getUserProfile().name,
    star_rating: 3,
    zipcode: 12345,
    distance: 15,
    get_on: Date.now(),
    return_by: Date.now() + 3 * 24 * 60 * 60 * 1000,
    text: "I tebe dau. Davay beri!",
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
  Backend.Cache.setObject(Backend.CacheChangeEvent.TYPE_OFFER_IDS, 6, [1]);
  Backend._offerCount = 2;
  */
  
}
setTimeout(__init, 2000);
