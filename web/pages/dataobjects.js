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
    Dialogs.showRecallRequestDialog(this.getElement(), this.getId());
  } else {
    var isActive = request.status == Backend.Request.STATUS_ACTIVE;
    
    var offerIds;
    if (isActive && (offerIds = Backend.getOfferIds(this.getId())) != null && offers.length > 0) {
      var dialog = UIUtils.showDialog("RequestDismiss", this.getLocale().RequestHasOffer, this.getLocale().RequestHasOfferText, {
        ok: {
          display: I18n.getLocale().literals.ConfirmButton,
          listener: function() {
            UIUtils.fadeOut(this.getElement(), null, function() {
              //TODO: Recall offers?
              Backend.removeRequest(this._requestId);
            }.bind(this));
            dialog.close();
          }.bind(this)
        },
        cancel: {
          display: I18n.getLocale().literals.CancelOperationButton,
          alignment: "left"
        }
      });
    } else {
      UIUtils.fadeOut(this.getElement(), null, function() {
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
    var recallElement = UIUtils.appendBlock(this.getElement(), "Closed");
    UIUtils.addClass(recallElement, "request-closed");
    recallElement.innerHTML = I18n.getLocale().literals.Closed;
  }
  
  this._appendRequestContent(root);
}

