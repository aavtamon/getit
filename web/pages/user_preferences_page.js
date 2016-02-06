UserPreferencesPage = ClassUtils.defineClass(AbstractDataPage, function UserPreferencesPage() {
  AbstractDataPage.call(this, UserPreferencesPage.name);
  
  this._detailLocationElement;
  this._addressElement;
  this._categoryFilterElement;
  this._toolList;
  
  this._updating = false;
});

UserPreferencesPage.prototype.definePageContent = function(root) {
  var preferencesPanel = UIUtils.appendBlock(root, "PreferencesPanel");
  UIUtils.appendLabel(preferencesPanel, "PreferencesLabel", this.getLocale().PreferencesLabel);
  
  var locationPreferencesPanel = UIUtils.appendBlock(preferencesPanel, "LocationPreferencesPanel");
  UIUtils.appendLabel(locationPreferencesPanel, "LocationPreferencesLabel", this.getLocale().LocationPreferencesLabel);
  
  var detailLocationPanel = UIUtils.appendBlock(locationPreferencesPanel, "DetailLocationPanel");
  UIUtils.appendLabel(detailLocationPanel, "DetailLocationLabel", this.getLocale().DetailLocationLabel);
  this._detailLocationElement = UIUtils.appendTextInput(detailLocationPanel, "DetailLocation");
  UIUtils.appendExplanationPad(detailLocationPanel, "DetailLocationExplanation", this.getLocale().DetailLocationExplanationTitle, this.getLocale().DetailLocationExplanationText);
  
  var addressPanel = UIUtils.appendBlock(locationPreferencesPanel, "AddressPanel");
  UIUtils.appendLabel(addressPanel, "AddressLabel", this.getLocale().AddressLabel);
  this._addressElement = UIUtils.appendTextInput(addressPanel, "Address");
  UIUtils.appendExplanationPad(addressPanel, "AddressExplanation", this.getLocale().AddressExplanationTitle, this.getLocale().AddressExplanationText);
  
  
  var requestPreferencesPanel = UIUtils.appendBlock(preferencesPanel, "RequestPreferencesPanel");
  UIUtils.appendLabel(requestPreferencesPanel, "RequestPreferencesLabel", this.getLocale().RequestPreferencesLabel);
  
  var categoryFilterPanel = UIUtils.appendBlock(requestPreferencesPanel, "CategoryFilterPanel");
  UIUtils.appendLabel(categoryFilterPanel, "CategoryFilterLabel", this.getLocale().CategoryFilterLabel);
  this._categoryFilterElement = UIUtils.appendMultiOptionList(categoryFilterPanel, "CategoryFilter", Backend.getUserSettings().expertise_categories, false);
  
  
  var toolLibraryPanel = UIUtils.appendBlock(preferencesPanel, "ToolLibraryPanel");
  UIUtils.appendLabel(toolLibraryPanel, "ToolLibraryLabel", this.getLocale().ToolLibraryLabel);
  UIUtils.appendExplanationPad(toolLibraryPanel, "ToolLibraryExplanation", this.getLocale().ToolLibraryExplanationTitle, this.getLocale().ToolLibraryExplanationText);
  
  this._toolList = UIUtils.appendList(toolLibraryPanel, "ToolList");
  
  var toolControlPanel = UIUtils.appendBlock(toolLibraryPanel, "ToolListControlPanel");
  var addButton = UIUtils.appendButton(toolControlPanel, "AddButton", this.getLocale().AddButton);
  addButton.setClickListener(this._addTool.bind(this));
  
  var removeButton = UIUtils.appendButton(toolControlPanel, "RemoveButton", this.getLocale().RemoveButton);
  removeButton.setClickListener(this._removeTool.bind(this));
  removeButton.setEnabled(false);
  
  var editButton = UIUtils.appendButton(toolControlPanel, "EditButton", this.getLocale().EditButton);
  editButton.setClickListener(this._editTool.bind(this));
  editButton.setEnabled(false);

  this._toolList.setSelectionListener(function(selectedItem) {
    var isEnabled = selectedItem != null;
    removeButton.setEnabled(isEnabled);
    editButton.setEnabled(isEnabled);
  });
  this._toolList.setClickListener(function(item) {
    this._editTool();
  }.bind(this));
  
  
  var buttonsPanel = UIUtils.appendBlock(preferencesPanel, "ButtonsPanel");
  var updateButton = UIUtils.appendButton(buttonsPanel, "UpdateButton", this.getLocale().UpdateButton);
  UIUtils.setClickListener(updateButton, function() {
    this._updateUserPreferences();
  }.bind(this));

  var cancelButton = UIUtils.appendButton(buttonsPanel, "CancelButton", I18n.getLocale().literals.CancelOperationButton);
  UIUtils.setClickListener(cancelButton, function() {
    Application.goBack();
  }.bind(this));
}

UserPreferencesPage.prototype.onShow = function() {
  this._detailLocationElement.setValue(Backend.getUserPreferences().detail_location);
  this._addressElement.setValue(Backend.getUserPreferences().address);
  this._categoryFilterElement.setValue(Backend.getUserPreferences().category_filter);
  this._toolList.setItems(Backend.getUserPreferences().tools);
  
  this._updating = false;
}

UserPreferencesPage.prototype.onHide = function() {
}


UserPreferencesPage.prototype._addTool = function() {
  this._addOrEditToolDialog();
}

UserPreferencesPage.prototype._editTool = function() {
  var selection = this._toolList.getSelectedItem();
  if (selection != null) {
    this._addOrEditToolDialog(selection);
  }
}

UserPreferencesPage.prototype._removeTool = function() {
  var selection = this._toolList.getSelectedItem();
  if (selection != null) {
    var items = GeneralUtils.removeFromArray(this._toolList.getItems(), selection);
    this._toolList.setItems(items);
    if (items.length > 0) {
      this._toolList.setSelectedItem(items[0]);
    }
  }
}


UserPreferencesPage.prototype._addOrEditToolDialog = function(tool) {
  var page = this;
  
  var toolNameInput;
  var descriptionEditor;
  var attachmentBar;
  var payment;
  var paymentChooser;
  var depositChooser;
  
  var dialog = UIUtils.showDialog("EditToolDialog", this.getLocale().EditToolDialogTitle, function(contentPanel) {
    UIUtils.appendLabel(contentPanel, "ToolNameLabel", page.getLocale().ToolNameLabel);
    toolNameInput = UIUtils.appendTextInput(contentPanel, "ToolName", 30, ValidationUtils.ID_REGEXP);
    toolNameInput.focus();
    
    UIUtils.appendLabel(contentPanel, "DescriptionLabel", page.getLocale().EditToolDialog_DescriptionLabel);
    descriptionEditor = UIUtils.appendTextEditor(contentPanel, "DescriptionEditor");

    attachmentBar = UIUtils.appendAttachmentBar(contentPanel, "AttachmentBar", null, true, function(file) {
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
    }.bind(this));
    
    var paymentPanel = UIUtils.appendBlock(contentPanel, "PaymentPanel");
    UIUtils.appendLabel(paymentPanel, "PaymentLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.PaymentLabel);
    payment = UIUtils.appendTextInput(paymentPanel, "Payment");
    payment.value = "0.00";
    payment.onchange = function() {
      if (!ValidationUtils.isValidDollarAmount(payment.value)) {
        UIUtils.indicateInvalidInput(payment);
      }
    };

    paymentChooser = UIUtils.appendDropList(paymentPanel, "PaymentRateChooser", Application.Configuration.PAYMENT_RATES);
    paymentChooser.setChangeListener(function(selectedItem) {
      if (selectedItem != Application.Configuration.PAYMENT_RATES[0].data) {
        payment.style.display = "inline-block";
      } else {
        payment.style.display = "none";
      }
    });

    UIUtils.appendLabel(paymentPanel, "DepositLabel", I18n.getLocale().dialogs.CreateNewOfferDialog.DepositLabel);
    depositChooser = UIUtils.appendDropList(paymentPanel, "DepositChooser", Application.Configuration.DEPOSITES);
    
    if (tool != null) {
      toolNameInput.setValue(tool.display);
      descriptionEditor.setValue(tool.description);
      attachmentBar.setAttachments(tool.attachments);
      payment.setValue(tool.payment);
      paymentChooser.setValue(tool.payrate);
      depositChooser.setValue(tool.deposit);
    }
  }, {
    ok: {
      display: I18n.getLocale().literals.ConfirmButton,
      listener: function() {
        if (dialog._processing) {
          return;
        }

        if (toolNameInput.getValue() == "") {
          UIUtils.indicateInvalidInput(toolNameInput);
          UIUtils.showMessage(page.getLocale().EditToolDialog_IncorrectToolNameMessage);
          return;
        }

        if (descriptionEditor.getValue() == "") {
          UIUtils.indicateInvalidInput(descriptionEditor);
          UIUtils.showMessage(page.getLocale().EditToolDialog_IncorrectDescriptionMessage);
          return;
        }

        if (paymentChooser.getValue() != Application.Configuration.PAYMENT_RATES[0].data
            && !ValidationUtils.isValidDollarAmount(payment.value)) {
          UIUtils.indicateInvalidInput(payment);
          UIUtils.showMessage(page.getLocale().EditToolDialog_IncorrectPaymentMessage);
          return;
        }

        var items = page._toolList.getItems();
        if (items == null) {
          items = [];
        }
        
        if (tool != null) {
          for (var i in items) {
            if (items[i] == tool) {
              items[i].display = toolNameInput.getValue();
              items[i].description = descriptionEditor.getValue();
              items[i].attachments = attachmentBar.getAttachments();
              items[i].payment = payment.getValue();
              items[i].payrate = paymentChooser.getValue();
              items[i].deposit = depositChooser.getValue();
              
              break;
            }
          }
          page._toolList.setItems(items);
        } else {
          var newTool = {
            display: toolNameInput.getValue(),
            description: descriptionEditor.getValue(),
            attachments: attachmentBar.getAttachments(),
            payment: payment.getValue(),
            payrate: paymentChooser.getValue(),
            deposit: depositChooser.getValue()
          }

          items.push(newTool);
          page._toolList.setItems(items);
        }
        
        dialog.close();
      }
    },
    cancel: {
      display: I18n.getLocale().literals.CancelOperationButton,
      alignment: "left"
    }
  });
}


UserPreferencesPage.prototype._updateUserPreferences = function(callback) {
  if (this._updating) {
    return;
  }
  
  
  var page = this;
  var callback = {
    success: function(requestId) {
      this._onCompletion();
      UIUtils.showMessage(page.getLocale().PreferencesUpdatedMessage);
      Application.goBack();
    },
    failure: function() {
      this._onCompletion();
      UIUtils.showMessage(page.getLocale().UpdateFailedMessage);
    },
    error: function() {
      this._onCompletion();
      UIUtils.showMessage(I18n.getLocale().literals.ServerErrorMessage);
    },

    _onCompletion: function() {
      this._updating = false;
      UIUtils.hideSpinningWheel();
    }.bind(this)
  }

  this._updating = true;
  UIUtils.showSpinningWheel();

  var userPreferences = {
    detail_location: page._detailLocationElement.getValue(),
    address: page._addressElement.getValue(),
    category_filter: page._categoryFilterElement.getValue(),
    tools: page._toolList.getValue()
  };
  
  Backend.updateUserPreferences(userPreferences, callback);
}
