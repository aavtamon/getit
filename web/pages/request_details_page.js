RequestDetailsPage = ClassUtils.defineClass(AbstractDataPage, function RequestDetailsPage() {
  AbstractDataPage.call(this, RequestDetailsPage.name);

  this._requestPanel;
  this._streamsPanel;
  this._requestId;
  this._statusElement;
  
  this._requestObject;
  this._streamObjects = [];
  
  this._cacheChangeListener = function(event) {
    if (event.type == Backend.CacheChangeEvent.TYPE_REQUEST_IDS) {
      if (!GeneralUtils.containsInArray(Backend.getRequestIds(), this._requestId)) {
        Application.goBack();
      }
    } else if (event.type == Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM_IDS && event.objectId == this._requestId) {
      this._showStreams();
      this._updateStatus();
    } else if (event.type == Backend.CacheChangeEvent.TYPE_REQUEST) {
      this._updateRequest();
      this._updateStatus();
    } else if (event.type == Backend.CacheChangeEvent.TYPE_NEGOTIATION_STREAM) {
      this._updateStream(event.objectId);
      this._updateStatus();
    }
  }.bind(this);
});


RequestDetailsPage.prototype.definePageContent = function(root) {
  AbstractDataPage.prototype.definePageContent.call(this, root);
  
  var contentPanel = UIUtils.appendBlock(root, "ContentPanel");
  
  var statusPanel = UIUtils.appendBlock(contentPanel, "RequestStatusPanel");
  UIUtils.appendLabel(statusPanel, "RequestStatusLabel", this.getLocale().StatusLabel);
  this._statusElement = UIUtils.appendBlock(statusPanel, "RequestStatus");
  
  
  this._requestPanel = UIUtils.appendBlock(contentPanel, "RequestPanel");
  this._streamsPanel = UIUtils.appendBlock(contentPanel, "StreamsPanel");
}

RequestDetailsPage.prototype.onShow = function(root, paramBundle) {
  AbstractDataPage.prototype.onShow.call(this, root);
  this._requestId = paramBundle.requestId;

  this._updateStatus();
  this._showRequest();
  this._showStreams();
  
  Backend.addCacheChangeListener(this._cacheChangeListener);
}

RequestDetailsPage.prototype.onHide = function() {
  AbstractDataPage.prototype.onHide.call(this);
  
  UIUtils.emptyContainer(this._requestPanel);
  UIUtils.emptyContainer(this._streamsPanel);
  
  this._requestObject.destroy();
  for (var i in this._streamObjects) {
    this._streamObjects[i].destroy();
  }
  this._streamObjects = [];
  
  Backend.removeCacheChangeListener(this._cacheChangeListener);
}

RequestDetailsPage.prototype.onDestroy = function() {
}



RequestDetailsPage.prototype._updateStatus = function() {
}

/*

RequestDetailsPage.prototype._getGrouppedOffers = function() {
  var offerIds = Backend.getOfferIds(this._requestId);
  if (offerIds == null) {
    return null;
  }

  if (offerIds.length == 0) {
    return [];
  }
  
  var offers = [];
  for (var i in offerIds) {
    var offer = Backend.getOffer(this._requestId, offerIds[i]);
    if (offer == null) {
      return null;
    } else {
      offers.push(offer);
    }
  }
  
  var grouppedOffers = {};
  for (var i in offers) {
    var offer = offers[i];
    if (offer.negotiations.length > 0) {
      var lastNegotiation = offer.negotiations[offer.negotiations.length - 1];
      if (!Backend.isOwnedNegotiation(lastNegotiation)) {
        if (grouppedOffers[lastNegotiation.type] == null) {
          grouppedOffers[lastNegotiation.type] = [];
        }
        grouppedOffers[lastNegotiation.type].push(offer);
      }
    } else if (!Backend.isOwnedOffer(offer)) {
      if (grouppedOffers["empty"] == null) {
        grouppedOffers["empty"] = [];
      }
      grouppedOffers["empty"].push(offer);
    }
  }
  
  return grouppedOffers;
}

RequestDetailsPage.prototype._updateStatus = function() {
  var request = Backend.getRequest(this._requestId);
  
  if (request.status == Backend.Request.STATUS_RECALLED) {
    this._statusElement.innerHTML = this.getLocale().StatusMessageRecalled;
    return;
  } else if (request.status == Backend.Request.STATUS_CLOSED) {
    this._statusElement.innerHTML = this.getLocale().StatusMessageClosed;
    return;
  }
  
  var offers = this._getGrouppedOffers();
  if (offers == null) {
    this._statusElement.innerHTML = this.getLocale().StatusMessageUpdating;
    return;
  }
  var types = Object.keys(offers);
  if (types.length == 0) {
    this._statusElement.innerHTML = this.getLocale().StatusMessageNoOffers;
    return;
  }
  
  if (types.length == 1 && types[0] == "empty") {
    this._statusElement.innerHTML = this.getLocale().StatusMessageOffersWaitingResponse;
  } else if (GeneralUtils.containsInArray(types, Backend.Negotiation.TYPE_CONFIRM)) {
    this._statusElement.innerHTML = this.getLocale().StatusMessageOfferConfirmed;
  } else if (GeneralUtils.containsInArray(types, Backend.Negotiation.TYPE_RECALL)) {
    this._statusElement.innerHTML = this.getLocale().StatusMessageOfferRecalled;
  } else {
    this._statusElement.innerHTML = this.getLocale().StatusMessageNewNegotiations;
  }
}

*/

RequestDetailsPage._RequestDetailsObject = ClassUtils.defineClass(AbstractRequestObject, function RequestDetailsObject(id) {
  AbstractRequestObject.call(this, id, "request-details");
});
                                               
RequestDetailsPage._RequestDetailsObject.prototype._appendRequestContent = function(root) {
  var request = Backend.getRequest(this.getId());
  
  var header = UIUtils.appendBlock(this.getElement(), "Header");

  var categoryElement = UIUtils.appendBlock(header, "Category");
  UIUtils.addClass(categoryElement, "request-category");
  categoryElement.innerHTML = request.category;
  var categoryItem = Application.Configuration.findConfigurationItem(Backend.getUserSettings().expertise_categories, request.category);
  if (categoryItem != null) {
    categoryElement.style.color = categoryItem.fg;
    categoryElement.style.backgroundColor = categoryItem.bg;
  }

  var dateElement = UIUtils.appendBlock(header, "Date");
  UIUtils.addClass(dateElement, "request-date");
  var date = new Date(request.creation_time);
  dateElement.innerHTML = date.toLocaleDateString() + " " + date.toLocaleTimeString();

  var nameElement = UIUtils.appendBlock(header, "Name");
  UIUtils.addClass(nameElement, "request-name");
  if (Backend.isOwnedRequest(request)) {
    nameElement.innerHTML = I18n.getLocale().literals.NameMe;
  } else {
    nameElement.innerHTML = request.user_name;
  }

  var textElement = UIUtils.appendBlock(this.getElement(), "Text");
  UIUtils.addClass(textElement, "request-text");
  textElement.innerHTML = request.text;

  if (!Backend.isOwnedRequest(request)) {
    var ratingElement = UIUtils.appendRatingBar(this.getElement(), "Rating");
    UIUtils.addClass(ratingElement, "request-rating");
    ratingElement.setRating(request.star_rating);
  }

  var whenAndHow = UIUtils.appendBlock(this.getElement(), "WhenAndHow");

  var getOnLabel = UIUtils.appendLabel(whenAndHow, "GetOnLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.GetOnLabel);
  UIUtils.addClass(getOnLabel, "request-geton-label");
  var getOnElement = UIUtils.appendBlock(whenAndHow, "GetOn");
  UIUtils.addClass(getOnElement, "request-geton");
  date = new Date(request.get_on);
  getOnElement.innerHTML = date.toLocaleDateString();

  var returnByLabel = UIUtils.appendLabel(whenAndHow, "ReturnByLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.ReturnByLabel);
  UIUtils.addClass(returnByLabel, "request-returnby-label");
  var returnByElement = UIUtils.appendBlock(whenAndHow, "ReturnBy");
  UIUtils.addClass(returnByElement, "request-returnby");
  date = new Date(request.return_by);
  returnByElement.innerHTML = date.toLocaleDateString();

  var pickupLabel = UIUtils.appendLabel(whenAndHow, "PickupLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.PickupLabel);
  UIUtils.addClass(pickupLabel, "request-pickup-label");
  var pickupElement = UIUtils.appendBlock(whenAndHow, "Pickup");
  UIUtils.addClass(pickupElement, "request-pickup");
  pickupElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PICKUP_OPTIONS, request.pickup);

  var payment = UIUtils.appendBlock(this.getElement(), "Payment");
  var paymentLabel = UIUtils.appendLabel(payment, "PaymentLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.PaymentLabel);
  UIUtils.addClass(paymentLabel, "request-payment-label");
  if (request.payment.payrate != Application.Configuration.PAYMENT_RATES[0].data) {
    var paymentElement = UIUtils.appendBlock(payment, "PayAmount");
    UIUtils.addClass(paymentElement, "request-payment");
    paymentElement.innerHTML = "$" + request.payment;
  }
  var payRateElement = UIUtils.appendBlock(payment, "Payrate");
  UIUtils.addClass(payRateElement, "request-payrate");
  payRateElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PAYMENT_RATES, request.payrate);
}

RequestDetailsPage.prototype._showRequest = function() {
  this._requestObject = new RequestDetailsPage._RequestDetailsObject(this._requestId);
  this._requestObject.append(this._requestPanel);
}

RequestDetailsPage.prototype._updateRequest = function() {
  this._requestObject.update();
}


RequestDetailsPage.prototype._showStreams = function() {
  var streamIds = Backend.getNegotiationStreamIds(this._requestId);
  if (streamIds == null) {
    return;
  }
  
  UIUtils.emptyContainer(this._streamsPanel);
  
  for (var i in this._streamObjects) {
    this._streamObjects[i].remove();
  }

  this._appendRequestControlPanel();

  if (streamIds.length > 0) {
    //TODO: sort streams
    for (var i in streamIds) {
      var streamObject = new RequestDetailsPage._NegotiationStreamObject(this._requestId, streamIds[i]);
      streamObject.append(this._streamsPanel);
      this._streamObjects.push(streamObject);
    }
  }
}

RequestDetailsPage.prototype._updateStream = function(streamId) {
  for (var i in this._streamObjects) {
    if (this._streamObjects[i].getId() == streamId) {
      this._streamObjects[i].update();
      break;
    }
  }
}

RequestDetailsPage.prototype._appendRequestControlPanel = function() {
  var controlPanel = UIUtils.appendBlock(this._requestPanel, "ControlPanel");

  var request = Backend.getRequest(this._requestId);
  if (Backend.isOwnedRequest(request)) {
    var recallRequestButton = UIUtils.appendButton(controlPanel, "RecallRequestButton", this.getLocale().RecallRequestButton, true);
    UIUtils.addClass(recallRequestButton, "left-control-button");
    UIUtils.setClickListener(recallRequestButton, function() {
      Dialogs.showRecallRequestDialog(this._requestObject);
    }.bind(this));
  } else {
    var streamIds = Backend.getNegotiationStreamIds(this._requestId);
    if (streamIds == null || streamIds.length > 0) {
      return;
    }
    
    var writeMessageButton = UIUtils.appendButton(controlPanel, "MessageButton", I18n.getLocale().dialogs.RequestDetailsDialog.MessageButton);
    UIUtils.addClass(writeMessageButton, "right-control-button");
    UIUtils.setClickListener(writeMessageButton, function() {
      Dialogs.showWriteMessageDialog(this._requestId);
    }.bind(this));

    var offerButton = UIUtils.appendButton(controlPanel, "MakeOfferButton", I18n.getLocale().dialogs.RequestDetailsDialog.OfferButton);
    UIUtils.addClass(offerButton, "right-control-button");
    UIUtils.setClickListener(offerButton, function() {
      Dialogs.showCreateNewOfferDialog(this._requestId);
    }.bind(this));
  }
}



RequestDetailsPage._NegotiationStreamObject = ClassUtils.defineClass(AbstractDataObject, function _NegotiationStreamObject(requestId, streamId) {
  AbstractDataObject.call(this, streamId, "stream");
  this._requestId = requestId;
  this._negotiationObjects = [];

  this._stream = Backend.getNegotiationStream(requestId, streamId);
  
  var negotiations = this._stream.negotiations;
  for (var i in negotiations) {
    var neg = negotiations[i];
    
    this._negotiationObjects.push(new RequestDetailsPage._NegotiationObject(i, neg));
  }
});
RequestDetailsPage._NegotiationStreamObject.prototype.remove = function() {
  AbstractDataObject.prototype.remove.call(this);
  
  for (var i in this._negotiationObjects) {
    this._negotiationObjects[i].remove();
  }
}
RequestDetailsPage._NegotiationStreamObject.prototype.destroy = function() {
  AbstractDataObject.prototype.destroy.call(this);

  for (var i in this._negotiationObjects) {
    this._negotiationObjects[i].destroy();
  }
  this._negotiationObjects = [];
}
RequestDetailsPage._NegotiationStreamObject.prototype.isClosable = function() {
  return true;
}
RequestDetailsPage._NegotiationStreamObject.prototype.close = function() {
  if (Backend.isOwnedStream(this._stream)) {
    Dialogs.showRecallStreamDialog(this, this._requestId, this.getId());
  } else {
    this.dismiss(function() {
      Backend.removeNegotiationStream(this._requestId, this.getId());
    }.bind(this));
  }
}
RequestDetailsPage._NegotiationStreamObject.prototype.update = function() {
  for (var i in this._negotiationObjects) {
    this._negotiationObjects[i].destroy();
  }
  this._negotiationObjects = [];
  
  var negotiations = this._stream.negotiations;
  for (var i in negotiations) {
    var neg = negotiations[i];
    
    this._negotiationObjects.push(new RequestDetailsPage._NegotiationObject(i, neg));
  }
  
  AbstractDataObject.prototype.update.call(this);
}
RequestDetailsPage._NegotiationStreamObject.prototype._appendContent = function(root) {
  var header = UIUtils.appendBlock(root, "Header");
  UIUtils.addClass(header, "stream-header");
  
  var nameElement = UIUtils.appendBlock(header, "Name");
  UIUtils.addClass(nameElement, "stream-name");
  if (Backend.isOwnedRequest(this._stream)) {
    nameElement.innerHTML = I18n.getLocale().literals.NameMe;
  } else {
    nameElement.innerHTML = this._stream.user_name;
    
    var ratingElement = UIUtils.appendRatingBar(this.getElement(), "Rating");
    UIUtils.addClass(ratingElement, "stream-rating");
    ratingElement.setRating(this._stream.star_rating);
  }

  
  
  for (var i in this._negotiationObjects) {
    this._negotiationObjects[i].append(root);
  }

  this.__appendStreamControlPanel();
}
RequestDetailsPage._NegotiationStreamObject.prototype.__appendStreamControlPanel = function() {
  var controlPanel = UIUtils.appendBlock(this.getElement(), "ControlPanel");

  if (Backend.isOwnedStream(this._stream)) {
    var recallStreamButton = UIUtils.appendButton(controlPanel, "CancelStreamButton", I18n.getLocale().pages.RequestDetailsPage.CancelStreamButton, true);
    UIUtils.addClass(recallStreamButton, "left-control-button");
    UIUtils.setClickListener(recallStreamButton, function() {
      Dialogs.showRecallStreamDialog(this, this._requestId, this.getId());
    }.bind(this));
    
    
    var writeMessageButton = UIUtils.appendButton(controlPanel, "MessageButton", I18n.getLocale().dialogs.RequestDetailsDialog.MessageButton);
    UIUtils.addClass(writeMessageButton, "right-control-button");
    UIUtils.setClickListener(writeMessageButton, function() {
      Dialogs.showWriteMessageDialog(this._requestId, this.getId());
    }.bind(this));

    var offerButton = UIUtils.appendButton(controlPanel, "MakeOfferButton", I18n.getLocale().dialogs.RequestDetailsDialog.OfferButton);
    UIUtils.addClass(offerButton, "right-control-button");
    UIUtils.setClickListener(offerButton, function() {
      Dialogs.showCreateNewOfferDialog(this._requestId, this.getId());
    }.bind(this));
  }
}




RequestDetailsPage._NegotiationObject = ClassUtils.defineClass(AbstractDataObject, function _NegotiationObject(id, negotiation) {
  AbstractDataObject.call(this, id, "negotiation");
  
  this._negotiation = negotiation;
});
RequestDetailsPage._NegotiationObject.prototype._appendContent = function(root) {
  if (this._negotiation.type == Backend.Negotiation.TYPE_MESSAGE) {
    UIUtils.addClass(root, "negotiation-message");

    if (Backend.isOwnedNegotiation(this._negotiation)) {
      UIUtils.addClass(root, "outgoing-negotiation-message");
    } else {
      UIUtils.addClass(root, "incoming-negotiation-message");
    }
    
    var dateElement = UIUtils.appendBlock(root, "Date");
    UIUtils.addClass(dateElement, "negotiation-date");
    var date = new Date(this._negotiation.creation_time);
    dateElement.innerHTML = date.toLocaleDateString() + " " + date.toLocaleTimeString();

    var nameElement = UIUtils.appendBlock(root, "Name");
    UIUtils.addClass(nameElement, "negotiation-name");
    if (Backend.isOwnedNegotiation(this._negotiation)) {
      nameElement.innerHTML = I18n.getLocale().literals.NameMe;
    } else {
      nameElement.innerHTML = this._negotiation.user_name;
    }

    var textElement = UIUtils.appendBlock(root, "Text");
    UIUtils.addClass(textElement, "negotiation-text");
    textElement.innerHTML = this._negotiation.text;
  }
}



/*

RequestDetailsPage._OfferObject.prototype._appendNegotiation = function(negId) {
  var offer = Backend.getOffer(this._requestId, this._offerId);
  var negotiation = offer.negotiations[negId];
  
  var isRequestersNegotiation = offer.user_id != negotiation.user_id;
  
  var negotiationElement = UIUtils.appendBlock(this.getElement(), "Negotiation" + negId);
  UIUtils.addClass(negotiationElement, "negotiation-details");
  
  if (Backend.isOwnedNegotiation(negotiation)) {
    UIUtils.addClass(negotiationElement, "outgoing-negotiation-details");
  } else {
    UIUtils.addClass(negotiationElement, "incoming-negotiation-details");
  }
  
  var header = UIUtils.appendBlock(negotiationElement, "Header");

  var dateElement = UIUtils.appendBlock(header, "Date");
  UIUtils.addClass(dateElement, "negotiation-date");
  var date = new Date(negotiation.creation_time);
  dateElement.innerHTML = date.toLocaleDateString() + " " + date.toLocaleTimeString();

  var nameElement = UIUtils.appendBlock(header, "Name");
  UIUtils.addClass(nameElement, "negotiation-name");
  if (Backend.isOwnedNegotiation(negotiation)) {
    nameElement.innerHTML = I18n.getLocale().literals.NameMe;
  } else {
    nameElement.innerHTML = negotiation.user_name;
  }

  if (negotiation.text != null && negotiation.text != "") {
    var textElement = UIUtils.appendBlock(negotiationElement, "Text");
    UIUtils.addClass(textElement, "negotiation-text");
    textElement.innerHTML = negotiation.text;
  }

  var whenAndHow = UIUtils.appendBlock(negotiationElement, "WhenAndHow");

  var getOnLabel = UIUtils.appendLabel(whenAndHow, "GetOnLabel", isRequestersNegotiation ? I18n.getLocale().dialogs.CreateNewRequestDialog.GetOnLabel : I18n.getLocale().dialogs.CreateNewOfferDialog.GetOnLabel);
  UIUtils.addClass(getOnLabel, "negotiation-geton-label");
  var getOnElement = UIUtils.appendBlock(whenAndHow, "GetOn");
  UIUtils.addClass(getOnElement, "negotiation-geton");
  date = new Date(negotiation.get_on);
  getOnElement.innerHTML = date.toLocaleDateString();

  var returnByLabel = UIUtils.appendLabel(whenAndHow, "ReturnByLabel", isRequestersNegotiation ? I18n.getLocale().dialogs.CreateNewRequestDialog.ReturnByLabel : I18n.getLocale().dialogs.CreateNewOfferDialog.ReturnByLabel);
  UIUtils.addClass(returnByLabel, "negotiation-returnby-label");
  var returnByElement = UIUtils.appendBlock(whenAndHow, "ReturnBy");
  UIUtils.addClass(returnByElement, "negotiation-returnby");
  date = new Date(negotiation.return_by);
  returnByElement.innerHTML = date.toLocaleDateString();

  var deliveryLabel = UIUtils.appendLabel(whenAndHow, "DeliveryLabel", isRequestersNegotiation ? I18n.getLocale().dialogs.CreateNewRequestDialog.PickupLabel : I18n.getLocale().dialogs.CreateNewOfferDialog.DeliveryLabel);
  UIUtils.addClass(deliveryLabel, "negotiation-delivery-label");
  var deliveryElement = UIUtils.appendBlock(whenAndHow, "Delivery");
  UIUtils.addClass(deliveryElement, "negotiation-delivery");
  deliveryElement.innerHTML = Application.Configuration.dataToString(isRequestersNegotiation ? Application.Configuration.PICKUP_OPTIONS : Application.Configuration.DELIVERY_OPTIONS, negotiation.delivery);
  
  var where = UIUtils.appendBlock(negotiationElement, "Where");
  if (negotiation.address != null && negotiation.address != "") {
    var addressLabel = UIUtils.appendLabel(where, "AddressLabel", Application.Configuration.DELIVERY_OPTIONS[0] ? this.getLocale().PickupAddressLabel : this.getLocale().DeliveryAddressLabel);
    UIUtils.addClass(addressLabel, "negotiation-address-label");
    var addressElement = UIUtils.appendBlock(where, "Address");
    UIUtils.addClass(addressElement, "negotiation-address");
    addressElement.innerHTML = negotiation.address;
  }
  
  
  var payment = UIUtils.appendBlock(negotiationElement, "Payment");
  var paymentLabel = UIUtils.appendLabel(payment, "PaymentLabel", isRequestersNegotiation ? I18n.getLocale().dialogs.CreateNewRequestDialog.PaymentLabel : I18n.getLocale().dialogs.CreateNewOfferDialog.PaymentLabel);
  UIUtils.addClass(paymentLabel, "negotiation-payment-label");
  if (negotiation.payment.payrate != Application.Configuration.PAYMENT_RATES[0].data) {
    var paymentElement = UIUtils.appendBlock(payment, "PayAmount");
    UIUtils.addClass(paymentElement, "negotiation-payment");
    paymentElement.innerHTML = "$" + negotiation.payment;
  }
  var payRateElement = UIUtils.appendBlock(payment, "Payrate");
  UIUtils.addClass(payRateElement, "negotiation-payrate");
  payRateElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PAYMENT_RATES, negotiation.payrate);
  
  if (!isRequestersNegotiation) {
    var depositLabel = UIUtils.appendLabel(payment, "DepositLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.DepositLabel);
    UIUtils.addClass(depositLabel, "negotiation-deposit-label");
    var depositElement = UIUtils.appendBlock(payment, "Deposit");
    UIUtils.addClass(depositElement, "negotiation-deposit");
    depositElement.innerHTML = "$" + negotiation.deposit;
  }
}


RequestDetailsPage._OfferObject.prototype._appendOfferControlPanel = function() {
  var offer = Backend.getOffer(this._requestId, this._offerId);
  
  var controlPanel = UIUtils.appendBlock(this.getElement(), "ControlPanel");
  UIUtils.addClass(controlPanel, "offer-control-panel");

  var actions = this._getApplicableActions(offer);
  
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_RECALL)) {
    var recallButton = UIUtils.appendButton(controlPanel, "RecallOfferButton", I18n.getLocale().pages.RequestDetailsPage.RecallOfferButton, true);
    UIUtils.addClass(recallButton, "left-control-button");
    UIUtils.setClickListener(recallButton, function() {
      Dialogs.showRecallOfferDialog(this, this._requestId, this._offerId);
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_NEGOTIATE)) {
    var negotiateButton = UIUtils.appendButton(controlPanel, "NegotiateButton", I18n.getLocale().pages.RequestDetailsPage.NegotiateButton);
    UIUtils.addClass(negotiateButton, "right-control-button");
    UIUtils.setClickListener(negotiateButton, function() {
      if (Backend.isOwnedOffer(offer)) {
        Dialogs.showNegotiateRequestDialog(this._requestId, this._offerId, offer);
      } else {
        Dialogs.showNegotiateOfferDialog(this._requestId, this._offerId, offer);
      }
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_ACCEPT)) {
    var acceptButton = UIUtils.appendButton(controlPanel, "AcceptButton", I18n.getLocale().pages.RequestDetailsPage.AcceptButton);
    UIUtils.addClass(acceptButton, "right-control-button");
    UIUtils.setClickListener(acceptButton, function() {
      Dialogs.showAcceptOfferDialog(this._offerId, offer);
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_DECLINE)) {
    var declineButton = UIUtils.appendButton(controlPanel, "DeclineButton", I18n.getLocale().pages.RequestDetailsPage.DeclineButton, true);
    UIUtils.addClass(declineButton, "left-control-button");
    UIUtils.setClickListener(declineButton, function() {
      Backend.declineOffer(this._requestId, this._offerId);
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_CONFIRM)) {
    var confirmButton = UIUtils.appendButton(controlPanel, "ConfirmButton", I18n.getLocale().literals.ConfirmButton);
    UIUtils.addClass(confirmButton, "right-control-button");
    UIUtils.setClickListener(confirmButton, function() {
      Dialogs.showConfirmOfferDialog(this._requestId, this._offerId);
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_DELIVERY)) {
    var confirmDeliveryButton = UIUtils.appendButton(controlPanel, "ConfirmDeliveryButton", I18n.getLocale().pages.RequestDetailsPage.ConfirmDeliveryButton);
    UIUtils.addClass(confirmDeliveryButton, "right-control-button");
    UIUtils.setClickListener(confirmDeliveryButton, function() {
      Backend.addNegotiation(this._requestId, this._offerId, Backend.Negotiation.TYPE_DELIVERY);
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_DELIVERY_ACCEPT)) {
    var acceptDeliveryButton = UIUtils.appendButton(controlPanel, "AcceptDeliveryButton", I18n.getLocale().pages.RequestDetailsPage.AcceptDeliveryButton);
    UIUtils.addClass(acceptDeliveryButton, "right-control-button");
    UIUtils.setClickListener(acceptDeliveryButton, function() {
      Backend.addNegotiation(this._requestId, this._offerId, Backend.Negotiation.TYPE_DELIVERY_ACCEPT);
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_RETURN)) {
    var confirmReturnButton = UIUtils.appendButton(controlPanel, "ConfirmReturnButton", I18n.getLocale().pages.RequestDetailsPage.ConfirmReturnButton);
    UIUtils.addClass(confirmReturnButton, "right-control-button");
    UIUtils.setClickListener(confirmReturnButton, function() {
      Backend.addNegotiation(this._requestId, this._offerId, Backend.Negotiation.TYPE_RETURN);
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_CLOSE)) {
    var acceptReturnButton = UIUtils.appendButton(controlPanel, "AcceptReturnButton", I18n.getLocale().pages.RequestDetailsPage.AcceptReturnButton);
    UIUtils.addClass(acceptReturnButton, "right-control-button");
    UIUtils.setClickListener(acceptReturnButton, function() {
      Backend.addNegotiation(this._requestId, this._offerId, Backend.Negotiation.TYPE_CLOSE);
    }.bind(this));
  }
}


RequestDetailsPage._OfferObject.prototype._getApplicableActions = function(offer) {
  if (!Backend.isOfferActive(offer)) {
    return [];
  }
  
  if (offer.negotiations.length == 0) {
    if (Backend.isOwnedOffer(offer)) {
      return [Backend.Negotiation.TYPE_RECALL, Backend.Negotiation.TYPE_NEGOTIATE]; 
    } else {
      return [Backend.Negotiation.TYPE_ACCEPT, Backend.Negotiation.TYPE_DECLINE, Backend.Negotiation.TYPE_NEGOTIATE]; 
    }
  } else {
    var lastNegotiation = offer.negotiations[offer.negotiations.length - 1];
    if (lastNegotiation.type == Backend.Negotiation.TYPE_NEGOTIATE) {
      if (Backend.isOwnedNegotiation(lastNegotiation)) {
        return [Backend.Negotiation.TYPE_RECALL, Backend.Negotiation.TYPE_NEGOTIATE];
      } else {
        return [Backend.Negotiation.TYPE_ACCEPT, Backend.Negotiation.TYPE_DECLINE];
      }
    } else if (lastNegotiation.type == Backend.Negotiation.TYPE_ACCEPT) {
      if (Backend.isOwnedNegotiation(lastNegotiation)) {
        return [Backend.Negotiation.TYPE_RECALL];
      } else {
        return [Backend.Negotiation.TYPE_CONFIRM, Backend.Negotiation.TYPE_DECLINE];
      }
    } else if (lastNegotiation.type == Backend.Negotiation.TYPE_CONFIRM) {
      if (Backend.isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_DELIVERY
          || !Backend.isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_PICKUP) {
        
        return [Backend.Negotiation.TYPE_DELIEVRY];
      } else {
        return [];
      }
    } else if (lastNegotiation.type == Backend.Negotiation.TYPE_DELIVERY) {
      if (Backend.isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_PICKUP
          || !Backend.isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_DELIEVRY) {
        
        return [Backend.Negotiation.TYPE_DELIEVRY_ACCEPT];
      } else {
        return [];
      }
    } else if (lastNegotiation.type == Backend.Negotiation.TYPE_DELIVERY_ACCEPT) {
      if (Backend.isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_PICKUP
          || !Backend.isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_DELIEVRY) {
        
        return [Backend.Negotiation.TYPE_DELIEVRY_RETURN];
      } else {
        return [];
      }
    } else if (lastNegotiation.type == Backend.Negotiation.TYPE_DELIEVRY_RETURN) {
      if (Backend.isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_DELIVERY
          || !Backend.isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_PICKUP) {
        
        return [Backend.Negotiation.TYPE_CLOSE];
      } else {
        return [];
      }
    } else {
      return [];
    }
  }
}

                                                         
                                                         

RequestDetailsPage._OfferDetailsObject = ClassUtils.defineClass(AbstractOfferObject, function OfferDetailsObject(requestId, offerId) {
  AbstractOfferObject.call(this, requestId, offerId, "offer-details");
});
                                               
RequestDetailsPage._OfferDetailsObject.prototype._appendOfferContent = function(root) {
  var offer = Backend.getOffer(this._requestId, this.getId());
  if (offer == null) {
    return;
  }
  
  var header = UIUtils.appendBlock(this.getElement(), "Header");

  var dateElement = UIUtils.appendBlock(header, "Date");
  UIUtils.addClass(dateElement, "offer-date");
  var date = new Date(offer.creation_time);
  dateElement.innerHTML = date.toLocaleDateString() + " " + date.toLocaleTimeString();

  var nameElement = UIUtils.appendBlock(header, "Name");
  UIUtils.addClass(nameElement, "offer-name");
  if (Backend.isOwnedOffer(offer)) {
    nameElement.innerHTML = I18n.getLocale().literals.NameMe;
  } else {
    nameElement.innerHTML = offer.user_name;
  }

  var textElement = UIUtils.appendBlock(this.getElement(), "Text");
  UIUtils.addClass(textElement, "offer-text");
  textElement.innerHTML = offer.text;

  if (!Backend.isOwnedOffer(offer)) {
    var ratingElement = UIUtils.appendRatingBar(this.getElement(), "Rating");
    UIUtils.addClass(ratingElement, "offer-rating");
    ratingElement.setRating(offer.star_rating);
  }
  
  if (offer.attachments != null && offer.attachments.length > 0) {
    var attachmentBar = UIUtils.appendAttachmentBar(this.getElement(), "AttachmentBar", offer.attachments, false);
    UIUtils.addClass(attachmentBar, "offer-attachments");
  }
  
  
  var whenAndHow = UIUtils.appendBlock(this.getElement(), "WhenAndHow");

  var getOnLabel = UIUtils.appendLabel(whenAndHow, "GetOnLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.GetOnLabel);
  UIUtils.addClass(getOnLabel, "offer-geton-label");
  var getOnElement = UIUtils.appendBlock(whenAndHow, "GetOn");
  UIUtils.addClass(getOnElement, "offer-geton");
  date = new Date(offer.get_on);
  getOnElement.innerHTML = date.toLocaleDateString();

  var returnByLabel = UIUtils.appendLabel(whenAndHow, "ReturnByLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.ReturnByLabel);
  UIUtils.addClass(returnByLabel, "offer-returnby-label");
  var returnByElement = UIUtils.appendBlock(whenAndHow, "ReturnBy");
  UIUtils.addClass(returnByElement, "offer-returnby");
  date = new Date(offer.return_by);
  returnByElement.innerHTML = date.toLocaleDateString();

  var deliveryLabel = UIUtils.appendLabel(whenAndHow, "DeliveryLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.DeliveryLabel);
  UIUtils.addClass(deliveryLabel, "offer-delivery-label");
  var deliveryElement = UIUtils.appendBlock(whenAndHow, "Delivery");
  UIUtils.addClass(deliveryElement, "offer-delivery");
  deliveryElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.DELIVERY_OPTIONS, offer.delivery);

  
  var where = UIUtils.appendBlock(this.getElement(), "Where");
  
  var zipLabel = UIUtils.appendLabel(where, "ZipLabel", I18n.getLocale().pages.RequestDetailsPage.ZipLabel);
  UIUtils.addClass(zipLabel, "offer-zip-label");
  var zipElement = UIUtils.appendBlock(where, "Zip");
  UIUtils.addClass(zipElement, "offer-zip");
  zipElement.innerHTML = offer.zipcode;
  
  var distanceLabel = UIUtils.appendLabel(where, "DistanceLabel", I18n.getLocale().pages.RequestDetailsPage.DistanceLabel);
  UIUtils.addClass(distanceLabel, "offer-distance-label");
  var distanceElement = UIUtils.appendBlock(where, "Distance");
  UIUtils.addClass(distanceElement, "offer-distance");
  distanceElement.innerHTML = I18n.getLocale().pages.RequestDetailsPage.DistanceProvider(offer.distance);
  
  
  var payment = UIUtils.appendBlock(this.getElement(), "Payment");
  var paymentLabel = UIUtils.appendLabel(payment, "PaymentLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.PaymentLabel);
  UIUtils.addClass(paymentLabel, "offer-payment-label");
  if (offer.payment.payrate != Application.Configuration.PAYMENT_RATES[0].data) {
    var paymentElement = UIUtils.appendBlock(payment, "PayAmount");
    UIUtils.addClass(paymentElement, "offer-payment");
    paymentElement.innerHTML = "$" + offer.payment;
  }
  var payRateElement = UIUtils.appendBlock(payment, "Payrate");
  UIUtils.addClass(payRateElement, "offer-payrate");
  payRateElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PAYMENT_RATES, offer.payrate);
  
  var depositLabel = UIUtils.appendLabel(payment, "DepositLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.DepositLabel);
  UIUtils.addClass(depositLabel, "offer-deposit-label");
  
  var depositElement = UIUtils.appendBlock(payment, "Deposit");
  UIUtils.addClass(depositElement, "offer-deposit");
  depositElement.innerHTML = "$" + offer.deposit;
}
*/





