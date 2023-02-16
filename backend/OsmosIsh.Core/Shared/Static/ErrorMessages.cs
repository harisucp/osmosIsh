using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.Shared.Static
{
    public class ErrorMessages
    {
        // Common
        public const string INTERNAL_SERVER_ERROR = "Internal Server Error from the custom middleware.";

        // Auth API Controller
        public const string RECORD_NOT_EXIST = "No Record Found";
        public const string USERNAME_PASSWORD_INCORRECT = "Username and Password incorrect.";
        public const string EMAIL_NOT_REGISTERED = "Email not registered.";
        public const string EXTERNAL_EMAIL_NOT_REGISTERED = "Forgot password is not allowed with external login credentials.";
        public const string REST_PASSWORD_LINK_EXPIRED = "Reset password link expired/Invalid.";
        public const string EMAIL_ALREADY_REGISTERED = "It looks like you've already got an account associated with this email. Log in instead or reset your password if you've forgotten it.";
        public const string INVALID_LOGIN_PROVIDER = "Invalid login Provider supplied.";
        public const string PASSWORD_NOT_CHANGED = "System facing trouble to update your password.";
        public const string INCORRECT_OLD_PASSWORD = "Incorrect old password.";
        public const string EMAIL_NOT_VERIFIED = "It looks like you've already got an account associated with this email. but not verified.";
        public const string ACCOUNT_VERIFICATION_LINK_EXPIRED = "Your Verification link has been expired, please generate a new one by Login through Osmos-ish account.";
        public const string PHONE_VERIFICATION_FAILED = "Phone number invalid.";
        public const string PHONE_VERIFICATION_OTP_EXPIRED = "Your OTP is not valid, please try again."; 


        //Common API Controller
        public const string RECORD_NOT_SAVED = "Record not saved sucessfully.";
        public const string DATA_NOT_MAPPED_SCREEN = "Data not mapped properly with this screen name in json.";
        public const string DATA_NOT_MAPPED_TAB = "Data not mapped properly with this tab name in json.";

        //Subscription API Controller
        public const string EMAIL_ALREADY_SUBSCRIBED = "Email already subscribed.";
        public const string EMAIL_NOT_SUBSCRIBED = "Email not subscribed.";


        //Session API Controller
        public const string SESSION_NOT_SAVED = "Session not saved successfully.";
        public const string SESSION_NOT_LESS_CURRENT_TIME = "Session start datetime can not be less the current datetime.";
        public const string SESSION_NOT_OVERRIDE = "Session can not overlap another session.";
        public const string PRIVATE_SESSION_TIME_SLOT_NOT_AVAILABLE = "Private session time slot not available.";
        public const string PRIVATE_SESSION_OVERLAP = "This time slot is currently being requested. Please select another time.";
        public const string FAILED_ACCEPT_SESSION = "Failed to accept private session.";


        //Series API Controller
        public const string SERIES_NOT_CREATED = "Series not saved successfully.";
        public const string SERIES_NOT_LESS_CURRENT_TIME = "Series start datetime can not be less the current datetime.";
        public const string SERRIES_SESSION_NOT_OVERRIDE = "Series session can not overlap another session.";

        // Teacher API Controller
        public const string TURTOR_NOT_EXISTS = "Tutor not exists.";
        public const string TUTOR_NOT_SAVED = "Tutor detail not saved successfully.";

        //Student API Controller
        public const string STUDENT_NOT_EXISTS = "Studnet not exists.";
        public const string STUDENT_NOT_SAVED = "Student detail not saved successfully.";
        public const string SERIES_NOT_EXIST = "Series not exist.";

        //Enrollment API Controller
        public const string ENROLLMENT_NOT_SAVED = "Item not added to cart.";
        public const string ENROLLMENT_NOT_REMOVED = "Item not removed from cart.";
        public const string ENROLLMENNT_NOT_ALLOWED = "Enrollment not allowed. You are the host.";
        
        //AmazonChime API Controller
        public const string NO_Session_Exists = "No session exists.";

        // Favourite message
        public const string NOT_ADDED_FAVOURITE = "Tutor is not added as favorite.";

        public const string ALREADY_ENROLLED = "You are already enrolled in this session/series.";

        // Chat Message
        public const string MESSAGE_STATUS_NOT_UPDATED = "Failed to update message status.";

        // Cart Items
        public const string CART_ITEMS_NOT_ADDED = "Cart items not saved.";

        //Deny private session
        public const string FAILED_DENY_SESSION = "Failed to deny private session.";

        //Generate Activation Link
        public const string ALREADY_ACTIVATED = "Account is already activated.";
        //Rating
        public const string RATING_ALREADY_EXISTS = "You have already submitted review for the session.";

        //Coupon
        public const string COUPON_ALREADY_EXISTS = "Coupon with same category already exists.";
        public const string COUPON_NOT_EXISTS = "Coupon code not exists.";
        public const string INVALID_COUPON= "Invalid/Expired Coupon Code.";
        public const string COUPON_NAME_ALREADY_EXISTS = "Coupon with same name already exists.";
        
        //Affiliate
        public const string AFFILIATE_ALREADY_REGISTER = "Affiliate Email already registered.";
        public const string AFFILIATE_NOT_EXISTS = "Affiliate not exists.";
        public const string AFFILIATE_CODE_INVALID = "Invalid affiliate code.";

        public const string INVALID_REQUEST = "Invalid request data.";

        public const string ZERO_RECORDS = "No record(s) found.";

        public const string INVALID_NEW_PASSWORD = "New password can not be the same as old password.";

        //public const string GENERAL_SYSTEM_ERROR = "Some thing went wrong please try again later or contact Osmosish support.";
    }
}
