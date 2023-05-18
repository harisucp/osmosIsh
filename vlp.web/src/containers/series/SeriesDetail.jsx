import React, { Component, Fragment } from 'react';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import FormatDateTime from '../../shared/components/functional/DateTimeFormatter';
import ReadMoreReact from 'read-more-react';
import Rating from '@material-ui/lab/Rating';
import RelatedSeries from "../../containers/series/RelatedSeries";
import Swiper from 'react-id-swiper';
import 'swiper/css/swiper.css';
import { APP_URLS } from "../../config/api.config";
import Loader from 'react-loaders';
import { PUBLIC_URL } from "../../config/api.config";
import { confirmAlert } from 'react-confirm-alert';
import { history } from '../../helpers/history';
import moment from 'moment';
import { localStorageService } from '../../services/localStorageService';
import { commonFunctions } from '../../shared/components/functional/commonfunctions';
class SeriesDetail extends Component {
    constructor(props) {
        super(props);
        let { auth, match } = this.props;
        const user = this.props.auth.user;
        this.state = {
            loading: false,
            seriesData: [],
            seriesSession: [],
            isNotFound: false,
            activeIndex: 0,
            seriesId: match.params.SeriesId > 0 ? match.params.SeriesId : -1,
            studentId: typeof (user) === "undefined" ? -1 : user.StudentId,
            tutorId: typeof (user) === "undefined" ? -1 : user.TeacherId,
            actionPerformedBy: typeof (user) === "undefined" ? -1 : user.FirstName,
            isLoggedIn: localStorageService.isAuthenticated(),
            isAdded: match.params.SeriesId > 0 ? localStorageService.checkCartItem(match.params.SeriesId, 'series') : false,
            // userTimezone: moment.tz(moment.tz.guess(true)).format("z").indexOf("+") !== -1 || moment.tz(moment.tz.guess(true)).format("z").indexOf("-") !== -1 ? this.props.userTimezone : moment.tz(moment.tz.guess(true)).format("z")
        };
        this.handleEnrollSeries = this.handleEnrollSeries.bind(this);
        this.handleSeriesEdit = this.handleSeriesEdit.bind(this);
    }
    componentDidMount = () => {
        if (this.state.seriesId > 0) {
            this.getSeriesData();
            const status = localStorageService.checkCartItem(this.state.seriesId);
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

    getSeriesData = () => {
        this.setState({ loading: true });
        let data;
        if (this.state.studentId > 0) {
            data = {
                "SeriesId": this.state.seriesId, userType: this.state.userMode, "StudentId": this.state.studentId
            }
        }
        else {
            data = {
                "SeriesId": this.state.seriesId
            }
        }
        apiService.post('UNAUTHORIZEDDATA', { "data": data, "keyName": "GetSeriesDetail" })
            .then(response => {
                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        this.setState({
                            seriesData: response.Data.ResultDataList[0],
                            seriesSession: JSON.parse(response.Data.ResultDataList[0].ClosestSession)
                        });
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

    handleConfirmation = (seriesId, refType) => {
        confirmAlert({
            message: <label>Please be aware that this series has already started, and the rate will not be adjusted according to classes you have already missed.</label>,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => this.handleEnrollSeries(seriesId, refType)
                },
                {
                    label: 'No',
                    onClick: () => { return }
                }
            ]
        })
    };
    handleEnrollSeries = (seriesId, refType) => {
        if (this.state.studentId > 0) {
            this.setState({ loading: true });
            apiService.post('ENROLLMENTREQUEST', {
                "studentId": this.state.studentId,
                "refrenceId": Number(seriesId),
                "refrenceTypeId": refType,
                "actionPerformedBy": this.state.actionPerformedBy
            })
                .then(response => {
                    if (response.Success) {
                        this.props.actions.showAlert({ message: 'Series Added To Cart', variant: "success" });
                        this.setState({
                            seriesData: {
                                ...this.state.seriesData,
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
                    "Id": seriesId,
                    "Type": "series"
                },
                "keyName": "GetCartItemDetail"
            })
                .then(response => {
                    if (response.Success) {

                        if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                            localStorageService.storeCartItem(response.Data.ResultDataList[0]);
                            this.props.actions.increementCart(1);
                            this.setState({ isAdded: true });
                        }
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
    }

    handleSeriesEdit = (seriesId) => {
        if (seriesId > 0) {
            history.push(`${PUBLIC_URL}/EditSeries/${seriesId}`);
        }
        else {
            history.push(`${PUBLIC_URL}/TutorDashboard`);
        }
    }

    handleTutorDetails = (TutorId) => {
        history.push(`${PUBLIC_URL}/TutorProfile/${TutorId}`);
    }

    render() {
        const { loading, seriesData, seriesSession, tutorId, seriesId, isLoggedIn, isAdded } = this.state;
        const { auth, userTimezone } = this.props;
        const params = {
            spaceBetween: 15,
            slidesPerView: 3,
            rebuildOnUpdate: true,
            slidesPerGroup: 1,

            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                dynamicBullets: true,
                clickable: true
            },
            // navigation: {
            //     nextEl: '.swiper-button-next',
            //     prevEl: '.swiper-button-prev'
            // },
            breakpoints: {
                0: {
                    slidesPerView: 1,
                    spaceBetween: 15,
                },
                550: {
                    slidesPerView: 2,
                    spaceBetween: 15,
                },
                988: {
                    slidesPerView: 3,
                    spaceBetween: 15,
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 15
                },
            },
        }

        const params2 = {
            spaceBetween: 15,
            slidesPerView: 3,
            rebuildOnUpdate: true,
            slidesPerGroup: 1,
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                dynamicBullets: true,
                clickable: true
            },
            // navigation: {
            //     nextEl: '.swiper-button-next',
            //     prevEl: '.swiper-button-prev'
            // },
            breakpoints: {
                0: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                },
                550: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                988: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 20
                },
            },
        }

        return (
            <Fragment>
                {seriesData &&
                    <Fragment>
                        <section className="innerSection">
                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-8 col-md-7 col-sm-7">
                                        <div className="bannerTitle">
                                            <h1>Series Details</h1>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-5 col-sm-5">
                                        <div className="thumbImage"><img width="" height=""  src={require("../../assets/images/session-series.png")} alt="image" /></div>
                                    </div>
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
                                                <li><a>Series Details</a></li>
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
                                        <div className="SessionContent">
                                            <div className="sessionImage">
                                                <div className="media">
                                                    <div className="avatar">{seriesData.TeacherImageFile && <img onClick={() => this.handleTutorDetails(seriesData.TeacherId)}
                                                        className="align-self-start mr-3" src={`${APP_URLS.API_URL}${seriesData.TeacherImageFile}`} alt="image" width="80" height="80" />}
                                                    </div>
                                                    {/*    */}
                                                    <div className="media-body">
                                                        <h6 className="user-title" >Instructor</h6>
                                                        <p className="user-subtitle" onClick={() => this.handleTutorDetails(seriesData.TeacherId)} >{seriesData.Name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="sessionPrice">
                                                <div className="price">$ {seriesData.Fee}</div>
                                            </div>
                                            {(() => {
                                                if (auth.loggedIn === true && auth.userMode === "student" && seriesData.EnrollmentId === null && commonFunctions.getUtcDatetime(seriesData.EndDate) > new Date()) {
                                                    return <div className="enrollNow">
                                                        {seriesData.NumberOfJoineesAllowed > seriesData.NumberOfJoineesEnrolled &&
                                                            < button className="btn btn-blue"
                                                                onClick={() => moment(commonFunctions.getUtcDatetime(seriesData.FirstSessionStartDate)).isAfter(moment(), 'second') ? this.handleEnrollSeries(seriesId, seriesData.RefrenceType) : this.handleConfirmation(seriesId, seriesData.RefrenceType)} >Add To Cart</button>
                                                        }
                                                        {seriesData.NumberOfJoineesAllowed === seriesData.NumberOfJoineesEnrolled &&
                                                            <div className="messagebtn">All seats occupied</div>
                                                        }
                                                    </div>
                                                }
                                                else if (moment().isAfter(commonFunctions.getUtcDatetime(seriesData.EndDate), 'second')) {
                                                    return < div className="enrollNow">
                                                        <div className="messagebtn">Series Completed</div>
                                                    </div>
                                                }
                                                else if (auth.loggedIn === true && auth.userMode === "student" && seriesData.EnrollmentId > 0) {
                                                    return <div className="enrollNow">
                                                        {(() => {
                                                            if (seriesData.IsPaymentSuccess === "Y") {
                                                                return < div className="enrollNow">
                                                                    <div className="messagebtn">Already Enrolled.</div>
                                                                </div>
                                                            }
                                                            else {
                                                                return < button className="btn btn-blue" onClick={() => history.push(`${PUBLIC_URL}/ViewCart`)} >Go To Cart</button>
                                                            }

                                                        })()}
                                                    </div>
                                                }
                                                else if (auth.loggedIn === false && isAdded === false) {
                                                    return <div className="enrollNow">
                                                        <button className="btn btn-blue" onClick={() => moment(commonFunctions.getUtcDatetime(seriesData.FirstSessionStartDate)).isAfter(moment(), 'second') ? this.handleEnrollSeries(seriesId, seriesData.RefrenceType) : this.handleConfirmation(seriesId, seriesData.RefrenceType)} >Add To Cart</button>
                                                    </div>
                                                }
                                                else if (auth.loggedIn === false && isAdded === true) {
                                                    return <div className="enrollNow">
                                                        <button className="btn btn-blue" onClick={() => history.push(`${PUBLIC_URL}/ViewCart`)} >Go To Cart</button>
                                                    </div>
                                                }
                                            })()}
                                            {auth.userMode === "tutor" && seriesData.TeacherId === tutorId && seriesData.NumberOfJoineesEnrolled > 0 && moment().isBefore(commonFunctions.getUtcDatetime(seriesData.StartDate).subtract(24, 'hours'), 'second') &&
                                                <div className="enrollNow">
                                                    <button className="btn btn-blue" onClick={() => this.handleSeriesEdit(seriesId)}>Edit</button>
                                                </div>
                                            }


                                        </div>
                                        <div className="sessionDesc">
                                            <div className="row">
                                                <div className="col-md-8">
                                                    {seriesData.ImageFile && <div className="sessionBanner" style={{ backgroundImage: `url(${APP_URLS.API_URL}${seriesData.ImageFile})` }}>
                                                    </div>}
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="sessionInfo">
                                                        {/* <h2>Session Info</h2> */}
                                                        <div className="sessionListing">
                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">Title</div>
                                                                    <div className="categoryDesc">{seriesData.SeriesTitle}</div>
                                                                </div>
                                                            </div>
                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">Instructor:</div>
                                                                    <div className="categoryDesc">{seriesData.Name}</div>
                                                                </div>
                                                            </div>

                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">Category:</div>
                                                                    <div className="categoryDesc">{seriesData.CategoryName}</div>
                                                                </div>
                                                            </div>
                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">Start Date:</div>
                                                                    <div className="categoryDesc">
                                                                        <FormatDateTime date={seriesData.StartDate}
                                                                            format="MMM DD, YYYY hh:mm A"></FormatDateTime> ({userTimezone})
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category"># Of Sessions:</div>
                                                                    <div className="categoryDesc">{seriesData.SessionCount}</div>
                                                                </div>
                                                            </div>
                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">Language:</div>
                                                                    <div className="categoryDesc">{seriesData.Language}</div>
                                                                </div>
                                                            </div>
                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">Attendees:</div>
                                                                    <div className="categoryDesc">{seriesData.NumberOfJoineesEnrolled}/{seriesData.NumberOfJoineesAllowed}</div>
                                                                </div>
                                                            </div>
                                                            <div className="widget">
                                                                <div className="categoryDiv">
                                                                    <div className="category">Country:</div>
                                                                    <div className="categoryDesc">{seriesData.CountryName}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-sm-12">
                                                    <div className="sessionDate">
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="thumbContent">
                                                        <h2>Series Description</h2>
                                                        <p>{seriesData.SeriesDescription}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="thumbContent">
                                                        <h2>Series Agenda</h2>
                                                        <p>{seriesData.SeriesAgenda}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </section>
                        {
                            seriesSession &&

                            <section className="sessionSchedule">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="thumbTitle">
                                                <h2>Session Schedule</h2>
                                            </div>
                                        </div>
                                        <div className="col-sm-12">
                                            <Swiper {...params2}>
                                                {seriesSession.map((data) => (
                                                    <div className="item">
                                                        <div className="schedule">
                                                            <div className="cardHeader">
                                                                <FormatDateTime date={data.StartTime}
                                                                    format="dddd"></FormatDateTime>
                                                            </div>
                                                            <div className="cardBody">
                                                                <div className="thumbContent">

                                                                    <p><i className="fa fa-calendar"></i>
                                                                        <FormatDateTime date={data.StartTime}
                                                                            format="MMM DD,YYYY"></FormatDateTime></p>
                                                                    <div className="date">
                                                                        <span>

                                                                            <FormatDateTime date={data.StartTime}
                                                                                format="hh:mm A"></FormatDateTime>
                                                                        </span>
                                                                        <div className="divider"></div>
                                                                        <span>{data.Duration}</span>
                                                                    </div>
                                                                    {/* <button className="btn btn-blue">Enroll Now</button> */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </Swiper>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        }
                        {
                            seriesData && Object.keys(seriesData).length > 0 &&
                            <RelatedSeries seriesData={seriesData} ></RelatedSeries>
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
                                            <div className="thumbImage">{seriesData.TeacherImageFile &&
                                                <img onClick={() => this.handleTutorDetails(seriesData.TeacherId)}
                                                    src={`${APP_URLS.API_URL}${seriesData.TeacherImageFile}`} alt="image" width="100" height="100" />}
                                            </div>
                                            <div className="thumbContent">
                                                <h5 onClick={() => this.handleTutorDetails(seriesData.TeacherId)} >{seriesData.Name}</h5>
                                                <p>{seriesData.TeacherDescription}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </Fragment >
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
export default connect(mapStateToProps, mapDispatchToProps)(SeriesDetail);
