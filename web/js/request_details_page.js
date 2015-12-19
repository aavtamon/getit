RequestDetailsPage = ClassUtils.defineClass(AbstractDataPage, function RequestDetailsPage() {
  AbstractDataPage.call(this, RequestDetailsPage.name);

  this._requestPanel;
  this._offersPanel;
  this._requestId;
  this._statusElement;
  this._signing = false;
  
  this._cacheChangeListener = function(event) {
    if (event.type == Backend.CacheChangeEvent.TYPE_OUTGOING_REQUESTS_CHANGED) {
      if (!GeneralUtils.containsInArray(Backend.getOutgoingRequestIds(), event.requestId)) {
        Application.goBack();
      }
    } else if (event.type == Backend.CacheChangeEvent.TYPE_OUTGOING_RESPONSES_CHANGED && event.requestId == this._requestId) {
      this._updateStatus();
    } else if (event.type == Backend.CacheChangeEvent.TYPE_RESPONSE_CHANGED) {
      this._updateOffer(event.responseId);
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
  this._offersPanel = UIUtils.appendBlock(contentPanel, "OffersPanel");
}

RequestDetailsPage.prototype.onShow = function(root, paramBundle) {
  AbstractDataPage.prototype.onShow.call(this, root);
  this._requestId = paramBundle.requestId;

  this._updateStatus();
  this._appendRequest();
  
  Backend.addCacheChangeListener(this._cacheChangeListener);
}

RequestDetailsPage.prototype.onHide = function() {
  AbstractDataPage.prototype.onHide.call(this);
  
  UIUtils.emptyContainer(this._requestPanel);
  UIUtils.emptyContainer(this._offersPanel);
  
  Backend.removeCacheChangeListener(this._cacheChangeListener);
}

RequestDetailsPage.prototype.onDestroy = function() {
}




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
      if (!RequestDetailsPage._isOwnedNegotiation(lastNegotiation)) {
        if (grouppedOffers[lastNegotiation.type] == null) {
          grouppedOffers[lastNegotiation.type] = [];
        }
        grouppedOffers[lastNegotiation.type].push(offer);
      }
    } else if (!RequestDetailsPage._isOwnedOffer(offer)) {
      if (grouppedOffers["empty"] == null) {
        grouppedOffers["empty"] = [];
      }
      grouppedOffers["empty"].push(offer);
    }
  }
  
  return grouppedOffers;
}

RequestDetailsPage.prototype._updateStatus = function() {
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


RequestDetailsPage.prototype._appendRequest = function() {
  UIUtils.appendBlock(this._requestPanel, this._requestId);
  this._updateRequest();


  var offers = Backend.getOfferIds(this._requestId);
  if (offers == null) {
    return;
  }

  //sort offers
  for (var i in offers) {
    var offerPanel = UIUtils.appendBlock(this._offersPanel, offers[i]);
    this._updateOffer(offers[i]);
  }
}

RequestDetailsPage.prototype._updateRequest = function() {
  var request = Backend.getRequest(this._requestId);
  if (request == null) {
    return;
  }
  
  var requestElement = document.getElementById(UIUtils.createId(this._requestPanel, this._requestId));
  if (requestElement == null) {
    return;
  }
  UIUtils.emptyContainer(requestElement);

  UIUtils.addClass(requestElement, "request-details");
  
  var requestCloser = UIUtils.appendXCloser(requestElement, "Closer");
  UIUtils.addClass(requestCloser, "request-closer");
  UIUtils.setClickListener(requestCloser, function() {
    if (HomePage._isOwnedRequest(request)) {
      UIUtils.showDialog(this.getLocale().RecallRequest, this.getLocale().RecallRequestText, {
        ok: {
          display: this.getLocale().ConfirmButton,
          listener: function() {
            UIUtils.fadeOut(requestElement, null, function() {
              Backend.removeRequest(requestId);
            });
          }
        },
        cancel: {
          display: I18n.getLocale().literals.CancelOperationButton,
          alignment: "left"
        }
      });
    } else {
      UIUtils.fadeOut(requestElement, null, function() {
        Backend.removeRequest(requestId);
      });
    }
    
    return false; 
  }.bind(this));
  
  if (HomePage._isOwnedRequest(request)) {
    UIUtils.addClass(requestElement, "outgoing-request-details");
  } else {
    UIUtils.addClass(requestElement, "incoming-request-details");
  }
  
  
  var header = UIUtils.appendBlock(requestElement, "Header");

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
  var date = new Date(request.timestamp);
  dateElement.innerHTML = date.toLocaleDateString() + " " + date.toLocaleTimeString();

  var nameElement = UIUtils.appendBlock(header, "Name");
  UIUtils.addClass(nameElement, "request-name");
  if (HomePage._isOwnedRequest(request)) {
    nameElement.innerHTML = this.getLocale().RequestNameMe;
  } else {
    nameElement.innerHTML = request.user_name;
  }

  var textElement = UIUtils.appendBlock(requestElement, "Text");
  UIUtils.addClass(textElement, "request-text");
  textElement.innerHTML = request.text;

  if (!HomePage._isOwnedRequest(request)) {
    var ratingElement = UIUtils.appendRatingBar(requestElement, "Rating");
    UIUtils.addClass(ratingElement, "request-rating");
    ratingElement.setRating(request.star_rating);
  }

  var whenAndHow = UIUtils.appendBlock(requestElement, "WhenAndHow");

  var getOnLabel = UIUtils.appendLabel(whenAndHow, "GetOnLabel", I18n.getLocale().pages.HomePage.RequestGetOnLabel);
  UIUtils.addClass(getOnLabel, "request-geton-label");
  var getOnElement = UIUtils.appendBlock(whenAndHow, "GetOn");
  UIUtils.addClass(getOnElement, "request-geton");
  date = new Date(request.get_on);
  getOnElement.innerHTML = date.toLocaleDateString();

  var returnByLabel = UIUtils.appendLabel(whenAndHow, "ReturnByLabel", I18n.getLocale().pages.HomePage.RequestReturnByLabel);
  UIUtils.addClass(returnByLabel, "request-returnby-label");
  var returnByElement = UIUtils.appendBlock(whenAndHow, "ReturnBy");
  UIUtils.addClass(returnByElement, "request-returnby");
  date = new Date(request.return_by);
  returnByElement.innerHTML = date.toLocaleDateString();

  var pickupLabel = UIUtils.appendLabel(whenAndHow, "PickupLabel", I18n.getLocale().pages.HomePage.RequestPickupLabel);
  UIUtils.addClass(pickupLabel, "request-pickup-label");
  var pickupElement = UIUtils.appendBlock(whenAndHow, "Pickup");
  UIUtils.addClass(pickupElement, "request-pickup");
  pickupElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PICKUP_OPTIONS, request.pickup);

  var payment = UIUtils.appendBlock(requestElement, "Payment");
  var paymentLabel = UIUtils.appendLabel(payment, "PaymentLabel", I18n.getLocale().pages.HomePage.RequestPaymentLabel);
  UIUtils.addClass(paymentLabel, "request-payment-label");
  if (request.payment.payrate != Application.Configuration.PAYMENT_RATES[0].data) {
    var paymentElement = UIUtils.appendBlock(payment, "PayAmount");
    UIUtils.addClass(paymentElement, "request-payment");
    paymentElement.innerHTML = "$" + request.payment.payment;
  }
  var payRateElement = UIUtils.appendBlock(payment, "Payrate");
  UIUtils.addClass(payRateElement, "request-payrate");
  payRateElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PAYMENT_RATES, request.payment.payrate);
}


RequestDetailsPage.prototype._updateOffer = function(offerId) {
  var offer = Backend.getOffer(this._requestId, offerId);
  if (offer == null) {
    return;
  }
  
  var offerPanel = document.getElementById(UIUtils.createId(this._offersPanel, offerId));
  if (offerPanel == null) {
    return;
  }
  
  UIUtils.emptyContainer(offerPanel);
  
  var offerElement = UIUtils.appendBlock(offerPanel, "Offer");
  this._appendOffer(offerElement, offerId, offer);
  
  this._appendNegotiations(offerPanel, offer);
  
  this._appendControlPanel(offerPanel, offerId, offer);
}

RequestDetailsPage.prototype._appendOffer = function(offerElement, offerId, offer) {
  UIUtils.addClass(offerElement, "offer-details");
  
  //TBD - possible race condition if you dismiss your own offer whie someone is accepting it
  if (offer.negotiations.length == 0) {
    var offerCloser = UIUtils.appendXCloser(offerElement, "Closer");
    UIUtils.addClass(offerCloser, "offer-closer");
    UIUtils.setClickListener(offerCloser, function() {
      if (RequestDetailsPage._isOwnedOffer(offer)) {
        UIUtils.showDialog(this.getLocale().RecallOffer, this.getLocale().RecallOfferText, {
          ok: {
            display: this.getLocale().ConfirmButton,
            listener: function() {
              UIUtils.fadeOut(offerElement, null, function() {
                Backend.removeOffer(offerId);
              });
            }
          },
          cancel: {
            display: I18n.getLocale().literals.CancelOperationButton,
            alignment: "left"
          }
        });
      } else {
        UIUtils.fadeOut(offerElement, null, function() {
          Backend.removeOffer(offerId);
        });
      }
    
      return false; 
    }.bind(this));
  }
  
  if (RequestDetailsPage._isOwnedOffer(offer)) {
    UIUtils.addClass(offerElement, "outgoing-offer-details");
  } else {
    UIUtils.addClass(offerElement, "incoming-offer-details");
  }
  
  
  var header = UIUtils.appendBlock(offerElement, "Header");

  var dateElement = UIUtils.appendBlock(header, "Date");
  UIUtils.addClass(dateElement, "offer-date");
  var date = new Date(offer.timestamp);
  dateElement.innerHTML = date.toLocaleDateString() + " " + date.toLocaleTimeString();

  var nameElement = UIUtils.appendBlock(header, "Name");
  UIUtils.addClass(nameElement, "offer-name");
  if (RequestDetailsPage._isOwnedOffer(offer)) {
    nameElement.innerHTML = this.getLocale().OfferNameMe;
  } else {
    nameElement.innerHTML = request.user_name;
  }

  var textElement = UIUtils.appendBlock(offerElement, "Text");
  UIUtils.addClass(textElement, "offer-text");
  textElement.innerHTML = offer.text;

  if (!RequestDetailsPage._isOwnedOffer(offer)) {
    var ratingElement = UIUtils.appendRatingBar(offerElement, "Rating");
    UIUtils.addClass(ratingElement, "offer-rating");
    ratingElement.setRating(offer.star_rating);
  }
  
  if (offer.attachments != null && offer.attachments.length > 0) {
    var attachmentBar = UIUtils.appendAttachmentBar(offerElement, "AttachmentBar", offer.attachments, false);
    UIUtils.addClass(attachmentBar, "offer-attachments");
  }
  
  var whenAndHow = UIUtils.appendBlock(offerElement, "WhenAndHow");

  var getOnLabel = UIUtils.appendLabel(whenAndHow, "GetOnLabel", I18n.getLocale().pages.HomePage.OfferGetOnLabel);
  UIUtils.addClass(getOnLabel, "offer-geton-label");
  var getOnElement = UIUtils.appendBlock(whenAndHow, "GetOn");
  UIUtils.addClass(getOnElement, "offer-geton");
  date = new Date(offer.get_on);
  getOnElement.innerHTML = date.toLocaleDateString();

  var returnByLabel = UIUtils.appendLabel(whenAndHow, "ReturnByLabel", I18n.getLocale().pages.HomePage.OfferReturnByLabel);
  UIUtils.addClass(returnByLabel, "offer-returnby-label");
  var returnByElement = UIUtils.appendBlock(whenAndHow, "ReturnBy");
  UIUtils.addClass(returnByElement, "offer-returnby");
  date = new Date(offer.return_by);
  returnByElement.innerHTML = date.toLocaleDateString();

  var deliveryLabel = UIUtils.appendLabel(whenAndHow, "DeliveryLabel", I18n.getLocale().pages.HomePage.OfferDeliveryLabel);
  UIUtils.addClass(deliveryLabel, "offer-delivery-label");
  var deliveryElement = UIUtils.appendBlock(whenAndHow, "Delivery");
  UIUtils.addClass(deliveryElement, "offer-delivery");
  deliveryElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.DELIVERY_OPTIONS, offer.delivery);

  
  var where = UIUtils.appendBlock(offerElement, "Where");
  
  var zipLabel = UIUtils.appendLabel(where, "ZipLabel", this.getLocale().ZipLabel);
  UIUtils.addClass(zipLabel, "offer-zip-label");
  var zipElement = UIUtils.appendBlock(where, "Zip");
  UIUtils.addClass(zipElement, "offer-zip");
  zipElement.innerHTML = offer.zipcode;
  
  var distanceLabel = UIUtils.appendLabel(where, "DistanceLabel", this.getLocale().DistanceLabel);
  UIUtils.addClass(distanceLabel, "offer-distance-label");
  var distanceElement = UIUtils.appendBlock(where, "Distance");
  UIUtils.addClass(distanceElement, "offer-distance");
  distanceElement.innerHTML = offer.distance;
  
  
  var payment = UIUtils.appendBlock(offerElement, "Payment");
  var paymentLabel = UIUtils.appendLabel(payment, "PaymentLabel", I18n.getLocale().pages.HomePage.OfferPaymentLabel);
  UIUtils.addClass(paymentLabel, "offer-payment-label");
  if (offer.payment.payrate != Application.Configuration.PAYMENT_RATES[0].data) {
    var paymentElement = UIUtils.appendBlock(payment, "PayAmount");
    UIUtils.addClass(paymentElement, "offer-payment");
    paymentElement.innerHTML = "$" + offer.payment.payment;
  }
  var payRateElement = UIUtils.appendBlock(payment, "Payrate");
  UIUtils.addClass(payRateElement, "offer-payrate");
  payRateElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PAYMENT_RATES, offer.payment.payrate);
  
  var depositLabel = UIUtils.appendLabel(payment, "DepositLabel", I18n.getLocale().pages.HomePage.OfferDepositLabel);
  UIUtils.addClass(depositLabel, "offer-deposit-label");
  
  var depositElement = UIUtils.appendBlock(payment, "Deposit");
  UIUtils.addClass(depositElement, "offer-deposit");
  depositElement.innerHTML = "$" + offer.payment.deposit;
}

RequestDetailsPage.prototype._appendNegotiations = function(root, offer) {
  for (var i in offer.negotiations) {
    var negotiation = offer.negotiations[i];
    var requestersNegotiation = offer.user_id != negotiation.user_id;
    
    this._appendNegotiation(root, i, negotiation, requestersNegotiation);
  }
}

RequestDetailsPage.prototype._appendNegotiation = function(root, negId, negotiation, isRequestersNegotiation) {
  var negotiationElement = UIUtils.appendBlock(root, "Negotiation" + negId);
  
  if (RequestDetailsPage._isOwnedNegotiation(negotiation)) {
    UIUtils.addClass(negotiationElement, "outgoing-negotiation");
  } else {
    UIUtils.addClass(negotiationElement, "incoming-negotiation");
  }
  
  
  var header = UIUtils.appendBlock(negotiationElement, "Header");

  var dateElement = UIUtils.appendBlock(header, "Date");
  UIUtils.addClass(negotiationElement, "negotiation-date");
  var date = new Date(negotiation.timestamp);
  dateElement.innerHTML = date.toLocaleDateString() + " " + date.toLocaleTimeString();

  var nameElement = UIUtils.appendBlock(header, "Name");
  UIUtils.addClass(nameElement, "negotiation-name");
  if (RequestDetailsPage._isOwnedNegotiation(negotiation)) {
    nameElement.innerHTML = this.getLocale().OfferNameMe;
  } else {
    nameElement.innerHTML = negotiation.user_name;
  }

  if (negotiation.text != null && negotiation.text != "") {
    var textElement = UIUtils.appendBlock(negotiationElement, "Text");
    UIUtils.addClass(textElement, "negotiation-text");
    textElement.innerHTML = offer.text;
  }

  var whenAndHow = UIUtils.appendBlock(negotiationElement, "WhenAndHow");

  var getOnLabel = UIUtils.appendLabel(whenAndHow, "GetOnLabel", isRequestersNegotiation ? I18n.getLocale().pages.HomePage.RequestGetOnLabel : I18n.getLocale().pages.HomePage.OfferGetOnLabel);
  UIUtils.addClass(getOnLabel, "negotiation-geton-label");
  var getOnElement = UIUtils.appendBlock(whenAndHow, "GetOn");
  UIUtils.addClass(getOnElement, "negotiation-geton");
  date = new Date(negotiation.get_on);
  getOnElement.innerHTML = date.toLocaleDateString();

  var returnByLabel = UIUtils.appendLabel(whenAndHow, "ReturnByLabel", isRequestersNegotiation ? I18n.getLocale().pages.HomePage.RequestReturnByLabel : I18n.getLocale().pages.HomePage.OfferReturnByLabel);
  UIUtils.addClass(returnByLabel, "negotiation-returnby-label");
  var returnByElement = UIUtils.appendBlock(whenAndHow, "ReturnBy");
  UIUtils.addClass(returnByElement, "negotation-returnby");
  date = new Date(offer.return_by);
  returnByElement.innerHTML = date.toLocaleDateString();

  var deliveryLabel = UIUtils.appendLabel(whenAndHow, "DeliveryLabel", isRequestersNegotiation ? I18n.getLocale().pages.HomePage.RequestPickupLabel : I18n.getLocale().pages.HomePage.OfferDeliveryLabel);
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
  var paymentLabel = UIUtils.appendLabel(payment, "PaymentLabel", isRequestersNegotiation ? I18n.getLocale().pages.HomePage.RequestPaymentLabel : I18n.getLocale().pages.HomePage.OfferPaymentLabel);
  UIUtils.addClass(paymentLabel, "negotiation-payment-label");
  if (offer.payment.payrate != Application.Configuration.PAYMENT_RATES[0].data) {
    var paymentElement = UIUtils.appendBlock(payment, "PayAmount");
    UIUtils.addClass(paymentElement, "negotiation-payment");
    paymentElement.innerHTML = "$" + offer.payment.payment;
  }
  var payRateElement = UIUtils.appendBlock(payment, "Payrate");
  UIUtils.addClass(payRateElement, "negotiation-payrate");
  payRateElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PAYMENT_RATES, offer.payment.payrate);
  
  if (!isRequestersNegotiation) {
    var depositLabel = UIUtils.appendLabel(payment, "DepositLabel", I18n.getLocale().pages.HomePage.OfferDepositLabel);
    UIUtils.addClass(depositLabel, "negotiation-deposit-label");
    var depositElement = UIUtils.appendBlock(payment, "Deposit");
    UIUtils.addClass(depositElement, "offer-deposit");
    depositElement.innerHTML = "$" + offer.payment.deposit;
  }
}


RequestDetailsPage.prototype._appendControlPanel = function(root, offerId, offer) {
  var controlPanel = UIUtils.appendBlock(root, "ControlPanel");
  UIUtils.addClass(controlPanel, "offer-control-panel");

  var actions = this._getApplicableActions(offer);
  
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_RECALL)) {
    var recallButton = UIUtils.appendButton(controlPanel, "RecallButton", this.getLocale().RecallButton);
    UIUtils.setClickListener(recallButton, function() {
      UIUtils.showDialog(this.getLocale().RecallOffer, this.getLocale().RecallOfferText, {
        ok: {
          display: this.getLocale().ConfirmButton,
          listener: function() {
            Backend.recallOffer(this._requestId, offerId);
          }
        },
        cancel: {
          display: I18n.getLocale().literals.CancelOperationButton,
          alignment: "left"
        }
      });
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_NEGOTIATE)) {
    var negotiateButton = UIUtils.appendButton(controlPanel, "NegotiateButton", this.getLocale().NegotiateButton);
    UIUtils.setClickListener(negotiateButton, function() {
      this._showNegotiateDialog(offerId, offer);
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_ACCEPT)) {
    var acceptButton = UIUtils.appendButton(controlPanel, "AcceptButton", this.getLocale().AcceptButton);
    UIUtils.setClickListener(acceptButton, function() {
      this._showAcceptOfferDialog(offerId, offer);
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_DECLINE)) {
    var declineButton = UIUtils.appendButton(controlPanel, "DeclineButton", this.getLocale().DeclineButton);
    UIUtils.setClickListener(declineButton, function() {
      Backend.declineOffer(this._requestId, offerId);
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_CONFIRM)) {
    var confirmButton = UIUtils.appendButton(controlPanel, "ConfirmButton", this.getLocale().ConfirmButton);
    UIUtils.setClickListener(confirmButton, function() {
      UIUtils.showDialog(this.getLocale().ConfirmOffer, this.getLocale().ConfirmOfferTextProvider(), {
        ok: {
          display: this.getLocale().ConfirmOfferButton,
          listener: function() {
            Backend.addNegotiation(this._requestId, offerId, Backend.Negotiation.TYPE_CONFIRM);
          }
        },
        cancel: {
          display: I18n.getLocale().literals.CancelOperationButton,
          alignment: "left"
        }
      });
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_DELIVERY)) {
    var confirmDeliveryButton = UIUtils.appendButton(controlPanel, "ConfirmDeliveryButton", this.getLocale().ConfirmDeliveryButton);
    UIUtils.setClickListener(confirmDeliveryButton, function() {
      Backend.addNegotiation(this._requestId, offerId, Backend.Negotiation.TYPE_DELIVERY);
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_DELIVERY_ACCEPT)) {
    var acceptDeliveryButton = UIUtils.appendButton(controlPanel, "AcceptDeliveryButton", this.getLocale().AcceptDeliveryButton);
    UIUtils.setClickListener(acceptDeliveryButton, function() {
      Backend.addNegotiation(this._requestId, offerId, Backend.Negotiation.TYPE_DELIVERY_ACCEPT);
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_RETURN)) {
    var confirmReturnButton = UIUtils.appendButton(controlPanel, "ConfirmReturnButton", this.getLocale().ConfirmReturnButton);
    UIUtils.setClickListener(confirmReturnButton, function() {
      Backend.addNegotiation(this._requestId, offerId, Backend.Negotiation.TYPE_RETURN);
    }.bind(this));
  }
  if (GeneralUtils.containsInArray(actions, Backend.Negotiation.TYPE_CLOSE)) {
    var acceptReturnButton = UIUtils.appendButton(controlPanel, "AcceptReturnButton", this.getLocale().AcceptReturnButton);
    UIUtils.setClickListener(acceptReturnButton, function() {
      Backend.addNegotiation(this._requestId, offerId, Backend.Negotiation.TYPE_CLOSE);
    }.bind(this));
  }
}



RequestDetailsPage.prototype._getApplicableActions = function(offer) {
  if (offer.negotiations.length == 0) {
    if (RequestDetailsPage._isOwnedOffer(offer)) {
      return [Backend.Negotiation.TYPE_RECALL, Backend.Negotiation.TYPE_NEGOTIATE]; 
    } else {
      return [Backend.Negotiation.TYPE_ACCEPT, Backend.Negotiation.TYPE_DECLINE, Backend.Negotiation.TYPE_NEGOTIATE]; 
    }
  } else {
    var lastNegotiation = offer.negotiations[offer.negotiations.length - 1];
    if (lastNegotiation.type == Backend.Negotiation.TYPE_ACCEPT) {
      if (RequestDetailsPage._isOwnedNegotiation(lastNegotiation)) {
        return [Backend.Negotiation.TYPE_DECLINE];
      } else {
        return [Backend.Negotiation.TYPE_CONFIRM, Backend.Negotiation.TYPE_RECALL];
      }
    } else if (lastNegotiation.type == Backend.Negotiation.TYPE_CONFIRM) {
      if (RequestDetailsPage._isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_DELIVERY
          || !RequestDetailsPage._isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_PICKUP) {
        
        return [Backend.Negotiation.TYPE_DELIEVRY];
      } else {
        return [];
      }
    } else if (lastNegotiation.type == Backend.Negotiation.TYPE_DELIVERY) {
      if (RequestDetailsPage._isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_PICKUP
          || !RequestDetailsPage._isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_DELIEVRY) {
        
        return [Backend.Negotiation.TYPE_DELIEVRY_ACCEPT];
      } else {
        return [];
      }
    } else if (lastNegotiation.type == Backend.Negotiation.TYPE_DELIVERY_ACCEPT) {
      if (RequestDetailsPage._isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_PICKUP
          || !RequestDetailsPage._isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_DELIEVRY) {
        
        return [Backend.Negotiation.TYPE_DELIEVRY_RETURN];
      } else {
        return [];
      }
    } else if (lastNegotiation.type == Backend.Negotiation.TYPE_DELIEVRY_RETURN) {
      if (RequestDetailsPage._isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_DELIVERY
          || !RequestDetailsPage._isOwnedOffer(offer) && lastNegotiation.delivery == Backend.Negotiation.DELIVERY_PICKUP) {
        
        return [Backend.Negotiation.TYPE_CLOSE];
      } else {
        return [];
      }
    } else {
      return [];
    }
  }
}


/*


HomePage.prototype._showCreateNewRequestDialog = function() {
  var dialog = UIUtils.appendDialog(this._rootElement, "CreateNewRequestDialog");
  
  var contentPanel = UIUtils.appendBlock(dialog, "ContentPanel");

  UIUtils.appendLabel(contentPanel, "CategoryLabel", this.getLocale().CategoryLabel);
  var categoryChooser = UIUtils.appendDropList(contentPanel, "ExpertiseCategory", Backend.getUserSettings().expertise_categories);
  
  UIUtils.appendLabel(contentPanel, "DescriptionLabel", this.getLocale().DescriptionLabel);
  var descriptionEditor = UIUtils.appendTextEditor(contentPanel, "DescriptionEditor");

  
  var whenPanel = UIUtils.appendBlock(contentPanel, "WhenPanel");
  UIUtils.appendLabel(whenPanel, "GetOnLabel", this.getLocale().GetOnLabel);
  var getOnChooser = UIUtils.appendDateInput(whenPanel, "GetOnChooser");
  getOnChooser.setDate(new Date());
  
  UIUtils.appendLabel(whenPanel, "ReturnByLabel", this.getLocale().ReturnByLabel);
  var returnByChooser = UIUtils.appendDateInput(whenPanel, "ReturnByChooser");
  var tomorrow = new Date();
  tomorrow.setTime(tomorrow.getTime() + 24 * 60 * 60 * 1000);
  returnByChooser.setDate(tomorrow);

  var deliveryPanel = UIUtils.appendBlock(contentPanel, "DeliveryPanel");
  UIUtils.appendLabel(deliveryPanel, "DeliveryLabel", this.getLocale().PickupLabel);
  var deliveryChooser = UIUtils.appendDropList(deliveryPanel, "DeliveryChooser", Application.Configuration.PICKUP_OPTIONS);
  
  
  var paymentPanel = UIUtils.appendBlock(contentPanel, "PaymentPanel");
  UIUtils.appendLabel(paymentPanel, "PaymentLabel", this.getLocale().PaymentLabel);
  var payment = UIUtils.appendTextInput(paymentPanel, "PaymentField");
  payment.value = "0.00";
  payment.onchange = function() {
    if (!HomePage._isPaymentValid(payment.value)) {
      UIUtils.indicateInvalidInput(payment);
    }
  };
  
  var paymentChooser = UIUtils.appendDropList(paymentPanel, "PaymentRateChooser", Application.Configuration.PAYMENT_RATES);
  paymentChooser.setChangeListener(function(selectedItem) {
    if (selectedItem != Application.Configuration.PAYMENT_RATES[0]) {
      payment.style.display = "inline-block";
    } else {
      payment.style.display = "none";
    }
  });
  
  UIUtils.appendSeparator(contentPanel);
  
  var buttonPanel = UIUtils.appendBlock(dialog, "ButtonPanel");
  var cancelButton = UIUtils.appendButton(buttonPanel, "CancelButton", I18n.getLocale().literals.CancelOperationButton);
  var okButton = UIUtils.appendButton(buttonPanel, "OkButton", I18n.getLocale().literals.OkButton);
  
  UIUtils.setClickListener(cancelButton, function() {
    UIUtils.fadeOut(dialog);
  });

  
  UIUtils.setClickListener(okButton, function() {
    if (this._signing) {
      return;
    }
    
    if (descriptionEditor.getValue() == "") {
      UIUtils.indicateInvalidInput(descriptionEditor);
      UIUtils.showMessage(this.getLocale().IncorrectDescriptionMessage);
      return;
    }

    if (paymentChooser.getSelectedItem() != Application.Configuration.PAYMENT_RATES[0] 
        && !HomePage._isPaymentValid(payment.value)) {
      UIUtils.indicateInvalidInput(payment);
      UIUtils.showMessage(this.getLocale().IncorrectProposedPaymentMessage);
      return;
    }
    
    var thisMorning = new Date();
    thisMorning.setHours(0);
    thisMorning.setMinutes(0);
    thisMorning.setSeconds(0);
    thisMorning.setMilliseconds(0);
    
    if (getOnChooser.getDate() == null || getOnChooser.getDate().getTime() < thisMorning.getTime()) {
      UIUtils.indicateInvalidInput(getOnChooser);
      UIUtils.showMessage(this.getLocale().IncorrectGetOnDateMessage);
      return;
    }
    if (returnByChooser.getDate() == null || returnByChooser.getDate().getTime() < getOnChooser.getDate().getTime()) {
      UIUtils.indicateInvalidInput(returnByChooser);
      UIUtils.showMessage(this.getLocale().IncorrectReturnByDateMessage);
      return;
    }
    
    
    var request = {
      category: categoryChooser.getValue(),
      text: descriptionEditor.getValue(),
      delivery: deliveryChooser.getValue(),
      get_on: getOnChooser.getDate().getTime(),
      return_by: returnByChooser.getDate().getTime(),
      payment: {
        payrate: paymentChooser.getValue(),
        payment: paymentChooser.getValue() != Application.Configuration.PAYMENT_RATES[0].data ? payment.value : null
      }
    };
    
    var page = this;
    var backendCallback = {
      success: function() {
        this._onCompletion();
        UIUtils.showMessage(page.getLocale().RequestIsSentMessage);

        UIUtils.fadeOut(dialog);
      },
      failure: function() {
        this._onCompletion();
        UIUtils.showMessage(page.getLocale().FailedToSendRequest);
      },
      error: function() {
        this._onCompletion();
        UIUtils.showMessage(I18n.getLocale().literals.ServerErrorMessage);
      },

      _onCompletion: function() {
        this._signing = false;
      }.bind(this)
    }
    Backend.createRequest(request, backendCallback);
  }.bind(this));
}




HomePage.prototype._showRequestDetailsDialog = function(requestId) {
  var request = Backend.getRequest(requestId);
  if (request == null) {
    return;
  }
  
  var dialog = UIUtils.appendDialog(this._rootElement, "RequestDetailsDialog");
  
  var contentPanel = UIUtils.appendBlock(dialog, "ContentPanel");

  var header = UIUtils.appendBlock(contentPanel, "Header");

  var categoryElement = UIUtils.appendBlock(header, "Category");
  categoryElement.innerHTML = request.category;
  var categoryItem = Application.Configuration.findConfigurationItem(Backend.getUserSettings().expertise_categories, request.category);
  if (categoryItem != null) {
    categoryElement.style.color = categoryItem.fg;
    categoryElement.style.backgroundColor = categoryItem.bg;
  }

  var dateElement = UIUtils.appendBlock(header, "Date");
  var date = new Date(request.timestamp);
  dateElement.innerHTML = date.toLocaleDateString() + " " + date.toLocaleTimeString();

  if (!HomePage._isOwnedRequest(request)) {
    var ratingElement = UIUtils.appendRatingBar(header, "Rating");
    ratingElement.setRating(request.star_rating);
  }

  var nameElement = UIUtils.appendBlock(header, "Name");
  if (HomePage._isOwnedRequest(request)) {
    nameElement.innerHTML = this.getLocale().RequestNameMe;
  } else {
    nameElement.innerHTML = request.user_name;
  }

  var textElement = UIUtils.appendBlock(contentPanel, "Text");
  UIUtils.addClass(textElement, "request-text");
  textElement.innerHTML = request.text;

  var whenAndHow = UIUtils.appendBlock(contentPanel, "WhenAndHow");

  UIUtils.appendLabel(whenAndHow, "GetOnLabel", this.getLocale().RequestGetOnLabel);
  var getOnElement = UIUtils.appendBlock(whenAndHow, "GetOn");
  getOnElement.innerHTML = date.toLocaleDateString();

  UIUtils.appendLabel(whenAndHow, "ReturnByLabel", this.getLocale().RequestReturnByLabel);
  var returnByElement = UIUtils.appendBlock(whenAndHow, "ReturnBy");
  date = new Date(request.get_on);
  returnByElement.innerHTML = date.toLocaleDateString();

  UIUtils.appendLabel(whenAndHow, "PickupLabel", this.getLocale().RequestPickupLabel);
  var pickupElement = UIUtils.appendBlock(whenAndHow, "Pickup");
  pickupElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PICKUP_OPTIONS, request.pickup);

  var payment = UIUtils.appendBlock(contentPanel, "Payment");
  UIUtils.appendLabel(payment, "PaymentLabel", this.getLocale().PaymentLabel);
  if (request.payment.payrate != Application.Configuration.PAYMENT_RATES[0].data) {
    var paymentElement = UIUtils.appendBlock(payment, "PayAmount");
    paymentElement.innerHTML = "$" + request.payment.payment;
  }
  var payRateElement = UIUtils.appendBlock(payment, "Payrate");
  payRateElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PAYMENT_RATES, request.payment.payrate);
  
  
  UIUtils.appendSeparator(contentPanel);
  
  var buttonPanel = UIUtils.appendBlock(dialog, "ButtonPanel");
  var cancelButton = UIUtils.appendButton(buttonPanel, "CancelButton", I18n.getLocale().literals.CancelOperationButton);
  UIUtils.setClickListener(cancelButton, function() {
    UIUtils.fadeOut(dialog);
  });

  
  if (!HomePage._isOwnedRequest(request)) {
    var offerButton = UIUtils.appendButton(buttonPanel, "OfferButton", this.getLocale().OfferButton);
    UIUtils.setClickListener(offerButton, function() {
      this._showCreateOfferDialog();
    }.bind(this));
  }
}

HomePage.prototype._appendRequestDetailsPanel = function(root, request) {
  
  return requestPanel;
}

HomePage.prototype._appendFoldedPanel = function(root) {
  var foldedPanel = UIUtils.appendBlock(root, "FoldedPanel");

  UIUtils.appendBlock(foldedPanel, "Collapse1");
  UIUtils.appendBlock(foldedPanel, "Collapse2");
  UIUtils.appendBlock(foldedPanel, "Collapse3");
  
  return foldedPanel;
}


HomePage._isPaymentValid = function(payment) {
  var amountExpression = /^\d+(?:\.\d{0,2})$/;
  return amountExpression.test(payment);
}

*/

RequestDetailsPage._isOwnedOffer = function(offer) {
  return offer.user_id == Backend.getUserProfile().user_id;  
}

RequestDetailsPage._isOwnedNegotiation = function(neg) {
  return neg.user_id == Backend.getUserProfile().user_id;  
}
