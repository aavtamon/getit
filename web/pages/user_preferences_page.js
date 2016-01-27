UserPreferencesPage = ClassUtils.defineClass(AbstractPage, function UserPreferencesPage() {
  AbstractPage.call(this, UserPreferencesPage.name);
  
  this._passwordElement;
  this._retypePasswordElement;

  this._currentPasswordElement;
  
  this._termsAndCondsCheckbox;
  
  this._updating = false;
});

UserPreferencesPage.prototype.definePageContent = function(root) {
  console.debug("Zzz")
  
  var signUpPanel = UIUtils.appendBlock(root, "UserPreferencesPanel");
  UIUtils.appendLabel(signUpPanel, "SignUpLabel", this.getLocale().SignUpLabel);

  console.debug("Zzzuuu")
  
  /*
  var emailPanel = UIUtils.appendBlock(signUpPanel, "EmailPanel");
  UIUtils.appendLabel(emailPanel, "EmailLabel", I18n.getLocale().literals.EmailLoginLabel);
  this._emailElement = UIUtils.appendTextInput(emailPanel, "Email");

  var namePanel = UIUtils.appendBlock(signUpPanel, "NamePanel");
  UIUtils.appendLabel(namePanel, "NameLabel", this.getLocale().NameLabel);
  this._nameElement = UIUtils.appendTextInput(namePanel, "Name", 30, ValidationUtils.ID_REGEXP);

  var zipcodePanel = UIUtils.appendBlock(signUpPanel, "ZipcodePanel");
  UIUtils.appendLabel(zipcodePanel, "ZipcodeLabel", this.getLocale().ZipcodeLabel);
  this._zipcodeElement = UIUtils.appendTextInput(zipcodePanel, "Zipcode", 6, ValidationUtils.NUMBER_REGEXP);
  UIUtils.appendExplanationPad(zipcodePanel, "ZipcodeExplanation", this.getLocale().ZipcodeExplanationTilte, this.getLocale().ZipcodeExplanationText);

  var passwordPanel = UIUtils.appendBlock(signUpPanel, "PasswordPanel");
  UIUtils.appendLabel(passwordPanel, "PasswordLabel", I18n.getLocale().literals.PasswordLabel);
  this._passwordElement = UIUtils.appendPasswordInput(passwordPanel, "Password");
  
  var retypePasswordPanel = UIUtils.appendBlock(signUpPanel, "RetypePasswordPanel");
  UIUtils.appendLabel(retypePasswordPanel, "RetypePasswordLabel", I18n.getLocale().literals.RetypePasswordLabel);
  this._retypePasswordElement = UIUtils.appendPasswordInput(retypePasswordPanel, "RetypePassword");

  UIUtils.get$(this._passwordElement).on("input", function() {
    this._retypePasswordElement.setValue("");
  }.bind(this));


  var licenseLinkId = UIUtils.createId(signUpPanel, "TermsAndCondsLink");
  this._termsAndCondsCheckbox = UIUtils.appendCheckbox(signUpPanel, "TermsAndCondsCheckbox", this.getLocale().AcceptTermsProvider(licenseLinkId));
  UIUtils.setClickListener(licenseLinkId, function() {
    this._showLicenseAgreement();
    setTimeout(this._termsAndCondsCheckbox.setValue.bind(this, false), 0);
  }.bind(this));

  var buttonsPanel = UIUtils.appendBlock(signUpPanel, "ButtonsPanel");
  var signUpButton = UIUtils.appendButton(buttonsPanel, "SignUpButton", "");
  UIUtils.setClickListener(signUpButton, function() {
    this._signUp();
  }.bind(this));
  */
}

UserPreferencesPage.prototype.onShow = function() {
//  this._passwordElement.setValue("");
//  this._retypePasswordElement.setValue("");
//  
//  this._signing = false;
}

UserPreferencesPage.prototype.onHide = function() {
}


UserPreferencesPage.prototype._signUp = function() {
  if (this._signing) {
    return;
  }
  
  var email = this._emailElement.getValue();
  if (!ValidationUtils.isValidEmail(email)) {
    UIUtils.indicateInvalidInput(this._emailElement);
    UIUtils.showMessage(this.getLocale().ProvideEmailMessage);
    return;
  }

  var name = this._nameElement.getValue();
  if (!ValidationUtils.isValidId(name)) {
    UIUtils.indicateInvalidInput(this._nameElement);
    UIUtils.showMessage(this.getLocale().ProvideNameMessage);
    return;
  }

  var zip = this._zipcodeElement.getValue();
  if (!ValidationUtils.isValidZip(zip)) {
    UIUtils.indicateInvalidInput(this._zipcodeElement);
    UIUtils.showMessage(this.getLocale().ProvideZipMessage);
    return;
  }

  var password = this._passwordElement.getValue();
  if (!ValidationUtils.isValidPassword(password)) {
    UIUtils.indicateInvalidInput(this._passwordElement);
    UIUtils.showMessage(this.getLocale().ProvideCorrectPasswordMessage);
    return;
  }

  var retypePassword = this._retypePasswordElement.getValue();
  if (retypePassword != password) {
    UIUtils.indicateInvalidInput(this._retypePasswordElement);
    UIUtils.showMessage(this.getLocale().PasswordsDoNotMatchMessage);
    return;
  }

  if (!this._termsAndCondsCheckbox.getValue()) {
    var licenseLinkId = UIUtils.createId(this._termsAndCondsCheckbox.parentElement, "TermsLink");
    UIUtils.showMessage(this.getLocale().MustAcceptTermsMessageProvider(licenseLinkId));
    UIUtils.setClickListener(licenseLinkId, function() {
      UIUtils.hideMessage();
      this._showLicenseAgreement();
    }.bind(this));

    return;
  }


  var backendCallback = {
    success: function() {
      backendCallback._onCompletion();

      this._emailElement.setValue("");
      this._nameElement.setValue("");
      this._zipcodeElement.setValue("");
      this._passwordElement.setValue("");
      this._retypePasswordElement.setValue("");

      Application.setupUserMenuChooser();
      Application.showPage(WelcomePage.name);
    }.bind(this),
    failure: function() {
      backendCallback._onCompletion();
      UIUtils.showMessage(this.getLocale().AccountCreationFailedMessage);
    }.bind(this),
    conflict: function() {
      backendCallback._onCompletion();
      UIUtils.showMessage(this.getLocale().AccountAlreadyExistsMessage);
    }.bind(this),
    error: function() {
      backendCallback._onCompletion();
      UIUtils.showMessage(I18n.getLocale().literals.ServerErrorMessage);
    },

    _onCompletion: function() {
      this._signing = false;
      UIUtils.hideSpinningWheel();
    }.bind(this)
  }

  var userProfile = {
    login: email,
    password: password,
    name: name,
    zipcode: zip,
  };

  this._updating = true;
  UIUtils.showSpinningWheel();

  Backend.registerUser(userProfile, backendCallback);
}
