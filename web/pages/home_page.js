HomePage = ClassUtils.defineClass(AbstractDataPage, function HomePage() {
  AbstractDataPage.call(this, HomePage.name);

  this._requestObjectList;
  this._searchList;
  
  this._cacheChangeListener = function(event) {
    if (event.type == Backend.CacheChangeEvent.TYPE_REQUEST_IDS) {
      this._requestObjectList.update();
    } else if (event.type == Backend.CacheChangeEvent.TYPE_REQUEST) {
      this._requestObjectList.updateItem(event.objectId);
    }
  }.bind(this);
});


HomePage.prototype.definePageContent = function(root) {
  AbstractDataPage.prototype.definePageContent.call(this, root);
  
  var contentPanel = UIUtils.appendBlock(root, "ContentPanel");
  var controlPanel = UIUtils.appendBlock(contentPanel, "ControlPanel");
  var createRequestButton = UIUtils.appendButton(controlPanel, "CreateRequestButton", this.getLocale().CreateRequestButton);
  UIUtils.setClickListener(createRequestButton, function() {
    Dialogs.showCreateNewRequestDialog();
  });
  
  var searchResultsPanel;
  var requestsPanel;
  
  UIUtils.appendLabel(controlPanel, "SearchLabel", this.getLocale().SearchLabel);
  var searchElement = UIUtils.appendSearchInput(controlPanel, "Search");
  searchElement.setSearchListener(function(text) {
    if (this._searchList != null) {
      this._searchList.destroy();
    }
    
    if (text != "" && text != null) {
      this._searchList = new SearchResultListObject("search", text, function() {
        UIUtils.hideSpinningWheel(true);
        UIUtils.emptyContainer(searchResultsPanel);

        this._searchList.append(searchResultsPanel);
        if (this._searchList.length() > 0) {
        } else {
          UIUtils.appendLabel(searchResultsPanel, "NoResultsLabel", I18n.getLocale().literals.NoResultsFound);
        }
      }.bind(this));
      this._searchList.setActionList([{display:this.getLocale().OrderTool, listener: function(tool) {
        Dialogs.showCreateNewRequestDialog(tool);
      }}]);
      
      
      UIUtils.showSpinningWheel(true, this.getLocale().Searching);

      UIUtils.setVisible(searchResultsPanel, true);
      UIUtils.setVisible(requestsPanel, false);
    } else {
      UIUtils.setVisible(searchResultsPanel, false);
      UIUtils.setVisible(requestsPanel, true);
    }
  }.bind(this));

  searchResultsPanel = UIUtils.appendBlock(contentPanel, "SearchResultsPanel");
  UIUtils.setVisible(searchResultsPanel, false);
  
  
  requestsPanel = UIUtils.appendBlock(contentPanel, "RequestsPanel");

  var filterPanel = UIUtils.appendBlock(requestsPanel, "FilterPanel");
  UIUtils.appendLabel(filterPanel, "FilterLabel", this.getLocale().FilterLabel);
  var filterElement = UIUtils.appendTextInput(filterPanel, "Filter", 30);
  
  UIUtils.appendLabel(filterPanel, "FilterMineLabel", this.getLocale().FilterMineLabel);
  var filterMineElement = UIUtils.appendCheckbox(filterPanel, "FilterMine");
  
  var filterChangeListener = function() {
    var filter = function(request) {
      if (filterMineElement.getValue()) {
        return Backend.isOwnedRequest(request);
      }
      
      if (filterElement.getValue() == "") {
        return true;
      }
      
      return request.text.toUpperCase().indexOf(filterElement.getValue().toUpperCase()) != -1;
    }
    
    this._requestObjectList.setFilter(filter);
  }.bind(this);
  
  filterElement.setChangeListener(filterChangeListener);
  filterMineElement.setChangeListener(filterChangeListener);
  
  this._requestObjectList = new HomePage._RequestListObject("RequestList");
  this._requestObjectList.append(requestsPanel);
  
}

HomePage.prototype.onShow = function(root) {
  AbstractDataPage.prototype.onShow.call(this, root);
  
  this._requestObjectList.update();
  
  Backend.addCacheChangeListener(this._cacheChangeListener);
}

HomePage.prototype.onHide = function() {
  AbstractDataPage.prototype.onHide.call(this);
  
  Backend.removeCacheChangeListener(this._cacheChangeListener);
}

HomePage.prototype.onDestroy = function() {
  this._requestObjectList.destroy();
}




HomePage._RequestListObject = ClassUtils.defineClass(AbstractDataListObject, function _RequestListObject(id) {
  AbstractDataListObject.call(this, id, "request-list");
  
  this._filter;
});
HomePage._RequestListObject.prototype.isClosable = function() {
  return false;
}
HomePage._RequestListObject.prototype.getDataItems = function() {
  var items = [];

  var requestIds = Backend.getRequestIds();
  for (var requestIndex in requestIds) {
    var request = Backend.getRequest(requestIds[requestIndex]);
    if (this._filter == null || this._filter(request)) {
      var requestObject = new HomePage._RequestOutlineObject(requestIds[requestIndex]);
      items.push(requestObject);
    }
  }

  return items;
}
HomePage._RequestListObject.prototype.setFilter = function(filter) {
  this._filter = filter;
  this.update();
}



HomePage._RequestOutlineObject = ClassUtils.defineClass(AbstractRequestObject, function RequestOutlineObject(id) {
  AbstractRequestObject.call(this, id, "request-outline");
});
                                               
HomePage._RequestOutlineObject.prototype._appendRequestContent = function(root) {
  var request = Backend.getRequest(this.getId());
  
  UIUtils.setClickListener(root, function() {
    var callback = {
      success: function() {
        var pulledSTreamIds = Backend.getNegotiationStreamIds(this.getId());
        if (pulledSTreamIds != null && pulledSTreamIds.length > 0) {
          Application.showPage(RequestDetailsPage.name, { requestId: this.getId() });
        }
      }.bind(this)
    }
    var streamIds = Backend.getNegotiationStreamIds(this.getId(), callback);
    if (streamIds == null || streamIds.length == 0) {
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
  textElement.innerHTML = UIUtils.getOneLine(request.target != null ? request.target.display : request.text);

  var dateElement = UIUtils.appendBlock(firstRow, "Date");
  UIUtils.addClass(dateElement, "request-date");
  var date = new Date(request.creation_time);
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
  if (request.payrate == Application.Configuration.PAYMENT_RATES[0].data) {
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
