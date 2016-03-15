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
    "SearchButton": "Search",
    
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
    
    "IncorrectAttachmentMessage": "You can only attach images",
    "AttachmentTooBigMessageProvider": function(maxSize) { return "The image size should be less than " + maxSize +" MGb" },
    
    
    "StreamStatusProvider": function(status) {
      var statusMessage = "Status: ";
      
      if (status == Backend.NegotiationStream.STATUS_ACTIVE) {
        statusMessage += "In negotiation";
      } else if (status == Backend.NegotiationStream.STATUS_DENIED) {
        statusMessage += "Denied";
      } else if (status == Backend.NegotiationStream.STATUS_RECALLED) {
        statusMessage += "Recalled";
      } else if (status == Backend.NegotiationStream.STATUS_ACCEPTED) {
        statusMessage += "Accepted, waiting a confirmation";
      } else if (status == Backend.NegotiationStream.STATUS_ACCEPTANCE_CONFIRMED) {
        statusMessage += "Accepted and confirmed, awaiting pickup/delivery";
      } else if (status == Backend.NegotiationStream.STATUS_DELIVERED) {
        statusMessage += "Delivered/picked, awaiting confirmation";
      } else if (status == Backend.NegotiationStream.STATUS_DELIVERY_CONFIRMED) {
        statusMessage += "Delivery/pick up confirmed";
      } else if (status == Backend.NegotiationStream.STATUS_RETURNED) {
        statusMessage += "Returned, awaiting confirmation";
      } else if (status == Backend.NegotiationStream.STATUS_RETURN_CONFIRMED) {
        statusMessage += "Return confirmed, deposit will be released soon";
      } else if (status == Backend.NegotiationStream.STATUS_CLOSED) {
        statusMessage += "Closed, payment withdrawn, deposit released";
      }
      
      return statusMessage;
    }
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
      "MessageButton": "Write a message"
    },
    "WriteMessageDialog": {
      "Title": "Send A Message...",
      "SendButton": "Send",
      "IncorrectMessageMessage": "Please write a message that you want to send",
      "MessageIsSentMessage": "Your message is sent successfully",
      "FailedToSendMessage": "Failed to send the message"
    },
    "CreateNewOfferDialog": {
      "Title": "Making An Offer...",
      "DescriptionLabel": "I am offerring:",
      "ChooseToolText": "You can choose from your collection...",
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
      "FailedToSendOffer": "We failed to send your offer. Please try again"
    },
    "NegotiateRequestDialog": {
      "Title": "Negotiate...",
      "MessageLabel": "Note:"
    },
    "NegotiateOfferDialog": {
      "Title": "Negotiate...",
    },
    "RecallRequestDialog": {
      "Title": "Request Cancellation",
      "Text": "Do you really want to cancel your request?<br>It will remove it completely. Any outstanding offers that you have will be declined."
    },
    "RecallNegotiationStreamDialog": {
      "Title": "Terminate This Conversation...",
      "Text": "Do you really want to stop this conversation and cancel any offers/negotiations that you have made?"
    },
    "RecallOfferDialog": {
      "RecallOffer": "Offer Recall",
      "RecallOfferText": "Do you really want to recall your offer?<br>It will remove it completely."
    },
    "ConfirmOfferDialog": {
      "Title": "Offer Confirmation",
      "TextProvider": function() { return "By confirming this offer you accept all the conditions that was negotiated and commit to provide the goods as your agreed to provide."},
      "ConfirmOfferButton": "Confirm all conditions"
    },
    "AcceptOfferDialog": {
      "Title": "Offer Acceptance",
      "TextProvider": function(offer) { return "By accpeting this offer you are agreing to the following: TBD."},
      "AcceptOfferButton": "Accept"
    },
    "DismissRequestWithOffersDialog": {
      "RequestHasOffer": "Remove The Request And Recall The Offer",
      "RequestHasOfferText": "Do you really want to recall the offer you have made and get rid of the request?"
    },
    "ChooseToolDialog": {
      "Title": "Choose Tool From Collection",
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
      
      "SearchLabel": "Search what our members offer:",
      
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
      "NameLabel": "Name",
      "ZipcodeLabel": "Zip Code",
      "ZipcodeExplanationTilte": "What do we need you zip code for?",
      "ZipcodeExplanationText": "We use your zip code to identify the area for the requests that might be of your interest",
      
      "AppropriateAgeCheckbox": "I confirm that I am at least 18 years of age",
      "AcceptTermsProvider": function(linkId) { return "I acknowledge that have read and agree to the <a id='" + linkId + "'>Terms And Conditions</a>"; },

      "ProvideEmailMessage": "The email is not provided or does not look like a valid email address",
      "ProvideNameMessage": "You must provide a valid name. Do not use special characters",
      "ProvideZipMessage": "You must provide a valid zipcode",
      "ProvideCorrectPasswordMessage": "Password should be at least 5 symbols long",
      "PasswordsDoNotMatchMessage": "Passwords do not match. Please retype.",
      "MustAcceptTermsMessageProvider": function(linkId) { return "You must accept<p><a id='" + linkId + "'><b>Terms And Conditions<b></a>"; },
      "AccountCreationFailedMessage": "Failed to create an account",
      "AccountAlreadyExistsMessage": "This login (email) was already used",
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
      "CancelStreamButton": "Recall my offers",
      "RemoveOfferButton": "Remove/Ignore offer",
      "RecallRequestButton": "Recall my request",
      "NegotiateButton": "Negotiate",
      "AcceptOfferButton": "Accept offer",
      "ConfirmOfferButton": "Confirm acceptance",
      "ConfirmDeliveryButton": "Delivered",
      "AcceptDeliveryButton": "Accept delivery",
      "DeclineOfferButton": "Decline offer",
      
      "ZipLabel": "Zip code:",
      "DistanceLabel": "Distance:",
      "DistanceProvider": function(distance) { return distance + (distance == 1 ? " mile" : " miles"); },
      "DeliveryAddressLabel": "Delivery address:",
      "PickupAddressLabel": "Pickup address:",
      
      
      "StatusLabel": "Important:",
      "StatusMessageRecalled": "The request was recalled and is no longer accessible. Please remove it from your view.",
      "StatusMessageClosed": "The request was closed and is no longer accessible. Please remove it from your view.",
      "StatusMessageUpdating": "Updating...",
      "StatusMessageNoOffers": "You are still waiting for a response. No updates just yet",
      "StatusMessageOffersWaitingResponse": "There are offers for your attention",
      "StatusMessageOfferConfirmed": "The offer that you accepted is confirmed. You should deliver/pickup as you agreed",
      "StatusMessageOfferRecalled": "The offer was recalled",
      "StatusMessageNewNegotiations": "New response(s) requires your attention, please review"
    },
    "UserProfilePage": {
      "ProfileLabel": "Your Profile",
      "NameLabel": "Name",
      "ZipcodeLabel": "Zip Code",
      "NewPasswordLabel": "New Password",
      "RetypePasswordLabel": "Re-enter Password",
      "CurrentPasswordLabel": "Current Password",
      "UpdateButton": "Update",
      "EnterPasswordMessage": "You must enter current password to update your profile",
      "NameNotSetMessage": "Name should be set",
      "LanguageNotSetMessage": "Languages should be set",
      "ProvideCorrectPasswordMessage": "Password should be at least 5 symbols long",
      "PasswordsDoNotMatchMessage": "Passwords do not match. Please retype.",
      "ProfileUpdatedMessage": "Your profile was successfully updated",
      "UpdateFailedMessage": "Cannot update user profile.<br>Please make sure your current password is correct."
    },
    "UserPreferencesPage": {
      "PreferencesLabel": "My Preferences",
      "LocationPreferencesLabel": "Location",
      "RequestPreferencesLabel": "Incoming Requests",
      
      "DetailLocationLabel": "Block-level home location:",
      "DetailLocationExplanationTitle": "Block-level location",
      "DetailLocationExplanationText": "Provide this location so that others can generally identify the area of your service",
      "AddressLabel": "Street Address:",
      "AddressExplanationTitle": "Street Address",
      "AddressExplanationText": "This is the detailed address that will only be made avalable to others when you request to deliver something to your house",
      "CategoryFilterLabel": "Only these categories:",
      
      "ToolLibraryLabel": "My Tool Collection",
      "ToolLibraryExplanationTitle": "Tool Library",
      "ToolLibraryExplanationText": "If you have a set of tools that you are going to offer, you may want to define them here and then easily offer in one click",
      "AddButton": "Add",
      "RemoveButton": "Remove",
      "EditButton": "Edit",
      "UpdateButton": "Update",
      
      "EditToolDialogTitle": "Create Or Edit The Tool",
      "ToolNameLabel": "Tool name:",
      "EditToolDialog_DescriptionLabel": "Describe what you have to offer",
      "EditToolDialog_IncorrectToolNameMessage": "Please give your tool a name",
      "EditToolDialog_IncorrectDescriptionMessage": "Please describe what you have to offer",
      "EditToolDialog_IncorrectPaymentMessage": "Payment should be expressed as a valud dollar amount",
      
      "PreferencesUpdatedMessage": "User preferences were successfully updated",
      "UpdateFailedMessage": "Failed to update user preferences"
    },
    "PageNotFoundPage": {
      "NotFoundLabel": "Page Not Found",
      "CreateRequestDialogTitle": "I Need..."
    }
  }
}
