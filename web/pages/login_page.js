LoginPage = ClassUtils.defineClass(AbstractPage, function LoginPage() {
  AbstractPage.call(this, LoginPage.name);
  
  this._loginElement;
  this._passwordElement;
  this._rememberCheckbox;
  this._searchList;
  
  this._signing = false;
});


LoginPage.prototype.definePageContent = function(root) {
  var searchPanel = UIUtils.appendBlock(root, "SearchPanel");
  
  var searchResultsPanel;
  UIUtils.appendLabel(searchPanel, "SearchLabel", this.getLocale().SearchLabel);
  var searchElement = UIUtils.appendSearchInput(searchPanel, "Search");
  searchElement.setSearchListener(function(text) {
    if (this._searchList != null) {
      this._searchList.destroy();
    }
    UIUtils.emptyContainer(searchResultsPanel);
    
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
      UIUtils.showSpinningWheel(true);
    } else {
      UIUtils.appendLabel(searchResultsPanel, "SearchResultsLabel", this.getLocale().SearchResultsLabel);
    }
  }.bind(this));

  searchResultsPanel = UIUtils.appendBlock(searchPanel, "SearchResultsPanel");
  UIUtils.appendLabel(searchResultsPanel, "SearchResultsLabel", this.getLocale().SearchResultsLabel);
  
  var loginPanel = UIUtils.appendBlock(root, "LoginPanel");

  var labelPanel = UIUtils.appendBlock(loginPanel, "LabelPanel");
  UIUtils.appendLabel(labelPanel, "EmailLabel", I18n.getLocale().literals.EmailLoginLabel);
  UIUtils.appendLabel(labelPanel, "PasswordLabel", I18n.getLocale().literals.PasswordLabel);
  
  var controlPanel = UIUtils.appendBlock(loginPanel, "ControlPanel");
  this._loginElement = UIUtils.appendTextInput(controlPanel, "Login");
  
  this._rememberCheckbox = UIUtils.appendCheckbox(controlPanel, "RememberLoginCheck", this.getLocale().RememberLoginLabel);
  
  this._passwordElement = UIUtils.appendPasswordInput(controlPanel, "Password");
  
  var forgotPasswordLink = UIUtils.appendLink(controlPanel, "ForgotPasswordLink", this.getLocale().ForgotPassowrdLink);
  UIUtils.setClickListener(forgotPasswordLink, this._restorePassword.bind(this));
  
  var buttonsPanel = UIUtils.appendBlock(controlPanel, "ButtonsPanel");
  var signInButton = UIUtils.appendButton(buttonsPanel, "SignInButton", this.getLocale().SignInButton);
  UIUtils.setClickListener(signInButton, function() {
    this._signIn();
  }.bind(this));

  
  var signUpLink = UIUtils.appendLink(buttonsPanel, "SignUpLink", this.getLocale().RegisterLink);
  UIUtils.setClickListener(signUpLink, function() {
    Application.showPage(RegisterPage.name);
  });
  
  
  var downloadsPanel = UIUtils.appendBlock(controlPanel, "DownloadsPanel");
  UIUtils.appendLabel(downloadsPanel, "DownloadAppsLabel", this.getLocale().DownloadAppsLabel);
  
  var downloadButtonsPanel = UIUtils.appendBlock(downloadsPanel, "DownloadButtonsPanel");
  var androidButton = UIUtils.appendButton(downloadButtonsPanel, "DownloadAndroidButton", "");
  UIUtils.setClickListener(androidButton, function() {
    window.open("https://play.google.com/store", "_blank");
  });
  
  var iOSButton = UIUtils.appendButton(downloadButtonsPanel, "DownloadiOSButton", "");
  UIUtils.setClickListener(iOSButton, function() {
    window.open("http://store.apple.com/us", "_blank");
  });
}


LoginPage.prototype.onShow = function(root, paramBundle) {
  if (Application.AutoLogin) {
    var autoSignAllowed = true;
    Application.AutoLogin = false;
  }
  
  
  var remember = window.localStorage.remember == "yes";

  if (remember && window.localStorage.login != null) {
    this._loginElement.setValue(window.localStorage.login);
  } else {
    this._loginElement.setValue("");
  }
  
  if (remember && window.localStorage.password != null) {
    this._passwordElement.setValue(window.localStorage.password);
  } else {
    this._passwordElement.setValue("");
  }
  
  this._rememberCheckbox.setValue(remember);
  
  this._signing = false;
  
  if (autoSignAllowed && this._loginElement.getValue() != "" && this._passwordElement.getValue() != "") {
    this._signIn();
  }
}

LoginPage.prototype.onHide = function() {
}


LoginPage.prototype._restorePassword = function() {
  var login = this._loginElement.getValue();

  if (!ValidationUtils.isValidEmail(login)) {
    UIUtils.indicateInvalidInput(this._loginElement);
    UIUtils.showMessage(this.getLocale().IncorrectEmailMessage);
    return;
  }
    
  callback = {
    success: function() {
      UIUtils.hideSpinningWheel();
      UIUtils.showMessage(this.getLocale().PasswordResetMessage, UIUtils.MESSAGE_TIMEOUT_SLOW);
    }.bind(this),
    failure: function() {
      UIUtils.hideSpinningWheel();
      UIUtils.showMessage(this.getLocale().UnexistingEmailMessage);
    }.bind(this),
    error: function() {
      UIUtils.hideSpinningWheel();
      UIUtils.showMessage(I18n.getLocale().literals.ServerErrorMessage);
    }
  }

  UIUtils.showMessage(this.getLocale().PasswordResetRequestMessage);
  UIUtils.showSpinningWheel();
  Backend.resetUserPassword(login, callback);
}

LoginPage.prototype._signIn = function() {
  if (this._signing) {
    return;
  }

  var login = this._loginElement.getValue();
  var isEmailValid = ValidationUtils.isValidEmail(login);
  if (!isEmailValid) {
    UIUtils.indicateInvalidInput(this._loginElement);
    UIUtils.showMessage(this.getLocale().InvalidLoginMessage);
    return;
  }
  
  var password = this._passwordElement.getValue();
  if (password == "") {
    UIUtils.indicateInvalidInput(this._passwordElement);
    UIUtils.showMessage(this.getLocale().ProvideLoginPasswordMessage);
    return;
  }

  if (this._rememberCheckbox.getValue()) {
    window.localStorage.login = login;
    window.localStorage.password = password;
    window.localStorage.remember = "yes";
  } else {
    window.localStorage.login = null;
    window.localStorage.password = null;
    window.localStorage.remember = "no";
  }

  var page = this;
  var backendCallback = {
    success: function() {
      this._onCompletion();
      Application.setupUserMenuChooser();
      Application.showPage(HomePage.name);
    },
    failure: function() {
      this._onCompletion();
      UIUtils.showMessage(page.getLocale().InvalidCredentialsMessage);
    },
    error: function() {
      this._onCompletion();
      UIUtils.showMessage(I18n.getLocale().literals.ServerErrorMessage);
    },

    _onCompletion: function() {
      this._signing = false;
      UIUtils.hideSpinningWheel();
    }.bind(this)
  }

  this._signing = true;
  UIUtils.showSpinningWheel();

  Backend.logIn(login, password, backendCallback);
}
