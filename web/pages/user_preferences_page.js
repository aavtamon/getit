UserPreferencesPage = ClassUtils.defineClass(AbstractDataPage, function UserPreferencesPage() {
  AbstractDataPage.call(this, UserPreferencesPage.name);
  
  this._detailLocationElement;
  this._addressElement;
  this._categoryFilterElement;
  
  this._updating = false;
});

UserPreferencesPage.prototype.definePageContent = function(root) {
  var preferencesPanel = UIUtils.appendBlock(root, "PreferencesPanel");
  UIUtils.appendLabel(preferencesPanel, "PreferencesLabel", this.getLocale().PreferencesLabel);
  
  var locationPreferencesPanel = UIUtils.appendBlock(preferencesPanel, "LocationPreferencesPanel");
  UIUtils.appendLabel(locationPreferencesPanel, "LocationPreferencesLabel", this.getLocale().LocationPreferencesLabel);
  
  var detailLocationPanel = UIUtils.appendBlock(preferencesPanel, "DetailLocationPanel");
  UIUtils.appendLabel(detailLocationPanel, "DetailLocatonLabel", I18n.getLocale().literals.DetailLocationLabel);
  this._detailLocationElement = UIUtils.appendTextInput(detailLocationPanel, "DetailLocation");
  
  var addressPanel = UIUtils.appendBlock(preferencesPanel, "AddressPanel");
  UIUtils.appendLabel(addressPanel, "AddressLabel", I18n.getLocale().literals.AddressLabel);
  this._addressElement = UIUtils.appendTextInput(detailLocationPanel, "DetailLocation");
  
  
  var requestPreferencesPanel = UIUtils.appendBlock(preferencesPanel, "RequestPreferencesPanel");
  UIUtils.appendLabel(requestPreferencesPanel, "RequestPreferencesLabel", this.getLocale().RequestPreferencesLabel);
  this._categoryFilterElement = UIUtils.appendMultiOptionList(requestPreferencesPanel, "RequestPreferences", Backend.getUserSettings().categories, false);
  
  
  var buttonsPanel = UIUtils.appendBlock(preferencesPanel, "ButtonsPanel");
  var updateButton = UIUtils.appendButton(buttonsPanel, "UpdateButton", this.getLocale().UpdateButton);
  UIUtils.setClickListener(updateButton, function() {
    this._updateUserPreferences();
  }.bind(this));

  var cancelButton = UIUtils.appendButton(buttonsPanel, "CancelButton", I18n.getLocale().literals.CancelOperationButton);
  UIUtils.setClickListener(cancelButton, function() {
    Application.goBack();
  }.bind(this));
  
//  
//  
//  var leftClarificationPanel = UIUtils.appendBlock(preferencesPanel, "LeftClarificationPanel");
//  UIUtils.appendExplanationPad(leftClarificationPanel, "ResponsesClarificationPanel", I18n.getLocale().literals.NumOfResponsesPreferenceLabel, this.getLocale().ResponsesClarificationText);
//  
//
//  var rightClarificationPanel = UIUtils.appendBlock(preferencesPanel, "RightClarificationPanel");
//  UIUtils.appendExplanationPad(rightClarificationPanel, "TimeFrameClarificationPanel", I18n.getLocale().literals.WaitPreferenceLabel, this.getLocale().TimeFrameClarificationText);
//  UIUtils.appendExplanationPad(rightClarificationPanel, "ProfessionalClarificationPanel", this.getLocale().ContactPreferencesLabel, this.getLocale().ProfessionalClarificationText);
}

UserPreferencesPage.prototype.onShow = function() {
  this._detailLocationElement.setValue(Backend.getUserPreferences().detail_location);
  this._addressElement.setValue(Backend.getUserPreferences().address);
  this._categoryFilterElement.selectData(Backend.getUserPreferences().category_filter);
  
  this._updating = false;
}

UserPreferencesPage.prototype.onHide = function() {
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
    detail_location: this._detailLocationElement.getValue(),
    address: this._addressElement.getValue(),
    category_filter: this._inquiryGenderElement.getSelectedData()
  };
  
  Backend.updateUserPreferences(userPreferences, callback);
}
