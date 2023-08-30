const API_URL = process.env.REACT_APP_API_URL;

const API_ENDPOINTS = {
  SIGNUP: "/AuthAPI/SignUp",
  SIGNIN: "/AuthAPI/Login",
  RESETFORGOTPASSWORD: "/AuthAPI/ResetForgotPassword",
  SUBSCRIBEEMAIL: "/SubscriptionAPI/SubscribeEmail",
  FORGOTPASSWORD: "/AuthAPI/ForgotPassword",
  EXTERNALLOGIN: "/AuthAPI/ExternalLogIn",
  COMMONSAVE: "/CommonAPI/SaveUpdateEntity",
  UNAUTHORIZEDDATA: "/CommonAPI/GetUnauthorizedData",
  NOTIFICATIONS: "/CommonAPI/GetUnauthorizedNotifications",
  CONTACTUS: "/AuthAPI/ContactUs",
  UPDATESTUDENTPROFILE: "/StudentAPI/UpdateStudentProfile",
  UPDATESTUDENTORTEACHERPROFILE: "/StudentAPI/UpdateStudentORTeacherProfile",
  UPDATETEACHERPROFILE: "/TeacherAPI/UpdateTeacherProfile",
  CREATEUPDATESESSION: "/SessionAPI/CreateUpdateSession",
  CREATESERIES: "/SeriesAPI/CreateSeries",
  UPDATESERIESDETAIL: "/SeriesAPI/UpdateSeriesDetail",
  UPDATESERIESSESSIONDETAIL: "/SeriesAPI/UpdateSeriesSessionDetail",
  CREATESTUDENT: "/StudentAPI/CreateStudent",
  CREATETUTORREQUEST: "/TeacherAPI/CreateTutorRequest",
  ENROLLMENTREQUEST: "/EnrollmentAPI/CreateEnrollmentRequest",
  DELETEENROLLMENT: "/EnrollmentAPI/DeleteEnrollmentRequest",
  CHANGEPASSSWORD: "/AuthAPI/ChangePassword",
  CHECKUSER: "/AuthAPI/CheckUser",
  SWITCHITEMFROMTOCART: "/EnrollmentAPI/SavedEnrollmentRequest",
  ADDFAVOURITE: "/EnrollmentAPI/AddFavourite",
  REQUESTPRIVATESESSION: "/SessionAPI/PrivateSessionRequest",
  CREATEMEETING: "/AmazonChimeAPI/CreateMeeting",
  JOINMEETING: "/AmazonChimeAPI/JoinMeeting",
  ENDMEETING: "/AmazonChimeAPI/EndMeeting",
  GETDATA: "/CommonAPI/GetData",
  UPDATECHATSTATUS: "​/ChatMessage​/UpdateMessageStatus",
  MULTIPLEENROLLMENTS: "/EnrollmentAPI/CreateMultipleEnrollmentsRequest",
  SESSIONREVIEWRATING: "/SessionAPI/SessionReviewRating",
  DENYSESSION: "/SessionAPI/DenyPrivateSessionRequest",
  VERIFYACCOUNT: "/AuthAPI/VerifyAccount",
  RESENDVERIFICATIONLINK: "/AuthAPI/ResendAccountVerification",
  CREATEPAYMENT: "/PaymentAPI/Pay",
  PROCESSSTUDENTREFUND: "/PaymentAPI/ProcessStudentRefund",
  PROCESSTUTORCANCELLEDSTUDENTREFUND:
    "/PaymentAPI/ProcessTutorCancellationRefund",
  CREATEUPDATEPRIVATESESSIONAVAILABLESLOTS:
    "/SessionAPI/CreateUpdatePrivateSessionAvailableSlots",
  PRIVATESESSIONREQUEST: "/SessionAPI/PrivateSessionRequest",
  ACCEPTPRIVATESESSIONREQUEST: "/SessionAPI/AcceptPrivateSessionRequest",
  SENDPHONEVERIFICATIONTOKEN: "/AuthAPI/SendPhoneVerificationToken",
  // VERIFYPHONE: "/AuthAPI/VerifyPhoneNumberToken",
  VERIFYPHONE: "/AuthAPI/VerifyPhoneNumber",
  VALIDATEAFFILIATE: "/AdminAffiliateAPI/ValidateAffiliate",
  VALIDATECOUPONCODE: "/StudentAPI/ValidateCouponCode",
  SUBSCRIBEEMAILTOSENDY: "/SubscriptionAPI/SubscribeEmailToSendy",
  DELETEUSER: "/AuthAPI/DeleteUser",
  REFRESHTOKEN: "/AuthAPI/RefreshToken",
  PAYMENTVERIFY: "/PaymentAPI/AuthorizeSuccessful",
};

export const getApiUrl = (key) => {
  return API_URL + API_ENDPOINTS[key];
};

export const getEndpointUrl = (key) => {
  return API_ENDPOINTS[key];
};

export const APP_URLS = {
  API_URL,
};

export const TIMEZONEDB_APIID = process.env.REACT_APP_TIMEZONEDB_APIID;
export const TIMEOUT_IN_MINUTES = process.env.REACT_APP_TIMEOUT_IN_MINUTES;
export const TIMEOUT_IN_DAYS = process.env.REACT_APP_TIMEOUT_IN_DAYS;
export const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID;
export const GOOGLE_APP_ID = process.env.REACT_APP_GOOGLE_APP_ID;
export const PUBLIC_URL = process.env.REACT_APP_PUBLIC_URL;
export const CLASS_START_DATE = process.env.REACT_APP_CLASS_START_DATE;
export const GOOGLE_ANALYTICS_TRACKINGID =
  process.env.REACT_APP_GOOGLE_ANALYTICS_TRACKINGID;
export const CAPTCHA_SITE_KEY = process.env.REACT_APP_CAPTCHA_SITE_KEY;
export const CAPTCHA_SECRET_KEY = process.env.REACT_APP_CAPTCHA_SECRET_KEY;
