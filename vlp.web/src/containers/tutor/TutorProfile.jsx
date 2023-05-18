import React, { Component, Fragment } from "react";
import { apiService } from "../../services/api.service";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import Loader from "react-loaders";
import Rating from "@material-ui/lab/Rating";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Swiper from "react-id-swiper";
import "swiper/css/swiper.css";
import { APP_URLS } from "../../config/api.config";
import FormatDateTime from "../../shared/components/functional/DateTimeFormatter";
import Button from "@material-ui/core/Button";
import { PUBLIC_URL } from "../../config/api.config";
import { history } from "../../helpers/history";
import Select from "react-select";
import { DataSync } from "aws-sdk";
import moment from "moment";
import { Card } from "@material-ui/core";
import { commonFunctions } from "../../shared/components/functional/commonfunctions";
import SimpleReactValidator from "simple-react-validator";
import { Modal, Table } from "react-bootstrap";
import SignIn from "../../containers/home/SignIn";
import PrivateSessionRequestModal from "../tutor/PrivateSessionRequestModal";
import { localStorageService } from "../../services/localStorageService";
class TeacherProfile extends Component {
  constructor(props) {
    super(props);
    let { auth, match } = this.props;
    this.state = {
      showSigninModal: false,
      teacherId: Number(match.params.TutorId),
      teacherProfileData: [],
      teacherSessionData: [],
      teacherSeriesData: [],
      SessionCategories: [],
      filterSessionCategories: [],
      tutorReviews: [],
      expanded: "panel1",
      loading: false,
      isRequestDone: false,
      categoryId: "",
      notes: "",
      activeIndex: 0,
      //privateSessionSlot: [],
      startTime: "",
      endTime: "",
      subject: "TEsting 1-o-1 session suject",
      message: "TEsting 1-o-1 session message",
      showSessionRequest: false,
      currentEvent: [],
      pageNumber: 1,
      pageRecordLimit: 5,
      showPrivateSessionModal: false,
      PrivateSessionAvailableDaySlots: [],
      PrivateSession: "N",
      PrivateSessionTimeZone: "",
      //userTimezone: moment.tz(moment.tz.guess(true)).format("z").indexOf("+") !== -1 || moment.tz(moment.tz.guess(true)).format("z").indexOf("-") !== -1 ? this.props.userTimezone : moment.tz(moment.tz.guess(true)).format("z")
    };
    this.validator = new SimpleReactValidator({});
    this.handleChange = this.handleChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  isShowSignIn = (status) => {
    this.setState({ showSigninModal: status });
  };

  componentDidMount = () => {
    this.getSessionCategories();
    this.getTeacherProfileData();
    this.getTutorReviews();
    this.getPrivateSessionAvailableDaySlots();
    const timezone = localStorageService.getUserTimeZone();
    this.props.actions.updateTimezone(timezone);
  };

  getPrivateSessionAvailableDaySlots = () => {
    apiService
      .post("UNAUTHORIZEDDATA", {
        data: { TeacherId: this.state.teacherId },
        keyName: "GetPrivateSessionAvailableDaySlots",
      })
      .then(
        (response) => {
          if (
            response.Success &&
            response.Data !== null &&
            Object.keys(response.Data).length > 0 &&
            response.Data.ResultDataList &&
            response.Data.ResultDataList.length > 0
          ) {
            this.setState({
              PrivateSessionAvailableDaySlots: JSON.parse(
                response.Data.ResultDataList[0].PrivateSessionAvailableDays
              ),
              PrivateSession: response.Data.ResultDataList[0].PrivateSession,
              PrivateSessionTimeZone:
                response.Data.ResultDataList[0].PrivateSessionTimeZone,
            });
          }
        },
        (error) =>
          this.setState((prevState) => {
            this.props.actions.showAlert({
              message:
                error !== undefined
                  ? error
                  : "Something went wrong please try again !!",
              variant: "error",
            });
          })
      );
  };

  getSessionCategories = () => {
    this.setState({ loading: true });
    apiService
      .post("UNAUTHORIZEDDATA", {
        data: { TeacherId: this.state.teacherId },
        keyName: "GetTutorPrivateSessionCategories",
      })
      .then(
        (response) => {
          if (response.Success) {
            if (
              response.Data !== null &&
              Object.keys(response.Data).length > 0 &&
              response.Data.ResultDataList &&
              response.Data.ResultDataList.length > 0
            ) {
              this.setState({
                filterSessionCategories: response.Data.ResultDataList,
              });
            }
          }
          this.setState({ loading: false });
        },
        (error) =>
          this.setState((prevState) => {
            this.props.actions.showAlert({
              message:
                error !== undefined
                  ? error
                  : "Something went wrong please try again !!",
              variant: "error",
            });
            this.setState({ loading: false });
          })
      );
  };

  getTutorReviews = () => {
    const { pageRecordLimit, pageNumber, teacherId } = this.state;
    apiService
      .post("UNAUTHORIZEDDATA", {
        data: {
          TeacherId: teacherId,
          PageSize: pageRecordLimit,
          PageNbr: pageNumber,
        },
        keyName: "GetTeacherRatingReviews",
      })
      .then(
        (response) => {
          if (response.Success) {
            if (
              response.Data !== null &&
              Object.keys(response.Data).length > 0 &&
              response.Data.ResultDataList &&
              response.Data.ResultDataList.length > 0
            ) {
              if (response.Data.ResultDataList[0].data !== null) {
                const temp = this.state.tutorReviews.concat(
                  JSON.parse(response.Data.ResultDataList[0].data)
                );
                this.setState({
                  tutorReviews: this.state.tutorReviews.concat(
                    JSON.parse(response.Data.ResultDataList[0].data)
                  ),
                });
              } else {
              }
            }
          }
        },
        (error) =>
          this.setState((prevState) => {
            this.props.actions.showAlert({
              message:
                error !== undefined
                  ? error
                  : "Something went wrong please try again !!",
              variant: "error",
            });
          })
      );
  };

  convertDate = (data) => {
    // This is using for the convert string to Date.
    for (let i = 0; i < data.length; i++) {
      data[i].StartTime = commonFunctions
        .getUtcDatetime(data[i].StartTime)
        .toDate();
      data[i].EndTime = commonFunctions
        .getUtcDatetime(data[i].EndTime)
        .toDate();
    }
    return data;
  };

  getTeacherProfileData = () => {
    this.setState({ loading: true, isRequestDone: false });
    apiService
      .post("UNAUTHORIZEDDATA", {
        data: { TeacherId: this.state.teacherId },
        keyName: "GetTutorDetail",
      })
      .then(
        (response) => {
          if (response.Success) {
            if (
              response.Data !== null &&
              Object.keys(response.Data).length > 0 &&
              response.Data.ResultDataList &&
              response.Data.ResultDataList.length > 0
            ) {
              if (
                response.Data.ResultDataList[0].IsProfileUpdated === "N" ||
                response.Data.ResultDataList[0].IsProfileUpdated === null
              ) {
                if (this.props.auth.userMode === "tutor") {
                  history.push(`${PUBLIC_URL}/CreateTutor`);
                }
              }

              this.setState({
                teacherProfileData: response.Data.ResultDataList[0],
                teacherSeriesData:
                  response.Data.ResultDataList[0].SeriesDetail !== null
                    ? JSON.parse(response.Data.ResultDataList[0].SeriesDetail)
                    : [],
                teacherSessionData:
                  response.Data.ResultDataList[0].SessionDetail !== null
                    ? JSON.parse(response.Data.ResultDataList[0].SessionDetail)
                    : [],
                SessionCategories:
                  response.Data.ResultDataList[0].SessionCategories !== null
                    ? JSON.parse(
                        response.Data.ResultDataList[0].SessionCategories
                      )
                    : [],
                //privateSessionSlot: this.convertDate(response.Data.ResultDataList[0].PrivateSessionSlotDetail    ? JSON.parse(response.Data.ResultDataList[0].PrivateSessionSlotDetail) : [])
              });
            } else {
              this.setState({ teacherProfileData: [] });
            }
          } else {
            this.props.actions.showAlert({
              message: response.Message,
              variant: "error",
            });
          }
          this.setState({ loading: false, isRequestDone: true });
        },
        (error) =>
          this.setState((prevState) => {
            this.props.actions.showAlert({
              message: "Something went wrong...",
              variant: "error",
            });
            this.setState({ loading: false, isRequestDone: true });
          })
      );
  };

  scrollToNode(node) {
    node.scrollIntoView({ behavior: "smooth" });
  }

  handleTabChange = (e, { activeIndex }) => this.setState({ activeIndex });

  handleChange = (panel) => (event, isExpanded) => {
    this.setState({ expanded: isExpanded ? panel : false });
  };

  handleTextChange = (e) => {
    this.setState({ notes: e.target.value });
  };

  handleSelectChange = (opt, meta) => {
    this.setState({ categoryId: opt.value });
  };

  handlePrivateSession = () => {
    if (this.validator.allValid() === false) {
      this.validator.showMessages();
      this.forceUpdate();
      return false;
    }
    let data = this.state;
    const { auth } = this.props;
    this.setState({ loading: true });
    apiService
      .post("REQUESTPRIVATESESSION", {
        studentId: auth.user.StudentId,
        teacherId: data.teacherId,
        startTime: commonFunctions.convertToFormattedUtc(
          data.startTime,
          "YYYY-MM-DD hh:mm A"
        ),
        endTime: commonFunctions.convertToFormattedUtc(
          data.endTime,
          "YYYY-MM-DD hh:mm A"
        ),
        sessionCategoryId: data.categoryId > 0 ? data.categoryId : null,
        privateSessionLogId: -1,
        subject: data.subject,
        message: data.message,
        actionPerformedBy: auth.user.FirstName,
        isAccept: "N",
        recordDeleted: "N",
        notes: data.notes,
      })
      .then(
        (response) => {
          if (response.Success) {
            this.handleClose();
            this.props.actions.showAlert({
              message: "Private session request sent successfully",
              variant: "success",
            });
          } else {
            this.props.actions.showAlert({
              message: response.Message,
              variant: "error",
            });
          }
          this.setState({ loading: false });
        },
        (error) =>
          this.setState((prevState) => {
            this.props.actions.showAlert({
              message:
                error !== undefined
                  ? error
                  : "Something went wrong please try again !!",
              variant: "error",
            });
            this.setState({ loading: false });
          })
      );
  };

  handleEventClick = (event) => {
    const { auth } = this.props;
    if (auth.loggedIn) {
      // if (auth.userMode === "student") {}
      this.setState({ showSessionRequest: true });
    } else {
      this.isShowSignIn(true);
    }
  };

  handleClose = () => {
    this.validator = new SimpleReactValidator({});
    this.setState({
      showSessionRequest: false,
      currentEvent: [],
      categoryId: "",
      notes: "",
      startTime: "",
      endTime: "",
    });
  };

  handleViewDetails = (SeriesId, SessionId) => {
    if (SeriesId !== null && SeriesId > 0) {
      history.push(`${PUBLIC_URL}/SeriesDetail/${SeriesId}`);
    } else if (SessionId !== null && SessionId > 0) {
      history.push(`${PUBLIC_URL}/SessionDetail/${SessionId}`);
    }
  };

  handleLoadMore = () => {
    let { pageRecordLimit, pageNumber } = this.state;
    this.setState({ pageNumber: pageNumber + 1 }, () => this.getTutorReviews());
  };

  handleOpenModal = () => {
    const { showPrivateSessionModal } = this.state;
    this.getPrivateSessionAvailableDaySlots();
    this.setState({ showPrivateSessionModal: !showPrivateSessionModal });
  };

  render() {
    //privateSessionSlot,
    const {
      loading,
      isRequestDone,
      teacherProfileData,
      teacherSessionData,
      teacherSeriesData,
      SessionCategories,
      expanded,
      userMode,
      startTime,
      endTime,
      teacherId,
      categoryId,
      filterSessionCategories,
      tutorReviews,
      activeIndex,
      showPrivateSessionModal,
      PrivateSessionTimeZone,
      showSessionRequest,
      notes,
      PrivateSessionAvailableDaySlots,
      PrivateSession,
    } = this.state;
    const { auth, userTimezone } = this.props;

    const moment = require("moment-timezone");

    const params = {
      spaceBetween: 15,
      slidesPerView: 3,
      loop: false,
      rebuildOnUpdate: true,
      slidesPerGroup: 1,
      pagination: {
        el: ".swiper-pagination",
        type: "bullets",
        dynamicBullets: true,
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
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
          slidesPerView: 2,
          spaceBetween: 15,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 15,
        },
      },
    };

    let categories = [];
    filterSessionCategories.map((item) => {
      categories.push({
        value: item.SessionCategoryId,
        label: item.SessionCategoryName,
      });
    });

    return (
      <Fragment>
        {Object.keys(teacherProfileData).length > 0 &&
          teacherProfileData.IsProfileUpdated === "Y" && (
            <Fragment>
              <section className="innerSection">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-5 col-md-5 col-sm-5">
                      <div className="bannerTitle">
                        <h1>Host Profile </h1>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section className="mainContent teacherprofileWrapper">
                <div className="container">
                  <div className="row">
                    <div className="col-sm-12">
                      <div className="breadcrumbSection"></div>
                    </div>
                  </div>
                </div>
              </section>
              <section className="teacherprofile">
                <div className="container">
                  {teacherProfileData && (
                    <div className="row">
                      <div className="col-md-12 userInfoSection">
                        <div className="row">
                          <div className="col-md-3">
                            <div className="thumbImage">
                              <img
                                src={`${APP_URLS.API_URL}${teacherProfileData.TeacherImageFile} `}
                                alt="image"
                                className="widthLimit"
                                width="200"
                                height="200"
                              />
                            </div>
                          </div>
                          <div className="col-md-9">
                            <div className="thumbDesc">
                              <h2 className="editTutorProfile">
                                {teacherProfileData.Name}
                                {auth.loggedIn &&
                                  auth.userMode === "tutor" &&
                                  Number(teacherId) === auth.user.TeacherId && (
                                    <div className="enrollNow">
                                      <Button
                                        variant="contained"
                                        onClick={() =>
                                          history.push(
                                            `${PUBLIC_URL}/CreateTutor`
                                          )
                                        }
                                        color="primary"
                                      >
                                        <i
                                          className="fa fa-pencil"
                                          aria-hidden="true"
                                        ></i>
                                        EDIT PROFILE
                                      </Button>
                                    </div>
                                  )}
                                {auth.loggedIn === true &&
                                  PrivateSession === "Y" &&
                                  PrivateSessionAvailableDaySlots !== null &&
                                  Number(teacherId) !== auth.user.TeacherId && (
                                    // auth.userMode === "student" && (
                                    <div className="requestPrivateSession">
                                      <Button
                                        variant="contained"
                                        onClick={(e) =>
                                          this.handleEventClick(e)
                                        }
                                        color="primary"
                                      >
                                        REQUEST PRIVATE SESSION
                                      </Button>
                                    </div>
                                  )}

                                {auth.loggedIn === false &&
                                  PrivateSession === "Y" &&
                                  PrivateSessionAvailableDaySlots !== null && (
                                    <div className="requestPrivateSession">
                                      <Button
                                        variant="contained"
                                        onClick={(e) =>
                                          this.handleEventClick(e)
                                        }
                                        color="primary"
                                      >
                                        REQUEST PRIVATE SESSION
                                      </Button>
                                    </div>
                                  )}
                                {/* /Affiliate code chnages -- uncomment these to use */}
                                {/* {
                                                                auth.loggedIn && auth.userMode === 'tutor' && Number(teacherId) === auth.user.TeacherId &&
                                                                <label>Affiliate Code: </label>
                                                            } */}
                              </h2>
                              <div className="starRating">
                                {/* <span>Rating</span> */}
                                <Rating
                                  name="read-only"
                                  size="small"
                                  value={`${
                                    teacherProfileData.TeachersRating === null
                                      ? 0
                                      : teacherProfileData.TeachersRating
                                  } `}
                                  readOnly
                                />
                                <a
                                  href="#reviewSection"
                                  className="numberOfReview"
                                >
                                  {teacherProfileData.TutorReviewCounts} Reviews
                                </a>
                              </div>
                              <div className="profileStats">
                                <div className="statsBlock">
                                  {/* {teacherProfileData.Languages !== null && */}
                                  <Fragment>
                                    <span>
                                      <b>Language :</b>{" "}
                                    </span>
                                    <span>
                                      {teacherProfileData.Languages !== null &&
                                        teacherProfileData.Languages.replace(
                                          /,/g,
                                          ", "
                                        )}
                                    </span>
                                  </Fragment>
                                  {/* } */}
                                </div>
                                <div className="statsBlock">
                                  {teacherProfileData.CountryName !== null && (
                                    <Fragment>
                                      <span>
                                        <b>Country :</b>{" "}
                                      </span>
                                      <span>
                                        {teacherProfileData.CountryName}
                                      </span>
                                    </Fragment>
                                  )}
                                </div>
                                <div className="statsBlock">
                                  <span>
                                    <b>Available For Private Session :</b>{" "}
                                  </span>
                                  <span>
                                    {teacherProfileData.PrivateSession === "Y"
                                      ? "Yes"
                                      : "No"}
                                  </span>
                                </div>
                                <div className="statsBlock">
                                  <span>
                                    <b>Total Sessions :</b>{" "}
                                  </span>
                                  <span>{teacherProfileData.TotalSession}</span>
                                </div>
                                <div className="statsBlock">
                                  <span>
                                    <b>Delivered Sessions :</b>{" "}
                                  </span>
                                  <span>
                                    {teacherProfileData.DeliveredSession}
                                  </span>
                                </div>
                                <div className="statsBlock">
                                  <span>
                                    <b>Upcoming Sessions :</b>{" "}
                                  </span>
                                  <span>
                                    {teacherProfileData.UpcomingSession}
                                  </span>
                                </div>

                                {/* <div className="statsBlock">
                                                                <span><b> Total Series :</b> </span>
                                                                <span>{teacherProfileData.TotalSeries}</span>
                                                            </div>
                                                            <div className="statsBlock">
                                                                <span><b>Delivered Series :</b> </span>
                                                                <span>{teacherProfileData.DeliveredSeries}</span>
                                                            </div>
                                                            <div className="statsBlock">
                                                                <span><b> Upcoming Series:</b> </span>
                                                                <span>{teacherProfileData.UpcomingSeries}</span>
                                                            </div> */}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-12 mt-5">
                            <div className="teacherInfo">
                              <div className="row">
                                <div className="col-sm-12">
                                  <ExpansionPanel
                                    expanded={expanded === "panel1"}
                                    onChange={this.handleChange("panel1")}
                                  >
                                    <ExpansionPanelSummary
                                      expandIcon={<ExpandMoreIcon />}
                                      aria-controls="panel1bh-content"
                                      id="panel1bh-header"
                                    >
                                      <Typography>
                                        <b>Bio</b>
                                      </Typography>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails>
                                      <Typography>
                                        {teacherProfileData.Description}
                                        <br />
                                        <br />
                                        <b>Instagram</b>:{" "}
                                        {teacherProfileData.instaProfile}
                                        <br />
                                        <b>LinkedIn</b>:{" "}
                                        {teacherProfileData.linkedinProfile}
                                      </Typography>
                                    </ExpansionPanelDetails>
                                  </ExpansionPanel>
                                  <ExpansionPanel
                                    expanded={expanded === "panel2"}
                                    onChange={this.handleChange("panel2")}
                                  >
                                    <ExpansionPanelSummary
                                      expandIcon={<ExpandMoreIcon />}
                                      aria-controls="panel2bh-content"
                                      id="panel2bh-header"
                                    >
                                      <Typography>
                                        <b>Specialization</b>
                                      </Typography>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails>
                                      <Typography>
                                        {teacherProfileData.Specialization}
                                      </Typography>
                                    </ExpansionPanelDetails>
                                  </ExpansionPanel>
                                  <ExpansionPanel
                                    expanded={expanded === "panel3"}
                                    onChange={this.handleChange("panel3")}
                                  >
                                    <ExpansionPanelSummary
                                      expandIcon={<ExpandMoreIcon />}
                                      aria-controls="panel3bh-content"
                                      id="panel3bh-header"
                                    >
                                      <Typography>
                                        <b>Categories</b>
                                      </Typography>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails>
                                      <Typography>
                                        {SessionCategories.map(
                                          (data, item, index) => (
                                            <span key={index}>
                                              {data.SessionCategoryName} <br />
                                            </span>
                                          )
                                        )}
                                      </Typography>
                                    </ExpansionPanelDetails>
                                  </ExpansionPanel>

                                  <ExpansionPanel
                                    expanded={expanded === "panel4"}
                                    onChange={this.handleChange("panel4")}
                                  >
                                    <ExpansionPanelSummary
                                      expandIcon={<ExpandMoreIcon />}
                                      aria-controls="panel4bh-content"
                                      id="panel4bh-header"
                                    >
                                      <Typography>
                                        <b>Awards</b>
                                      </Typography>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails>
                                      <Typography>
                                        {teacherProfileData.Awards}
                                      </Typography>
                                    </ExpansionPanelDetails>
                                  </ExpansionPanel>
                                  <ExpansionPanel
                                    expanded={expanded === "panel5"}
                                    onChange={this.handleChange("panel5")}
                                  >
                                    <ExpansionPanelSummary
                                      expandIcon={<ExpandMoreIcon />}
                                      aria-controls="panel5bh-content"
                                      id="panel5bh-header"
                                    >
                                      <Typography>
                                        <b>Education</b>
                                      </Typography>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails>
                                      <Typography>
                                        {teacherProfileData.Education}
                                      </Typography>
                                    </ExpansionPanelDetails>
                                  </ExpansionPanel>
                                  <ExpansionPanel
                                    expanded={expanded === "panel6"}
                                    onChange={this.handleChange("panel6")}
                                  >
                                    <ExpansionPanelSummary
                                      expandIcon={<ExpandMoreIcon />}
                                      aria-controls="panel6bh-content"
                                      id="panel6bh-header"
                                    >
                                      <Typography>
                                        <b>Interests</b>
                                      </Typography>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails>
                                      <Typography>
                                        {teacherProfileData.Interest}
                                      </Typography>
                                    </ExpansionPanelDetails>
                                  </ExpansionPanel>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {(() => {
                        if (
                          Object.keys(teacherSessionData).length > 0 ||
                          Object.keys(teacherSeriesData).length > 0
                        ) {
                          return (
                            <div className="col-md-12 upcomingSession">
                              <div className="row">
                                <div className="col-sm-12">
                                  <h3>Upcoming Sessions</h3>
                                  <Swiper {...params}>
                                    {teacherSessionData.map((data, index) => (
                                      <div
                                        className="thumbTab"
                                        onClick={() =>
                                          this.handleViewDetails(
                                            data.SeriesId,
                                            data.SessionId
                                          )
                                        }
                                      >
                                        <div
                                          className="thumbImage"
                                          style={{
                                            backgroundImage: `url(${APP_URLS.API_URL}${data.SD[0].SC[0].ImageFile})`,
                                          }}
                                        ></div>
                                        <div className="thumbDesc">
                                          <div className="date">
                                            <span className="month">
                                              <i className="fa fa-calendar"></i>
                                              <FormatDateTime
                                                date={data.StartTime}
                                                format="MMM DD, YYYY hh:mm A"
                                              ></FormatDateTime>{" "}
                                              ({userTimezone})
                                              {/* ({data.SD[0].SC[0].GC[0].TimeZone}) */}
                                            </span>
                                          </div>
                                          <h4> {data.SD[0].SessionTitle}</h4>
                                          <p>{data.SD[0].Description} </p>
                                          <div className="enrollNow">
                                            <a className="btn btn-blue">
                                              View Details
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {teacherSeriesData.map((data, index) => {
                                      return typeof data.SerD[0].SC[0]
                                        .ClosestSession !== "undefined" ? (
                                        <div>
                                          {" "}
                                          <div
                                            className="thumbTab"
                                            onClick={() =>
                                              this.handleViewDetails(
                                                data.SeriesId,
                                                -1
                                              )
                                            }
                                          >
                                            <div
                                              className="thumbImage"
                                              style={{
                                                backgroundImage: `url(${APP_URLS.API_URL}${data.SerD[0].SC[0].ImageFile})`,
                                              }}
                                            ></div>
                                            <div className="thumbDesc">
                                              <div className="date">
                                                <span className="month">
                                                  <i className="fa fa-calendar"></i>
                                                  {commonFunctions.getUtcDate(
                                                    data.SerD[0].SC[0]
                                                      .ClosestSession[0]
                                                      .StartTime,
                                                    "MMM DD, YYYY hh:mm A"
                                                  )}
                                                  ({userTimezone})
                                                </span>
                                              </div>
                                              <h4>
                                                {data.SerD[0].SeriesTitle}
                                              </h4>
                                              <p>{data.SerD[0].Description} </p>
                                              <div className="enrollNow">
                                                <a className="btn btn-blue">
                                                  View Details
                                                </a>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <></>
                                      );
                                    })}
                                  </Swiper>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      })()}

                      {tutorReviews !== null && tutorReviews.length > 0 && (
                        <section className="studentFeedback" id="reviewSection">
                          <div className="container">
                            <div className="row">
                              <div className="col-sm-12">
                                <div className="reviewsTitle">
                                  <h3>Student Feedback</h3>
                                </div>
                              </div>
                              {tutorReviews.map((item) => (
                                <div className="col-sm-12">
                                  <div className="studentReview">
                                    <div className="reviewContent nameRatting">
                                      <h5>
                                        {" "}
                                        {item.StudentName}{" "}
                                        <Rating
                                          name="read-only"
                                          size="small"
                                          value={`${item.Rating}`}
                                          readOnly
                                        />
                                      </h5>
                                      <p>{item.ReviewComment}</p>
                                      <p className="postedDate">
                                        Posted on{" "}
                                        <FormatDateTime
                                          date={item.CreatedDate}
                                          format="MMM DD, YYYY"
                                        ></FormatDateTime>
                                      </p>
                                    </div>
                                    {/* <div className="reviewContent postReview">
                                                                        <p>{item.ReviewComment}</p>
                                                                        
                                                                    </div> */}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {tutorReviews !== null &&
                            tutorReviews.length <
                              teacherProfileData.TutorReviewCounts && (
                              <div className="loadMore">
                                <button
                                  className="btn btn-blue"
                                  onClick={this.handleLoadMore}
                                >
                                  Load More
                                </button>
                              </div>
                            )}
                        </section>
                      )}
                    </div>
                  )}
                  {/* {Object.keys(this.state.privateSessionSlot).length > 0 &&
                                    < div className="rightSideBar" ref={(node) => this.tempRef = node}>
                                        <h3>Private Session Availability</h3>
                                        <FullCalendar
                                            events={this.state.privateSessionSlot}
                                            onEventSelect={this.handleEventClick}
                                        />
                                    </div>} */}
                  {/* <Modal show={showSessionRequest} onHide={this.handleClose}
                                    size="lg"
                                    aria-labelledby="contained-modal-title-vcenter"
                                    centered
                                    className="privateSessionModal"
                                >
                                    <Modal.Header closeButton>
                                        <Modal.Title id="sign-up-title">
                                            Private Session Request
                                        </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <div className="categoryControl">
                                            <label>Category:</label>
                                            <Select
                                                name="categoryId"
                                                placeholder='Choose Private Session Category'
                                                value={categories.filter(obj => obj.value === categoryId)}
                                                onChange={this.handleSelectChange}
                                                options={categories}
                                                onBlur={() => this.validator.showMessageFor('fullName')}
                                            />
                                        </div>
                                        {this.validator.message('Category', categoryId, 'required')}
                                        <div className="timingControl">
                                            <label>Requested Date and Time:</label>
                                            <h5> <FormatDateTime date={startTime}
                                                format="MMM DD, YYYY hh:mm A"></FormatDateTime> -
                                            <FormatDateTime date={endTime}
                                                    format=" hh:mm A"></FormatDateTime>
                                            </h5>
                                        </div>
                                        <div className="categoryControl mt-3">
                                            <label>Note:</label>
                                            <textarea name="notes" value={notes} onChange={this.handleTextChange}></textarea>
                                        </div>

                                    </Modal.Body>
                                    {auth.userMode === "student" &&
                                        < Modal.Footer >
                                            <Button variant="contained" onClick={this.handleClose} color="primary">Close</Button>
                                            < Button variant="contained" onClick={this.handlePrivateSession} color="primary">Request Private Session</Button>

                                        </Modal.Footer>
                                    }
                                </Modal>
                             */}
                </div>
              </section>
              <section className="privateSessionAvailability">
                <div className="container">
                  <div className="row">
                    <div className="col-sm-12">
                      <Card>
                        {PrivateSessionAvailableDaySlots !== null &&
                          PrivateSession === "Y" &&
                          PrivateSessionAvailableDaySlots.length > 0 && (
                            <Table borderless>
                              <tbody>
                                <tr>
                                  <td>
                                    <b>Private Session Availablility</b>
                                  </td>
                                  <td>
                                    Following timing as per{" "}
                                    <b>
                                      (
                                      {PrivateSessionTimeZone &&
                                        moment()
                                          .tz(PrivateSessionTimeZone)
                                          .format("z")}
                                      )
                                    </b>{" "}
                                    timezone.
                                  </td>
                                </tr>
                                {PrivateSessionAvailableDaySlots.map((item) => {
                                  return (
                                    <tr>
                                      <td>{item.Day} </td>
                                      <td>
                                        {!item.Opened ||
                                        !item.PrivateSessionAvailableDaySlots ? (
                                          "Not Available"
                                        ) : (
                                          <Fragment>
                                            {item.PrivateSessionAvailableDaySlots ===
                                              "" &&
                                            item.PrivateSessionAvailableDaySlots ===
                                              null &&
                                            item.PrivateSessionAvailableDaySlots
                                              .length > 0
                                              ? "Closed"
                                              : item.PrivateSessionAvailableDaySlots.map(
                                                  (times, index) => {
                                                    return (
                                                      <Fragment>
                                                        <div
                                                          className="statsBlock"
                                                          style={{
                                                            width: "100%",
                                                          }}
                                                        >
                                                          <FormatDateTime
                                                            date={
                                                              new Date(
                                                                `1999-09-09 ${times.Start}`.replace(
                                                                  /-/g,
                                                                  "/"
                                                                )
                                                              )
                                                            }
                                                            format="hh:mm A"
                                                          />{" "}
                                                          -{" "}
                                                          <FormatDateTime
                                                            date={
                                                              new Date(
                                                                `1999-09-09 ${times.End}`.replace(
                                                                  /-/g,
                                                                  "/"
                                                                )
                                                              )
                                                            }
                                                            format="hh:mm A"
                                                          />
                                                        </div>
                                                      </Fragment>
                                                    );
                                                  }
                                                )}
                                          </Fragment>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </Table>
                          )}
                      </Card>
                    </div>
                  </div>
                </div>
              </section>
            </Fragment>
          )}
        {(() => {
          if (
            teacherProfileData === null ||
            Object.keys(teacherProfileData).length === 0 ||
            teacherProfileData.IsProfileUpdated === "N" ||
            teacherProfileData.IsProfileUpdated === null
          ) {
            return (
              <section className="innerSection">
                <div className="container blankProfile">
                  <div className="blankSpace">
                    <img
                      width=""
                      height=""
                      src={require("../../assets/images/undraw_profile.png")}
                    ></img>
                    {!loading && isRequestDone && (
                      <h3 className="blankSpaceMessage">
                        Profile details are not available.
                      </h3>
                    )}
                    {(loading || !isRequestDone) && (
                      <h3 className="blankSpaceMessage">
                        Loading profile details.
                      </h3>
                    )}
                  </div>
                </div>
              </section>
            );
          }
        })()}
        {loading && (
          <div className="loaderDiv">
            <div className="loader">
              <Loader
                type="ball-clip-rotate-multiple"
                style={{ transform: "scale(1.4)" }}
              />
            </div>
          </div>
        )}
        <PrivateSessionRequestModal
          showSessionRequest={showSessionRequest}
          onHide={this.handleClose}
          categoryId={categoryId}
          handleSelectChange={this.handleSelectChange}
          startTime={startTime}
          endTime={endTime}
          categories={categories}
          auth={auth}
          PrivateSessionAvailableDaySlots={PrivateSessionAvailableDaySlots}
          teacherId={teacherId}
          PrivateSessionTimeZone={
            PrivateSessionTimeZone ? PrivateSessionTimeZone : ""
          }
        />
        <SignIn
          showSignIn={this.state.showSigninModal}
          onSignInClose={this.isShowSignIn}
        ></SignIn>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
    userTimezone: state.timezone.userTimezone,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      showAlert: bindActionCreators(actions.showAlert, dispatch),
      updateTimezone: bindActionCreators(actions.updateTimezone, dispatch),
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(TeacherProfile);
