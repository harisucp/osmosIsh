import React, { Component, Fragment } from 'react';
import { Tab, Row, Col, Nav } from 'react-bootstrap';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import FormatDateTime from '../../shared/components/functional/DateTimeFormatter';
import Swiper from 'react-id-swiper';
import 'swiper/css/swiper.css';
import Rating from '@material-ui/lab/Rating';
import Loader from 'react-loaders';
import { PUBLIC_URL } from "../../config/api.config";
import { history } from '../../helpers/history';
import { APP_URLS } from "../../config/api.config";
import moment from 'moment';
import { commonFunctions } from "../../shared/components/functional/commonfunctions";
import { NavLink, Link } from "react-router-dom";
import { localStorageService } from '../../services/localStorageService';
class BrowseSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            browseSessionData: [],
            loading: false,
            activeTab: 'Upcoming Session',
            //  userTimezone: moment.tz(moment.tz.guess(true)).format("z").indexOf("+") !== -1 || moment.tz(moment.tz.guess(true)).format("z").indexOf("-") !== -1 ? this.props.userTimezone : moment.tz(moment.tz.guess(true)).format("z")
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleViewDetails = this.handleViewDetails.bind(this);
        this.handleTutorDetails = this.handleTutorDetails.bind(this);

    }
    componentDidMount = () => {
        this.handleClick('Upcoming Session');
        let timezone = localStorageService.getUserTimeZone();
        this.props.actions.updateTimezone(timezone);
    }

    navigateCourseSearch = () => {
        history.push(`${PUBLIC_URL}/CourseSearch?isAll=${encodeURIComponent("true")}`);
    }

    handleClick = (sessionType) => {
        this.setState({ loading: true, activeTab: sessionType });
        apiService.post('UNAUTHORIZEDDATA',
            {
                "data": {
                    "SearchText": null,
                    "SessionType": sessionType,
                    "CategoryId": null,
                    "StartDate": '1990-01-01',
                    "EndDate": '2099-01-01',
                    "MinPrice": 0,
                    "MaxPrice": 1000,
                    "userid": null,
                    "PageNbr": 1,
                    "PageSize": 10,
                    "Type": "Series & Session",
                    "Tag": null
                },
                "keyName": "GetSeriesSessions"
            }).then(response => {
                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        let responseData = response.Data.ResultDataList;
                        if (sessionType === "Todays Session") {
                            responseData = responseData.filter(x => x.SeriesId > 0 ? moment(commonFunctions.getUtcDatetime(JSON.parse(x.SeriesDetail)[0].StartTime)).isSame(moment(), 'day') : commonFunctions.getUtcDatetime(x.StartTime).isSame(moment(), 'day'));
                        }
                        this.setState({ browseSessionData: responseData });
                    }
                    else {
                        this.setState({ browseSessionData: [] });
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
    handleViewDetails = (SeriesId, SessionId) => {
        if (SeriesId !== null && SeriesId > 0) {
            history.push(`${PUBLIC_URL}/SeriesDetail/${SeriesId}`);
        }
        else if (SessionId !== null && SessionId > 0) {
            history.push(`${PUBLIC_URL}/SessionDetail/${SessionId}`);
        }
    }

    handleTutorDetails = (TutorId) => {
        history.push(`${PUBLIC_URL}/TutorProfile/${TutorId}`);
    }
    render() {
        const { browseSessionData, loading, activeTab } = this.state
        const { userTimezone } = this.props;
        const params = {
            spaceBetween: 15,
            slidesPerView: 2,
            slidesPerGroup: 1,
            loop: false,
            rebuildOnUpdate: true,
            breakpoints: {
                0: {
                    slidesPerView: 1,
                    spaceBetween: 10,
                },
                767: {
                    slidesPerView: 1,
                    spaceBetween: 15,
                },
                1024: {
                    slidesPerView: 2,
                    spaceBetween: 15
                },
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            },
            autoplay: true
        }
        return (
            <Fragment>
                <section className="browseSession">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="headingTitle text-center">
                                    <h3>Browse Series & Sessions</h3>
                                </div>
                            </div>
                        </div>
                        <Tab.Container id="left-tabs-example" defaultActiveKey="Upcoming Session">
                            <Row>
                                <Col md={4} sm={5}>
                                    <div className="browseListing">
                                        <Nav variant="pills" className="nav nav-tabs">
                                            <Nav.Item >
                                                <Nav.Link eventKey="All Classes" onClick={() => this.navigateCourseSearch()}><span><img width="28" height="25"  src={require("../../assets/images/classes-icon.png")} alt="classes-icon" /></span>All Classes</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="Recently Added Sessions" onClick={() => this.handleClick("Recently Added Sessions")}><span><img width="26" height="28"  src={require("../../assets/images/upcoming-session.png")} alt="upcoming-session" /></span>Recently Added Sessions</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="Todays Session" onClick={() => this.handleClick("Todays Session")}><span><img width="20" height="21"  src={require("../../assets/images/pop-session.png")} alt="pop-session" /></span>Upcoming Sessions</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="Featured Teachers" onClick={() => this.handleClick("Featured Teachers")}><span><img width="24" height="30"  src={require("../../assets/images/teacher-icon.png")} alt="teacher-icon" /></span>Featured Tutors</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="Featured Sessions" onClick={() => this.handleClick("Featured Sessions")}><span><img width="23" height="31"  src={require("../../assets/images/feat-sessions.png")} alt="feat-sessions" /></span>Featured Sessions</Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </div>
                                </Col>
                                {Object.keys(browseSessionData).length > 0 &&
                                    <Col md={8} sm={7}>
                                        <div className="allClasses">
                                            <Tab.Content>
                                                <Tab.Pane eventKey={activeTab}>
                                                    <Swiper {...params}>
                                                        {browseSessionData.map((data, index) => (
                                                            <div key={index}>
                                                                <div className="thumbDiv">
                                                                    <div className="thumbImage" onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)} style={{ backgroundImage: `url(${APP_URLS.API_URL}${data.ImageFile})` }}></div>
                                                                    <div className="dateDescriptionSection">
                                                                        <div className="thumbDesc">
                                                                            <div className="row">
                                                                                <div className="col-lg-7 col-md-7 col-sm-12">
                                                                                    <div className="thumbTitle">
                                                                                        <div className="profileIcon"><img onClick={() => this.handleTutorDetails(data.TeacherId)} src={`${APP_URLS.API_URL}${data.TeacherImageFile}`} alt="Teacher Profile Image" width="40" height="40" /></div>
                                                                                        <h2 className="headerInfo" onClick={() => this.handleTutorDetails(data.TeacherId)}>{data.Name}</h2>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-lg-5 col-md-5 col-sm-12">
                                                                                    <div className="starRating">
                                                                                        <Rating name="read-only" precision={0.5} size='small' value={data.Rating} readOnly />
                                                                                        <span>({data.RatingCount})</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <h4 onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)}>{data.Title}</h4>
                                                                            <span onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)} className="sessionType">({data.SeriesId === null ? 'Session' : 'Series'})
                                                                            <p className="wordlimitBrowse">{data.Description}</p></span>
                                                                        </div>
                                                                        {data.SeriesId != null && data.SeriesId > 0 && JSON.parse(data.SeriesDetail) &&
                                                                            <Fragment>
                                                                                <div className="flexContent">
                                                                                    <div className="date">
                                                                                        <span className="month">
                                                                                            <FormatDateTime date={JSON.parse(data.SeriesDetail)[0].StartTime}
                                                                                                format="MMM DD, YYYY"></FormatDateTime>
                                                                                        </span>
                                                                                        <span className="month weekDay">
                                                                                            <FormatDateTime date={JSON.parse(data.SeriesDetail)[0].StartTime}
                                                                                                format="ddd"></FormatDateTime>
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="time">
                                                                                        <span>
                                                                                            <FormatDateTime date={JSON.parse(data.SeriesDetail)[0].StartTime}
                                                                                                format="h:mm A"></FormatDateTime> ({userTimezone})
                                                                                            {/* ({data.TimeZone}) */}
                                                                                        </span>
                                                                                        <span className="timeInSecnd">{JSON.parse(data.SeriesDetail)[0].SD[0].Duration}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </Fragment>
                                                                        }
                                                                        {data.SeriesId === null &&
                                                                            <Fragment>
                                                                                <div className="flexContent">
                                                                                    <div className="date">
                                                                                        <span className="month">
                                                                                            < FormatDateTime date={data.StartTime}
                                                                                                format="MMM DD, YYYY">

                                                                                            </FormatDateTime>
                                                                                        </span>
                                                                                        <span className="month weekDay">
                                                                                            <FormatDateTime date={data.StartTime}
                                                                                                format="ddd"></FormatDateTime>
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="time">
                                                                                        <span>
                                                                                            <FormatDateTime date={data.StartTime}
                                                                                                format="h:mm A">
                                                                                            </FormatDateTime> ({userTimezone})
                                                                                            {/* ({data.TimeZone}) */}
                                                                                        </span>
                                                                                        <span className="timeInSecnd">{data.Duration}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </Fragment>
                                                                        }
                                                                    </div>
                                                                    <div className="priceDiv">
                                                                        <span className="price">$ {data.Fee}</span>
                                                                        <span className="users" title="Spots Left"><i className="fa fa-users"  ></i>{data.TotalSeats - data.OccupiedSeats}</span>

                                                                    </div>
                                                                    <div className="enrollNow" onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)}><a className="btn btn-blue">Enroll Now</a></div>
                                                                </div>
                                                            </div>
                                                        )
                                                        )}
                                                    </Swiper>
                                                </Tab.Pane>
                                            </Tab.Content>
                                        </div>
                                    </Col>
                                }
                                {Object.keys(browseSessionData).length === 0 &&
                                    <Col md={8} sm={7}>
                                        <div className="blankSpace">
                                            <img width="436" height="331"  src={require('../../assets/images/undraw_empty.png')}></img>
                                            {!loading &&
                                                <h3 className="blankSpaceMessage">No Series/Sessions Found</h3>
                                            }
                                            {loading &&
                                                <h3 className="blankSpaceMessage">Loading Series/Sessions List.</h3>
                                            }
                                        </div>

                                    </Col>}
                            </Row>
                        </Tab.Container>
                        <div className="col-sm-12">
                            <div className="viewAll">
                                <NavLink className="btn btn-blue" to={`${PUBLIC_URL}/CourseSearch`}>
                                    View All
                                </NavLink>
                            </div>
                        </div>
                    </div>
                    {loading &&
                        <div className="loaderDiv"><div className="loader">
                            <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                        </div></div>
                    }
                </section>
                {/* <!----> */}
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
            changeUserMode: bindActionCreators(actions.changeUserMode, dispatch),
            updateTimezone: bindActionCreators(actions.updateTimezone, dispatch)
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(BrowseSection);