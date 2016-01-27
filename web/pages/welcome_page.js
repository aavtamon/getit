WelcomePage = ClassUtils.defineClass(AbstractPage, function WelcomePage() {
  AbstractPage.call(this, WelcomePage.name);
});

WelcomePage.prototype.definePageContent = function(root) {
  var descriptionPanel = UIUtils.appendBlock(root, "Description");
  descriptionPanel.innerHTML = this.getLocale().WelcomeProvider(Backend.getUserProfile().name);
  
  var goBackPanel = UIUtils.appendBlock(root, "GoHome");
  var linkId = UIUtils.createId(goBackPanel, "HomePageLink");
  goBackPanel.innerHTML = this.getLocale().GoBackLinkProvider(linkId);
  
  UIUtils.setClickListener(linkId, function() {
    Application.showMenuPage(HomePage.name);
  });
}
