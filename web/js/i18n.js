var I18n = {
  _currentLanguage: null,
}

I18n.ENGLISH = "eng";
I18n.RUSSIAN = "rus";

I18n._currentLanguage = I18n.ENGLISH;


I18n.setCurrentLanguage = function(lang) {
  this._currentLanguage = lang;
}

I18n.getLocale = function(lang) {
  var language = lang || this._currentLanguage;
  
  var locale = window["Locale_" + language];
  if (locale == null) {
    locale = window["Locale_" + I18n.ENGLISH];
  }
  
  return locale;
}

I18n.getPageLocale = function(page, lang) {
  return I18n.getLocale(lang).pages[page];
}



