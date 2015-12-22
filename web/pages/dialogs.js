Dialogs = {
  _processing: false
}

Dialogs.showCreateNewRequestDialog = function() {
  var dialog = UIUtils.appendDialog(null, "CreateNewRequestDialog", true);
  
  var contentPanel = UIUtils.appendBlock(dialog, "ContentPanel");

  UIUtils.appendLabel(contentPanel, "CategoryLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.RequestCategoryLabel);
  var categoryChooser = UIUtils.appendDropList(contentPanel, "Category", Backend.getUserSettings().expertise_categories);
  
  UIUtils.appendLabel(contentPanel, "DescriptionLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.RequestDescriptionLabel);
  var descriptionEditor = UIUtils.appendTextEditor(contentPanel, "DescriptionEditor");
  descriptionEditor.focus();
  
  var whenPanel = UIUtils.appendBlock(contentPanel, "WhenPanel");
  UIUtils.appendLabel(whenPanel, "GetOnLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.RequestGetOnLabel);
  var getOnChooser = UIUtils.appendDateInput(whenPanel, "GetOnChooser");
  getOnChooser.setDate(new Date());
  
  UIUtils.appendLabel(whenPanel, "ReturnByLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.RequestReturnByLabel);
  var returnByChooser = UIUtils.appendDateInput(whenPanel, "ReturnByChooser");
  var tomorrow = new Date();
  tomorrow.setTime(tomorrow.getTime() + 24 * 60 * 60 * 1000);
  returnByChooser.setDate(tomorrow);

  var deliveryPanel = UIUtils.appendBlock(contentPanel, "DeliveryPanel");
  UIUtils.appendLabel(deliveryPanel, "DeliveryLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.RequestPickupLabel);
  var deliveryChooser = UIUtils.appendDropList(deliveryPanel, "DeliveryChooser", Application.Configuration.PICKUP_OPTIONS);
  
  
  var paymentPanel = UIUtils.appendBlock(contentPanel, "PaymentPanel");
  UIUtils.appendLabel(paymentPanel, "PaymentLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.RequestPaymentLabel);
  var payment = UIUtils.appendTextInput(paymentPanel, "PaymentField");
  payment.value = "0.00";
  payment.onchange = function() {
    if (!ValidationUtils.isValidDollarAmount(payment.value)) {
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
    if (Dialogs._signing) {
      return;
    }
    
    if (descriptionEditor.getValue() == "") {
      UIUtils.indicateInvalidInput(descriptionEditor);
      UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewRequestDialog.IncorrectRequestDescriptionMessage);
      return;
    }

    if (paymentChooser.getValue() != Application.Configuration.PAYMENT_RATES[0] 
        && !ValidationUtils.isValidDollarAmount(payment.value)) {
      UIUtils.indicateInvalidInput(payment);
      UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewRequestDialog.IncorrectRequestProposedPaymentMessage);
      return;
    }
    
    var thisMorning = new Date();
    thisMorning.setHours(0);
    thisMorning.setMinutes(0);
    thisMorning.setSeconds(0);
    thisMorning.setMilliseconds(0);
    
    if (getOnChooser.getDate() == null || getOnChooser.getDate().getTime() < thisMorning.getTime()) {
      UIUtils.indicateInvalidInput(getOnChooser);
      UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewRequestDialog.IncorrectRequestGetOnDateMessage);
      return;
    }
    if (returnByChooser.getDate() == null || returnByChooser.getDate().getTime() < getOnChooser.getDate().getTime()) {
      UIUtils.indicateInvalidInput(returnByChooser);
      UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewRequestDialog.IncorrectRequestReturnByDateMessage);
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
    
    var backendCallback = {
      success: function() {
        this._onCompletion();
        UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewRequestDialog.RequestIsSentMessage);

        UIUtils.fadeOut(dialog);
      },
      failure: function() {
        this._onCompletion();
        UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewRequestDialog.FailedToSendRequest);
      },
      error: function() {
        this._onCompletion();
        UIUtils.showMessage(I18n.getLocale().literals.ServerErrorMessage);
      },

      _onCompletion: function() {
        Dialogs._processing = false;
      }
    }
    Backend.createRequest(request, backendCallback);
  });
}


Dialogs.showRequestDetailsDialog = function(requestId) {
  var request = Backend.getRequest(requestId);
  if (request == null) {
    return;
  }
  
  var dialog = UIUtils.appendDialog(null, "RequestDetailsDialog", true);
  
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

  if (!Backend.isOwnedRequest(request)) {
    var ratingElement = UIUtils.appendRatingBar(header, "Rating");
    ratingElement.setRating(request.star_rating);
  }

  var nameElement = UIUtils.appendBlock(header, "Name");
  if (Backend.isOwnedRequest(request)) {
    nameElement.innerHTML = I18n.getLocale().literals.NameMe;
  } else {
    nameElement.innerHTML = request.user_name;
  }

  var textElement = UIUtils.appendBlock(contentPanel, "Text");
  textElement.innerHTML = request.text;

  var whenAndHow = UIUtils.appendBlock(contentPanel, "WhenAndHow");

  UIUtils.appendLabel(whenAndHow, "GetOnLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.RequestGetOnLabel);
  var getOnElement = UIUtils.appendBlock(whenAndHow, "GetOn");
  date = new Date(request.get_on);
  getOnElement.innerHTML = date.toLocaleDateString();

  UIUtils.appendLabel(whenAndHow, "ReturnByLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.RequestReturnByLabel);
  var returnByElement = UIUtils.appendBlock(whenAndHow, "ReturnBy");
  date = new Date(request.return_by);
  returnByElement.innerHTML = date.toLocaleDateString();

  UIUtils.appendLabel(whenAndHow, "PickupLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.RequestPickupLabel);
  var pickupElement = UIUtils.appendBlock(whenAndHow, "Pickup");
  pickupElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PICKUP_OPTIONS, request.pickup);

  var payment = UIUtils.appendBlock(contentPanel, "Payment");
  UIUtils.appendLabel(payment, "PaymentLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.RequestPaymentLabel);
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

  
  if (!Backend.isOwnedRequest(request)) {
    var offerButton = UIUtils.appendButton(buttonPanel, "OfferButton", I18n.getLocale().dialogs.RequestDetailsDialog.OfferButton);
    UIUtils.setClickListener(offerButton, function() {
      Dialogs.showCreateNewOfferDialog(requestId);
    });
  }
}




Dialogs.showCreateNewOfferDialog = function(requestId) {
  var dialog = UIUtils.appendDialog(null, "CreateNewOfferDialog", true);
  
  var contentPanel = UIUtils.appendBlock(dialog, "ContentPanel");

  UIUtils.appendLabel(contentPanel, "DescriptionLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.OfferDescriptionLabel);
  var descriptionEditor = UIUtils.appendTextEditor(contentPanel, "DescriptionEditor");
  descriptionEditor.focus();

  var attachmentBar = UIUtils.appendAttachmentBar(contentPanel, "AttachmentBar", null, true, function(file) {
    if (!FileUtils.isImage(file)) {
      UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewOfferDialog.IncorrectAttachmentMessage);
      return false;
    }
    
    var maxFileSize = Backend.getUserSettings().attachment_limit;
    if (file.size > maxFileSize * 1024 * 1000) {
      UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewOfferDialog.AttachmentTooBigMessageProvider(maxFileSize));
      return false;
    }
    
    return true;
  }.bind(this));
  
  var whenPanel = UIUtils.appendBlock(contentPanel, "WhenPanel");
  UIUtils.appendLabel(whenPanel, "GetOnLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.OfferGetOnLabel);
  var getOnChooser = UIUtils.appendDateInput(whenPanel, "GetOnChooser");
  getOnChooser.setDate(new Date());
  
  UIUtils.appendLabel(whenPanel, "ReturnByLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.OfferReturnByLabel);
  var returnByChooser = UIUtils.appendDateInput(whenPanel, "ReturnByChooser");
  var tomorrow = new Date();
  tomorrow.setTime(tomorrow.getTime() + 24 * 60 * 60 * 1000);
  returnByChooser.setDate(tomorrow);

  var deliveryPanel = UIUtils.appendBlock(contentPanel, "DeliveryPanel");
  UIUtils.appendLabel(deliveryPanel, "DeliveryLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.OfferDeliveryLabel);
  var deliveryChooser = UIUtils.appendDropList(deliveryPanel, "DeliveryChooser", Application.Configuration.DELIVERY_OPTIONS);
  
  
  var paymentPanel = UIUtils.appendBlock(contentPanel, "PaymentPanel");
  UIUtils.appendLabel(paymentPanel, "PaymentLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.OfferPaymentLabel);
  var payment = UIUtils.appendTextInput(paymentPanel, "PaymentField");
  payment.value = "0.00";
  payment.onchange = function() {
    if (!ValidationUtils.isValidDollarAmount(payment.value)) {
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

  UIUtils.appendLabel(paymentPanel, "DepositLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.OfferDepositLabel);
  var depositChooser = UIUtils.appendDropList(paymentPanel, "DepositChooser", Application.Configuration.DEPOSITES);
  
  UIUtils.appendSeparator(contentPanel);
  
  var buttonPanel = UIUtils.appendBlock(dialog, "ButtonPanel");
  var cancelButton = UIUtils.appendButton(buttonPanel, "CancelButton", I18n.getLocale().literals.CancelOperationButton);
  var okButton = UIUtils.appendButton(buttonPanel, "OkButton", I18n.getLocale().literals.OkButton);
  
  UIUtils.setClickListener(cancelButton, function() {
    UIUtils.fadeOut(dialog);
  });

  
  UIUtils.setClickListener(okButton, function() {
    if (Dialogs._processing) {
      return;
    }
    
    if (descriptionEditor.getValue() == "") {
      UIUtils.indicateInvalidInput(descriptionEditor);
      UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewOfferDialog.IncorrectOfferDescriptionMessage);
      return;
    }

    if (paymentChooser.getValue() != Application.Configuration.PAYMENT_RATES[0] 
        && !ValidationUtils.isValidDollarAmount(payment.value)) {
      UIUtils.indicateInvalidInput(payment);
      UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewOfferDialog.IncorrectOfferProposedPaymentMessage);
      return;
    }
    
    var thisMorning = new Date();
    thisMorning.setHours(0);
    thisMorning.setMinutes(0);
    thisMorning.setSeconds(0);
    thisMorning.setMilliseconds(0);
    
    if (getOnChooser.getDate() == null || getOnChooser.getDate().getTime() < thisMorning.getTime()) {
      UIUtils.indicateInvalidInput(getOnChooser);
      UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewOfferDialog.IncorrectOfferGetOnDateMessage);
      return;
    }
    if (returnByChooser.getDate() == null || returnByChooser.getDate().getTime() < getOnChooser.getDate().getTime()) {
      UIUtils.indicateInvalidInput(returnByChooser);
      UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewOfferDialog.IncorrectOfferReturnByDateMessage);
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
        UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewOfferDialog.OfferIsSentMessage);

        UIUtils.fadeOut(dialog);
      },
      failure: function() {
        this._onCompletion();
        UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewOfferDialog.FailedToSendOffer);
      },
      error: function() {
        this._onCompletion();
        UIUtils.showMessage(I18n.getLocale().literals.ServerErrorMessage);
      },

      _onCompletion: function() {
        Dialogs._processing = false;
      }
    }
    Backend.createOffer(requestId, offer, backendCallback);
  });
}
