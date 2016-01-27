UserProfilePage = ClassUtils.defineClass(AbstractDataPage, function UserProfilePage() {
  AbstractDataPage.call(this, UserProfilePage.name);
  
  
  this._nameElement;
  this._zipcodeElement;
  this._newPasswordElement;
  this._retypePasswordElement;
  this._currentPasswordElement;
  
  this._updating = false;
});

UserProfilePage.prototype.definePageContent = function(root) {
  var profilePanel = UIUtils.appendBlock(root, "ProfilePanel");
  UIUtils.appendLabel(profilePanel, "ProfileLabel", this.getLocale().ProfileLabel);
  
  var namePanel = UIUtils.appendBlock(profilePanel, "NamePanel");
  UIUtils.appendLabel(namePanel, "NameLabel", this.getLocale().NameLabel);
  this._nameElement = UIUtils.appendTextInput(namePanel, "Name", 30, ValidationUtils.ID_REGEXP);
  
  var zipcodePanel = UIUtils.appendBlock(profilePanel, "ZipcodePanel");
  UIUtils.appendLabel(zipcodePanel, "ZipcodeLabel", this.getLocale().ZipcodeLabel);
  this._zipcodeElement = UIUtils.appendTextInput(zipcodePanel, "Zipcode", 6, ValidationUtils.NUMBER_REGEXP);

  var newPasswordPanel = UIUtils.appendBlock(profilePanel, "NewPasswordPanel");
  UIUtils.appendLabel(newPasswordPanel, "NewPasswordLabel", this.getLocale().NewPasswordLabel);
  this._newPasswordElement = UIUtils.appendPasswordInput(newPasswordPanel, "Password");
  
  var retypePasswordPanel = UIUtils.appendBlock(profilePanel, "RetypePasswordPanel");
  UIUtils.appendLabel(retypePasswordPanel, "RetypePasswordLabel",this.getLocale().RetypePasswordLabel);
  this._retypePasswordElement = UIUtils.appendPasswordInput(retypePasswordPanel, "RetypePassword");

  UIUtils.get$(this._newPasswordElement).on("input", function() {
    this._retypePasswordElement.setValue("");
  }.bind(this));
  
  var currentPasswordPanel = UIUtils.appendBlock(profilePanel, "CurrentPasswordPanel");
  UIUtils.appendLabel(currentPasswordPanel, "CurrentPasswordLabel", this.getLocale().CurrentPasswordLabel);
  this._currentPasswordElement = UIUtils.appendPasswordInput(currentPasswordPanel, "CurrentPassword");
  

  var buttonsPanel = UIUtils.appendBlock(profilePanel, "ButtonsPanel");
  var updateButton = UIUtils.appendButton(buttonsPanel, "UpdateButton", this.getLocale().UpdateButton);
  UIUtils.setClickListener(updateButton, function() {
    this._updateUserProfile();
  }.bind(this));

  var cancelButton = UIUtils.appendButton(buttonsPanel, "CancelButton", I18n.getLocale().literals.CancelOperationButton);
  UIUtils.setClickListener(cancelButton, function() {
    Application.goBack();
  }.bind(this));
}

UserProfilePage.prototype.onShow = function() {
  this._nameElement.setValue(Backend.getUserProfile().name);
  this._zipcodeElement.setValue(Backend.getUserProfile().zipcode);
  
  this._newPasswordElement.setValue("");
  this._retypePasswordElement.setValue("");
  this._currentPasswordElement.setValue("");
  
  this._updating = false;
}

UserProfilePage.prototype.onHide = function() {
}


UserProfilePage.prototype._updateUserProfile = function(callback) {
  if (this._updating) {
    return;
  }
  
  var newPassword = this._newPasswordElement.getValue();
  var confirmNewPassword = this._retypePasswordElement.getValue();
    
  if (newPassword.length > 0) {
    var passwordIncorrect = false;
    if (newPassword != confirmNewPassword) {
      UIUtils.showMessage(this.getLocale().PasswordsDoNotMatchMessage);
      passwordIncorrect = true;
    } else if (!ValidationUtils.isValidPassword(newPassword)) {
      UIUtils.showMessage(this.getLocale().ProvideCorrectPasswordMessage);
      passwordIncorrect = true;
    }

    if (passwordIncorrect) {
      UIUtils.indicateInvalidInput(this._newPasswordElement);
      UIUtils.indicateInvalidInput(this._confirmNewPasswordElement);
      return;
    }
  }
  
  var currentPassword = this._currentPasswordElement.getValue();
  if (currentPassword == "") {
    UIUtils.indicateInvalidInput(this._currentPasswordElement);
    UIUtils.showMessage(this.getLocale().EnterPasswordMessage);
    return;
  }
    

  var callback = {
    success: function(requestId) {
      callback._onCompletion();
      UIUtils.showMessage(this.getLocale().ProfileUpdatedMessage);
      Application.setupUserMenuChooser();
      Application.goBack();
    }.bind(this),
    failure: function() {
      callback._onCompletion();
      UIUtils.showMessage(this.getLocale().UpdateFailedMessage);
    }.bind(this),
    error: function() {
      callback._onCompletion();
      UIUtils.showMessage(I18n.getLocale().literals.ServerErrorMessage);
    },

    _onCompletion: function() {
      this._updating = false;
      this._currentPasswordElement.setValue("");
      UIUtils.hideSpinningWheel();
    }.bind(this)
  }

  this._updating = true;
  UIUtils.showSpinningWheel();
  
  var userProfile = {
    name: this._nameElement.getValue(),
//    zipcode: this._zipcodeElement.getSelectedData(),
  };

  if (newPassword.length > 0) {
    userProfile.password = newPassword;
  }
  
  var currentPassword = this._currentPasswordElement.getValue();
  
  Backend.updateUserProfile(userProfile, currentPassword, callback);
}
