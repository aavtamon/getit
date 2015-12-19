HomePage = ClassUtils.defineClass(AbstractDataPage, function HomePage() {
  AbstractDataPage.call(this, HomePage.name);

  this._requestsPanel;
  this._rootElement;
  this._signing = false;
  
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
    this._showCreateNewRequestDialog();
  }.bind(this));
  
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
      this._showRequestDetailsDialog(requestId);
    } else {
      Application.showPage(RequestDetailsPage.name, { requestId: requestId });
    }
  }.bind(this))
  
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
  if (HomePage._isOwnedRequest(request)) {
    nameElement.innerHTML = this.getLocale().RequestNameMe;
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
  
  if (!HomePage._isOwnedRequest(request)) {
    var ratingElement = UIUtils.appendRatingBar(secondRow, "Rating");
    UIUtils.addClass(ratingElement, "request-rating");
    ratingElement.setRating(request.star_rating);
  }
}






HomePage.prototype._showCreateNewRequestDialog = function() {
  var dialog = UIUtils.appendDialog(this._rootElement, "CreateNewRequestDialog", true);
  
  var contentPanel = UIUtils.appendBlock(dialog, "ContentPanel");

  UIUtils.appendLabel(contentPanel, "CategoryLabel", this.getLocale().RequestCategoryLabel);
  var categoryChooser = UIUtils.appendDropList(contentPanel, "ExpertiseCategory", Backend.getUserSettings().expertise_categories);
  
  UIUtils.appendLabel(contentPanel, "DescriptionLabel", this.getLocale().RequestDescriptionLabel);
  var descriptionEditor = UIUtils.appendTextEditor(contentPanel, "DescriptionEditor");
  descriptionEditor.focus();
  
  var whenPanel = UIUtils.appendBlock(contentPanel, "WhenPanel");
  UIUtils.appendLabel(whenPanel, "GetOnLabel", this.getLocale().RequestGetOnLabel);
  var getOnChooser = UIUtils.appendDateInput(whenPanel, "GetOnChooser");
  getOnChooser.setDate(new Date());
  
  UIUtils.appendLabel(whenPanel, "ReturnByLabel", this.getLocale().RequestReturnByLabel);
  var returnByChooser = UIUtils.appendDateInput(whenPanel, "ReturnByChooser");
  var tomorrow = new Date();
  tomorrow.setTime(tomorrow.getTime() + 24 * 60 * 60 * 1000);
  returnByChooser.setDate(tomorrow);

  var deliveryPanel = UIUtils.appendBlock(contentPanel, "DeliveryPanel");
  UIUtils.appendLabel(deliveryPanel, "DeliveryLabel", this.getLocale().RequestPickupLabel);
  var deliveryChooser = UIUtils.appendDropList(deliveryPanel, "DeliveryChooser", Application.Configuration.PICKUP_OPTIONS);
  
  
  var paymentPanel = UIUtils.appendBlock(contentPanel, "PaymentPanel");
  UIUtils.appendLabel(paymentPanel, "PaymentLabel", this.getLocale().RequestPaymentLabel);
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
      UIUtils.showMessage(this.getLocale().IncorrectRequestDescriptionMessage);
      return;
    }

    if (paymentChooser.getSelectedItem() != Application.Configuration.PAYMENT_RATES[0] 
        && !HomePage._isPaymentValid(payment.value)) {
      UIUtils.indicateInvalidInput(payment);
      UIUtils.showMessage(this.getLocale().IncorrectRequestProposedPaymentMessage);
      return;
    }
    
    var thisMorning = new Date();
    thisMorning.setHours(0);
    thisMorning.setMinutes(0);
    thisMorning.setSeconds(0);
    thisMorning.setMilliseconds(0);
    
    if (getOnChooser.getDate() == null || getOnChooser.getDate().getTime() < thisMorning.getTime()) {
      UIUtils.indicateInvalidInput(getOnChooser);
      UIUtils.showMessage(this.getLocale().IncorrectRequestGetOnDateMessage);
      return;
    }
    if (returnByChooser.getDate() == null || returnByChooser.getDate().getTime() < getOnChooser.getDate().getTime()) {
      UIUtils.indicateInvalidInput(returnByChooser);
      UIUtils.showMessage(this.getLocale().IncorrectRequestReturnByDateMessage);
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
  
  var dialog = UIUtils.appendDialog(this._rootElement, "RequestDetailsDialog", true);
  
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
  textElement.innerHTML = request.text;

  var whenAndHow = UIUtils.appendBlock(contentPanel, "WhenAndHow");

  UIUtils.appendLabel(whenAndHow, "GetOnLabel", this.getLocale().RequestGetOnLabel);
  var getOnElement = UIUtils.appendBlock(whenAndHow, "GetOn");
  date = new Date(request.get_on);
  getOnElement.innerHTML = date.toLocaleDateString();

  UIUtils.appendLabel(whenAndHow, "ReturnByLabel", this.getLocale().RequestReturnByLabel);
  var returnByElement = UIUtils.appendBlock(whenAndHow, "ReturnBy");
  date = new Date(request.return_by);
  returnByElement.innerHTML = date.toLocaleDateString();

  UIUtils.appendLabel(whenAndHow, "PickupLabel", this.getLocale().RequestPickupLabel);
  var pickupElement = UIUtils.appendBlock(whenAndHow, "Pickup");
  pickupElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PICKUP_OPTIONS, request.pickup);

  var payment = UIUtils.appendBlock(contentPanel, "Payment");
  UIUtils.appendLabel(payment, "PaymentLabel", this.getLocale().RequestPaymentLabel);
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
      this._showCreateNewOfferDialog(requestId);
    }.bind(this));
  }
}




HomePage.prototype._showCreateNewOfferDialog = function(requestId) {
  var dialog = UIUtils.appendDialog(this._rootElement, "CreateNewOfferDialog", true);
  
  var contentPanel = UIUtils.appendBlock(dialog, "ContentPanel");

  UIUtils.appendLabel(contentPanel, "DescriptionLabel", this.getLocale().OfferDescriptionLabel);
  var descriptionEditor = UIUtils.appendTextEditor(contentPanel, "DescriptionEditor");
  descriptionEditor.focus();

  var attachmentBar = UIUtils.appendAttachmentBar(contentPanel, "AttachmentBar", null, true, function(file) {
    if (!FileUtils.isImage(file)) {
      UIUtils.showMessage(this.getLocale().IncorrectAttachmentMessage);
      return false;
    }
    
    var maxFileSize = Backend.getUserSettings().attachment_limit;
    if (file.size > maxFileSize * 1024 * 1000) {
      UIUtils.showMessage(this.getLocale().AttachmentTooBigMessageProvider(maxFileSize));
      return false;
    }
    
    return true;
  }.bind(this));
  
  var whenPanel = UIUtils.appendBlock(contentPanel, "WhenPanel");
  UIUtils.appendLabel(whenPanel, "GetOnLabel", this.getLocale().OfferGetOnLabel);
  var getOnChooser = UIUtils.appendDateInput(whenPanel, "GetOnChooser");
  getOnChooser.setDate(new Date());
  
  UIUtils.appendLabel(whenPanel, "ReturnByLabel", this.getLocale().OfferReturnByLabel);
  var returnByChooser = UIUtils.appendDateInput(whenPanel, "ReturnByChooser");
  var tomorrow = new Date();
  tomorrow.setTime(tomorrow.getTime() + 24 * 60 * 60 * 1000);
  returnByChooser.setDate(tomorrow);

  var deliveryPanel = UIUtils.appendBlock(contentPanel, "DeliveryPanel");
  UIUtils.appendLabel(deliveryPanel, "DeliveryLabel", this.getLocale().OfferDeliveryLabel);
  var deliveryChooser = UIUtils.appendDropList(deliveryPanel, "DeliveryChooser", Application.Configuration.DELIVERY_OPTIONS);
  
  
  var paymentPanel = UIUtils.appendBlock(contentPanel, "PaymentPanel");
  UIUtils.appendLabel(paymentPanel, "PaymentLabel", this.getLocale().OfferPaymentLabel);
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

  UIUtils.appendLabel(paymentPanel, "DepositLabel", this.getLocale().OfferDepositLabel);
  var depositChooser = UIUtils.appendDropList(paymentPanel, "DepositChooser", Application.Configuration.DEPOSITES);
  
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
      UIUtils.showMessage(this.getLocale().IncorrectOfferDescriptionMessage);
      return;
    }

    if (paymentChooser.getSelectedItem() != Application.Configuration.PAYMENT_RATES[0] 
        && !HomePage._isPaymentValid(payment.value)) {
      UIUtils.indicateInvalidInput(payment);
      UIUtils.showMessage(this.getLocale().IncorrectOfferProposedPaymentMessage);
      return;
    }
    
    var thisMorning = new Date();
    thisMorning.setHours(0);
    thisMorning.setMinutes(0);
    thisMorning.setSeconds(0);
    thisMorning.setMilliseconds(0);
    
    if (getOnChooser.getDate() == null || getOnChooser.getDate().getTime() < thisMorning.getTime()) {
      UIUtils.indicateInvalidInput(getOnChooser);
      UIUtils.showMessage(this.getLocale().IncorrectOfferGetOnDateMessage);
      return;
    }
    if (returnByChooser.getDate() == null || returnByChooser.getDate().getTime() < getOnChooser.getDate().getTime()) {
      UIUtils.indicateInvalidInput(returnByChooser);
      UIUtils.showMessage(this.getLocale().IncorrectOfferReturnByDateMessage);
      return;
    }
    
    
    
    var offer = {
      text: descriptionEditor.getValue(),
      delivery: deliveryChooser.getValue(),
      get_on: getOnChooser.getDate().getTime(),
      return_by: returnByChooser.getDate().getTime(),
      attachments: attachmentBar.getAttachments(),
      payment: {
        payrate: paymentChooser.getValue(),
        payment: paymentChooser.getValue() != Application.Configuration.PAYMENT_RATES[0].data ? payment.value : null,
        deposit: depositChooser.getValue()
      }
    };
    
    var page = this;
    var backendCallback = {
      success: function() {
        this._onCompletion();
        UIUtils.showMessage(page.getLocale().OfferIsSentMessage);

        UIUtils.fadeOut(dialog);
      },
      failure: function() {
        this._onCompletion();
        UIUtils.showMessage(page.getLocale().FailedToSendOffer);
      },
      error: function() {
        this._onCompletion();
        UIUtils.showMessage(I18n.getLocale().literals.ServerErrorMessage);
      },

      _onCompletion: function() {
        this._signing = false;
      }.bind(this)
    }
    Backend.createOffer(requestId, offer, backendCallback);
  }.bind(this));
}





HomePage._isPaymentValid = function(payment) {
  var amountExpression = /^\d+(?:\.\d{0,2})$/;
  return amountExpression.test(payment);
}

HomePage._isOwnedRequest = function(request) {
  return request.user_id == Backend.getUserProfile().user_id;  
}