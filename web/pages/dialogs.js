Dialogs = {
  _processing: false
}


Dialogs.showCreateNewRequestDialog = function() {
  var categoryChooser;
  var descriptionEditor;
  var getOnChooser;
  var returnByChooser;
  var deliveryChooser;
  var payment;
  var payrateChooser;
  
  var dialog = UIUtils.showDialog("CreateNewRequestDialog", I18n.getLocale().dialogs.CreateNewRequestDialog.Title, function(contentPanel) {
    UIUtils.appendLabel(contentPanel, "CategoryLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.CategoryLabel);
    categoryChooser = UIUtils.appendDropList(contentPanel, "Category", Backend.getUserSettings().expertise_categories);

    UIUtils.appendLabel(contentPanel, "DescriptionLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.DescriptionLabel);
    descriptionEditor = UIUtils.appendTextEditor(contentPanel, "DescriptionEditor");
    descriptionEditor.focus();

    var whenPanel = UIUtils.appendBlock(contentPanel, "WhenPanel");
    UIUtils.appendLabel(whenPanel, "GetOnLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.GetOnLabel);
    getOnChooser = UIUtils.appendDateInput(whenPanel, "GetOnChooser");
    getOnChooser.setDate(new Date());

    UIUtils.appendLabel(whenPanel, "ReturnByLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.ReturnByLabel);
    returnByChooser = UIUtils.appendDateInput(whenPanel, "ReturnByChooser");
    var tomorrow = new Date();
    tomorrow.setTime(tomorrow.getTime() + 24 * 60 * 60 * 1000);
    returnByChooser.setDate(tomorrow);

    var deliveryPanel = UIUtils.appendBlock(contentPanel, "DeliveryPanel");
    UIUtils.appendLabel(deliveryPanel, "DeliveryLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.PickupLabel);
    deliveryChooser = UIUtils.appendDropList(deliveryPanel, "DeliveryChooser", Application.Configuration.PICKUP_OPTIONS);


    var paymentPanel = UIUtils.appendBlock(contentPanel, "PaymentPanel");
    UIUtils.appendLabel(paymentPanel, "PaymentLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.PaymentLabel);
    payment = UIUtils.appendTextInput(paymentPanel, "PaymentField");
    payment.value = "0.00";
    payment.onchange = function() {
      if (!ValidationUtils.isValidDollarAmount(payment.value)) {
        UIUtils.indicateInvalidInput(payment);
      }
    };

    payrateChooser = UIUtils.appendDropList(paymentPanel, "PaymentRateChooser", Application.Configuration.PAYMENT_RATES);
    payrateChooser.setChangeListener(function(selectedItem) {
      if (selectedItem != Application.Configuration.PAYMENT_RATES[0]) {
        payment.style.display = "inline-block";
      } else {
        payment.style.display = "none";
      }
    });
  }, {
    ok: {
      display: I18n.getLocale().literals.ConfirmButton,
      listener: function() {
        if (Dialogs._signing) {
          return;
        }

        if (descriptionEditor.getValue() == "") {
          UIUtils.indicateInvalidInput(descriptionEditor);
          UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewRequestDialog.IncorrectRequestDescriptionMessage);
          return;
        }

        if (payrateChooser.getValue() != Application.Configuration.PAYMENT_RATES[0].data
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
          pickup: deliveryChooser.getValue(),
          get_on: getOnChooser.getDate().getTime(),
          return_by: returnByChooser.getDate().getTime(),
          payment: {
            payrate: payrateChooser.getValue(),
            payment: payrateChooser.getValue() != Application.Configuration.PAYMENT_RATES[0].data ? payment.value : null
          }
        };

        var backendCallback = {
          success: function() {
            this._onCompletion();
            UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewRequestDialog.RequestIsSentMessage);
            dialog.close();
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
        
        Dialogs._processing = true;
        Backend.createRequest(request, backendCallback);
      }
    },
    cancel: {
      display: I18n.getLocale().literals.CancelOperationButton,
      alignment: "left"
    }
  });
}



Dialogs.showRequestDetailsDialog = function(requestId) {
  var dialog;
  
  var buttonSpec = {
    cancel: {
      display: I18n.getLocale().literals.CancelOperationButton,
      alignment: "left"
    }
  };
  
  
  var request = Backend.getRequest(requestId);
  
  if (!Backend.isOwnedRequest(request)) {
    buttonSpec.message = {
      display: I18n.getLocale().dialogs.RequestDetailsDialog.MessageButton,
      listener: function() {
        dialog.close();
        Dialogs.showWriteMessageDialog(requestId);
      }
    }
    
    buttonSpec.offer = {
      display: I18n.getLocale().dialogs.RequestDetailsDialog.OfferButton,
      listener: function() {
        dialog.close();
        Dialogs.showCreateNewOfferDialog(requestId);
      }
    }
  }
  
  dialog = UIUtils.showDialog("RequestDetailsDialog", I18n.getLocale().dialogs.RequestDetailsDialog.Title, function(contentPanel) {
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

    UIUtils.appendLabel(whenAndHow, "GetOnLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.GetOnLabel);
    var getOnElement = UIUtils.appendBlock(whenAndHow, "GetOn");
    date = new Date(request.get_on);
    getOnElement.innerHTML = date.toLocaleDateString();

    UIUtils.appendLabel(whenAndHow, "ReturnByLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.ReturnByLabel);
    var returnByElement = UIUtils.appendBlock(whenAndHow, "ReturnBy");
    date = new Date(request.return_by);
    returnByElement.innerHTML = date.toLocaleDateString();

    UIUtils.appendLabel(whenAndHow, "PickupLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.PickupLabel);
    var pickupElement = UIUtils.appendBlock(whenAndHow, "Pickup");
    pickupElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PICKUP_OPTIONS, request.pickup);

    var payment = UIUtils.appendBlock(contentPanel, "Payment");
    UIUtils.appendLabel(payment, "PaymentLabel", I18n.getLocale().dialogs.CreateNewRequestDialog.PaymentLabel);
    if (request.payment.payrate != Application.Configuration.PAYMENT_RATES[0].data) {
      var paymentElement = UIUtils.appendBlock(payment, "PayAmount");
      paymentElement.innerHTML = "$" + request.payment.payment;
    }
    var payRateElement = UIUtils.appendBlock(payment, "Payrate");
    payRateElement.innerHTML = Application.Configuration.dataToString(Application.Configuration.PAYMENT_RATES, request.payment.payrate);
  }, buttonSpec, true);
}


Dialogs.showWriteMessageDialog = function(requestId) {
  var messageEditor;
  var attachmentBar;
  
  var dialog = UIUtils.showDialog("WriteMessageDialog", I18n.getLocale().dialogs.WriteMessageDialog.Title, function(contentPanel) {
    descriptionEditor = UIUtils.appendTextEditor(contentPanel, "DescriptionEditor");
    descriptionEditor.focus();

    attachmentBar = Dialogs._appendAttachmentBar(contentPanel);
  }, {
    ok: {
      display: I18n.getLocale().dialogs.WriteMessageDialog.SendButton,
      listener: function() {
        if (Dialogs._processing) {
          return;
        }

        if (descriptionEditor.getValue() == "") {
          UIUtils.indicateInvalidInput(descriptionEditor);
          UIUtils.showMessage(I18n.getLocale().dialogs.WriteMessageDialog.IncorrectMessageMessage);
          return;
        }

        var negotiation = {
          text: descriptionEditor.getValue(),
          attachments: attachmentBar.getAttachments(),
        };

        var backendCallback = {
          success: function() {
            this._onCompletion();
            UIUtils.showMessage(I18n.getLocale().dialogs.WriteMessageDialog.MessageIsSentMessage);

            dialog.close();
          },
          failure: function() {
            this._onCompletion();
            UIUtils.showMessage(I18n.getLocale().dialogs.WriteMessageDialog.FailedToSendMessage);
          },
          error: function() {
            this._onCompletion();
            UIUtils.showMessage(I18n.getLocale().literals.ServerErrorMessage);
          },

          _onCompletion: function() {
            Dialogs._processing = false;
          }
        }
        
        Dialogs._processing = true;
        Backend.addNegotiation(requestId, Backend.Negotiation.TYPE_NEGOTIATE, negotiation, backendCallback);
      }
    },
    cancel: {
      display: I18n.getLocale().literals.CancelOperationButton,
      alignment: "left"
    }
  });
}


Dialogs.showCreateNewOfferDialog = function(requestId) {
  var descriptionEditor;
  var attachmentBar;
  var getOnChooser;
  var returnByChooser;
  var deliveryChooser;
  var payment;
  var payrateChooser;
  var depositChooser;
  
  var dialog = UIUtils.showDialog("CreateNewOfferDialog", I18n.getLocale().dialogs.CreateNewOfferDialog.Title, function(contentPanel) {
    UIUtils.appendLabel(contentPanel, "DescriptionLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.DescriptionLabel);
  
    if (Backend.getUserPreferences().tools != null && Backend.getUserPreferences().tools.length > 0) {
      var toolChooser = UIUtils.appendMultiOptionList(contentPanel, "ToolChooser", Backend.getUserPreferences().tools, true, I18n.getLocale().dialogs.CreateNewOfferDialog.ChooseToolText);
      
      toolChooser.setChangeListener(function() {
        var tool = toolChooser.getSelectedChoices()[0];
        
        descriptionEditor.setValue(tool.description);
        attachmentBar.setAttachments(tool.attachments);
        payment.setValue(tool.payment);
        payrateChooser.setValue(tool.payrate);
        depositChooser.setValue(tool.deposit);
      });
    }
    
    descriptionEditor = UIUtils.appendTextEditor(contentPanel, "DescriptionEditor");
    descriptionEditor.focus();

    attachmentBar = Dialogs._appendAttachmentBar(contentPanel);

    var whenPanel = UIUtils.appendBlock(contentPanel, "WhenPanel");
    UIUtils.appendLabel(whenPanel, "GetOnLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.GetOnLabel);
    getOnChooser = UIUtils.appendDateInput(whenPanel, "GetOnChooser");
    getOnChooser.setDate(new Date());

    UIUtils.appendLabel(whenPanel, "ReturnByLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.ReturnByLabel);
    returnByChooser = UIUtils.appendDateInput(whenPanel, "ReturnByChooser");
    var tomorrow = new Date();
    tomorrow.setTime(tomorrow.getTime() + 24 * 60 * 60 * 1000);
    returnByChooser.setDate(tomorrow);

    var deliveryPanel = UIUtils.appendBlock(contentPanel, "DeliveryPanel");
    UIUtils.appendLabel(deliveryPanel, "DeliveryLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.DeliveryLabel);
    deliveryChooser = UIUtils.appendDropList(deliveryPanel, "DeliveryChooser", Application.Configuration.DELIVERY_OPTIONS);


    var paymentPanel = UIUtils.appendBlock(contentPanel, "PaymentPanel");
    UIUtils.appendLabel(paymentPanel, "PaymentLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.PaymentLabel);
    payment = UIUtils.appendTextInput(paymentPanel, "PaymentField");
    payment.value = "0.00";
    payment.onchange = function() {
      if (!ValidationUtils.isValidDollarAmount(payment.value)) {
        UIUtils.indicateInvalidInput(payment);
      }
    };

    payrateChooser = UIUtils.appendDropList(paymentPanel, "PaymentRateChooser", Application.Configuration.PAYMENT_RATES);
    payrateChooser.setChangeListener(function(selectedItem) {
      if (selectedItem != Application.Configuration.PAYMENT_RATES[0].data) {
        payment.style.display = "inline-block";
      } else {
        payment.style.display = "none";
      }
    });

    UIUtils.appendLabel(paymentPanel, "DepositLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.DepositLabel);
    depositChooser = UIUtils.appendDropList(paymentPanel, "DepositChooser", Application.Configuration.DEPOSITES);
  }, {
    ok: {
      display: I18n.getLocale().literals.ConfirmButton,
      listener: function() {
        if (Dialogs._processing) {
          return;
        }

        if (descriptionEditor.getValue() == "") {
          UIUtils.indicateInvalidInput(descriptionEditor);
          UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewOfferDialog.IncorrectOfferDescriptionMessage);
          return;
        }

        if (payrateChooser.getValue() != Application.Configuration.PAYMENT_RATES[0].data
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
            payrate: payrateChooser.getValue(),
            payment: payrateChooser.getValue() != Application.Configuration.PAYMENT_RATES[0].data ? payment.value : null,
            deposit: depositChooser.getValue()
          }
        };

        var backendCallback = {
          success: function() {
            this._onCompletion();
            UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewOfferDialog.OfferIsSentMessage);

            dialog.close();
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
        
        Dialogs._processing = true;
        Backend.createOffer(requestId, offer, backendCallback);
      }
    },
    cancel: {
      display: I18n.getLocale().literals.CancelOperationButton,
      alignment: "left"
    }
  });
}

Dialogs.showNegotiateRequestDialog = function(requestId, offerId, offer) {
  var getOnChooser;
  var returnByChooser;
  var deliveryChooser;
  var payment;
  var payrateChooser;
  var depositChooser;
  var descriptionEditor;
  
  var dialog = UIUtils.showDialog("NegotiateRequestDialog", I18n.getLocale().dialogs.NegotiateRequestDialog.Title, function(contentPanel) {
    var lastNegotiatedObject = offer.negotiations.length > 0 ? offer.negotiations[offer.negotiations.length - 1] : offer;

    var whenPanel = UIUtils.appendBlock(contentPanel, "WhenPanel");
    UIUtils.appendLabel(whenPanel, "GetOnLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.GetOnLabel);
    getOnChooser = UIUtils.appendDateInput(whenPanel, "GetOnChooser");
    getOnChooser.setDate(new Date(lastNegotiatedObject.get_on));

    UIUtils.appendLabel(whenPanel, "ReturnByLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.ReturnByLabel);
    returnByChooser = UIUtils.appendDateInput(whenPanel, "ReturnByChooser");
    returnByChooser.setDate(new Date(lastNegotiatedObject.return_by));

    var deliveryPanel = UIUtils.appendBlock(contentPanel, "DeliveryPanel");
    UIUtils.appendLabel(deliveryPanel, "DeliveryLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.DeliveryLabel);
    deliveryChooser = UIUtils.appendDropList(deliveryPanel, "DeliveryChooser", Application.Configuration.DELIVERY_OPTIONS);
    deliveryChooser.selectData(lastNegotiatedObject.delivery);


    var paymentPanel = UIUtils.appendBlock(contentPanel, "PaymentPanel");
    UIUtils.appendLabel(paymentPanel, "PaymentLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.PaymentLabel);
    payment = UIUtils.appendTextInput(paymentPanel, "PaymentField");
    payment.value = lastNegotiatedObject.payment.payment;
    payment.onchange = function() {
      if (!ValidationUtils.isValidDollarAmount(payment.value)) {
        UIUtils.indicateInvalidInput(payment);
      }
    };

    payrateChooser = UIUtils.appendDropList(paymentPanel, "PaymentRateChooser", Application.Configuration.PAYMENT_RATES);
    payrateChooser.setChangeListener(function(selectedItem) {
      if (selectedItem != Application.Configuration.PAYMENT_RATES[0]) {
        payment.style.display = "inline-block";
      } else {
        payment.style.display = "none";
      }
    });
    payrateChooser.selectData(lastNegotiatedObject.payment.payrate);

    UIUtils.appendLabel(paymentPanel, "DepositLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.DepositLabel);
    depositChooser = UIUtils.appendDropList(paymentPanel, "DepositChooser", Application.Configuration.DEPOSITES);
    depositChooser.selectData(lastNegotiatedObject.payment.deposit);

    UIUtils.appendLabel(contentPanel, "MessageLabel", I18n.getLocale().dialogs.NegotiateRequestDialog.MessageLabel);
    descriptionEditor = UIUtils.appendTextEditor(contentPanel, "MessageEditor");
    descriptionEditor.focus();
  }, {
    ok: {
      display: I18n.getLocale().literals.ConfirmButton,
      listener: function() {
        if (Dialogs._processing) {
          return;
        }
        if (payrateChooser.getValue() != Application.Configuration.PAYMENT_RATES[0].data
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

        var negotiation = {
          text: descriptionEditor.getValue(),
          delivery: deliveryChooser.getValue(),
          get_on: getOnChooser.getDate().getTime(),
          return_by: returnByChooser.getDate().getTime(),
          payment: {
            payrate: payrateChooser.getValue(),
            payment: payrateChooser.getValue() != Application.Configuration.PAYMENT_RATES[0].data ? payment.value : null,
            deposit: depositChooser.getValue()
          }
        };

        var backendCallback = {
          success: function() {
            this._onCompletion();
            UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewOfferDialog.OfferIsSentMessage);

            dialog.close();
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
        
        Dialogs._processing = true;
        Backend.addNegotiation(requestId, offerId, Backend.Negotiation.TYPE_NEGOTIATE, negotiation, backendCallback);
      }
    },
    cancel: {
      display: I18n.getLocale().literals.CancelOperationButton,
      alignment: "left"
    }
  });
}

Dialogs.showNegotiateOfferDialog = function(requestId, offerId, offer) {
  var getOnChooser;
  var returnByChooser;
  var deliveryChooser;
  var payment;
  var payrateChooser;
  var depositChooser;
  var descriptionEditor;
  
  var dialog = UIUtils.showDialog("NegotiateOfferDialog", I18n.getLocale().dialogs.NegotiateOfferDialog.Title, function(contentPanel) {
    var lastNegotiatedObject = offer.negotiations.length > 0 ? offer.negotiations[offer.negotiations.length - 1] : offer;

    var whenPanel = UIUtils.appendBlock(contentPanel, "WhenPanel");
    UIUtils.appendLabel(whenPanel, "GetOnLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.GetOnLabel);
    getOnChooser = UIUtils.appendDateInput(whenPanel, "GetOnChooser");
    getOnChooser.setDate(new Date(lastNegotiatedObject.get_on));

    UIUtils.appendLabel(whenPanel, "ReturnByLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.ReturnByLabel);
    returnByChooser = UIUtils.appendDateInput(whenPanel, "ReturnByChooser");
    returnByChooser.setDate(new Date(lastNegotiatedObject.return_by));

    var deliveryPanel = UIUtils.appendBlock(contentPanel, "DeliveryPanel");
    UIUtils.appendLabel(deliveryPanel, "DeliveryLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.DeliveryLabel);
    deliveryChooser = UIUtils.appendDropList(deliveryPanel, "DeliveryChooser", Application.Configuration.NEGOTIATED_DELIVERY_OPTIONS);
    deliveryChooser.selectData(lastNegotiatedObject.delivery);


    var paymentPanel = UIUtils.appendBlock(contentPanel, "PaymentPanel");
    UIUtils.appendLabel(paymentPanel, "PaymentLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.PaymentLabel);
    payment = UIUtils.appendTextInput(paymentPanel, "PaymentField");
    payment.value = lastNegotiatedObject.payment.payment;
    payment.onchange = function() {
      if (!ValidationUtils.isValidDollarAmount(payment.value)) {
        UIUtils.indicateInvalidInput(payment);
      }
    };

    payrateChooser = UIUtils.appendDropList(paymentPanel, "PaymentRateChooser", Application.Configuration.PAYMENT_RATES);
    payrateChooser.setChangeListener(function(selectedItem) {
      if (selectedItem != Application.Configuration.PAYMENT_RATES[0]) {
        payment.style.display = "inline-block";
      } else {
        payment.style.display = "none";
      }
    });
    payrateChooser.selectData(lastNegotiatedObject.payment.payrate);

    UIUtils.appendLabel(paymentPanel, "DepositLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.DepositLabel);
    depositChooser = UIUtils.appendDropList(paymentPanel, "DepositChooser", Application.Configuration.DEPOSITES);
    depositChooser.selectData(lastNegotiatedObject.payment.deposit);

    UIUtils.appendLabel(contentPanel, "MessageLabel", I18n.getLocale().dialogs.NegotiateRequestDialog.MessageLabel);
    descriptionEditor = UIUtils.appendTextEditor(contentPanel, "MessageEditor");
    descriptionEditor.focus();
  }, {
    ok: {
      display: I18n.getLocale().literals.ConfirmButton,
      listener: function() {
        if (Dialogs._processing) {
          return;
        }
        if (payrateChooser.getValue() != Application.Configuration.PAYMENT_RATES[0].data
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

        var negotiation = {
          text: descriptionEditor.getValue(),
          delivery: deliveryChooser.getValue(),
          get_on: getOnChooser.getDate().getTime(),
          return_by: returnByChooser.getDate().getTime(),
          payment: {
            payrate: payrateChooser.getValue(),
            payment: payrateChooser.getValue() != Application.Configuration.PAYMENT_RATES[0].data ? payment.value : null,
            deposit: depositChooser.getValue()
          }
        };

        var backendCallback = {
          success: function() {
            this._onCompletion();
            UIUtils.showMessage(I18n.getLocale().dialogs.CreateNewOfferDialog.OfferIsSentMessage);

            dialog.close();
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
        
        Dialogs._processing = true;
        Backend.addNegotiation(requestId, offerId, Backend.Negotiation.TYPE_NEGOTIATE, negotiation, backendCallback);
      }
    },
    cancel: {
      display: I18n.getLocale().literals.CancelOperationButton,
      alignment: "left"
    }
  });
}




// Confirmation dialogs

Dialogs.showRecallRequestDialog = function(requestObject) {
  var dialog = UIUtils.showDialog("RecallRequest", I18n.getLocale().dialogs.RecallRequestDialog.RecallRequest, I18n.getLocale().dialogs.RecallRequestDialog.RecallRequestText, {
    ok: {
      display: I18n.getLocale().literals.ConfirmButton,
      listener: function() {
        requestObject.dismiss(function() {
          Backend.removeRequest(requestObject.getId());
        });
        dialog.close();
      }
    },
    cancel: {
      display: I18n.getLocale().literals.CancelOperationButton,
      alignment: "left"
    }
  });
}

Dialogs.showIgnoreRequestWithOffersDialog = function(requestObject) {
  var dialog = UIUtils.showDialog("DismissRequestWithOffers", I18n.getLocale().dialogs.DismissRequestWithOffersDialog.RequestHasOffer, I18n.getLocale().dialogs.DismissRequestWithOffersDialog.RequestHasOfferText, {
    ok: {
      display: I18n.getLocale().literals.ConfirmButton,
      listener: function() {
        requestObject.dismiss(function() {
          //TODO: Recall offers?
          Backend.removeRequest(requestObject.getId());
        });
        dialog.close();
      }.bind(this)
    },
    cancel: {
      display: I18n.getLocale().literals.CancelOperationButton,
      alignment: "left"
    }
  });
}


Dialogs.showRecallOfferDialog = function(offerObject, requestId, offerId) {
  var dialog = UIUtils.showDialog("RecallOffer", I18n.getLocale().dialogs.RecallOfferDialog.RecallOffer, I18n.getLocale().dialogs.RecallOfferDialog.RecallOfferText, {
    ok: {
      display: I18n.getLocale().literals.ConfirmButton,
      listener: function() {
        offerObject.dismiss(function() {
          Backend.recallOffer(requestId, offerId);
        });
        dialog.close();
      }
    },
    cancel: {
      display: I18n.getLocale().literals.CancelOperationButton,
      alignment: "left"
    }
  });
}

Dialogs.showConfirmOfferDialog = function(requestId, offerId) {
  var dialog = UIUtils.showDialog("OfferConfirmation", I18n.getLocale().dialogs.ConfirmOfferDialog.ConfirmOffer, I18n.getLocale().dialogs.ConfirmOfferDialog.ConfirmOfferTextProvider(), {
    ok: {
      display: I18n.getLocale().dialogs.ConfirmOfferDialog.ConfirmOfferButton,
      listener: function() {
        Backend.addNegotiation(requestId, offerId, Backend.Negotiation.TYPE_CONFIRM);
        dialog.close();
      }
    },
    cancel: {
      display: I18n.getLocale().literals.CancelOperationButton,
      alignment: "left"
    }
  });
}


Dialogs._appendAttachmentBar = function(root) {
  return UIUtils.appendAttachmentBar(root, "AttachmentBar", null, true, function(file) {
    if (!FileUtils.isImage(file)) {
      UIUtils.showMessage(I18n.getLocale().literals.IncorrectAttachmentMessage);
      return false;
    }

    var maxFileSize = Backend.getUserSettings().attachment_limit;
    if (file.size > maxFileSize * 1024 * 1000) {
      UIUtils.showMessage(I18n.getLocale().literals.AttachmentTooBigMessageProvider(maxFileSize));
      return false;
    }

    return true;
  });
}
