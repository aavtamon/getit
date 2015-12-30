HomePage = ClassUtils.defineClass(AbstractDataPage, function HomePage() {
  AbstractDataPage.call(this, HomePage.name);

  this._requestsPanel;
  this._rootElement;
  this._requestObjects = [];
  
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
  
  for (var i in this._requestObjects) {
    this._requestObjects[i].destroy();
  }
  this._requestObjects = [];
}

HomePage.prototype.onDestroy = function() {
}



HomePage.prototype._showRequests = function() {
  UIUtils.emptyContainer(this._requestsPanel);

  var requestIds = Backend.getRequestIds();
  
  for (var requestIndex in requestIds) {
    var requestObject = new HomePage._RequestOutlineObject(requestIds[requestIndex]);
    
    this._requestObjects.push(requestObject);
    requestObject.append(this._requestsPanel);
  }
}

HomePage.prototype._updateRequest = function(requestId) {
  for (var i in this._requestObjects) {
    if (this._requestObjects[i].getId() == requestId) {
      this._requestObjects[i].update();
      break;
    }
  }
}




HomePage._RequestOutlineObject = ClassUtils.defineClass(AbstractRequestObject, function RequestOutlineObject(id) {
  AbstractRequestObject.call(this, id, "request-outline");
});
                                               
HomePage._RequestOutlineObject.prototype._appendRequestContent = function(root) {
  var request = Backend.getRequest(this.getId());
  
  UIUtils.setClickListener(root, function() {
    var callback = {
      success: function() {
        var pulledOffers = Backend.getOfferIds(this.getId());
        if (offers != null && offers.length > 0) {
          Application.showPage(RequestDetailsPage.name, { requestId: this.getId() });
        }
      }.bind(this)
    }
    var offers = Backend.getOfferIds(this.getId(), callback);
    if (offers == null || offers.length == 0) {
      Dialogs.showRequestDetailsDialog(this.getId());
    } else {
      Application.showPage(RequestDetailsPage.name, { requestId: this.getId() });
    }
  }.bind(this));
  
  var firstRow = UIUtils.appendBlock(this.getElement(), "FirstRow");

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
  
  
  var secondRow = UIUtils.appendBlock(this.getElement(), "SecondRow");

  var getonLabel = UIUtils.appendLabel(secondRow, "GetOnlabel", I18n.getLocale().pages.HomePage.RequestOutlineGetOnLabel);
  UIUtils.addClass(getonLabel, "request-geton-label");
  
  var getOnElement = UIUtils.appendBlock(secondRow, "GetOn");
  UIUtils.addClass(getOnElement, "request-geton");
  date = new Date(request.get_on);
  getOnElement.innerHTML = date.toLocaleDateString();

  var returnByLabel = UIUtils.appendLabel(secondRow, "ReturnBylabel", I18n.getLocale().pages.HomePage.RequestOutlineReturnByLabel);
  UIUtils.addClass(returnByLabel, "request-returnby-label");
  
  var returnByElement = UIUtils.appendBlock(secondRow, "ReturnBy");
  UIUtils.addClass(returnByElement, "request-returnby");
  date = new Date(request.get_on);
  returnByElement.innerHTML = date.toLocaleDateString();

  var pickupLabel = UIUtils.appendLabel(secondRow, "PickupLabel", I18n.getLocale().pages.HomePage.RequestOutlinePickupLabel);
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
