import React, { Component, Fragment } from "react";
import { apiService } from "../../services/api.service";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import FormatDateTime from "../../shared/components/functional/DateTimeFormatter";
import Swiper from "react-id-swiper";
import "swiper/css/swiper.css";
import Chart from "react-google-charts";
import { Tab } from "semantic-ui-react";
// import FullCalendar from "../../shared/components/ui/Calendar/FullCalendar";
import moment from "moment";
import { APP_URLS } from "../../config/api.config";
import { PUBLIC_URL } from "../../config/api.config";
import { history } from "../../helpers/history";
import Loader from "react-loaders";
import Button from "@material-ui/core/Button";
import { localStorageService } from "../../services/localStorageService";
import MaterialTable, { MTableBody } from "material-table";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import Tooltip from "@material-ui/core/Tooltip";
import { commonFunctions } from "../../shared/components/functional/commonfunctions";
import PrivateSessionModal from "../session/PrivateSessionModal/PrivateSessionModal";
import AddToCalendar from "react-add-to-calendar";
import "react-add-to-calendar/dist/react-add-to-calendar.css";
const tableRef = React.createRef();
class TeacherDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      teacherDashboardData: [],
      todaySeriesSession: [],
      activeIndex: 1,
      panes: [],
      teacherId:
        this.props.auth.user.TeacherId > 0
          ? this.props.auth.user.TeacherId
          : -1,
      //eventList: [],
      teachertodaysSessionData: [],
      upcomingSeriesSessionTab: [],
      recentSeriesSessionTab: [],
      userMode: "tutor",
      showPrivateSessionModal: false,
      PrivateSessionAvailableDaySlots: [],
      PrivateSessionTimeZone: "",
      localDatetime: '',
      description: "Hello, in order to join a video session, 5 minutes before your start time, you will need to go to your Host or User dashboard at osmosish.com and below the information with your progress, there will be a card with your class information and a button to join.",
      // userTimezone: moment.tz(moment.tz.guess(true)).format("z").indexOf("+") !== -1 || moment.tz(moment.tz.guess(true)).format("z").indexOf("-") !== -1 ? this.props.userTimezone : moment.tz(moment.tz.guess(true)).format("z")
    };
  }
  componentDidMount = async () => {
    localStorageService.updateUserMode("tutor");
    this.props.actions.changeUserMode("tutor");
    let timezone = localStorageService.getUserTimeZone();
    this.props.actions.updateTimezone(timezone);


    const { auth } = this.props;
    if (auth.user.IsProfileUpdated === "N") {
      this.props.actions.showAlert({
        message: "Please add your prfoile details to continue.",
        variant: "info",
      });
      history.push(`${PUBLIC_URL}/CreateTutor`);
    }

    this.getTeacherDashboardData();
    await this.getRecentSeriesSession();
    await this.getUpcomingSeriesSession();
    this.getTeacherTodaysSessionData();
    this.tabsData();
  };

  //------------------ Api calls -----------------------
  getTeacherDashboardData = () => {
    this.setState({ loading: true });
    apiService
      .post("UNAUTHORIZEDDATA", {
        data: { TeacherId: this.state.teacherId },
        keyName: "GetTutorDashboardData",
      })
      .then(
        (response) => {
          if (response.Success) {
            if (
              response.Data !== null &&
              Object.keys(response.Data).length > 0 &&
              response.Data.ResultDataList.length > 0
            ) {
              let dashboardData = response.Data.ResultDataList[0];
              dashboardData.TotalEarned =
                dashboardData.TotalEarned > 0 ? dashboardData.TotalEarned : 0;
              this.setState({
                teacherDashboardData: dashboardData,
              });
            }
          } else {
            this.props.actions.showAlert({ message: response.Message, variant: "error" });
          }
          this.setState({ loading: false });
        },
        (error) =>
          this.setState((prevState) => {
            this.props.actions.showAlert({
              message: "Something went wrong...",
              variant: "error",
            });
            this.setState({ loading: false });
          })
      );
  };

  convertDate = (data) => {
    // This is using for the convert string to Date.
    for (let i = 0; i < data.length; i++) {
      data[i].StartTime = commonFunctions.getUtcDatetime(data[i].StartTime).toDate();
      data[i].EndTime = commonFunctions.getUtcDatetime(data[i].EndTime).toDate();
    }
    return data;
  };

  // getAllSessionsOfTutor = () => {
  //   this.setState({ loading: true });
  //   apiService
  //     .post("UNAUTHORIZEDDATA", {
  //       data: { TutorId: this.state.teacherId },
  //       keyName: "GetAllSessionsOfTutor",
  //     })
  //     .then(
  //       (response) => {
  //         if (response.Success) {
  //           if (
  //             response.Data !== null &&
  //             Object.keys(response.Data).length > 0 &&
  //             response.Data.ResultDataList.length > 0
  //           ) {
  //             const data = this.convertDate(response.Data.ResultDataList);
  //             this.setState({
  //               eventList: data,
  //             });
  //           }
  //         }
  //         this.setState({ loading: false });
  //       },
  //       (error) =>
  //         this.setState((prevState) => {
  //           console.log(`Detail:${error}`);
  //           this.props.actions.showAlert({
  //             message: "Something went wrong...",
  //             variant: "error",
  //           });
  //           this.setState({ loading: false });
  //         })
  //     );
  // };

  getTeacherTodaysSessionData = () => {
    const localDateTime = localStorageService.getCurrentTime();
    apiService.post("UNAUTHORIZEDDATA", { data: { TutorId: this.state.teacherId }, keyName: "GetTutorsTodaysSession" })
      .then(
        (response) => {
          if (response.Success) {
            if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
              let filterData = response.Data.ResultDataList.filter((x) => moment(localDateTime).isSame(commonFunctions.getUtcDatetime(x.StartTime), "date"));

              let orderedList1 = filterData.filter((x) => commonFunctions.getUtcDatetime(x.EndTime).isAfter(moment(), "second"));
              let orderedList2 = filterData.filter((x) => commonFunctions.getUtcDatetime(x.EndTime).isBefore(moment(), "second"));
              this.setState({ teachertodaysSessionData: [...orderedList1, ...orderedList2] });
              this.timeout = window.setInterval(() => this.getTeacherTodaysSessionData(), 60000);
            }
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

  componentWillUnmount() {
    clearInterval(this.timeout);
  }

  getRecentSeriesSession = async () => {
    this.setState({ loading: true });
    await apiService
      .post("UNAUTHORIZEDDATA", { data: { TeacherId: this.state.teacherId }, keyName: "GetTutorRecentSession" })
      .then(
        (response) => {
          if (response.Success) {
            if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
              let filterData = response.Data.ResultDataList[0].data === null ? [] : JSON.parse(response.Data.ResultDataList[0].data).filter((x) =>
                x.SeriesId > 0 ? moment(commonFunctions.getUtcDatetime(JSON.parse(x.SeriesSessions)[0].EndTime)).isBefore(moment(), "second")
                  : commonFunctions.getUtcDatetime(x.EndTime).isBefore(moment(), "second"));
              this.setState({ recentSeriesSessionTab: filterData });
            }
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

  getUpcomingSeriesSession = async () => {
    this.setState({ loading: true });
    await apiService
      .post("UNAUTHORIZEDDATA", {
        data: { TeacherId: this.state.teacherId },
        keyName: "GetTutorUpcomingSession",
      })
      .then((response) => {
        if (response.Success) {
          if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
            let filterData = response.Data.ResultDataList[0].data === null ? [] : JSON.parse(response.Data.ResultDataList[0].data).filter((x) => x.SeriesId > 0 && typeof (x.SeriesSessions) !== "undefined" ? moment(commonFunctions.getUtcDatetime(JSON.parse(x.SeriesSessions)[0].EndTime)
            ).isAfter(moment(), "second") : x.SeriesId > 0 ? null : moment(commonFunctions.getUtcDatetime(x.EndTime)).isAfter(moment(), "second"));
            this.setState({ upcomingSeriesSessionTab: filterData });
          }
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

  /// handler functions ----------------------------------
  tabsData = () => {
    this.setState({ loading: true });
    const { userTimezone } = this.props;
    const { description } = this.state;
    let panes = [];
    panes = [
      {
        menuItem: "Recent Series/Sessions",
        render: () => (
          <Tab.Pane className="dataContent">
            <div className="responsiveTable">
              <MaterialTable
                tableRef={tableRef}
                title=""
                key="1"
                columns={[
                  {
                    title: "Type",
                    width: "5%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Type
                        </div>
                        {rowData.Type}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Title",
                    width: "30%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Title
                        </div>
                        {rowData.Title}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Start Time",
                    width: "25%",
                    render: (rowData) =>
                      rowData.SeriesId > 0 ? (
                        <Fragment>
                          <div data-testid="td-before" className="tdBefore">
                            Start Time
                          </div>
                          <FormatDateTime
                            date={
                              JSON.parse(rowData.SeriesSessions)[0].StartTime
                            }
                            format="MMM DD, YYYY hh:mm A"
                          ></FormatDateTime>{" "}
                          ({userTimezone}){/* ({rowData.TimeZone}) */}
                        </Fragment>
                      ) : (
                        <Fragment>
                          <div data-testid="td-before" className="tdBefore">
                            Start Time
                          </div>
                          <FormatDateTime
                            date={rowData.StartTime}
                            format="MMM DD, YYYY hh:mm A"
                          ></FormatDateTime>{" "}
                          ({userTimezone}){/* ({rowData.TimeZone}) */}
                        </Fragment>
                      ),
                  },
                  {
                    title: "Session Duration",
                    width: "15%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Session Duration
                        </div>
                        {rowData.SeriesId > 0
                          ? JSON.parse(rowData.SeriesSessions)[0].Duration
                          : rowData.Duration}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Session/Series Fee",
                    width: "15%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          {" "}
                          Session/Series Fee
                        </div>
                        {"$ " + rowData.Fee}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Action",
                    width: "10%",
                    render: (rowData) => (
                      <Fragment>
                        {" "}
                        <div data-testid="td-before" className="tdBefore">
                          Action
                        </div>{" "}
                        <div class="tbActionBtn">
                          {rowData.SeriesId > 0 ? (
                            <Tooltip
                              title="View Detail"
                              aria-label="view"
                              className="viewBlue"
                            >
                              <Button
                                variant="outlined"
                                onClick={() =>
                                  this.handleViewDetails(rowData.SeriesId, 0)
                                }
                                size="small"
                                color="info"
                              >
                                <i class="fa fa-eye"></i>
                              </Button>
                            </Tooltip>
                          ) : (
                            <Tooltip
                              title="View Detail"
                              aria-label="view"
                              className="viewBlue"
                            >
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() =>
                                  this.handleViewDetails(0, rowData.SessionId)
                                }
                                color="indo"
                              >
                                <i class="fa fa-eye"></i>
                              </Button>
                            </Tooltip>
                          )}
                          <Tooltip title={`Duplicate ${rowData.Type}`} aria-label="view">
                            <Button size="small" onClick={() => this.handleCopyClass(rowData.SeriesId, rowData.SessionId)}>
                              <i class="fa fa-files-o"></i>
                            </Button>
                          </Tooltip>
                        </div>
                      </Fragment>
                    ),
                  },
                ]}
                data={this.state.recentSeriesSessionTab === null ? [] : this.state.recentSeriesSessionTab}
                options={{
                  draggable: false,
                  sorting: false,
                  pageSize: 5,
                  pageSizeOptions: [5, 10, 25, 50, 100],
                  paging: true,
                  minBodyHeight: "270px",
                  headerStyle: {
                    backgroundColor: "#4c5a67",
                    color: "#FFF",
                  },
                }}
                localization={{
                  pagination: {
                    labelRowsSelect: "rows per page",
                  },
                }}
                components={{
                  Body: (props) => (
                    <Fragment>
                      {" "}
                      {props.renderData && props.renderData.length === 0 ? (
                        <div className="alignCenterExt">No Records found</div>
                      ) : (
                        <MTableBody {...props} />
                      )}
                    </Fragment>
                  ),
                }}
              />
            </div>
          </Tab.Pane>
        ),
      },
      {
        menuItem: "Upcoming Series/Sessions",
        render: () => (
          <Tab.Pane className="dataContent" renderActiveOnly={true}>
            <div className="responsiveTable">
              <MaterialTable
                tableRef={tableRef}
                title=""
                key="2"
                columns={[
                  {
                    title: "Type",
                    field: "Type",
                    width: "5%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Type
                        </div>
                        {rowData.Type}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Title",
                    field: "Title",
                    width: "20%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Title
                        </div>
                        {rowData.Title}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Start Time",
                    width: "30%",
                    render: (rowData) =>
                      rowData.SeriesId > 0 ? (
                        <Fragment>
                          <div data-testid="td-before" className="tdBefore">
                            Start Time
                          </div>
                          <FormatDateTime
                            date={
                              JSON.parse(rowData.SeriesSessions)[0].StartTime
                            }
                            format="MMM DD, YYYY hh:mm A"
                          ></FormatDateTime>{" "}
                          ({userTimezone}){/* ({rowData.TimeZone}) */}
                        </Fragment>
                      ) : (
                        <Fragment>
                          <div data-testid="td-before" className="tdBefore">
                            Start Time
                          </div>
                          <FormatDateTime
                            date={rowData.StartTime}
                            format="MMM DD, YYYY hh:mm A"
                          ></FormatDateTime>{" "}
                          ({userTimezone}){/* ({rowData.TimeZone}) */}
                        </Fragment>
                      ),
                  },
                  {
                    title: "Session/Series Duration",
                    width: "7%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Session/Series Duration
                        </div>
                        {rowData.SeriesId > 0
                          ? JSON.parse(rowData.SeriesSessions)[0].Duration
                          : rowData.Duration}
                      </Fragment>
                    ),
                  },
                  {
                    title: "# Of Participants",
                    width: "7%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Number Of Enrollments
                        </div>
                        {`${rowData.NumberOfJoineesEnrolled}/${rowData.NumberOfJoineesAllowed}`}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Session/Series Fee",
                    width: "7%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Session/Series Fee
                        </div>
                        {"$ " + rowData.Fee}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Action",
                    width: "35%",
                    render: (rowData) => (
                      <Fragment>

                        {" "}
                        <div data-testid="td-before" className="tdBefore">
                          Action
                        </div>{" "}
                        <div class="tbActionBtn">
                          <Tooltip>
                            <AddToCalendar buttonLabel="Add To Calendar" event={{ title: rowData.Title, description: description, location: "osmosish.com", startTime: rowData.StartTime, endTime: rowData.Endtime }} />
                          </Tooltip>
                          {rowData.SessionStatus === "N" &&
                            rowData.SeriesId > 0 ? (
                            <Fragment>
                              <Tooltip
                                title="View Detail"
                                aria-label="view"
                                className="viewBlue"
                              >
                                <Button
                                  variant="outlined"
                                  onClick={() =>
                                    this.handleViewDetails(rowData.SeriesId, 0)
                                  }
                                  size="small"
                                  color="primary"
                                >
                                  <i class="fa fa-eye"></i>
                                </Button>
                              </Tooltip>
                              {/* {moment(JSON.parse(rowData.SeriesSessions)[0].StartTime).isAfter(moment(), 'second') && */}
                              {moment().isBefore(
                                commonFunctions
                                  .getUtcDatetime(
                                    JSON.parse(rowData.SeriesSessions)[0]
                                      .StartTime
                                  )
                                  .subtract(24, "hours"),
                                "second"
                              ) && (
                                  <Tooltip
                                    title="Some fields are editable when students aren't enrolled and there are more than 24 hours before the session begins"
                                    aria-label="view"
                                    className="success"
                                  >
                                    <Button
                                      variant="outlined"
                                      onClick={() =>
                                        this.handleEditDetails(
                                          rowData.SeriesId,
                                          0
                                        )
                                      }
                                      size="small"
                                      color="primary"
                                    >
                                      <i class="material-icons">edit</i>
                                    </Button>
                                  </Tooltip>
                                )}
                              <Tooltip
                                title="Cancel"
                                aria-label="view"
                                className="danger"
                              >
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="secondary"
                                  onClick={() =>
                                    this.handleConfirmation(rowData.SeriesId, 0)
                                  }
                                >
                                  <i class="material-icons">close</i>
                                </Button>
                              </Tooltip>
                            </Fragment>
                          ) : rowData.SessionStatus === "N" ? (
                            <Fragment>
                              <Tooltip
                                title="View Detail"
                                aria-label="view"
                                className="viewBlue"
                              >
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() =>
                                    this.handleViewDetails(0, rowData.SessionId)
                                  }
                                  color="primary"
                                >
                                  <i class="fa fa-eye"></i>
                                </Button>
                              </Tooltip>
                              {moment().isBefore(commonFunctions.getUtcDatetime(rowData.StartTime).subtract(24, "hours"),
                                "second"
                              ) && (<Tooltip
                                title="Some fields are editable when students aren't enrolled and there are more than 24 hours before the session begins"
                                aria-label="view"
                                className="success"
                              >
                                <Button variant="outlined" size="small" onClick={() => this.handleEditDetails(0, rowData.SessionId)} color="primary">
                                  <i class="material-icons">edit</i>
                                </Button>
                              </Tooltip>
                                )}
                              <Tooltip
                                title="Cancel"
                                aria-label="view"
                                className="danger"
                              >
                                <Button variant="outlined" size="small" color="secondary" onClick={() => this.handleConfirmation(0, rowData.SessionId)}>
                                  <i class="material-icons">close</i>
                                </Button>
                              </Tooltip>
                            </Fragment>
                          ) : null}
                          {rowData.SessionStatus === "Y" && (
                            <div>
                              <Tooltip title="This class has been blocked due to a potential violation of our Terms and Conditions" className="danger">
                                <div>{rowData.Type} Blocked</div>
                              </Tooltip>
                            </div>

                          )}
                          <Tooltip title={`Duplicate ${rowData.Type}`} aria-label="view">
                            <Button size="small" onClick={() => this.handleCopyClass(rowData.SeriesId, rowData.SessionId)}>
                              <i class="fa fa-files-o"></i>
                            </Button>
                          </Tooltip>
                        </div>
                      </Fragment>
                    ),
                  }
                ]}
                data={
                  this.state.upcomingSeriesSessionTab === null
                    ? []
                    : this.state.upcomingSeriesSessionTab
                }
                options={{
                  draggable: false,
                  sorting: false,
                  minBodyHeight: "270px",
                  pageSize: 5,
                  pageSizeOptions: [5, 10, 25, 50, 100],
                  paging: true,

                  headerStyle: {
                    backgroundColor: "#4c5a67",
                    color: "#FFF",
                  },
                  rowStyle: (rowData) => {
                    return {
                      backgroundColor:
                        rowData.EnrollmentCount === 0 ? "#ffd1d5" : "#fff",
                    };
                  },
                }}
                localization={{
                  pagination: {
                    labelRowsSelect: "rows per page",
                  },
                }}
                components={{
                  Body: (props) => (
                    <Fragment>
                      {" "}
                      {props.renderData && props.renderData.length === 0 ? (
                        <div className="alignCenterExt">No Records found</div>
                      ) : (
                        <MTableBody {...props} />
                      )}
                    </Fragment>
                  ),
                }}
              />
            </div>
          </Tab.Pane>
        ),
      },
      {
        menuItem: "Cancelled Series/Sessions",
        render: () => (
          <Tab.Pane className="dataContent" renderActiveOnly={true}>
            <div className="responsiveTable">
              <MaterialTable
                tableRef={tableRef}
                title=""
                key="3"
                columns={[
                  {
                    title: "Type",
                    field: "Type",
                    width: "5%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Type
                        </div>
                        {rowData.Type}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Title",
                    field: "Title",
                    width: "26%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Title
                        </div>
                        {rowData.Title}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Start Time",
                    width: "25%",
                    render: (rowData) =>
                      rowData.SeriesId > 0 ? (
                        <Fragment>
                          <div data-testid="td-before" className="tdBefore">
                            Start Time
                          </div>
                          <FormatDateTime
                            date={
                              JSON.parse(rowData.SeriesSessions)[0].StartTime
                            }
                            format="MMM DD, YYYY hh:mm A"
                          ></FormatDateTime>{" "}
                          ({userTimezone}){/* ({rowData.TimeZone}) */}
                        </Fragment>
                      ) : (
                        <Fragment>
                          <div data-testid="td-before" className="tdBefore">
                            Start Time
                          </div>
                          <FormatDateTime
                            date={rowData.StartTime}
                            format="MMM DD, YYYY hh:mm A"
                          ></FormatDateTime>{" "}
                          ({userTimezone}){/* ({rowData.TimeZone}) */}
                        </Fragment>
                      ),
                  },

                  {
                    title: "Cancelled Date",
                    width: "25%",
                    render: (rowData) =>
                      rowData.SeriesId > 0 ? (
                        <Fragment>
                          <div data-testid="td-before" className="tdBefore">
                            Cancelled Date
                          </div>
                          <FormatDateTime
                            date={rowData.DeletedDate}
                            format="MMM DD, YYYY hh:mm A"
                          ></FormatDateTime>{" "}
                          ({userTimezone}){/* ({rowData.TimeZone}) */}
                        </Fragment>
                      ) : (
                        <Fragment>
                          <div data-testid="td-before" className="tdBefore">
                            Cancelled Date
                          </div>
                          <FormatDateTime
                            date={rowData.DeletedDate}
                            format="MMM DD, YYYY hh:mm A"
                          ></FormatDateTime>{" "}
                          ({userTimezone}){/* ({rowData.TimeZone}) */}
                        </Fragment>
                      ),
                  },

                  {
                    title: "Session Duration",
                    width: "12%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Session Duration
                        </div>
                        {rowData.SeriesId > 0
                          ? JSON.parse(rowData.SeriesSessions)[0].Duration
                          : rowData.Duration}{" "}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Session/Series Fee",
                    width: "7%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Session/Series Fee
                        </div>
                        {"$ " + rowData.Fee}{" "}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Action",
                    width: "25%",
                    render: (rowData) => (
                      <Fragment>
                        {" "}
                        <div data-testid="td-before" className="tdBefore">
                          Action
                        </div>{" "}
                        <div class="tbActionBtn">
                          <Tooltip title={`Duplicate ${rowData.Type}`} aria-label="view">
                            <Button size="small" onClick={() => this.handleCopyClass(rowData.SeriesId, rowData.SessionId)}>
                              <i class="fa fa-files-o"></i>
                            </Button>
                          </Tooltip>
                        </div>

                      </Fragment>
                    ),
                  }
                ]}
                data={(query) =>
                  new Promise((resolve, reject) => {
                    apiService
                      .post("UNAUTHORIZEDDATA", {
                        data: {
                          TeacherId: this.state.teacherId,
                          PageNbr: query.page + 1,
                          PageSize: query.pageSize,
                          Search: query.search,
                        },
                        keyName: "GetTutoCancelledSession",
                      })
                      .then((response) => {
                        resolve({
                          data:
                            response.Data.ResultDataList[0].data === null
                              ? []
                              : JSON.parse(
                                response.Data.ResultDataList[0].data
                              ),
                          page: query.page,
                          totalCount:
                            response.Data.ResultDataList[0].totalCount,
                        });
                      });
                  })
                }
                options={{
                  draggable: false,
                  sorting: false,
                  pageSize: 5,
                  pageSizeOptions: [5, 10, 25, 50, 100],
                  paging: true,
                  minBodyHeight: "270px",
                  headerStyle: {
                    backgroundColor: "#4c5a67",
                    color: "#FFF",
                  },
                }}
                localization={{
                  pagination: {
                    labelRowsSelect: "rows per page",
                  },
                }}
                components={{
                  Body: (props) => (
                    <Fragment>
                      {" "}
                      {props.renderData && props.renderData.length === 0 ? (
                        <div className="alignCenterExt">No Records found</div>
                      ) : (
                        <MTableBody {...props} />
                      )}
                    </Fragment>
                  ),
                }}
              />
            </div>
          </Tab.Pane>
        ),
      },
      {
        menuItem: "Disputes",
        render: () => (
          <Tab.Pane className="dataContent" renderActiveOnly={true}>
            <div className="responsiveTable">
              <MaterialTable
                tableRef={tableRef}
                title=""
                key="4"
                columns={[
                  {
                    title: "Type",
                    field: "Type",
                    width: "4%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Type
                        </div>
                        {rowData.Type}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Title",
                    field: "Title",
                    width: "23%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Title
                        </div>
                        {rowData.Title}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Student",
                    width: "20%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Student
                        </div>
                        {rowData.StudentName}{" "}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Dispute Date",
                    width: "23%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Dispute Date
                        </div>
                        <FormatDateTime
                          date={rowData.DisputeDate}
                          format="MMM DD, YYYY hh:mm A"
                        ></FormatDateTime>{" "}
                        ({userTimezone}){/* ({rowData.TimeZone}) */}
                      </Fragment>
                    ),
                  },

                  {
                    title: "Dispute Type",
                    width: "5%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Dispute Type
                        </div>
                        {rowData.DisputeReason}{" "}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Reason",
                    width: "15%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Reason
                        </div>
                        {rowData.Reason}{" "}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Status",
                    width: "5%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Status
                        </div>
                        {rowData.Status}{" "}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Response",
                    width: "5%",
                    render: (rowData) => (
                      <Fragment>
                        <div data-testid="td-before" className="tdBefore">
                          Status
                        </div>
                        {rowData.TutorResponse === "N" ? (
                          <Tooltip
                            title="Agree"
                            aria-label="Agree"
                            className="viewBlue"
                          >
                            <Button
                              variant="outlined"
                              onClick={() =>
                                this.handleDisputeResponse(rowData)
                              }
                              size="small"
                              color="info"
                            >
                              <i class="material-icons">done</i>
                            </Button>
                          </Tooltip>
                        ) : (
                          <label variant="outlined" size="small" color="info">
                            Agreed
                          </label>
                        )}{" "}
                      </Fragment>
                    ),
                  },
                  {
                    title: "Action",
                    width: "25%",
                    render: (rowData) => (
                      <Fragment>
                        {" "}
                        <div data-testid="td-before" className="tdBefore">
                          Action
                        </div>{" "}
                        <div class="tbActionBtn">
                          <Tooltip title={`Duplicate ${rowData.Type}`} aria-label="view">
                            <Button size="small" onClick={() => this.handleCopyClass(rowData.SeriesId, rowData.SessionId)}>
                              <i class="fa fa-files-o"></i>
                            </Button>
                          </Tooltip>
                        </div>

                      </Fragment>
                    ),
                  }
                ]}
                data={(query) =>
                  new Promise((resolve, reject) => {
                    apiService
                      .post("UNAUTHORIZEDDATA", {
                        data: {
                          TeacherId: this.state.teacherId,
                          PageNbr: query.page + 1,
                          PageSize: query.pageSize,
                          Search: query.search,
                        },
                        keyName: "GetTeacherDisputedSession",
                      })
                      .then((response) => {
                        resolve({
                          data:
                            response.Data.ResultDataList[0].data === null
                              ? []
                              : JSON.parse(
                                response.Data.ResultDataList[0].data
                              ),
                          page: query.page,
                          totalCount:
                            response.Data.ResultDataList[0].totalCount,
                        });
                      });
                  })
                }
                options={{
                  draggable: false,
                  sorting: false,
                  pageSize: 5,
                  minBodyHeight: "270px",
                  pageSizeOptions: [5, 10, 25, 50, 100],
                  paging: true,
                  headerStyle: {
                    backgroundColor: "#4c5a67",
                    color: "#FFF",
                  },
                }}
                localization={{
                  pagination: {
                    labelRowsSelect: "rows per page",
                  },
                }}
                components={{
                  Body: (props) => (
                    <Fragment>
                      {" "}
                      {props.renderData && props.renderData.length === 0 ? (
                        <div className="alignCenterExt">No Records found</div>
                      ) : (
                        <MTableBody {...props} />
                      )}
                    </Fragment>
                  ),
                }}
              />
            </div>
          </Tab.Pane>
        ),
      },
    ];
    this.setState({ panes, loading: false });
  };

  handleDisputeResponse = (data) => {
    this.setState({ loading: true });
    apiService
      .post("COMMONSAVE", {
        data: [
          {
            DisputeId: data.DisputeId,
            DisputeReason: data.ReasonId,
            DisputeStatus: data.DisputeStatus,
            SessionId: data.SessionId,
            StudentId: data.StudentId,
            TeacherId: data.TeacherId,
            Reason: data.Reason,
            TutorResponse: "Y",
          },
        ],
        entityName: "Disputes",
        additionalFields: {
          userName: this.props.auth.user.FirstName,
        },
      })
      .then(
        (response) => {
          if (response.Success) {
            tableRef.current && tableRef.current.onQueryChange();
            this.props.actions.showAlert({
              message: "Response submitted successfully.",
              variant: "success",
            });
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
  handleTabChange = (e, { activeIndex }) => {
    this.setState({ activeIndex });
    //tableRef.current && tableRef.current.onQueryChange();
    if (activeIndex === 0) {
      this.getRecentSeriesSession();
    } else if (activeIndex === 1) {
      this.getUpcomingSeriesSession();
    }
  };

  handleViewDetails = (seriesId, sessionId) => {
    if (seriesId !== null && seriesId > 0) {
      history.push(`${PUBLIC_URL}/SeriesDetail/${seriesId}`);
    } else if (sessionId !== null && sessionId > 0) {
      history.push(`${PUBLIC_URL}/SessionDetail/${sessionId}`);
    }
  };

  handleCopyClass = (seriesId, sessionId) => {
    if (seriesId !== null && seriesId > 0) {
      history.push(`${PUBLIC_URL}/CreateSeries/${seriesId}`);
    } else if (sessionId !== null && sessionId > 0) {
      history.push(`${PUBLIC_URL}/CreateEditSession/${sessionId}/true`);
    }

  }

  handleEditDetails = (seriesId, sessionId) => {
    if (seriesId !== null && seriesId > 0) {
      history.push(`${PUBLIC_URL}/EditSeries/${seriesId}`);
    } else if (sessionId !== null && sessionId > 0) {
      history.push(`${PUBLIC_URL}/CreateEditSession/${sessionId}`);
    }
  };

  /// Cancellation of session region started
  handleConfirmation = (seriesId, sessionId) => {
    confirmAlert({
      title: "Confirm Cancellation",
      message:
        "Are you sure you want to cancel the Session/Series? The payment(s) will be refunded back to the students.",
      buttons: [
        {
          label: "Yes",
          onClick: () => this.handleCancellation(seriesId, sessionId),
        },
        {
          label: "No",
          onClick: () => {
            return;
          },
        },
      ],
    });
  };

  handleCancellation = (seriesId, sessionId) => {
    this.setState({ loading: true });
    const data = {
      TeacherId: this.props.auth.user.TeacherId,
      SessionId: sessionId,
      SeriesId: seriesId,
      //CancelDate: commonFunctions.convertToUtc(new Date()),
      ActionPerformedBy: this.props.auth.user.FirstName,
    };
    apiService.post("PROCESSTUTORCANCELLEDSTUDENTREFUND", data).then(
      (response) => {
        if (response.Success) {
          // window.location.reload(false);
          this.props.actions.showAlert({
            message: response.Message,
            variant: "success",
          });
        } else {
          this.props.actions.showAlert({ message: response.Message, variant: "error" });
        }
        this.setState({
          showDisputeModal: false,
          activeIndex: 1,
          loading: false,
        });
        // tableRef.current && tableRef.current.onQueryChange();
        // this.getUpcomingSeriesSession();
        this.getTeacherDashboardData();
        this.getTeacherTodaysSessionData();
        this.getUpcomingSeriesSession();
      },
      (error) =>
        this.setState((prevState) => {
          this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
          this.setState({ loading: false });
        })
    );
  };

  /// Cancellation region ended

  handleTutorDetails = () => {
    history.push(`${PUBLIC_URL}/TutorProfile/${this.state.teacherId}`);
  };

  handleStartNow = (sessionid) => {
    window.location = `${PUBLIC_URL}/meeting.html?sessionId=${sessionid}`;
  };

  // handleEventSelect = (event) => {
  //   if (event.SeriesId && event.SeriesId > 0) {
  //     history.push(`${PUBLIC_URL}/SeriesDetail/${event.SeriesId}`);
  //   } else {
  //     history.push(`${PUBLIC_URL}/SessionDetail/${event.SessionId}`);
  //   }
  // };

  // Private session modal function
  handlePrivateSessionModal = () => {
    const { showPrivateSessionModal } = this.state;
    this.setState({ showPrivateSessionModal: !showPrivateSessionModal });
  };

  handleTimezoneChange = (timeZone) => {
    this.setState({ PrivateSessionTimeZone: timeZone.id });
  };

  render() {
    const {
      loading,
      panes,
      activeIndex,
      teacherDashboardData,
      teachertodaysSessionData,
      // userTimezone,
      teacherId,
      showPrivateSessionModal,
    } = this.state;
    const { auth, userTimezone } = this.props;
    const params = {
      slidesPerView: 1,
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
    };
    const data = [
      ["Type", "Value"],
      // ["Delivered Series", teacherDashboardData.TotalDeliveredSeries > 0 ? teacherDashboardData.TotalDeliveredSeries : 0],
      [
        "Delivered Sessions",
        teacherDashboardData.TotalDeliveredSessions > 0
          ? teacherDashboardData.TotalDeliveredSessions
          : 0,
      ],
      // ["Pending Series", teacherDashboardData.TotalPendingSeries > 0 ? teacherDashboardData.TotalPendingSeries : 0],
      [
        "Pending Sessions",
        teacherDashboardData.TotalPendingSessions > 0
          ? teacherDashboardData.TotalPendingSessions
          : 0,
      ],
    ];
    return (
      <Fragment>
        <section className="studentProfile">
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <div className="greyBg">
                  <div className="row">
                    <div className="col-md-8">
                      <div className="thumbContent">
                        {/* <div className="thumbImage"><img src="assets/images/teacherprofile.jpg" alt="image" /></div> */}
                        <div className="thumbDesc">
                          <h1 onClick={() => this.handleTutorDetails()}>
                            Welcome {teacherDashboardData.Name}
                          </h1>
                          <p>{teacherDashboardData.Description}</p>
                          <Button
                            variant="contained"
                            onClick={() => {
                              history.push(`${PUBLIC_URL}/CreateSeries`);
                            }}
                            color="primary"
                          >
                            Create Series
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => {
                              history.push(
                                `${PUBLIC_URL}/CreateEditSession/-1`
                              );
                            }}
                            color="primary"
                          >
                            Create Session
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={this.handlePrivateSessionModal}
                          >
                            Create Private Session
                          </Button>
                        </div>
                      </div>
                      <div className="sessionStatus">
                        {/* <div className="sessionInner borderRgt">
                                                      <h3>{teacherDashboardData.TotalDeliveredSeries > 0 ? teacherDashboardData.TotalDeliveredSeries : 0}</h3>
                                                      <h4>Delivered<br />Series</h4>
                                                  </div> */}
                        <div className="sessionInner borderRgt">
                          <h3>
                            {teacherDashboardData.TotalPendingSessions > 0
                              ? teacherDashboardData.TotalPendingSessions
                              : 0}
                          </h3>
                          <h4>
                            Pending
                            <br />
                            Sessions
                          </h4>
                        </div>
                        <div className="sessionInner borderRgt">
                          <h3>
                            {teacherDashboardData.TotalDeliveredSessions > 0
                              ? teacherDashboardData.TotalDeliveredSessions
                              : 0}
                          </h3>
                          <h4>
                            Delivered
                            <br />
                            Sessions
                          </h4>
                        </div>
                        <div className="sessionInner borderRgt">
                          <h3>
                            {teacherDashboardData.TotalDeliveredHours === null
                              ? `00h 00min`
                              : teacherDashboardData.TotalDeliveredHours}
                          </h3>
                          <h4>
                            Total Hours
                            <br />
                            Completed
                          </h4>
                        </div>
                        <div className="sessionInner">
                          <h3>
                            $
                            {teacherDashboardData.TotalEarned > 0
                              ? teacherDashboardData.TotalEarned
                              : 0}
                          </h3>
                          <h4>Earnings</h4>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="progressGraph">
                        <h2>Progress</h2>
                        <Chart
                          chartType="PieChart"
                          data={data}
                          width={"100%"}
                          height={"200px"}
                          options={{
                            pieHole: 0.9,
                            is3D: false,

                            pieSliceTextStyle: {
                              color: "black",
                            },
                            pieSliceText: "value",
                            backgroundColor: "#ebebeb",
                            chartArea: { width: "100%", height: "90%" },
                            legend: { position: "end" },
                          }}
                        />

                        {teacherDashboardData.TotalDeliveredSeries === 0 &&
                          teacherDashboardData.TotalDeliveredSessions === 0 &&
                          teacherDashboardData.TotalDeliveredHours === 0 &&
                          teacherDashboardData.TotalEarned === 0 && (
                            <p> No series/Session delivered yet.</p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {Object.keys(teachertodaysSessionData).length > 0 && (
          <section>
            <div className="container">
              <div className="todaySession">
                <Swiper {...params}>
                  {Object.keys(teachertodaysSessionData).length > 0 &&
                    teachertodaysSessionData.map((data, item) => (
                      <row>
                        <div className="col-sm-12">
                          <div className="thumbHeading">
                            <h2>Today’s Session</h2>
                          </div>
                        </div>
                        <div className="col-sm-12">
                          <div className="SessionData">
                            <div className="swiper-container">
                              <div className="swiper-wrapper">
                                <div className="swiper-slide">
                                  <div className="row">
                                    <div className="col-md-8">
                                      <div className="sessionContent">
                                        <h3><a onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)}>{data.SessionTitle}</a></h3>
                                        <div className="price">
                                          ${data.SessionFee}
                                        </div>
                                        <div className="thumbDesc">
                                          <p>{data.Description}</p>
                                        </div>
                                        <div className="dateTime">
                                          <span className="date">
                                            <i className="fa fa-calendar"></i>
                                            <FormatDateTime
                                              date={data.StartTime}
                                              format="MMM DD, YYYY"
                                            ></FormatDateTime>
                                          </span>
                                          <span className="time">
                                            <i className="fa fa-clock-o"></i>
                                            <FormatDateTime
                                              date={data.StartTime}
                                              format="hh:mm A"
                                            ></FormatDateTime>
                                            -
                                            <FormatDateTime
                                              date={data.EndTime}
                                              format="hh:mm A"
                                            ></FormatDateTime>{" "}
                                            ({userTimezone})
                                            {/* ({data.TimeZone}) */}
                                          </span>
                                          <span className="users fa fa-users">
                                            <i title="Spots Left"></i>
                                            {data.TotalSeats - data.OccupiedSeats}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-md-4">
                                      <div className="sessionImage">
                                        <div className="thumbImage">
                                          <img width="" height=""
                                            src={`${APP_URLS.API_URL}${data.SessionImageFile}`}
                                            alt="image"
                                          />
                                        </div>
                                        <div className="thumbBtn">
                                          {data.SessionStatus === "N" &&
                                            data.Status &&
                                            data.Status === "Session Started" &&
                                            Number(data.OccupiedSeats) > 0 && (
                                              <button
                                                className="btn btn-white"
                                                onClick={() =>
                                                  this.handleStartNow(
                                                    data.SessionId
                                                  )
                                                }
                                              >
                                                Start Now
                                              </button>
                                            )}
                                          {data.SessionStatus === "N" &&
                                            data.Status &&
                                            data.Status === "Session Started" &&
                                            Number(data.OccupiedSeats) ===
                                            0 && (
                                              <span class="sessionStatus">
                                                No enrollment in this session.
                                              </span>
                                            )}
                                          {data.SessionStatus === "N" &&
                                            data.Status &&
                                            data.Status === "Session Ended" && (
                                              <span class="sessionStatus">
                                                Session Ended
                                              </span>
                                            )}
                                          {data.SessionStatus === "Y" && (
                                            <span class="sessionStatus">
                                              {/* <Tooltip title="This class has been blocked due to a potential violation of our Terms and Conditions" className="danger"> */}
                                              Session Blocked
                                              {/* </Tooltip> */}
                                            </span>
                                          )}
                                          {data.SessionStatus === "N" &&
                                            data.Status &&
                                            data.Status === "Show Time" && (
                                              <span class="sessionStatus">
                                                You can start the session at{" "}
                                                {moment(
                                                  commonFunctions.getUtcDatetime(
                                                    data.StartTime
                                                  )
                                                )
                                                  .subtract(10, "minutes")
                                                  .format("hh:mm A")}{" "}
                                                ({userTimezone})
                                              </span>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </row>
                    ))}
                </Swiper>
              </div>
            </div>
          </section>
        )}
        {/* <section className="fullCalendar">
                      <div className="container">
                          <div className="row">
                              <div className="col-md-12">
                                  <div className="dataHaeding">
                                      <h4 className="commonHeading">Scheduler</h4>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                      </div>
                  </section> */}

        <section className="sessionDeleivered">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="dataHaeding">
                  <h4>Delivered and Upcoming Series/Sessions</h4>
                </div>
                <Tab
                  panes={panes}
                  activeIndex={activeIndex}
                  menu={{ secondary: true }}
                  onTabChange={this.handleTabChange}
                ></Tab>
              </div>
            </div>
          </div>
        </section>
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
        <PrivateSessionModal
          showPrivateSessionModal={showPrivateSessionModal}
          handleClose={this.handlePrivateSessionModal}
          teacherId={teacherId}
          handleTimezoneChange={this.handleTimezoneChange}
          PrivateSessionTimeZone={this.state.PrivateSessionTimeZone}
        ></PrivateSessionModal>
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
      loginSuccess: bindActionCreators(actions.loginSuccess, dispatch),
      updateTimezone: bindActionCreators(actions.updateTimezone, dispatch),
      changeUserMode: bindActionCreators(actions.changeUserMode, dispatch)
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TeacherDashboard);
