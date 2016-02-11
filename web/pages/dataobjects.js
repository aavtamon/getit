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
    UIUtils.addClass(closer, "closer");
    UIUtils.setClickListener(closer, function() {
      this.close();
      return false; 
    }.bind(this));
  }
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
