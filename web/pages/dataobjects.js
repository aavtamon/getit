AbstractDataObject = ClassUtils.defineClass(Object, function AbstractDataObject(id, baseCss) {
  this._id = id;
  this._baseCss = baseCss;
  
  this._baseElement;
});

AbstractDataObject.prototype.getBaseCss = function() {
  return this._baseCss;
}

AbstractDataObject.prototype.getId = function() {
  return this._id;
}

AbstractDataObject.prototype.getElement = function() {
  return this._baseElement;
}

AbstractDataObject.prototype.update = function() {
  if (this._baseElement != null) {
    UIUtils.emptyContainer(this._baseElement);
    this.__appendCloser();

    this._appendContent(this._baseElement);
  }
}

AbstractDataObject.prototype.append = function(root) {
  this.remove();
  
  this._baseElement = UIUtils.appendBlock(root, this.getId());
  UIUtils.addClass(this._baseElement, this._baseCss);

  this.update();
}

AbstractDataObject.prototype.remove = function() {
  if (this._baseElement != null) {
    UIUtils.remove(this._baseElement);
  }
  this._baseElement = null;
}

AbstractDataObject.prototype.dismiss = function(observer) {
  UIUtils.fadeOut(this.getElement(), null, observer);
}


AbstractDataObject.prototype.destroy = function() {
  this.remove();
}

AbstractDataObject.prototype.isClosable = function() {
  return false;
}
AbstractDataObject.prototype.close = function() {
  throw "To be implemented";
}

AbstractDataObject.prototype._appendContent = function(root) {
  throw "To be implemented";
}

AbstractDataObject.prototype.__appendCloser = function() {
  if (this.isClosable()) {
    var closer = UIUtils.appendXCloser(this._baseElement, "Closer");
    UIUtils.setClickListener(closer, function() {
      this.close();
      return false; 
    }.bind(this));
  }
}


AbstractDataListObject = ClassUtils.defineClass(AbstractDataObject, function AbstractDataListObject(id, baseCss) {
  AbstractDataObject.call(this, id, baseCss);
  
  this._items = this.getDataItems();
});
AbstractDataListObject.prototype.update = function() {
  for (var i in this._items) {
    this._items[i].destroy();
  }
  
  this._items = this.getDataItems();
  
  AbstractDataObject.prototype.update.call(this);
}
AbstractDataListObject.prototype.remove = function() {
  for (var i in this._items) {
    this._items[i].remove();
  }
  this._items = [];

  AbstractDataObject.prototype.remove.call(this);
}
AbstractDataListObject.prototype.destroy = function() {
  for (var i in this._items) {
    this._items[i].destroy();
  }
  this._items = [];

  AbstractDataObject.prototype.destroy.call(this);
}
AbstractDataListObject.prototype._appendContent = function(root) {
  for (var i in this._items) {
    this._items[i].append(root);
  }
}
AbstractDataListObject.prototype.getDataItems = function() {
  throw "To be implemented";
}
                                              
                                                



AbstractRequestObject = ClassUtils.defineClass(AbstractDataObject, function AbstractRequestObject(id, baseCss) {
  AbstractDataObject.call(this, id, baseCss);
});
                                               
AbstractRequestObject.prototype._appendRequestContent = function(root) {
  throw "Not implemented";
}

AbstractRequestObject.prototype.isClosable = function() {
  var request = Backend.getRequest(this.getId());
  if (request == null) {
    return false;
  }
  
  return true;
}
AbstractRequestObject.prototype.close = function() {
  var request = Backend.getRequest(this.getId());

  if (Backend.isOwnedRequest(request)) {
    Dialogs.showRecallRequestDialog(this, this.getId());
  } else {
    var isActive = request.status == Backend.Request.STATUS_ACTIVE;
    
    var streamIds;
    if (isActive && (streamIds = Backend.getNegotiationStreamIds(this.getId())) != null && streamIds.length > 0) {
      Dialogs.showIgnoreRequestWithOffersDialog(this);
    } else {
      this.dismiss(function() {
        Backend.removeRequest(this.getId());
      }.bind(this));
    }
  }
}

AbstractRequestObject.prototype._appendContent = function(root) {
  var request = Backend.getRequest(this.getId());
  if (request == null) {
    return;
  }
  
  var classPrefix;
  if (request.status != Backend.Request.STATUS_ACTIVE) {
    classPrefix = "inactive";
  } else if (Backend.isOwnedRequest(request)) {
    classPrefix = "outgoing";
  } else {
    classPrefix = "incoming";
  }
  UIUtils.addClass(this.getElement(), classPrefix + "-" + this.getBaseCss());
  
  if (request.status == Backend.Request.STATUS_RECALLED) {
    var recallElement = UIUtils.appendBlock(this.getElement(), "Recalled");
    UIUtils.addClass(recallElement, "request-recalled");
    recallElement.innerHTML = I18n.getLocale().literals.Recalled;
  } else if (request.status == Backend.Request.STATUS_CLOSED) {
    var closedElement = UIUtils.appendBlock(this.getElement(), "Closed");
    UIUtils.addClass(closedElement, "request-closed");
    closedElement.innerHTML = I18n.getLocale().literals.Closed;
  }
  
  this._appendRequestContent(root);
}




SearchResultItemObject = ClassUtils.defineClass(AbstractDataObject, function SearchResultItemObject(tool) {
  AbstractDataObject.call(this, null, "search-result-item");
  
  this._tool = tool;
});
                                               
SearchResultItemObject.prototype.isClosable = function() {
  return false;
}
SearchResultItemObject.prototype._appendContent = function(root) {
  var header = UIUtils.appendBlock(root, "Header");

  var nameElement = UIUtils.appendBlock(header, "Name");
  UIUtils.addClass(nameElement, "tool-name");
  nameElement.innerHTML = this._tool.display;

  var descriptionElement = UIUtils.appendBlock(root, "Description");
  UIUtils.addClass(descriptionElement, "tool-description");
  descriptionElement.innerHTML = this._tool.description;

  var payment = UIUtils.appendBlock(root, "Payment");
  var paymentLabel = UIUtils.appendLabel(payment, "PaymentLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.PaymentLabel);
  UIUtils.addClass(paymentLabel, "tool-payment-label");
  if (this._tool.payrate != Application.Configuration.PAYMENT_RATES[0].data) {
    var paymentElement = UIUtils.appendBlock(payment, "PayAmount");
    UIUtils.addClass(paymentElement, "tool-payment");
    paymentElement.innerHTML = "$" + this._tool.payment;
  }
  
  var payRateElement = UIUtils.appendBlock(payment, "Payrate");
  UIUtils.addClass(payRateElement, "tool-payrate");
  payRateElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PAYMENT_RATES, this._tool.payrate);

  var depositLabel = UIUtils.appendLabel(payment, "DepositLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.DepositLabel);
  UIUtils.addClass(depositLabel, "tool-deposit-label");
  var depositElement = UIUtils.appendBlock(payment, "Deposit");
  UIUtils.addClass(depositElement, "tool-deposit");
  depositElement.innerHTML = "$" + this._tool.deposit;
}


SearchResultListObject = ClassUtils.defineClass(AbstractDataListObject, function SearchResultListObject(searchPattern) {
  AbstractDataListObject.call(this, null, "search-result");
  
  this._searchPattern = searchPattern;
});
SearchResultListObject.prototype.isClosable = function() {
  return false;
}
SearchResultListObject.prototype.getDataItems = function() {
  var items = [];
  
  var tools = Backend.getMatchingTools(this._searchPattern);
  for (var i in tools) {
    items.push(new SearchResultItemObject(tools[i]));
  }

  return items;
}




/*
AbstractOfferObject = ClassUtils.defineClass(AbstractDataObject, function AbstractOfferObject(requestId, id, baseCss) {
  AbstractDataObject.call(this, id, baseCss);
  this._requestId = requestId;
});
                                               
AbstractOfferObject.prototype._appendOfferContent = function(root) {
  throw "Not implemented";
}

AbstractOfferObject.prototype.isClosable = function() {
  var request = Backend.getRequest(this._requestId);
  if (request == null) {
    return false;
  }
  
  return request.status == Backend.Request.STATUS_ACTIVE;
}
AbstractOfferObject.prototype.close = function() {
  var offer = Backend.getOffer(this._requestId, this.getId());
  if (offer == null) {
    return;
  }
  
  if (Backend.isOwnedOffer(offer)) {
    Dialogs.showRecallOfferDialog(this.getElement(), this._requestId, this.getId());
  } else {
    this.dismiss(function() {
      Backend.removeOffer(this._requestId, this.getId());
    }.bind(this));
  }
}

AbstractOfferObject.prototype._appendContent = function(root) {
  var offer = Backend.getOffer(this._requestId, this.getId());
  if (offer == null) {
    return;
  }
  
  var classPrefix;
  if (!Backend.isOfferActive(offer)) {
    classPrefix = "inactive";
  } else if (Backend.isOwnedOffer(offer)) {
    classPrefix = "outgoing";
  } else {
    classPrefix = "incoming";
  }
  UIUtils.addClass(this.getElement(), classPrefix + "-" + this.getBaseCss());
  
  if (Backend.offerHasNegotiationType(Backend.Negotiation.TYPE_RECALL)) {
    var recallElement = UIUtils.appendBlock(this.getElement(), "Recalled");
    UIUtils.addClass(recallElement, "offer-recalled");
    recallElement.innerHTML = I18n.getLocale().literals.Recalled;
  } else if (Backend.offerHasNegotiationType(Backend.Negotiation.TYPE_CLOSE)) {
    var closedElement = UIUtils.appendBlock(this.getElement(), "Closed");
    UIUtils.addClass(closedElement, "offer-closed");
    closedElement.innerHTML = I18n.getLocale().literals.Closed;
  } else if (Backend.offerHasNegotiationType(Backend.Negotiation.TYPE_DECLINE)) {
    var declinedElement = UIUtils.appendBlock(this.getElement(), "Declined");
    UIUtils.addClass(declinedElement, "offer-recalled");
    declinedElement.innerHTML = I18n.getLocale().literals.Declined;
  }
  
  this._appendOfferContent(root);
}
*/
