import HomePage from "../containers/home/index";
import CourseSearch from "../containers/course_search/index";
import ResetPassword from "../containers/Account/ResetPassword";
import ChangePassword from "../containers/Account/ChangePassword";
import { PUBLIC_URL } from "../config/api.config";
import TutorProfile from "../containers/tutor/TutorProfile";
import ContactUs from "../containers/contact-us/contact-us";
import SessionDetail from "../containers/session/SessionDetail";
import CancelledSessionDetail from "../containers/session/CancelledSessionDetail";
import SeriesDetail from "../containers/series/SeriesDetail";
import CancelledSeriesDetail from "../containers/series/CancelledSeriesDetail";
import StudentDashboard from "../containers/dashboard/StudentDashboard";
import TutorDashboard from "../containers/dashboard/TeacherDashboard";
import CreateSeries from "../containers/series/CreateSeries";
import CreateTutor from "../containers/tutor/CreateTutor";
import CreateSession from "../containers/session/CreateSession";
import CreateStudent from "../containers/student/CreateStudent";
import ViewCart from "../containers/student/CartItems";
import HowItWork from "../containers/how_it_works/HowItWorks";
import EditSeries from "../containers/series/EditSeries";
import BecomeTutor from "../containers/home/BecomeTutor";
import PrivateSession from "../containers/session/PrivateSession";
import CreatePrivateSession from "../containers/session/CreatePrivateSession";
import PrivacyPolicy from "../containers/privatepolicy/PrivacyPolicy";
import Feedback from "../containers/feedback/Feedback";
import Notifications from "../containers/chatbot/MessageNotification"
import TermCondition from "../containers/termcondition/termcondition";
import VerifyAccount from "../containers/not_found/VerifyAccount";
import PagePaymentSuccess from "../containers/Payment/PaymentSuccess";
import PageFailedPayment from "../containers/Payment/PaymentFailed";
import Faq from "../containers/faq/faq";
import PaymentVerify from "../containers/Payment/PaymentVerify";


var appRoutes = [
    {
        path: `${PUBLIC_URL === '' ? '/' : PUBLIC_URL}`,
        name: "Home Page",
        component: HomePage,
        exact: true
    },
    {
        path: `${PUBLIC_URL}/CourseSearch/:isAll?/:search?`,
        name: "Course Search",
        component: CourseSearch,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/ResetPassword`,
        name: "Reset Password",
        component: ResetPassword,
        exact: true,
        auth: false
    },

    {
        path: `${PUBLIC_URL}/ChangePassword`,
        name: "Change Password",
        component: ChangePassword,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/ContactUs`,
        name: "ContactUs",
        component: ContactUs,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/SessionDetail/:SessionId`,
        name: "Create Series",
        component: SessionDetail,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/CancelledSessionDetail/:SessionId`,
        name: "Cancelled Session Detail",
        component: CancelledSessionDetail,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/SeriesDetail/:SeriesId`,
        name: "Series Detail",
        component: SeriesDetail,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/CancelledSeriesDetail/:SeriesId`,
        name: "Cancelled Series Detail",
        component: CancelledSeriesDetail,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/StudentDashboard`,
        name: "Student Dashboard",
        component: StudentDashboard,
        exact: true,
        auth: true
    },
    {
        path: `${PUBLIC_URL}/TutorDashboard`,
        name: "Teacher Dashboard",
        component: TutorDashboard,
        exact: true,
        auth: true

    },
    {
        path: `${PUBLIC_URL}/CreateSeries/:SeriesId?`,
        name: "Teacher Dashboard",
        component: CreateSeries,
        exact: true,
        auth: true
    },
    {
        path: `${PUBLIC_URL}/CreateTutor`,
        name: "Create Tutor",
        component: CreateTutor,
        exact: true,
        auth: true
    },
    {
        path: `${PUBLIC_URL}/TutorProfile/:TutorId`,
        name: "Tutor Profile",
        component: TutorProfile,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/CreateEditSession/:SessionId/:copysession?`,
        name: "Create Session",
        component: CreateSession,
        exact: true,
        auth: true
    },
    {
        path: `${PUBLIC_URL}/CreatePrivateSession/:PrivateSessionLogId`,
        name: "Create Session",
        component: CreatePrivateSession,
        exact: true,
        auth: true
    },
    {
        path: `${PUBLIC_URL}/StudentProfile`,
        name: "Create Student",
        component: CreateStudent,
        exact: true,
        auth: true
    },
    {
        path: `${PUBLIC_URL}/HowItwork`,
        name: "How it work",
        component: HowItWork,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/EditSeries/:SeriesId`,
        name: "Edit Series",
        component: EditSeries,
        exact: true,
        auth: true
    },
    {
        path: `${PUBLIC_URL}/BecomeTutor`,
        name: "Become A Tutor",
        component: BecomeTutor,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/PrivateSession`,
        name: "Private Session",
        component: PrivateSession,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/ViewCart`,
        name: "View Cart",
        component: ViewCart,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/PrivacyPolicy`,
        name: "Private Policy",
        component: PrivacyPolicy,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/Feedback/:SessionId/:ShowModal`,
        name: "Feedback",
        component: Feedback,
        exact: true,
        auth: true
    },
    {
        path: `${PUBLIC_URL}/Notifications`,
        name: "Notification List",
        component: Notifications,
        exact: true,
        auth: true
    },
    {
        path: `${PUBLIC_URL}/TermCondition`,
        name: "Term Condition",
        component: TermCondition,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/VerifyAccount/:Token?/:Email?`,
        name: "Verify Account",
        component: VerifyAccount,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/VerifyPayment/:transactionId?/:paymentId?/:token?/:PayerID?`,
        name: "Verify Payment",
        component: PaymentVerify,
        exact: true,
        auth: false
    },
    {
        path: `${PUBLIC_URL}/PagePaymentSuccess`,
        name: "Payment Success",
        component: PagePaymentSuccess,
        exact: true,
        auth: true
    },
    {
        path: `${PUBLIC_URL}/PageFailedPayment`,
        name: "Payment Failed",
        component: PageFailedPayment,
        exact: true,
        auth: true
    },
    {
        path: `${PUBLIC_URL}/Faq/:TabName?`,
        name: "Faq",
        component: Faq,
        exact: true,
        auth: false
    }

];
export default appRoutes;