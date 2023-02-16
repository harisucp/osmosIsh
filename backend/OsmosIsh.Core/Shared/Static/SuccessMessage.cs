using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.Shared.Static
{
    public class SuccessMessage
    {
        //Common API Controller
        public const string RECORD_SAVED = "Record saved sucessfully.";
        public const string User_REGISTERED = "User Registered sucessfully.";

        //Auth API Contoller
        public const string RESET_PASSWORD_EMAIL = "Reset password mail send successfully.";
        public const string PASSWORD_REST = "Your password has been reset successfully. You will be redirected to the Home screen in a few seconds.";
        public const string PASSWORD_CHANGE = "Your Passsword has been changed successfully.";
        public const string LOGIN_SUCCESS = "Logon successful.";
        public const string MAIL_SUCCESS = "Mail sent successfully.";
        public const string ACCOUNT_VERIFIED_SUCCESS = "Account verified successfully.";
        public const string ACCOUNT_VERIFICATION_EMAIL = "Account verification mail sent successfully.";
        public const string PHONE_VERIFICATION_SUCCESS = "Phone number verification code sent successfully.";
        public const string PHONE_NUMBER_VERIFIED_SUCCESS = "Phone number verified successfully.";

        //Subscription API Controller
        public const string EMAIL_SUBSCRIBED = "Email subscribed successfully.";
        public const string EMAIL_UNSUBSCRIBED = "Email unsubscribed successfully.";
        public const string EMAIL_RESUBSCRIBED = "Email resubscribed successfully.";




        //Session API Controller
        public const string SESSION_SAVED = "Session saved successfully.";
        public const string PRIVATESESSIONSLOTS_SAVED = "Private session information updated successfully.";
        public const string PRIVATESESSIONREQUEST = "Private session request sent successfully.";
        public const string ACCEPT_PRIVATE_SESSION = "Private session request approved successfully.";


        //Session API Controller
        public const string SERIES_SAVED = "Series saved successfully.";

        //Teacher API Controller
        public const string TUTOR_SAVED = "Tutor detail saved successfully.";

        //Student API Controller
        public const string STUDENT_SAVED = "Student detail saved successfully.";

        //Enrollment API Controller
        public const string ENROLLMENT_SAVED = "Added in cart successfully.";
        public const string ENROLLMENT_REMOVED_SAVED = "Item removed from cart successfully.";

        //AmazonChime API Controller
        public const string Session_ENDED = "Session ended successfully.";


        // Favourite
        public const string ADDED_FAVOURITE = "Added tutor as favorite.";
        public const string Removed_FAVOURITE = "Removed tutor as favorite.";

        //Chat Message 
        public const string MESSAGE_STATUS_UPDATED = "Mesaage status updated.";

        // Cart Items Added
        public const string CART_ITEMS_ADDED = "Cart items added successfully.";

        // Deny Private Session
        public const string DENY_SESSION = "Denied private session successfully.";
        // Contact us
        public const string MESSAGE_SENT_SUCCESSFULLY = "Message sent successfully.";

        //Coupon
        public const string COUPON_CREATED_SUCCESSFULLY = "Coupon created sucessfully.";
        public const string COUPON_UPDATED_SUCCESSFULLY = "Coupon updated sucessfully.";
        public const string VALID_COUPON = "Coupon code applied successfully.";



        //Affiliate
        public const string AFFILIATE_CREATED_SUCCESSFULLY = "Affiliate created sucessfully.";
        public const string AFFILIATE_UPDATED_SUCCESSFULLY = "Affiliate updated sucessfully.";
        //public const string AFFILIATE_CODE_VERIFIED = "Affiliate code verified. If you save it, you will be eligible for {Teache_PayBack}% payback.";
        public const string AFFILIATE_CODE_VERIFIED = "Affiliate code verified.";
    }
}
