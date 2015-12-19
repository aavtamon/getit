AbstractDataPage = ClassUtils.defineClass(AbstractPage, function AbstractDataPage(pageId) {
  AbstractPage.call(this, pageId);
  
  this._updateListener;
});

AbstractDataPage.prototype.definePageContent = function(root) {
  if (!Backend.isLogged()) {
    throw AbstractPage.prototype.NO_CONTENT;
  }
  
  this._updateListener = function(event) {
    if (event.type == Backend.CacheChangeEvent.TYPE_UPDATE_STARTED) {
      UIUtils.showSpinningWheel();
    } else if (event.type == Backend.CacheChangeEvent.TYPE_UPDATE_FINISHED) {
      UIUtils.hideSpinningWheel();
    }
  };
}

AbstractDataPage.prototype.definePageNoContent = function(root, reason) {
  var contentPanel = UIUtils.createBlock("AbstractDataPage-ContentPanel");
  root.appendChild(contentPanel);
  
  if (reason == AbstractPage.prototype.NO_CONTENT) {
    UIUtils.appendLabel(contentPanel, "ReasonLabel", I18n.getPageLocale("AbstractDataPage").NoContentLabel);

    var loginLink = UIUtils.appendButton(contentPanel, "LoginLink", I18n.getPageLocale("AbstractDataPage").LoginLink);
    UIUtils.setClickListener(loginLink, function() {
      Application.showPage(LoginPage.name);
    });
  } else if (reason == AbstractPage.prototype.EXPIRED) {
    UIUtils.appendLabel(contentPanel, "ReasonLabel", I18n.getPageLocale("AbstractDataPage").ExpiredLabel);
  } else {
    UIUtils.appendLabel(contentPanel, "ReasonLabel", I18n.getPageLocale("AbstractDataPage").CannotDisplayLabel);
    console.error(reason);
  }
}

AbstractDataPage.prototype.onShow = function(root, paramBundle) {
  Backend.addCacheChangeListener(this._updateListener);
}

AbstractDataPage.prototype.onHide = function() {
  Backend.removeCacheChangeListener(this._updateListener);
  UIUtils.hideSpinningWheel();
}

