var Locale_eng = {
  "images": {
  },
  "literals": {
    "AppTitle": "Get It!",
    "ServerErrorMessage": "Server communication error",
    
    "CancelOperationButton": "Cancel",
    "OkButton": "OK",
    "AttachButton": "Attach",
    "ConfirmButton": "Confirm",
    
    "ProfileItem": "Profile",
    "PreferencesItem": "Preferences",
    "LogOutItem": "Log Out",
    
    "ContactUs": "Contact Us",
    
    "Today": "Today",
    "Yesterday": "Yesterday",
    
    "EmailLoginLabel": "Email",
    "PasswordLabel": "Password",
    "RetypePasswordLabel": "Confirm Password",
    
    "NameMe": "Me",
    "Recalled": "R E C A L L E D",
    "Closed": "C l o s e d",
    "Declined": "D e c l i n e d",
    
    
    "LanguageRussian": "Russian",
    "LanguageEnglish": "English",
    "LanguageGerman": "German",
    "LanguageSpanish": "Spanish",
    "LanguageFrench": "French",
    "LanguagePortugeese": "Portugeese",
    "LanguageGreece": "Greece",
    "LanguageGondurasee": "Gondurasee",
    
    "PaymentFree": "free",
    "PaymentDaily": "per day",
    "PaymentWeekly": "per week",
    "PaymentMonthly": "per month",
    
    "PickupPickup": "pickup myself",
    "PickupDeliver": "need a delivery",
    "PickupAny": "pickup or get it delivered",
    
    "DeliveryPickup": "let you pickup",
    "DeliveryDeliver": "deliver",
    "DeliveryAny": "deliver or let you pickup",
  },
  "dialogs": {
    "CreateNewRequestDialog": {
      "Title": "Request Creation",
      "CategoryLabel": "My need belongs in:",
      "DescriptionLabel": "I am looking for:",
      "GetOnLabel": "I want to get it on:",
      "ReturnByLabel": "I will return it by:",
      "PickupLabel": "I will: ",
      "PaymentLabel": "I am ready to get it for: ",
      
      "IncorrectRequestDescriptionMessage": "Please provide the details of your need",
      "IncorrectRequestProposedPaymentMessage": "Payment is a dollar amount that you are ready to pay, like 3.00",
      "IncorrectRequestGetOnDateMessage": "Please select a valid pickup/delivery date. It must be a valid future date",
      "IncorrectRequestReturnByDateMessage": "Please select a valid return date. It must be a valid date after a pickup date",
      "RequestIsSentMessage": "Your request is sent. Watch incoming offers soon!",
      "FailedToSendRequest": "We failed to send your request. Please try again",
    },
    "RequestDetailsDialog": {
      "Title": "Request Details",
      "OfferButton": "Make an offer",
    },
    "CreateNewOfferDialog": {
      "Title": "Making An Offer...",
      "DescriptionLabel": "I am offerring:",
      "GetOnLabel": "I can provide it on:",
      "ReturnByLabel": "I want it back by:",
      "DeliveryLabel": "I can:",
      "PaymentLabel": "I can offer it for: ",
      "DepositLabel": "Deposit:",
      
      "IncorrectOfferDescriptionMessage": "Please provide the details of your offer",
      "IncorrectOfferProposedPaymentMessage": "Payment is a dollar amount that you want to get, like 3.00",
      "IncorrectOfferGetOnDateMessage": "Please select a valid pickup/delivery date. It must be a valid future date",
      "IncorrectOfferReturnByDateMessage": "Please select a valid return date. It must be a valid date after a pickup date",
      "OfferIsSentMessage": "Your offer is sent. You will know soon if it is accepted",
      "FailedToSendOffer": "We failed to send your offer. Please try again",
      "IncorrectAttachmentMessage": "You can only attach images",
      "AttachmentTooBigMessageProvider": function(maxSize) { return "The image size should be less than " + maxSize +" MGb" },
    },
    "NegotiateRequestDialog": {
      "Title": "Negotiate...",
      "MessageLabel": "Note:"
    },
    "NegotiateOfferDialog": {
      "Title": "Negotiate...",
    },
    "RecallRequestDialog": {
      "RecallRequest": "Request Cancellation",
      "RecallRequestText": "Do you really want to cancel your request?<br>It will remove it completely. Any outstanding offers that you have will be declined."
    },
    "RecallOfferDialog": {
      "RecallOffer": "Offer Recall",
      "RecallOfferText": "Do you really want to recall your offer?<br>It will remove it completely."
    }
  },
  "pages": {
    "AbstractDataPage": {
      "NoContentLabel": "This page cannot be displayed because you are not logged in",
      "LoginLink": "Login",
      "ExpiredLabel": "This page is expired",
      "CannotDisplayLabel": "The page cannot be displayed"
    },
    "LoginPage": {
      "RememberLoginLabel": "Keep me logged in",
      "SignInButton": "Log In",
      "ForgotPassowrdLink": "Forgot your password?",
      "RegisterLink": "Sign Up",
      "DownloadAppsLabel": "Download our mobile applications:",
      
      "InvalidCredentialsMessage": "Invalid login/password combination",
      "InvalidLoginMessage": "Please provide a valid email for your login",
      "ProvideLoginPasswordMessage": "Please provide login and password",
      "PasswordResetMessage": "You will receive an email shortly with a link to reset the password. You may ignore the email if you do not need to reset your password.",
      "PasswordResetRequestMessage": "The request is being sent...",
      "IncorrectEmailMessage": "Your login does not look like a valid email",
      "UnexistingEmailMessage": "Something went wrong. Please make sure that you provided a correct email address",
      
      "ProjectDescriptionHtml": ""
    },
    "RegisterPage": {
      "SignUpLabel": "Sign Up",
      "AppropriateAgeCheckbox": "I confirm that I am at least 18 years of age",
      "AcceptTermsProvider": function(linkId) { return "I acknowledge that have read and agree to the <a id='" + linkId + "'>Terms And Conditions</a>"; },
      "LanguageClarificationText": "In what languages you would like to get inquiries. Specify those which you fluently speak and would like to use for your communication",
      "NicknameClarificationText": "Nickname is optional and will never be visible to anybody. It is only used to address you",
      
      "ProvideLoginMessage": "The email is not provided or does not look like a valid email address",
      "ProvideNicknameMessage": "You must provide a nickname",
      "ProvideLanguageMessage": "One or more languages must be set",
      "ProvideCorrectPasswordMessage": "Password should be at least 5 symbols long",
      "PasswordsDoNotMatchMessage": "Passwords do not match. Please retype.",
      "MustBeOver18Message": "Please confirm that your age is over 18",
      "MustAcceptTermsMessageProvider": function(linkId) { return "You must accept<p><a id='" + linkId + "'><b>Terms And Conditions<b></a>"; },
      "AccountCreationFailedMessage": "Failed to create an account",
      "AccountAlreadyExistsMessage": "This login (email) was already used"
    },
    "RestorePasswordPage": {
      "ChangePasswordButton": "Change password",
      "LoginLink": "Login",
      
      "PasswordChangedMessage": "Your password was successfully changed",
      "UnknownLoginOrTokenMessage": "Your recovery token expired or you provided an incorrect email",
      "ProvideLoginMessage": "The email is not provided or does not look like a valid email address",
      "ProvideCorrectPasswordMessage": "Password should be at least 5 symbols long",
      "PasswordsDoNotMatchMessage": "Passwords do not match. Please retype.",
    },
    "WelcomePage": {
      "WelcomeProvider": function(name) { return "Welcome, " + name + "<p> We are gald to see you in here. This super site gives you access to an absolutely unique abilities and experiences. Here is how you should use it"; },
      "GoBackLinkProvider": function(linkId) { return "Click <a id='" + linkId + "'>Home</a> to start!"; }
    },
    "HomePage": {
      "CreateRequestButton": "I need something",
      
      "RequestOutlineGetOnLabel": "Neened on:",
      "RequestOutlineReturnByLabel": "To be returned by:",
      "RequestOutlinePickupLabel": "Delivery: ",
      
    },
    "RequestDetailsPage": {
      "ConfirmOffer": "Offer Confirmation",
      "ConfirmOfferTextProvider": function() { return "By confirming this offer you accept all the conditions that was negotiated and commit to provide the goods as your agreed to provide."},
      "RequestHasOffer": "Remove The Request And Recall The Offer",
      "RequestHasOfferText": "Do you really want to recall the offer you have made and get rid of the request?",
      
      "RecallOfferButton": "Recall my offer",
      "RecallRequestButton": "Recall my request",
      "NegotiateButton": "Negotiate",
      "AcceptButton": "Accept offer",
      "DeclineButton": "Decline offer",
      "ConfirmOfferButton": "Confirm all conditions",
      
      "ZipLabel": "Zip code:",
      "DistanceLabel": "Distance:",
      "DeliveryAddressLabel": "Delivery address:",
      "PickupAddressLabel": "Pickup address:",
      
      "MakeOfferButton": "Make an offer",
      
      "StatusLabel": "Important:",
      "StatusMessageRecalled": "The request was recalled and is no longer accessible. Please remove it from your view.",
      "StatusMessageClosed": "The request was closed and is no longer accessible. Please remove it from your view.",
      "StatusMessageUpdating": "Updating...",
      "StatusMessageNoOffers": "You are still waiting for a response. No updates just yet",
      "StatusMessageOffersWaitingResponse": "There are offers for your attention",
      "StatusMessageOfferConfirmed": "The offer that you accepted is confirmed. YOu should deliver/pickup as you agreed",
      "StatusMessageOfferRecalled": "The offer was recalled",
      "StatusMessageNewNegotiations": "New response(s) requires your attention, please review"
    },
    "UserProfilePage": {
      "ProfileLabel": "Profile",
      "NewPasswordLabel": "New Password",
      "ConfirmNewPasswordLabel": "Re-enter New Password",
      "CurrentPasswordLabel": "Current Password",
      "UpdateButton": "Update",
      "PasswordClarificationText": "Type a new password only if you want to change the current one",
      "LanguageClarificationText": "In what languages you would like to get inquiries",
      "EnterPasswordMessage": "You must enter current password to update your profile",
      "NameNotSetMessage": "Name should be set",
      "LanguageNotSetMessage": "Languages should be set",
      "ProvideCorrectPasswordMessage": "Password should be at least 5 symbols long",
      "PasswordsDoNotMatchMessage": "Passwords do not match. Please retype.",
      "ProfileUpdatedMessage": "Your profile was successfully updated",
      "UpdateFailedMessage": "Cannot update user profile.<br>Please make sure your current password is correct."
    },
    "PageNotFoundPage": {
      "NotFoundLabel": "Page Not Found",
      "CreateRequestDialogTitle": "I Need..."
    }
  }
}
