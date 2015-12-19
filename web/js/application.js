
Application = {
  Configuration: {
    LANGUAGES: [ {data: "eng", display: I18n.getLocale().literals.LanguageEnglish}, {data: "rus", display: I18n.getLocale().literals.LanguageRussian}, {data: "ger", display: I18n.getLocale().literals.LanguageGerman}, {data: "esp", display: I18n.getLocale().literals.LanguageSpanish}, {data: "fra", display: I18n.getLocale().literals.LanguageFrench}, {data: "por", display: I18n.getLocale().literals.LanguagePortugeese}, {data: "grc", display: I18n.getLocale().literals.LanguageGreece}, {data: "gon", display: I18n.getLocale().literals.LanguageGondurasee} ],
    PAYMENT_RATES: [ {data: "free", display: I18n.getLocale().literals.PaymentFree}, {data: "day", display: I18n.getLocale().literals.PaymentDaily}, {data: "week", display: I18n.getLocale().literals.PaymentWeekly}, {data: "month", display: I18n.getLocale().literals.PaymentMonthly} ],
    PICKUP_OPTIONS: [ {data: "pickup", display: I18n.getLocale().literals.PickupPickup}, {data: "delivery", display: I18n.getLocale().literals.PickupDeliver}, {data: "any", display: I18n.getLocale().literals.PickupAny} ],
    NEGOTIATED_PICKUP_OPTIONS: [ {data: "pickup", display: I18n.getLocale().literals.PickupPickup}, {data: "delivery", display: I18n.getLocale().literals.PickupDeliver} ],
    DELIVERY_OPTIONS: [ {data: "pickup", display: I18n.getLocale().literals.DeliveryPickup}, {data: "delivery", display: I18n.getLocale().literals.DeliveryDeliver}, {data: "any", display: I18n.getLocale().literals.DeliveryAny} ],
    NEGOTIATED_DELIVERY_OPTIONS: [ {data: "pickup", display: I18n.getLocale().literals.DeliveryPickup}, {data: "delivery", display: I18n.getLocale().literals.DeliveryDeliver} ],
    DEPOSITES: [ {data: 0, display: I18n.getLocale().literals.DepositFree}, {data: 5, display: "$5"}, {data: 10, display: "$10"}, {data: 25, display: "$25"}, {data: 50, display: "$50"}, {data: 100, display: "$100"}, {data: 250, display: "$250"}, {data: 500, display: "$500"}, {data: 1000, display: "$1000"} ],

    dataToString: function(configurationItem, data) {
      var item = this.findConfigurationItem(configurationItem, data);
      return item != null ? item.display : null;
    },

    findConfigurationItem: function(configurationItems, data) {
      for (var i in configurationItems) {
        if (configurationItems[i].data == data) {
          return configurationItems[i];
        }
      }

      return null;
    }
  },
    
  _pageManager: null,
};


Application.AutoLogin = "true";


Application.start = function() {
  this._pageManager = new PageManagement(document.getElementById("RootContainer"), [LoginPage, RestorePasswordPage]);
  
  window.onunload = function() {
    Backend.logOut();
  }
  
  $("#Title-Caption").text(I18n.getLocale().literals.AppTitle);
  
  $("#Footer-ContactUs").text(I18n.getLocale().literals.ContactUs);
  $("#Footer-ContactUs").click(function() {
    UIUtils.showDialog("", "We will need to find a way to open this page");
  });

  
  var showDefaultPage = function() {
    if (Backend.isLogged()) {
      Application.showPage(HomePage.name);
    } else {
      Application.showPage(LoginPage.name);
    }
  }
  
  $("#Title-Caption").click(function() {
    showDefaultPage();
  });
  $("#Title-Logo").click(function() {
    showDefaultPage();
  });
  
  Application._setupLanguageChooser();

}

Application.logOut = function() {
  this._pageManager.destroy();
  
  UIUtils.hideMessage();
  UIUtils.hideSpinningWheel();
  UIUtils.hideDialog();

  Backend.logOut({
    success: function() {
      $("#Title-Options-Separator").css("display", "none");
      $("#Title-Options-User").css("display", "none");

      window.localStorage.remember = "no";
    }
  });
}

Application.reload = function() {
  this._pageManager.reload();

  UIUtils.hideMessage();
  UIUtils.hideSpinningWheel();
  UIUtils.hideDialog();
  
  $("#Footer-ContactUs").text(I18n.getLocale().literals.ContactUs);
}


Application.showPage = function(pageId, paramBundle) {
  this._pageManager.showPage(pageId, paramBundle);
}

Application.goBack = function(pageId, paramBundle) {
  this._pageManager.goBack();
}




Application.setupUserMenuChooser = function() {
  $("#Title-Options-User-Button").click(function() {
    if ($(".user-menu-popup").length > 0) {
      return;
    }
    
    var popup = UIUtils.appendBlock($("#Title-Options-User").get(0), "Title-User-Popup");
    UIUtils.addClass(popup, "user-menu-popup");
    
    
    var popupCloser = function() {
      var container = UIUtils.get$(popup);
      container.fadeOut("fast", function() {
        container.remove();
      });
    };
    
    var item = UIUtils.appendLink(popup, "ProfileItem", I18n.getLocale().literals.ProfileItem);
    UIUtils.addClass(item, "user-menu-item");
    UIUtils.setClickListener(item, function(lr) {
      popupCloser();
      Application.showPage(UserProfilePage.name);
    });
    
    var item = UIUtils.appendLink(popup, "PreferencesItem", I18n.getLocale().literals.PreferencesItem);
    UIUtils.addClass(item, "user-menu-item");
    UIUtils.setClickListener(item, function(lr) {
      popupCloser();
      Application.showPage(UserPreferencesPage.name);
    });
    
    popup.appendChild(UIUtils.createSeparator());
    
    var item = UIUtils.appendLink(popup, "LogOutItem", I18n.getLocale().literals.LogOutItem);
    UIUtils.addClass(item, "user-menu-item");
    UIUtils.setClickListener(item, function(lr) {
      popupCloser();
      
      Application.logOut();
      Application.showPage(LoginPage.name);
      
      return false;
    });
    
    Application._setPopupCloser("user-menu-popup");
  }.bind(this));
  
  $("#Title-Options-Separator").css("display", "inline-block");
  $("#Title-Options-User").css("display", "inline-block");
  $("#Title-Options-User-Button").text(Backend.getUserProfile().name);
}



Application._setupLanguageChooser = function() {
  $("#Title-Options-Language-Button").click(function() {
    if ($(".language-selection-popup").length > 0) {
      return;
    }
    
    var popup = UIUtils.appendBlock($("#Title-Options-Language").get(0), "Title-Language-Popup");
    UIUtils.addClass(popup, "language-selection-popup");
    
    for (var index in Application.Configuration.LANGUAGES) {
      var languageRecord = Application.Configuration.LANGUAGES[index];
      
      var item = UIUtils.appendLink(popup, languageRecord.data, languageRecord.display);
      UIUtils.addClass(item, "language-selection-item");

      UIUtils.setClickListener(item, function(lr) {
        UIUtils.get$(popup).remove();
        
        $("#Title-Options-Language-Button").text(lr.display);
        I18n.setCurrentLanguage(lr.data);
        window.localStorage.menuLanguage = lr.data;

        Application.reload();
        
        return false;
      }.bind(this, languageRecord));
    }
    
    Application._setPopupCloser("language-selection-popup");
  }.bind(this));
  
  var currentLanguage = window.localStorage.menuLanguage || Application.Configuration.LANGUAGES[0].data;
  var displayLanguage = Application.Configuration.LANGUAGES[0].display;
  for (var index in Application.Configuration.LANGUAGES) {
    if (Application.Configuration.LANGUAGES[index].data == currentLanguage) {
      displayLanguage = Application.Configuration.LANGUAGES[index].display;
      break;
    }
  }
  $("#Title-Options-Language-Button").text(displayLanguage);
}


Application._setPopupCloser = function(popupClass) {
  var popupSelector = "." + popupClass;
  UIUtils.listenOutsideClicks(popupSelector, function() {
      var container = UIUtils.get$(popupSelector);
      container.fadeOut("slow", function() {
        container.remove();
      });
  });
}


