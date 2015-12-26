HomePage = ClassUtils.defineClass(AbstractDataPage, function HomePage() {
  AbstractDataPage.call(this, HomePage.name);

  this._requestsPanel;
  this._rootElement;
  
  this._cacheChangeListener = function(event) {
    if (event.type == Backend.CacheChangeEvent.TYPE_REQUEST_IDS) {
      this._showRequests();
    } else if (event.type == Backend.CacheChangeEvent.TYPE_REQUEST) {
      this._updateRequest(event.objectId);
    }
  }.bind(this);
});


HomePage.prototype.definePageContent = function(root) {
  AbstractDataPage.prototype.definePageContent.call(this, root);
  
  this._rootElement = root;
  
  var contentPanel = UIUtils.appendBlock(root, "ContentPanel");
  var controlPanel = UIUtils.appendBlock(contentPanel, "ControlPanel");
  var createRequestButton = UIUtils.appendButton(controlPanel, "CreateRequestButton", this.getLocale().CreateRequestButton);
  UIUtils.setClickListener(createRequestButton, function() {
    Dialogs.showCreateNewRequestDialog();
  });
  
  this._requestsPanel = UIUtils.appendBlock(contentPanel, "RequestsPanel");
}

HomePage.prototype.onShow = function(root) {
  AbstractDataPage.prototype.onShow.call(this, root);
  
  this._showRequests();
  
  Backend.addCacheChangeListener(this._cacheChangeListener);
}

HomePage.prototype.onHide = function() {
  AbstractDataPage.prototype.onHide.call(this);
  
  Backend.removeCacheChangeListener(this._cacheChangeListener);
}

HomePage.prototype.onDestroy = function() {
}



HomePage.prototype._showRequests = function() {
  UIUtils.emptyContainer(this._requestsPanel);

  var requestIds = Backend.getRequestIds();
  
  for (var requestIndex in requestIds) {
    var requestId = requestIds[requestIndex];
    this._appendRequest(requestId);
  }
}


HomePage.prototype._appendRequest = function(requestId) {
  var requestElement = UIUtils.appendBlock(this._requestsPanel, requestId);
  
  this._updateRequest(requestId);
}

HomePage.prototype._updateRequest = function(requestId) {
  var request = Backend.getRequest(requestId);
  if (request == null) {
    return;
  }
  
  var requestElement = document.getElementById(UIUtils.createId(this._requestsPanel, requestId));
  if (requestElement == null) {
    return;
  }
  UIUtils.emptyContainer(requestElement);

  UIUtils.addClass(requestElement, "request-outline");
  
  var requestCloser = UIUtils.appendXCloser(requestElement, "Closer");
  UIUtils.addClass(requestCloser, "request-closer");
  UIUtils.setClickListener(requestCloser, function() {
    if (Backend.isOwnedRequest(request)) {
      Dialogs.showRecallRequestDialog(requestElement, requestId);
    } else {
      UIUtils.fadeOut(requestElement, null, function() {
        Backend.removeRequest(requestId);
      });
    }
    
    return false; 
  }.bind(this));
  
  if (Backend.isOwnedRequest(request)) {
    UIUtils.addClass(requestElement, "outgoing-request-outline");
  } else {
    UIUtils.addClass(requestElement, "incoming-request-outline");
  }
  UIUtils.setClickListener(requestElement, function() {
    var callback = {
      success: function() {
        var pulledOffers = Backend.getOfferIds(requestId);
        if (offers != null && offers.length > 0) {
          Application.showPage(RequestDetailsPage.name, { requestId: requestId });
        }
      }
    }
    var offers = Backend.getOfferIds(requestId, callback);
    if (offers == null || offers.length == 0) {
      Dialogs.showRequestDetailsDialog(requestId);
    } else {
      Application.showPage(RequestDetailsPage.name, { requestId: requestId });
    }
  })
  
  var firstRow = UIUtils.appendBlock(requestElement, "FirstRow");
  
  var categoryElement = UIUtils.appendBlock(firstRow, "Category");
  UIUtils.addClass(categoryElement, "request-category");
  categoryElement.innerHTML = request.category;
  var categoryItem = Application.Configuration.findConfigurationItem(Backend.getUserSettings().expertise_categories, request.category);
  if (categoryItem != null) {
    categoryElement.style.color = categoryItem.fg;
    categoryElement.style.backgroundColor = categoryItem.bg;
  }
  
  var textElement = UIUtils.appendBlock(firstRow, "Text");
  UIUtils.addClass(textElement, "request-text");
  textElement.innerHTML = UIUtils.getOneLine(request.text);

  var dateElement = UIUtils.appendBlock(firstRow, "Date");
  UIUtils.addClass(dateElement, "request-date");
  var date = new Date(request.timestamp);
  dateElement.innerHTML = date.toLocaleDateString() + " " + date.toLocaleTimeString();
  
  var nameElement = UIUtils.appendBlock(firstRow, "Name");
  UIUtils.addClass(nameElement, "request-name");
  if (Backend.isOwnedRequest(request)) {
    nameElement.innerHTML = I18n.getLocale().literals.NameMe;
  } else {
    nameElement.innerHTML = request.user_name;
  }
  
  
  var secondRow = UIUtils.appendBlock(requestElement, "SecondRow");

  var getonLabel = UIUtils.appendLabel(secondRow, "GetOnlabel", this.getLocale().RequestOutlineGetOnLabel);
  UIUtils.addClass(getonLabel, "request-geton-label");
  
  var getOnElement = UIUtils.appendBlock(secondRow, "GetOn");
  UIUtils.addClass(getOnElement, "request-geton");
  date = new Date(request.get_on);
  getOnElement.innerHTML = date.toLocaleDateString();

  var returnByLabel = UIUtils.appendLabel(secondRow, "ReturnBylabel", this.getLocale().RequestOutlineReturnByLabel);
  UIUtils.addClass(returnByLabel, "request-returnby-label");
  
  var returnByElement = UIUtils.appendBlock(secondRow, "ReturnBy");
  UIUtils.addClass(returnByElement, "request-returnby");
  date = new Date(request.get_on);
  returnByElement.innerHTML = date.toLocaleDateString();

  var pickupLabel = UIUtils.appendLabel(secondRow, "PickupLabel", this.getLocale().RequestOutlinePickupLabel);
  UIUtils.addClass(pickupLabel, "request-pickup-label");
  
  var pickupElement = UIUtils.appendBlock(secondRow, "Pickup");
  UIUtils.addClass(pickupElement, "request-pickup");
  pickupElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PICKUP_OPTIONS, request.pickup);

  var payRateElement = UIUtils.appendBlock(secondRow, "Payrate");
  if (request.payment.payrate == Application.Configuration.PAYMENT_RATES[0].data) {
    UIUtils.addClass(payRateElement, "request-payrate-free");
  } else {
    UIUtils.addClass(payRateElement, "request-payrate-paid");
  }
  
  if (!Backend.isOwnedRequest(request)) {
    var ratingElement = UIUtils.appendRatingBar(secondRow, "Rating");
    UIUtils.addClass(ratingElement, "request-rating");
    ratingElement.setRating(request.star_rating);
  }
}
