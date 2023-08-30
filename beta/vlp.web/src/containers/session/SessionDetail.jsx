import React, { Component, Fragment } from 'react';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import FormatDateTime from '../../shared/components/functional/DateTimeFormatter';
import Loader from 'react-loaders';
import RelatedSession from "../../containers/session/RelatedSessions";
import { PUBLIC_URL } from "../../config/api.config";
import { history } from '../../helpers/history';
import { localStorageService } from '../../services/localStorageService';
import { APP_URLS } from "../../config/api.config";
import { commonFunctions } from "../../shared/components/functional/commonfunctions";
import moment from 'moment';
// import { commonFunctions } from "../../shared/components/functional/commonfunctions";
class SessionDetail extends Component {
    constructor(props) {
        super(props);
        let { match, auth } = this.props;
        this.state = {
            loading: false,
            sessionData: [],
            isNotFound: false,
            isLoggedIn: typeof (auth) === "undefined" ? false : auth.loggedIn,
            activeIndex: 0,
            sessionId: match.params.SessionId > 0 ? match.params.SessionId : -1,
            studentId: typeof (auth.user) === "undefined" ? -1 : auth.user.StudentId,
            userMode: typeof (auth.user) === "undefined" ? "student" : auth.userMode,
            tutorId: typeof (auth.user) === "undefined" ? -1 : auth.user.TeacherId,
            actionPerformedBy: typeof (auth.user) === "undefined" ? "" : auth.user.FirstName,
            isAdded: match.params.SessionId > 0 ? localStorageService.checkCartItem(match.params.SessionId, 'session') : false,
            //  userTimezone: moment.tz(moment.tz.guess(true)).format("z").indexOf("+") !== -1 || moment.tz(moment.tz.guess(true)).format("z").indexOf("-") !== -1 ? this.props.userTimezone : moment.tz(moment.tz.guess(true)).format("z")
        };
        this.handleEnrollSession = this.handleEnrollSession.bind(this);
        this.handleSessionEdit = this.handleSessionEdit.bind(this);
    }
    componentDidMount = () => {
        if (this.state.sessionId > 0) {
            this.getSessionData();
        }
        else {
            this.props.actions.showAlert({ message: "Something went wrong... Please Sign in Again !", variant: "error" });
            history.pushState(`${PUBLIC_URL}/`);
        }

        localStorageService.updateUserMode("student");
        this.props.actions.changeUserMode("student");
        let timezone = localStorageService.getUserTimeZone();
        this.props.actions.updateTimezone(timezone);
    }
    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.auth.loggedIn !== this.props.auth.loggedIn) {
            this.setState({
                isLoggedIn: this.props.auth.loggedIn,
                studentId: this.props.auth.user.StudentId,
                userId: this.props.auth.user.UserId
            }, () => {
                this.getSessionData();
            })
        }
    }
    getSessionData = () => {
        this.setState({ loading: true });
        let data = {};
        if (this.state.studentId > 0) {
            data = {
                "SessionId": this.state.sessionId,
                "StudentId": this.state.studentId,
                "usertype": this.state.userMode
            }
        }
        else {
            data = {
                "SessionId": this.state.sessionId,
            }
        }

        apiService.post('UNAUTHORIZEDDATA', {
            "data": data,
            "keyName": "GetSessionDetail"
        })
            .then(response => {
                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        this.setState({ sessionData: response.Data.ResultDataList[0] });
                    }
                }else{
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                }
                this.setState({ loading: false });
            },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: 'Something went wrong...', variant: "error" });
                        this.setState({ loading: false });
                    })
            );
    }

    // Handler functions =========================

    handleSessionEdit = (sessionId) => {
        if (sessionId > 0) {
            history.push(`${PUBLIC_URL}/CreateEditSession/${sessionId}`);
        }
        else {
            history.push(`${PUBLIC_URL}/TutorDashboard`);
        }
    }

    handleEnrollSession = (sessionId, refType) => {
        if (this.state.studentId > 0) {
            this.setState({ loading: true });
            apiService.post('ENROLLMENTREQUEST', {
                "studentId": this.state.studentId,
                "refrenceId": Number(sessionId),
                "refrenceTypeId": refType,
                "actionPerformedBy": this.state.actionPerformedBy
            }).then(response => {
                if (response.Success) {
                    this.props.actions.showAlert({ message: 'Session Added To Cart', variant: "success" });
                    this.setState({
                        sessionData: {
                            ...this.state.sessionData,
                            EnrollmentId: response.Data.EnrollmentId
                        }
                    });
                    this.props.actions.increementCart(1);
                }else{
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                }
                this.setState({ loading: false });
            },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
                        this.setState({ loading: false });
                    })
            );
        }
        else {
            this.setState({ loading: true });
            apiService.post('UNAUTHORIZEDDATA', {
                "data":
                {
                    "Id": sessionId,
                    "Type": "session"
                },
                "keyName": "GetCartItemDetail"
            })
                .then(response => {
                    if (response.Success) {

                        if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                            localStorageService.storeCartItem(response.Data.ResultDataList[0]);
                            this.setState({ isAdded: true });
                            this.props.actions.increementCart(1);
                        }
                    }else{
                        this.props.actions.showAlert({ message: response.Message, variant: "error" });
                    }
                    this.setState({ loading: false });
                },
                    (error) =>
                        this.setState((prevState) => {
                            this.props.actions.showAlert({ message: 'Something went wrong...', variant: "error" });
                            this.setState({ loading: false });
                        })
                );
        }
    }

    handleTutorDetails = (TutorId) => {
        history.push(`${PUBLIC_URL}/TutorProfile/${TutorId}`);
    }

    render() {
        const { loading, sessionData, sessionId, tutorId, userMode, isAdded, isLoggedIn } = this.state;
        const { userTimezone } = this.props;
        return (
            <Fragment>
                {sessionData &&
                    <Fragment>
                        <section className="innerSection">
                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-8 col-md-7 col-sm-7">
                                        <div className="bannerTitle">
                                            <h1>Session Details</h1>
                                        </div>
                                    </div>
                                    {/* <div className="col-lg-4 col-md-5 col-sm-5">
                                        <div className="thumbImage"><img src={require("../../assets/images/session-series.png")} alt="image" /></div>
                                    </div> */}
                                </div>
                            </div>
                        </section>

                        <section className="mainContent">
                            <div className="container">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="breadcrumbSection">
                                            <ul>
                                                <li>Home <i className="fa fa-angle-right"></i></li>
                                                <li><a>Session Details</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className="seriesSession">
                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-12">
                                        {/* <div className="SessionInfo">
                                         <h2>Session Info</h2>
                                         </div> */}
                                        <div className="SessionContent">
                                            <div className="sessionImage">
                                                <div className="media">
                                                    <div className="avatar">{sessionData.TeacherImageFile && <img onClick={() => this.handleTutorDetails(sessionData.TeacherId)}
                                                        className="align-self-start mr-3" src={`${APP_URLS.API_URL}${sessionData.TeacherImageFile}`} alt="imagefaff" width="80" height="80" />}</div>
                                                    <div className="media-body">
                                                        <h6 className="user-title">Instructor</h6>
                                                        <p className="user-subtitle" onClick={() => this.handleTutorDetails(sessionData.TeacherId)} >{sessionData.Name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="sessionCategory">
                                                {/* <div className="thumbContent">
                                                    <div className="thumbIcon"><i className="fa fa-bookmark-o" aria-hidden="true"></i></div>
                                                    <div className="thumbDesc">
                                                        <h6 className="user-title">Category</h6>
                                                        <p className="user-subtitle">{sessionData.SessionCategoryName}</p>
                                                    </div>
                                                </div> */}
                                            </div>
                                            {/* <div className="sessionReview">
                                                <div className="starRating">
                                                    <Rating name="read-only" precision={0.5} size='small' value={`${sessionData.Rating}`} readOnly />
                                                    <label>({sessionData.Rating})</label>
                                                </div>

                                            </div> */}
                                            <div className="sessionPrice">
                                                <div className="price">$ {sessionData.SessionFee}</div>
                                            </div>
                                            {(() => {

                                                if (isLoggedIn && userMode === "student" && sessionData.EnrollmentId === null && moment().isBefore(commonFunctions.getUtcDatetime(sessionData.StartTime), 'second')) {
                                                    return < div className="enrollNow">
                                                        {sessionData.NumberOfJoineesAllowed > sessionData.NumberOfJoineesEnrolled &&
                                                            <button className="btn btn-blue" onClick={() => this.handleEnrollSession(sessionId, sessionData.RefrenceType)} >Add To Cart</button>
                                                        }
                                                        {sessionData.NumberOfJoineesAllowed === sessionData.NumberOfJoineesEnrolled &&
                                                            <div className="messagebtn">All seats occupied</div>
                                                        }
                                                    </div>
                                                }
                                                else if (moment().isAfter(commonFunctions.getUtcDatetime(sessionData.EndTime), 'second')) {
                                                    return < div className="enrollNow">
                                                        <div className="messagebtn">Session Completed</div>
                                                    </div>
                                                }
                                                else if (isLoggedIn && userMode === "student" && sessionData.EnrollmentId > 0) {
                                                    return < div className="enrollNow">
                                                        {(() => {
                                                            if (sessionData.IsPaymentSuccess === "Y") {
                                                                return < div className="enrollNow">
                                                                    <div className="messagebtn">Already Enrolled.</div>
                                                                </div>
                                                            }
                                                            else {
                                                                return <button className="btn btn-blue" onClick={() => history.push(`${PUBLIC_URL}/ViewCart`)}>Go To cart</button>
                                                            }

                                                        })()}

                                                    </div>
                                                }
                                                else if (isLoggedIn === false && isAdded === false && commonFunctions.getUtcDatetime(sessionData.StartTime) > new Date()) {
                                                    return < div className="enrollNow">
                                                        {sessionData.NumberOfJoineesAllowed > sessionData.NumberOfJoineesEnrolled &&
                                                            <button className="btn btn-blue" onClick={() => this.handleEnrollSession(sessionId, sessionData.RefrenceType)} >Add To Cart</button>
                                                        }
                                                        {sessionData.NumberOfJoineesAllowed === sessionData.NumberOfJoineesEnrolled &&
                                                            <div className="messagebtn">All seats occupied</div>
                                                        }
                                                    </div>

                                                }
                                                else if (isLoggedIn === false && isAdded === true) {
                                                    return < div className="enrollNow">
                                                        <button className="btn btn-blue" onClick={() => history.push(`${PUBLIC_URL}/ViewCart`)}>Go To cart</button>
                                                    </div>
                                                }
                                            })()}
                                            {userMode === "tutor" && sessionData.TeacherId === tutorId && commonFunctions.getUtcDatetime(sessionData.StartTime) > new Date() && 
                                             moment().isBefore(commonFunctions.getUtcDatetime(sessionData.StartTime).subtract(24, "hours"),"second")
                                             &&
                                                <div className="enrollNow" title="Some fields are editable when students aren't enrolled and there are more than 24 hours before the session begins">
                                                    <button className="btn btn-blue" onClick={() => this.handleSessionEdit(sessionId)}>Edit</button>
                                                </div>
                                            }
                                        </div>
                                        <div className="sessionDesc">
                                            <div className="row">
                                                <div className="col-md-8">
                                                    {sessionData.ImageFile && <div className="sessionBanner" style={{ backgroundImage: `url(${APP_URLS.API_URL}${sessionData.ImageFile})` }}>
                                                    </div>}
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="sessionInfo">

                                                        <div className="sessionListing">
                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">Title:</div>
                                                                    <div className="categoryDesc">{sessionData.SessionTitle}</div>
                                                                </div>
                                                            </div>
                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">Instructor:</div>
                                                                    <div className="categoryDesc">{sessionData.Name}</div>
                                                                </div>
                                                            </div>
                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">Category:</div>
                                                                    <div className="categoryDesc">{sessionData.CategoryName}</div>
                                                                </div>
                                                            </div>
                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">Start Date:</div>
                                                                    <div className="categoryDesc">
                                                                        <FormatDateTime date={sessionData.StartTime}
                                                                            format="MMM DD, YYYY hh:mm A"></FormatDateTime> ({userTimezone})
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">End Date:</div>
                                                                    <div className="categoryDesc">
                                                                        <FormatDateTime date={sessionData.EndTime}
                                                                            format="MMM DD, YYYY hh:mm A"></FormatDateTime> ({userTimezone})
                                                                            </div>
                                                                </div>
                                                            </div>

                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">Language:</div>
                                                                    <div className="categoryDesc">{sessionData.Language}</div>
                                                                </div>
                                                            </div>

                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">Attendees:</div>
                                                                    <div className="categoryDesc">{sessionData.NumberOfJoineesEnrolled}/{sessionData.NumberOfJoineesAllowed}</div>
                                                                </div>
                                                            </div>
                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">Country:</div>
                                                                    <div className="categoryDesc">{sessionData.CountryName}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-sm-12">
                                                    <div className="sessionDate">
                                                    </div>
                                                </div>
                                                {sessionData.SessionDescription != null && 
                                                    <div className="col-md-12">
                                                        <div className="thumbContent">
                                                            <h2>Session Description</h2>
                                                            <p>{sessionData.SessionDescription}</p>
                                                        </div>
                                                    </div>
                                                }
                                                {sessionData.SessionAgenda != null && 
                                                    <div className="col-md-12">
                                                        <div className="thumbContent">
                                                            <h2>Session Agenda</h2>
                                                            <p>{sessionData.SessionAgenda}</p>
                                                        </div>
                                                    </div>
                                                }
                                                {/* <div className="col-md-12">
                                                    <div className="thumbContent">
                                                        <h2>Session Agenda</h2>
                                                        <p>{sessionData.SessionAgenda}</p>
                                                    </div>
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        {sessionData && Object.keys(sessionData).length > 0 &&
                            < RelatedSession sessionData={sessionData}  ></RelatedSession>
                        }
                        <section className="aboutTeacher">
                            <div className="container">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="thumbTitle">
                                            <h2>About the Teacher</h2>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="teacherInfo">
                                            <div className="thumbImage">{sessionData.TeacherImageFile &&
                                                <img onClick={() => this.handleTutorDetails(sessionData.TeacherId)}
                                                    src={`${APP_URLS.API_URL}${sessionData.TeacherImageFile}`} alt="image" width="100" height="100" />}
                                            </div>
                                            <div className="thumbContent">
                                                <h5 onClick={() => this.handleTutorDetails(sessionData.TeacherId)}> {sessionData.Name}</h5>
                                                <p>{sessionData.TeacherDescription}</p>
                                                {/* <div className="askQuestion"><button className="btn btn-blue">Ask A Question</button></div> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </Fragment>
                }
                {
                    loading &&
                    <div className="loaderDiv"><div className="loader">
                        <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                    </div></div>
                }

            </Fragment >
        )
    }
}
const mapStateToProps = state => {
    return {
        auth: state.auth,
        userTimezone: state.timezone.userTimezone
    };
};
const mapDispatchToProps = dispatch => {
    return {
        actions: {
            showAlert: bindActionCreators(actions.showAlert, dispatch),
            increementCart: bindActionCreators(actions.increementCart, dispatch),
            updateTimezone: bindActionCreators(actions.updateTimezone, dispatch),
            changeUserMode: bindActionCreators(actions.changeUserMode, dispatch)

        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(SessionDetail);
