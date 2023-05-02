import React, { Fragment, Component } from "react";
import SignIn from "../../../containers/home/SignIn";
import SignUp from "../../../containers/home/SignUp";
import TutorSignUp from "../../../containers/home/TutorSignUp";
import "../../../assets/scss/header.scss";
import { PUBLIC_URL } from "../../../config/api.config";
import { history } from "../../../helpers/history";
import { localStorageService } from "../../../services/localStorageService";
import { apiService } from "../../../services/api.service";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../../../store/actions";
import Loader from "react-loaders";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Typography from "@material-ui/core/Typography";
import { NavLink, Link } from "react-router-dom";
import { APP_URLS } from "../../../config/api.config";
import Button from "@material-ui/core/Button";
import NotificationsNoneRoundedIcon from "@material-ui/icons/NotificationsNoneRounded";
import { Dropdown } from "semantic-ui-react";
import moment from "moment";
import PrivateSessionModal from "../../../containers/session/PrivateSessionModal/PrivateSessionModal";
import { commonFunctions } from "../../../shared/components/functional/commonfunctions";
import Tooltip from "@material-ui/core/Tooltip";
class AppHeader extends Component {
  constructor(props) {
    super(props);
    const { auth } = this.props;
    this.state = {
      showSigninModal: false,
      showSignupModal: false,
      showTutorSignupModal: false,
      addMobileSticky: "",
      showMenu: false,
      profileOptions: false,
      loading: false,
      anchorEl: null,
      anchorE2: null,
      anchorE3: null,
      //searchText: "",
      notificationCount: 0,
      firstName: "",
      lastName: "",
      userImage: "",
      activeMenu: "",
      showSearchBar: false,
      showPrivateSessionModal: false,
      PrivateSessionTimeZone: "",
    };
    this.becomeStudentOrTutor = this.becomeStudentOrTutor.bind(this);
    this.redirectToProfile = this.redirectToProfile.bind(this);
    this.redirectToUserMode = this.redirectToUserMode.bind(this);
  }

  state = {
    addMobileSticky: "",
  };

  isShowSignIn = (status) => {
    this.setState({ showSigninModal: status });
  };

  isShowSignUp = (status) => {
    this.setState({ showSignupModal: status });
  };

  isShowTutorSignUp = (status) => {
    this.setState({ showTutorSignupModal: status });
  };

  componentDidMount = async () => {
    const { auth } = this.props;
    window.addEventListener("scroll", this.handleScroll, true);
    history.listen((location, action) => {
      this.setState({ showMenu: false });
    });
    if (auth.loggedIn === true) {
      this.timeout = window.setInterval(
        () => this.handleCheckNotifications(),
        60000
      );
      this.handleCheckNotifications();
    }
    //fetching current  timezone region ---- Dont remove or displace from here
    await commonFunctions.getTimezoneData(moment.tz.guess(true));
    let timezone = localStorageService.getUserTimeZone();
    //timezone region fetch
    //fetch current timezone
    await commonFunctions.getCurrentTime();
    //
    this.props.actions.updateTimezone(timezone);
  };

  componentWillUnmount() {
    clearTimeout(this.timeout);
    window.removeEventListener("scroll", this.handleScroll);
  }

  componentWillReceiveProps = (props) => {
    if (props.auth.loggedIn === false) {
      clearTimeout(this.timeout);
    }
    if (props.auth.loggedIn === true) {
      clearTimeout(this.timeout);
      this.timeout = window.setInterval(
        () => this.handleCheckNotifications(),
        60000
      );
      this.setState({
        firstName: props.auth.user.FirstName,
        lastName: props.auth.user.LastName,
        userImage: props.auth.user.UserImage,
      });
    }
  };

  handleCheckNotifications = () => {
    const { auth } = this.props;
    let teacherId, studentId;
    if (auth.loggedIn === true) {
      if (auth.userMode === "student") {
        teacherId = -1;
        studentId = auth.user.StudentId;
      } else {
        teacherId = auth.user.TeacherId;
        studentId = -1;
      }
    }
    apiService
      .post("NOTIFICATIONS", {
        data: { TeacherId: teacherId, StudentId: studentId },
        keyName: "GetAllNotifications",
      })
      .then(
        (response) => {
          if (
            response.Data !== null &&
            Object.keys(response.Data).length > 0 &&
            response.Data.ResultDataList &&
            response.Data.ResultDataList.length > 0
          ) {
            let count = response.Data.ResultDataList[0].NotificationCount;
            this.setState({ notificationCount: count });
          }
        },
        (error) =>
          this.setState((prevState) => {
            if (typeof error !== "undefined") {
              this.props.actions.showAlert({
                message: error,
                variant: "error",
              });
            }
          })
      );
  };

  handleScroll = () => {
    if (window.pageYOffset > 10) {
      this.setState({ addMobileSticky: " mobSticky", profileOptions: false });
    } else {
      this.setState({ addMobileSticky: "" });
    }
  };

  handleToggleMenu = (e) => {
    this.setState({
      showMenu: !this.state.showMenu,
    });
  };

  showProfileMenu = () => {
    this.setState({ profileOptions: !this.state.profileOptions });
  };

  becomeStudentOrTutor = (userMode) => {
    this.setState({ loading: true });
    apiService
      .post(userMode === "student" ? "CREATESTUDENT" : "CREATETUTORREQUEST", {
        userId: this.props.auth.user.UserId,
        username: this.props.auth.user.FirstName,
      })
      .then(
        (response) => {
          if (response.Success) {
            let user = [];
            if (localStorageService.isAuthenticated()) {
              user = localStorageService.getUserDetail();
              if (userMode === "student") {
                user.StudentId = response.Data.StudentId;
                user.IsStudent = "Y";
                userMode = "student";
              } else if (userMode === "tutor") {
                user.TeacherId = response.Data.TeacherId;
                user.IsTutor = "Y";
                userMode = "tutor";
              }
              this.props.actions.loginSuccess(user);
              localStorageService.updateUserMode(userMode);
              this.props.actions.changeUserMode(userMode);
              localStorage.setItem("AuthUser", JSON.stringify(user));
              if (userMode === "tutor") {
                history.push(
                  `${PUBLIC_URL}/TutorProfile/${response.Data.TeacherId}`
                );
                this.toggle("BecomeATutor");
                this.props.actions.showAlert({
                  message:
                    "Tutor account created successfully. Please complete your profile details.",
                  variant: "success",
                });
              } else {
                this.toggle("BecomeAStudent");
                this.props.actions.showAlert({
                  message:
                    "Student account created successfully. Please complete your profile details.",
                  variant: "success",
                });
                history.push(`${PUBLIC_URL}/CourseSearch`);
              }
            } else {
              this.props.actions.showAlert({
                message: "Something Went Wrong! Please Sign In Again.",
                variant: "error",
              });
            }
          } else {
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
  };
  redirectToUserMode = (navigateTo) => {
    let { userMode } = this.props;
    if (navigateTo === "student") {
      if (userMode !== "student") {
        userMode = "student";
        this.props.actions.changeUserMode(userMode);
        localStorageService.updateUserMode(userMode);
      }
      this.toggle("CourseSearch");
      history.push(`${PUBLIC_URL}/CourseSearch`);
    } else if (navigateTo === "tutor") {
      if (userMode !== "tutor") {
        userMode = "tutor";
        this.props.actions.changeUserMode(userMode);
        localStorageService.updateUserMode(userMode);
      }
      this.toggle("TutorDashboard");
      history.push(`${PUBLIC_URL}/TutorDashboard`);
    }
  };

  redirectToProfile = () => {
    this.handleClose();
    let { userMode, auth } = this.props;
    if (userMode === "student") {
      history.push(`${PUBLIC_URL}/StudentProfile`);
    } else if (userMode === "tutor") {
      history.push(`${PUBLIC_URL}/TutorProfile/${auth.user.TeacherId}`);
    }
  };

  handleChange = (e) => {

    //this.setState({ searchText: e.target.value });
    this.props.actions.headerSearch(e.target.value);
  };

  handleFilterRecord = () => {
    this.props.actions.performSearch(true);
    console.log(history.location.pathname);
    if (history.location.pathname != "/CourseSearch") {
      history.push(
        `${PUBLIC_URL}/CourseSearch`
      );
    }
  };

  onKeyDown = (event) => {
    // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
    if (event.key === "Enter") {
      this.handleFilterRecord();
    }
  };

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };
  handleCreateMenu = (event) => {
    this.toggle("Create");
    this.setState({ anchorE2: event.currentTarget });
  };

  handleFaqMenu = (event) => {
    this.toggle("Faq");
    this.setState({ anchorE3: event.currentTarget });
  };
  handleFaqMenuClose = () => {
    this.toggle("Faq");
    this.setState({ anchorE3: null });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleCreateMenuClose = () => {
    this.toggle("");
    this.setState({ anchorE2: null });
  };

  handleRedirect = (route) => {
    this.handleFaqMenuClose();
    this.handleCreateMenuClose();
    this.toggle("Create");
    history.push(`${PUBLIC_URL}${route}`);
  };
  handleChangePassword = () => {
    this.handleClose();
    history.push(`${PUBLIC_URL}/ChangePassword`);
  };

  handleLogOut = () => {
    this.handleClose();
    this.props.onLogout();
    clearTimeout(this.timeout);
  };

  toggle = (menuItem) => {
    this.setState({ activeMenu: menuItem });
  };

  // Private session modal function
  handlePrivateSessionModal = () => {
    const { auth } = this.props;
    if (
      auth.user.IsProfileUpdated === "N" ||
      auth.user.IsProfileUpdated === null
    ) {
      this.props.actions.showAlert({
        message: "Please add details to your profile in order to continue.",
        variant: "info",
      });
      history.push(`${PUBLIC_URL}/CreateTutor`);
      this.handleCreateMenuClose();
      return false;
    }
    this.handleCreateMenuClose();
    const { showPrivateSessionModal } = this.state;
    this.setState({
      showPrivateSessionModal: !showPrivateSessionModal,
      showMenu: false,
    });
  };

  handleTimezoneChange = (timeZone) => {
    this.setState({ PrivateSessionTimeZone: timeZone.id });
  };

  render() {
    const {
      addMobileSticky,
      loading,
      // searchText,
      notificationCount,
      firstName,
      lastName,
      userImage,
      activeMenu,
    } = this.state;
    const { auth, userMode } = this.props;
    return (
      <Fragment>
        <header
          className={
            `mainHeader fixed-top ${this.state.showMenu ? "show" : ""}` +
            addMobileSticky
          }
        >
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <nav className="navbar navbar-expand-md">
                  <a
                    className="navbar-brand"
                    href={`${PUBLIC_URL === "" ? "/" : PUBLIC_URL}`}
                  >
                    <img width="50" height="47"
                      src={require("../../../assets/images/logo.png")}
                      alt="logo"
                    />
                    {
                      <span className="logoText">
                        Osmos-ish
                        <strong className="text-danger">BETA</strong>
                      </span>
                    }
                  </a>
                  <div
                    className="navbarToggler"
                    onClick={this.handleToggleMenu}
                  >
                    <span>
                      <b></b>
                      <b></b>
                      <b></b>
                    </span>
                  </div>
                  <div
                    className={`sectionBg ${this.state.showMenu ? "show" : ""}`}
                  ></div>
                  <div className="mobileMenus">
                    <ul className="cartValue">
                      {userMode === "student" && (
                        <li>
                          <NavLink
                            className="nav-link"
                            to={`${PUBLIC_URL}/ViewCart`}
                          >
                            <Badge
                              color="secondary"
                              badgeContent={this.props.cart.cartCount}
                              showZero
                            >
                              <i
                                className="fa fa-shopping-cart"
                                aria-hidden="true"
                              ></i>
                            </Badge>
                          </NavLink>
                        </li>
                      )}
                      {auth.loggedIn && (
                        <li>
                          <NavLink
                            className="nav-link"
                            to={`${PUBLIC_URL}/Notifications`}
                          >
                            <Badge
                              color="primary"
                              variant="dot"
                              invisible={notificationCount > 0 ? false : true}
                            >
                              <Tooltip
                                title={`${userMode === "tutor"
                                  ? "Private Session Requests and Status"
                                  : "Private Session Status"
                                  }`}
                              >
                                <NotificationsNoneRoundedIcon fontSize="small"></NotificationsNoneRoundedIcon>
                              </Tooltip>
                            </Badge>
                          </NavLink>
                        </li>
                      )}
                      {userMode === "student" && (
                        <li className="nav-item">
                          <a
                            className="nav-link"
                            title="Search"
                            onClick={() =>
                              this.setState({
                                showSearchBar: !this.state.showSearchBar,
                              })
                            }
                          >
                            <i className="fa fa-search"></i>
                          </a>
                          <form
                            className={`mobileSearchBaar ${this.state.showSearchBar ? "showMobileSearch" : ""
                              }`}
                          >
                            <input
                              className="form-control mr-sm-2"
                              type="text"
                              placeholder="Search for Sessions"
                              value={this.props.search}
                              onChange={this.handleChange}
                              onKeyDown={this.onKeyDown}
                            />
                            <button
                              type="button"
                              className="searchBtn"
                              onClick={this.handleFilterRecord}
                            >
                              <i
                                className="fa fa-search"
                                aria-hidden="true"
                              ></i>
                            </button>
                          </form>
                        </li>
                      )}

                    </ul>
                  </div>
                  <div
                    className={`navbarCollapse ${this.state.showMenu ? "show" : ""
                      }`}
                  >
                    <label>Menu</label>
                    <ul className="navbar-nav ml-auto">
                      {userMode === "student" && (
                        <li className="form-inline d-md-none d-sm-none d-none d-lg-block">
                          <input
                            className="form-control mr-sm-2"
                            type="text"
                            placeholder="Search for Sessions"
                            value={this.props.search}
                            onChange={this.handleChange}
                            onKeyDown={this.onKeyDown}
                          />
                          <button
                            type="button"
                            className="searchBtn"
                            onClick={this.handleFilterRecord}
                          >
                            <i className="fa fa-search" aria-hidden="true"></i>
                          </button>
                        </li>
                      )}
                      {auth.loggedIn && (
                        <Fragment>
                          <li className="nav-item mobileMenu userProfileSection mt-3">
                            <Avatar
                              alt={firstName}
                              src={`${APP_URLS.API_URL}${userImage}`}
                            />
                            <span disabled={false}>
                              {firstName} {lastName}
                            </span>
                          </li>
                        </Fragment>
                      )}

                      <>
                        <li
                          className={`nav-item ${activeMenu === "Faq" ? "active" : ""
                            } desktopMenu`}
                          aria-controls="simple-menu"
                          aria-haspopup="true"
                          onClick={this.handleFaqMenu}
                        >
                          <a className="nav-link">Faq</a>
                        </li>
                        <Menu
                          id="simple-menu"
                          anchorEl={this.state.anchorE3}
                          keepMounted
                          open={Boolean(this.state.anchorE3)}
                          onClose={this.handleFaqMenuClose}
                          disableScrollLock={true}
                        >
                          <MenuItem
                            onClick={() => this.handleRedirect("/HowItwork")}
                          >
                            How It Works
                          </MenuItem>
                          <MenuItem onClick={() => this.handleRedirect("/Faq/Hosts")}>
                            {" "}
                            FAQ
                          </MenuItem>
                          {/* <MenuItem onClick={() => this.handleRedirect("/Faq/affiliateProgram")}>
                            {" "}
                            Affiliate Program
                          </MenuItem> */}
                        </Menu>
                      </>
                      {(() => {
                        if (auth.loggedIn) {
                          return (
                            <Fragment>
                              <li className={`nav-item ${activeMenu === "Faq" ? "active" : ""} mobileMenu`} onClick={() => this.toggle("Faq")}                                  >
                                <NavLink className="nav-link" to={`${PUBLIC_URL}/Faq/Hosts`}>
                                  Faq
                                </NavLink>
                              </li>
                              <li className={`nav-item ${activeMenu === "HowItwork" ? "active" : ""} mobileMenu`} onClick={() => this.toggle("HowItwork")}                                  >
                                <NavLink className="nav-link" to={`${PUBLIC_URL}/HowItwork`}>
                                  How It Works
                                </NavLink>
                              </li>
                              <li className={`nav-item ${activeMenu === "AffiliateProgram" ? "active" : ""} mobileMenu`} onClick={() => this.toggle("AffiliateProgram")}                                  >
                                <NavLink className="nav-link" to={`${PUBLIC_URL}/Faq/affiliateProgram`}>
                                  Affiliate Program
                                </NavLink>
                              </li>


                              {userMode === "student" && (
                                <li
                                  className={`nav-item ${activeMenu === "CourseSearch"
                                    ? "active"
                                    : ""
                                    }`}
                                  onClick={() => this.toggle("CourseSearch")}
                                >
                                  <NavLink
                                    className="nav-link"
                                    to={`${PUBLIC_URL}/CourseSearch`}
                                  >
                                    Browse
                                  </NavLink>
                                </li>
                              )}


                              {userMode === "student" &&
                                auth.user.IsTutor === "N" && (
                                  <li
                                    className={`nav-item ${activeMenu === "BecomeATutor"
                                      ? "active"
                                      : ""
                                      }`}
                                    onClick={() =>
                                      this.becomeStudentOrTutor("tutor")
                                    }
                                  >
                                    <a className="nav-link"> Become A Host</a>
                                  </li>
                                )}
                              {userMode === "student" && (
                                <li
                                  className={`nav-item ${activeMenu === "StudentDashboard"
                                    ? "active"
                                    : ""
                                    }`}
                                  onClick={() =>
                                    this.toggle("StudentDashboard")
                                  }
                                >
                                  <NavLink
                                    className="nav-link"
                                    to={`${PUBLIC_URL}/StudentDashboard`}
                                  >
                                    Dashboard
                                  </NavLink>
                                </li>
                              )}

                              {userMode === "student" && (
                                <li
                                  className={`nav-item ${activeMenu === "PrivateSession"
                                    ? "active"
                                    : ""
                                    }`}
                                  onClick={() => this.toggle("PrivateSession")}
                                >
                                  <NavLink
                                    className="nav-link"
                                    to={`${PUBLIC_URL}/PrivateSession`}
                                  >
                                    Private Session
                                  </NavLink>
                                </li>
                              )}

                              {userMode === "student" && (
                                <li
                                  className={`nav-item d-md-none d-sm-none d-none d-lg-block ${activeMenu === "ViewCart" ? "active" : ""
                                    }`}
                                  onClick={() => this.toggle("ViewCart")}
                                >
                                  <NavLink
                                    className="nav-link"
                                    to={`${PUBLIC_URL}/ViewCart`}
                                  >
                                    <Badge
                                      color="secondary"
                                      badgeContent={this.props.cart.cartCount}
                                      showZero
                                    >
                                      <Typography>My Cart</Typography>
                                    </Badge>
                                  </NavLink>
                                </li>
                              )}

                              {userMode === "student" &&
                                auth.user.IsTutor === "Y" && (
                                  <li
                                    className={`nav-item ${activeMenu === "Tutor" ? "active" : ""
                                      }`}
                                    onClick={() =>
                                      this.redirectToUserMode("tutor")
                                    }
                                  >
                                    <a className="nav-link">Switch to Host</a>
                                  </li>
                                )}
                              {userMode === "tutor" && (
                                <>
                                  <li
                                    className={`nav-item ${activeMenu === "Create" ? "active" : ""
                                      } desktopMenu`}
                                    aria-controls="simple-menu"
                                    aria-haspopup="true"
                                    onClick={this.handleCreateMenu}
                                  >
                                    <a className="nav-link">Create</a>
                                  </li>
                                  <Menu
                                    id="simple-menu"
                                    anchorEl={this.state.anchorE2}
                                    keepMounted
                                    open={Boolean(this.state.anchorE2)}
                                    onClose={this.handleCreateMenuClose}
                                    disableScrollLock={true}
                                  >
                                    <MenuItem
                                      onClick={() =>
                                        this.handleRedirect("/CreateSeries")
                                      }
                                    >
                                      Create Series
                                    </MenuItem>
                                    <MenuItem
                                      onClick={() =>
                                        this.handleRedirect(
                                          "/CreateEditSession/-1"
                                        )
                                      }
                                    >
                                      {" "}
                                      Create Session
                                    </MenuItem>
                                    <MenuItem
                                      onClick={() =>
                                        this.handlePrivateSessionModal()
                                      }
                                    >
                                      {" "}
                                      Create Private Session
                                    </MenuItem>
                                  </Menu>
                                </>
                              )}

                              {userMode === "tutor" && (
                                <Fragment>
                                  <li className={`nav-item ${activeMenu === "CreateSeries" ? "active" : ""} mobileMenu`} onClick={() => this.toggle("CreateSeries")}                                  >
                                    <NavLink className="nav-link" to={`${PUBLIC_URL}/CreateSeries`}>
                                      Create Series
                                    </NavLink>
                                  </li>
                                  <li
                                    className={`nav-item ${activeMenu === "CreateSession"
                                      ? "active"
                                      : ""
                                      } mobileMenu`}
                                    onClick={() => this.toggle("CreateSession")}
                                  >
                                    <NavLink
                                      className="nav-link"
                                      to={`${PUBLIC_URL}/CreateEditSession/-1`}
                                    >
                                      Create Session
                                    </NavLink>
                                  </li>
                                  <li
                                    className={`nav-item ${activeMenu === "CreatePrivateSession"
                                      ? "active"
                                      : ""
                                      } mobileMenu`}
                                    onClick={() =>
                                      this.handlePrivateSessionModal()
                                    }
                                  >
                                    <a className="nav-link">
                                      Create Private Session
                                    </a>
                                  </li>
                                </Fragment>
                              )}

                              {userMode === "tutor" && (
                                <li
                                  className={`nav-item ${activeMenu === "TutorDashboard"
                                    ? "active"
                                    : ""
                                    }`}
                                  onClick={() => this.toggle("TutorDashboard")}
                                >
                                  <NavLink
                                    className="nav-link"
                                    to={`${PUBLIC_URL}/TutorDashboard`}
                                  >
                                    Dashboard
                                  </NavLink>
                                </li>
                              )}
                              {userMode === "tutor" &&
                                auth.user.IsStudent == "N" && (
                                  <li
                                    className={`nav-item ${activeMenu === "BecomeAStudent"
                                      ? "active"
                                      : ""
                                      }`}
                                    onClick={() =>
                                      this.becomeStudentOrTutor("student")
                                    }
                                  >
                                    <a className="nav-link">Become A Student</a>
                                  </li>
                                )}
                              {userMode === "tutor" &&
                                auth.user.IsStudent == "Y" && (
                                  <li
                                    className={`nav-item ${activeMenu === "Student" ? "active" : ""
                                      }`}
                                    onClick={() =>
                                      this.redirectToUserMode("student")
                                    }
                                  >
                                    <a className="nav-link">Switch to User</a>
                                  </li>
                                )}
                              <li className="nav-item desktopMenu">
                                <NavLink
                                  className="nav-link"
                                  to={`${PUBLIC_URL}/Notifications`}
                                >
                                  <Badge
                                    color="primary"
                                    variant="dot"
                                    invisible={
                                      notificationCount > 0 ? false : true
                                    }
                                  >
                                    <Tooltip
                                      title={`${userMode === "tutor"
                                        ? "Private Session Requests and Status"
                                        : "Private Session Status"
                                        }`}
                                    >
                                      <NotificationsNoneRoundedIcon fontSize="small"></NotificationsNoneRoundedIcon>
                                    </Tooltip>
                                  </Badge>
                                </NavLink>
                              </li>

                              <Fragment>
                                <li
                                  className="nav-item mobileMenu"
                                  onClick={this.redirectToProfile}
                                >
                                  <a className="nav-link">
                                    {userMode === "tutor"
                                      ? "Host Profile"
                                      : "User Profile"}
                                  </a>
                                </li>
                                {auth.user.ExternalProvider === null && (
                                  <li
                                    className="nav-item mobileMenu"
                                    onClick={this.handleChangePassword}
                                  >
                                    <a className="nav-link">Reset Password</a>
                                  </li>
                                )}

                                <li
                                  className="nav-item mobileMenu"
                                  onClick={this.handleLogOut}
                                >
                                  <a className="nav-link">Log Out</a>
                                </li>
                              </Fragment>
                              <li className="nav-item userProfileSection desktopMenu">
                                <Avatar
                                  onClick={this.handleClick}
                                  alt={auth.user.FirstName}
                                  src={`${APP_URLS.API_URL}${auth.user.UserImage}`}
                                />
                                <Menu
                                  id="simple-menu"
                                  anchorEl={this.state.anchorEl}
                                  keepMounted
                                  open={Boolean(this.state.anchorEl)}
                                  onClose={this.handleClose}
                                  disableScrollLock={true}
                                >
                                  <MenuItem disabled={false}>
                                    {auth.user.FirstName} {auth.user.LastName}
                                  </MenuItem>
                                  <MenuItem onClick={this.redirectToProfile}>
                                    <PersonOutlineIcon fontSize="small" />
                                    {userMode === "tutor"
                                      ? "Host Profile"
                                      : "User Profile"}
                                  </MenuItem>
                                  {auth.user.ExternalProvider === null && (
                                    <MenuItem
                                      onClick={this.handleChangePassword}
                                    >
                                      <LockOpenIcon fontSize="small" />
                                      Reset Password
                                    </MenuItem>
                                  )}
                                  <MenuItem onClick={this.handleLogOut}>
                                    <ExitToAppIcon fontSize="small" />
                                    Logout
                                  </MenuItem>
                                </Menu>
                              </li>
                            </Fragment>
                          );
                        } else {
                          return (
                            <Fragment>
                              {userMode === "student" && (
                                <li
                                  className={`nav-item ${activeMenu === "CourseSearch"
                                    ? "active"
                                    : ""
                                    }`}
                                  onClick={() => this.toggle("CourseSearch")}
                                >
                                  <NavLink
                                    className="nav-link"
                                    to={`${PUBLIC_URL}/CourseSearch`}
                                  >
                                    Browse
                                  </NavLink>
                                </li>
                              )}

                              <li className={`nav-item ${activeMenu === "Faq" ? "active" : ""} mobileMenu`} onClick={() => this.toggle("Faq")}                                  >
                                <NavLink className="nav-link" to={`${PUBLIC_URL}/Faq/Hosts`}>
                                  Faq
                                </NavLink>
                              </li>
                              <li className={`nav-item ${activeMenu === "HowItwork" ? "active" : ""} mobileMenu`} onClick={() => this.toggle("HowItwork")}                                  >
                                <NavLink className="nav-link" to={`${PUBLIC_URL}/HowItwork`}>
                                  How It Works
                                </NavLink>
                              </li>
                              <li className={`nav-item ${activeMenu === "AffiliateProgram" ? "active" : ""} mobileMenu`} onClick={() => this.toggle("AffiliateProgram")}                                  >
                                <NavLink className="nav-link" to={`${PUBLIC_URL}/Faq/affiliateProgram`}>
                                  Affiliate Program
                                </NavLink>
                              </li>

                              <li
                                className={`nav-item ${activeMenu === "BecomeTutor" ? "active" : ""
                                  }`}
                                onClick={() => this.toggle("BecomeTutor")}
                              >
                                <NavLink
                                  className="nav-link"
                                  to={`${PUBLIC_URL}/BecomeTutor`}
                                >
                                  Become A Host
                                </NavLink>
                              </li>
                              <li
                                className={`nav-item ${activeMenu === "PrivateSession"
                                  ? "active"
                                  : ""
                                  }`}
                                onClick={() => this.toggle("PrivateSession")}
                              >
                                <NavLink
                                  className="nav-link"
                                  to={`${PUBLIC_URL}/PrivateSession`}
                                >
                                  Private Session
                                </NavLink>
                              </li>
                              {/* <li
                                className={`nav-item ${activeMenu === "HowItwork" ? "active" : ""
                                  }`}
                                onClick={() => this.toggle("HowItwork")}
                              >
                                <NavLink
                                  className="nav-link"
                                  to={`${PUBLIC_URL}/HowItwork`}
                                >
                                  How it Works
                                </NavLink>
                              </li> */}

                              <li
                                className={`nav-item d-md-none d-sm-none d-none d-lg-block ${activeMenu === "HowItwork" ? "active" : ""
                                  }`}
                                onClick={() => this.toggle("ViewCart")}
                              >
                                <a
                                  className="nav-link"
                                  href={`${PUBLIC_URL}/ViewCart`}
                                  title="My Cart"
                                >
                                  <Badge
                                    color="secondary"
                                    badgeContent={this.props.cart.cartCount}
                                    showZero
                                  >
                                    <Typography>My Cart</Typography>
                                  </Badge>
                                </a>
                              </li>

                              <li
                                className="nav-item"
                                onClick={() => this.isShowSignIn(true)}
                              >
                                <a className="nav-link">
                                  <img width="25" height="19"
                                    src={require("../../../assets/images/loginicon.png")}
                                  />
                                  Sign In
                                </a>
                              </li>
                              <li
                                className="nav-item"
                                onClick={() => this.isShowSignUp(true)}
                              >
                                <a className="nav-link">
                                  <img width="25" height="19"
                                    src={require("../../../assets/images/sign-up.png")}
                                  />
                                  Sign Up
                                </a>
                              </li>
                            </Fragment>
                          );
                        }
                      })()}

                    </ul>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </header>
        <SignIn
          showSignIn={this.state.showSigninModal}
          onSignInClose={this.isShowSignIn}
        ></SignIn>
        <SignUp
          showSignUp={this.state.showSignupModal}
          onSignUpClose={this.isShowSignUp}
          showSignInModal={() => this.isShowSignIn(true)}
        ></SignUp>
        <TutorSignUp
          showTutorSignUp={this.state.showTutorSignupModal}
          onSignUpClose={this.isShowTutorSignUp}
          showSignInModal={() => this.isShowSignIn(true)}
        ></TutorSignUp>
        <PrivateSessionModal
          showPrivateSessionModal={this.state.showPrivateSessionModal}
          handleClose={this.handlePrivateSessionModal}
          teacherId={this.props.auth.user && this.props.auth.user.TeacherId}
          handleTimezoneChange={this.handleTimezoneChange}
          PrivateSessionTimeZone={this.state.PrivateSessionTimeZone}
        ></PrivateSessionModal>
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
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
    cart: state.cart,
    userMode: state.auth.userMode,
    search: state.common.search

  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      showAlert: bindActionCreators(actions.showAlert, dispatch),
      loginSuccess: bindActionCreators(actions.loginSuccess, dispatch),
      changeUserMode: bindActionCreators(actions.changeUserMode, dispatch),
      updateTimezone: bindActionCreators(actions.updateTimezone, dispatch),
      headerSearch: bindActionCreators(actions.searchText, dispatch),
      performSearch: bindActionCreators(actions.performSearch, dispatch),
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);
