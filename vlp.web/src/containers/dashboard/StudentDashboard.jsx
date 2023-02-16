import React, { Component, Fragment } from "react";
import Dispute from "../../containers/Dispute/dispute";
import { apiService } from "../../services/api.service";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import FormatDateTime from "../../shared/components/functional/DateTimeFormatter";
import Swiper from "react-id-swiper";
import "swiper/css/swiper.css";
import Button from "@material-ui/core/Button";
import { Tab } from "semantic-ui-react";
import Chart from "react-google-charts";
import { APP_URLS } from "../../config/api.config";
import { PUBLIC_URL } from "../../config/api.config";
import { history } from "../../helpers/history";
import Loader from "react-loaders";
import MaterialTable, { MTableBody } from "material-table";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import Tooltip from "@material-ui/core/Tooltip";
import moment from "moment";
import { commonFunctions } from "../../shared/components/functional/commonfunctions";
import { localStorageService } from "../../services/localStorageService";
const tableRef = React.createRef();
class StudentDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showDisputeModal: false,
            loading: false,
            panes: [],
            studentDashboardData: [],
            studentTodaySessionData: [],
            upcomingSessionData: [],
            recentSessionData: [],
            favouriteTeacherData: [],
            savedSessionData: [],
            activeIndex: 0,
            studentId: this.props.auth.user.StudentId,
            actionPerformedBy: typeof this.props.auth.user === "undefined" ? "" : this.props.auth.user.FirstName,
            disputeData: {},
            localDatetime: ""
            //userTimezone: moment.tz(moment.tz.guess(true)).format("z").indexOf("+") !== -1 || moment.tz(moment.tz.guess(true)).format("z").indexOf("-") !== -1 ? this.props.userTimezone : moment.tz(moment.tz.guess(true)).format("z")
        };
        this.handleViewDetails = this.handleViewDetails.bind(this);
    }
    async componentDidMount() {

        if (!(this.state.studentId > 0)) {
            this.props.actions.showAlert({
                message: "Access Denied ! Please Sign In",
                variant: "error",
            });
            history.push(`${PUBLIC_URL}/`);
        }

        localStorageService.updateUserMode("student");
        this.props.actions.changeUserMode("student");
        let timezone = localStorageService.getUserTimeZone();
        this.props.actions.updateTimezone(timezone);
        // changes for getting local time from api
        let dateTime = await localStorageService.getCurrentTime();

        this.setState({ localDatetime: dateTime })
        //
        await this.getComponentData();
        await this.getRecentSeriesSession();
        await this.getUpcomingSeriesSession();
        this.tabsData();
    }

    getComponentData = async () => {
        await this.getStudentDashboardData();
        await this.getStudentTodaySession();
    };

    getStudentDashboardData = async () => {
        this.setState({ loading: true });
        await apiService.post("UNAUTHORIZEDDATA", { data: { StudentId: this.state.studentId }, keyName: "GetStudentDashboard" })
            .then(
                (response) => {
                    if (response.Success) {
                        if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                            this.setState({ studentDashboardData: response.Data.ResultDataList[0] });
                        }
                    }
                    this.setState({ loading: false });
                },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: "Something went wrong...", variant: "error" });
                        this.setState({ loading: false });
                    })
            );
    };

    getStudentTodaySession = async () => {
        const localDateTime = localStorageService.getCurrentTime();
        await apiService.post("UNAUTHORIZEDDATA", { data: { StudentId: this.state.studentId }, keyName: "GetStudentTodaySession" })
            .then((response) => {
                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        let filterData = response.Data.ResultDataList.filter((x) => moment(localDateTime).isSame(commonFunctions.getUtcDatetime(x.StartTime), "date"));
                        let orderedList1 = filterData.filter((x) => commonFunctions.getUtcDatetime(x.EndTime).isAfter(moment(), "second"));
                        let orderedList2 = filterData.filter((x) => commonFunctions.getUtcDatetime(x.EndTime).isBefore(moment(), "second"));
                        this.setState({
                            studentTodaySessionData: [...orderedList1, ...orderedList2],
                        });
                        this.timeout = window.setInterval(() => this.getStudentTodaySession(), 60000);
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
            .post("UNAUTHORIZEDDATA", {
                data: { StudentId: this.state.studentId },
                keyName: "GetStudentRecentSession",
            })
            .then(
                (response) => {
                    if (response.Success) {
                        let responseData = [];
                        if (
                            response.Data !== null &&
                            Object.keys(response.Data).length > 0 &&
                            response.Data.ResultDataList.length > 0
                        ) {
                            if (response.Data.ResultDataList[0].data !== null) {
                                responseData = JSON.parse(response.Data.ResultDataList[0].data);
                                responseData = responseData.filter(
                                    (item) =>
                                        typeof item.SeriesSessions !== "undefined" ||
                                        item.SessionId > 0
                                );
                            }
                            let filterData =
                                responseData === []
                                    ? []
                                    : responseData.filter((x) =>
                                        x.SeriesId > 0
                                            ? moment(
                                                commonFunctions.getUtcDatetime(
                                                    JSON.parse(x.SeriesSessions)[0].EndTime
                                                )
                                            ).isBefore(moment(), "second")
                                            : moment(
                                                commonFunctions.getUtcDatetime(x.EndTime)
                                            ).isBefore(moment(), "second")
                                    );

                            this.setState({
                                recentSessionData: filterData,
                            });
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
        const studentId = this.state.studentId;
        await apiService
            .post("UNAUTHORIZEDDATA", {
                data: { StudentId: studentId },
                keyName: "GetStudentUpcoingEnrolledSession",
            })
            .then(
                (response) => {
                    if (response.Success) {
                        if (
                            response.Data !== null &&
                            Object.keys(response.Data).length > 0 &&
                            response.Data.ResultDataList.length > 0
                        ) {
                            let filterData =
                                response.Data.ResultDataList[0].data === null
                                    ? []
                                    : JSON.parse(
                                        response.Data.ResultDataList[0].data
                                    ).filter((x) =>
                                        x.SeriesId > 0
                                            ? typeof (x.SeriesSessions) !== "undefined" &&
                                            moment(
                                                commonFunctions.getUtcDatetime(
                                                    JSON.parse(x.SeriesSessions)[0].EndTime
                                                )
                                            ).isAfter(moment(), "second")
                                            : x.SeriesId > 0 ? null : moment(
                                                commonFunctions.getUtcDatetime(x.EndTime)
                                            ).isAfter(moment(), "second")
                                    );

                            this.setState({ upcomingSessionData: filterData });
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

    handleTabChange = (e, { activeIndex }) => {
        console.log(activeIndex);
        this.setState({ activeIndex });
        // tableRef.current && tableRef.current.onQueryChange();
        if (activeIndex === 0) {
            this.getRecentSeriesSession();
        } else if (activeIndex === 1) {
            this.getUpcomingSeriesSession();
        }
    };
    handleTutorDetails = (TutorId) => {
        history.push(`${PUBLIC_URL}/TutorProfile/${TutorId}`);
    };
    /// Cancellation of enrolled session region started
    handleConfirmation = (seriesId, sessionId) => {
        confirmAlert({
            title: "Confirm Cancellation",
            message: (
                <label>
                    Are you sure you want to cancel your enrollment in the session/series?
          You may be eligible for a refund based on our{" "}
                    <a href={`${PUBLIC_URL}/TermCondition`}>Terms and Conditions </a>
                </label>
            ),
            buttons: [
                {
                    label: "Yes",
                    onClick: () => this.handleCancelEnrollment(seriesId, sessionId),
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
    handleCancelEnrollment = (seriesId, sessionId) => {
        this.setState({ loading: true });
        const data = {
            StudentId: this.props.auth.user.StudentId,
            SessionId: sessionId,
            SeriesId: seriesId,
            //   CancelDate: commonFunctions.convertToUtc(new Date()),
            ActionPerformedBy: this.props.auth.user.FirstName,
        };
        apiService.post("PROCESSSTUDENTREFUND", data).then(
            (response) => {
                //window.location.reload(false);
                if (response.Success) {
                    this.props.actions.showAlert({
                        message: response.Message,
                        variant: "success",
                    });
                }else{
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                }
                this.getStudentTodaySession();
                this.getUpcomingSeriesSession();
                this.getStudentDashboardData();

                this.setState({
                    loading: false,
                    activeIndex: 1,
                    showDisputeModal: false,
                });
            },
            (error) =>
                this.setState((prevState) => {
                    this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
                    this.setState({ loading: false });
                })
        );
    };

    handleCancellationRequest = (seriesId, teacherId) => {
        this.setState({ loading: true });
        apiService
            .post("COMMONSAVE", {
                data: [
                    {
                        CancelledSeriesId: 0,
                        SeriesId: seriesId,
                        TeacherId: teacherId,
                        StudentId: this.props.auth.user.StudentId,
                    },
                ],
                entityName: "CancelledSeriesRequest",
                additionalFields: {
                    userName: this.props.auth.user.FirstName,
                },
            })
            .then(
                (response) => {
                    if (response.Success) {
                        this.props.actions.showAlert({
                            message: "Cancellation completed successfully",
                            variant: "success",
                        });
                    }else{
                        this.props.actions.showAlert({ message: response.Message, variant: "error" });
                    }
                    this.getUpcomingSeriesSession();
                    this.setState({ loading: false, activeIndex: 1 });
                },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
                        this.setState({ loading: false });
                    })
            );
    };

    /// Cancellation region ended
    tabsData = () => {
        this.setState({ loading: true });
        const { userTimezone } = this.props;
        var ts = Math.round(new Date().getTime() / 1000);
        var tsYesterday = ts - 24 * 3600;
        let panes = [];
        panes = [
            {
                menuItem: `Recently Attended`,
                render: () => (
                    <Tab.Pane>
                        <div className="responsiveTable">
                            <MaterialTable
                                tableRef={tableRef}
                                title=""
                                key="1"
                                columns={[
                                    {
                                        title: "Type",
                                        field: "Type",
                                        width: "100px",
                                        render: (rowData) => (
                                            <Fragment>
                                                {rowData.Type}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Title",
                                        field: "Title",
                                        width: "30%",
                                        render: (rowData) => (
                                            <Fragment>
                                                {/* <div data-testid="td-before" className="tdBefore">
                                                    Title
                                               </div> */}
                                                {rowData.Title}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Start Time",
                                        width: "25%",
                                        render: (rowData) =>
                                            rowData.Type === "Series" ? (
                                                <Fragment>
                                                    {/* <div data-testid="td-before" className="tdBefore">
                                                        Start Time
                                                    </div> */}
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
                                                        {/* <div data-testid="td-before" className="tdBefore">
                                                            Start Time
                          </div> */}
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
                                        render: (rowData) => (
                                            <Fragment>
                                                {/* <div data-testid="td-before" className="tdBefore">
                                                    Session Duration
                        </div> */}
                                                {typeof rowData.SeriesId !== "undefined" &&
                                                    rowData.SeriesId > 0
                                                    ? JSON.parse(rowData.SeriesSessions)[0].Duration
                                                    : rowData.Duration}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Cost",
                                        render: (rowData) => (
                                            <Fragment>
                                                {/* <div data-testid="td-before" className="tdBefore">
                                                    Cost
                        </div> */}
                                                {"$ " + rowData.Fee}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Paid Amount",
                                        render: (rowData) => (
                                            <Fragment>
                                                {/* <div data-testid="td-before" className="tdBefore">
                                                    Paid Amount
                        </div> */}
                                                {"$ " + rowData.DiscountedFee}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Action",
                                        render: (rowData) => (
                                            <Fragment>
                                                {" "}
                                                {/* <div data-testid="td-before" className="tdBefore">
                                                    Action
                        </div> */}
                                                <div className="tbActionBtn">
                                                    {rowData.Type === "Series" ? (
                                                        <Tooltip
                                                            title="View Detail"
                                                            aria-label="view"
                                                            className="viewBlue"
                                                        >
                                                            <div>
                                                            <Button
                                                                variant="outlined"
                                                                onClick={() =>
                                                                    this.handleViewDetails(rowData.SeriesId, 0)
                                                                }
                                                                size="small"
                                                                color="primary"
                                                                title="View"
                                                            >
                                                                <i className="fa fa-eye"></i>
                                                            </Button>
                                                            </div>
                                                        </Tooltip>
                                                    ) : (
                                                            <Tooltip
                                                                title="View Detail"
                                                                aria-label="view"
                                                                className="viewBlue"
                                                            >   
                                                                <div>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    onClick={() =>
                                                                        this.handleViewDetails(0, rowData.SessionId)
                                                                    }
                                                                    color="primary"
                                                                    title="View"
                                                                >
                                                                    <i className="fa fa-eye"></i>
                                                                </Button>
                                                                </div>
                                                            </Tooltip>
                                                        )}
                                                </div>
                                            </Fragment>
                                        ),
                                    },
                                ]}
                                data={
                                    this.state.recentSessionData === null
                                        ? []
                                        : this.state.recentSessionData
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
                menuItem: "Upcoming Series/Sessions",
                render: () => (
                    <Tab.Pane className="dataContent">
                        <div className="responsiveTable">
                            <MaterialTable
                                tableRef={tableRef}
                                title=""
                                key="2"
                                columns={[
                                    {
                                        title: "Type",
                                        field: "Type",
                                        width: "7%",
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
                                      ({userTimezone})
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
                                      ({userTimezone})
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
                                                    : rowData.Duration}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Cost",
                                        width: "9%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Cost
                                    </div>
                                                {"$ " + parseFloat(rowData.Fee).toFixed(2)}{" "}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Paid Amount",
                                        width: "5%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Paid Amount
                                    </div>
                                                {"$ " + parseFloat(rowData.DiscountedFee).toFixed(2)}{" "}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Action",
                                        width: "25%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Action
                                                 </div>{" "}
                                                <div className="tbActionBtn">
                                                    {(() => {
                                                        if (rowData.SeriesId > 0 && rowData.SessionStatus === "N") {
                                                            return <Fragment>
                                                                <Tooltip title="View Detail" aria-label="view" className="viewBlue">
                                                                    <div>
                                                                        <Button variant="outlined" onClick={() => this.handleViewDetails(rowData.SeriesId, 0)} size="small" color="primary" title="View">
                                                                            <i className="fa fa-eye"></i>
                                                                        </Button>
                                                                    </div>
                                                                </Tooltip>
                                                                {moment(commonFunctions.getUtcDatetime(rowData.StartTime)).isAfter(moment(), "second") &&
                                                                    <Tooltip title="Cancel" aria-label="cancel" className="danger">
                                                                        <div>
                                                                            <Button variant="outlined" onClick={() => this.handleConfirmation(rowData.SeriesId, 0)} size="small" color="primary" title="Close"><i className="material-icons">close</i>
                                                                            </Button>
                                                                        </div>
                                                                    </Tooltip>
                                                                }
                                                            </Fragment>
                                                        }
                                                        else if (rowData.SessionStatus === "N" && typeof (rowData.SeriesId) === "undefined") {
                                                            return <Fragment>
                                                                <Tooltip title="View Detail" aria-label="view" className="viewBlue">
                                                                    <div>
                                                                        <Button variant="outlined" size="small" onClick={() => this.handleViewDetails(0, rowData.SessionId)} color="primary" title="View">
                                                                            <i className="fa fa-eye"></i>
                                                                        </Button>
                                                                    </div>
                                                                </Tooltip>
                                                                {(() => {
                                                                    if (moment().isBefore(commonFunctions.getUtcDatetime(rowData.StartTime), "second")) {
                                                                        return <Tooltip title="Cancel" aria-label="cancel" className="danger">
                                                                                <div>
                                                                                    <Button variant="outlined" onClick={() => this.handleConfirmation(0, rowData.SessionId)} size="small" color="primary" title="Close">
                                                                                        <i className="material-icons">close</i>
                                                                                    </Button>
                                                                                    </div>
                                                                        </Tooltip>
                                                                    }
                                                                })()}
                                                            </Fragment>
                                                        }
                                                    })()}
                                                    {rowData.SessionStatus === "N" && rowData.SeriesId > 0 && moment().isAfter(commonFunctions.getUtcDatetime(rowData.StartTime), "second") &&
                                                        <Tooltip title="Cancel_Request" aria-label="Cancel_Request" className="danger">
                                                            <div>
                                                            <Button variant="outlined" onClick={() => this.handleCancellationRequest(rowData.SeriesId, rowData.TeacherId)} size="small" color="primary" title="CancelRequest">
                                                                Cancel Request
                                                             </Button>
                                                             </div>
                                                        </Tooltip>
                                                    }
                                                    {rowData.SessionStatus === "Y" &&
                                                        <Tooltip title="This class has been blocked due to a potential violation of our Terms and Conditions" aria-label="Cancel_Request" className="danger"><div>{rowData.Type} Blocked </div></Tooltip>
                                                    }
                                                </div>
                                            </Fragment>
                                        ),
                                    },
                                ]}
                                data={
                                    this.state.upcomingSessionData === null
                                        ? []
                                        : this.state.upcomingSessionData
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
                menuItem: "My Favorites",
                render: () => (
                    <Tab.Pane className="dataContent">
                        <div className="responsiveTable">
                            <MaterialTable
                                tableRef={tableRef}
                                title=""
                                key="3"
                                columns={[
                                    {
                                        title: "Teacher Image",
                                        field: "TeacherImageFile",
                                        width: "10%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Teacher Image
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        this.handleTutorDetails(rowData.TeacherId)
                                                    }
                                                    className="link-button"
                                                >
                                                    <img
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            backgroundColor: "#f9f9f9",
                                                            borderRadius: "50%",
                                                        }}
                                                        src={`${APP_URLS.API_URL}${rowData.TeacherImageFile}`}
                                                    />
                                                </button>
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Teacher Name",
                                        width: "30%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Teacher Name
                        </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        this.handleTutorDetails(rowData.TeacherId)
                                                    }
                                                    className="link-button"
                                                >
                                                    {rowData.TeacherName}
                                                </button>{" "}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Private Session Enabled",
                                        width: "15%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Private Session Enabled
                        </div>
                                                {rowData.PrivateSession === "Y" ? "YES" : "NO"}{" "}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Private Session Fee",
                                        width: "15%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Private Session Fee
                        </div>
                                                {rowData.FeePerHours !== null
                                                    ? "$ " + rowData.FeePerHours
                                                    : 0}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Action",
                                        width: "20%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Action
                        </div>{" "}
                                                <div className="tbActionBtn">
                                                    <Tooltip
                                                        title="View Detail"
                                                        aria-label="view"
                                                        className="viewBlue"
                                                    >
                                                        <div>
                                                        <Button
                                                            variant="outlined"
                                                            onClick={() =>
                                                                this.handleTutorDetails(rowData.TeacherId)
                                                            }
                                                            size="small"
                                                            color="primary"
                                                            title="View"
                                                        >
                                                            <i className="fa fa-eye"></i>
                                                        </Button>
                                                        </div>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title="Close"
                                                        aria-label="view"
                                                        className="danger"
                                                    >
                                                        <div>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            color="secondary"
                                                            onClick={() =>
                                                                this.handleRemoveFavourite(
                                                                    rowData.TeacherId,
                                                                    rowData.RefrenceType
                                                                )
                                                            }
                                                        >
                                                            <i className="material-icons">close</i>
                                                        </Button>
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                            </Fragment>
                                        ),
                                    },
                                ]}
                                data={(query) =>
                                    new Promise((resolve, reject) => {
                                        apiService
                                            .post("UNAUTHORIZEDDATA", {
                                                data: {
                                                    StudentId: this.state.studentId,
                                                    PageNbr: query.page + 1,
                                                    PageSize: query.pageSize,
                                                    Search: query.search,
                                                },
                                                keyName: "GetStudentFavoriteTeacher",
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
                                    minBodyHeight: "270px",
                                    pageSize: 5,
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
            {
                menuItem: "My Hosts",
                render: () => (
                    <Tab.Pane className="dataContent">
                        <div className="responsiveTable">
                            <MaterialTable
                                tableRef={tableRef}
                                title=""
                                key="4"
                                columns={[
                                    {
                                        title: "Host Image",
                                        field: "TeacherImageFile",
                                        width: "10%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Host Image
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        this.handleTutorDetails(rowData.TeacherId)
                                                    }
                                                    className="link-button"
                                                >
                                                    <img
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            backgroundColor: "#f9f9f9",
                                                            borderRadius: "50%",
                                                        }}
                                                        src={`${APP_URLS.API_URL}${rowData.HostImageFile}`}
                                                    />
                                                </button>
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Host Name",
                                        width: "30%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Host Name
                        </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        this.handleTutorDetails(rowData.TeacherId)
                                                    }
                                                    className="link-button"
                                                >
                                                    {rowData.HostName}
                                                </button>{" "}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Private Session Enabled",
                                        width: "15%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Private Session Enabled
                        </div>
                                                {rowData.PrivateSession === "Y" ? "YES" : "NO"}{" "}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Private Session Fee",
                                        width: "15%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Private Session Fee
                        </div>
                                                {rowData.FeePerHours !== null
                                                    ? "$ " + rowData.FeePerHours
                                                    : 0}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Action",
                                        width: "20%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Action
                        </div>{" "}
                                                <div className="tbActionBtn">
                                                    <Tooltip
                                                        title="View Detail"
                                                        aria-label="view"
                                                        className="viewBlue"
                                                    >
                                                        <div>
                                                            <Button
                                                                variant="outlined"
                                                                onClick={() =>
                                                                    this.handleTutorDetails(rowData.TeacherId)
                                                                }
                                                                size="small"
                                                                color="primary"
                                                                title="View"
                                                            >
                                                                <i className="fa fa-eye"></i>
                                                            </Button>
                                                        </div>
                                                    </Tooltip>
                                                    {/* <Tooltip
                                                        title="Close"
                                                        aria-label="view"
                                                        className="danger"
                                                    >
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            color="secondary"
                                                            onClick={() =>
                                                                this.handleRemoveFavourite(
                                                                    rowData.TeacherId,
                                                                    rowData.RefrenceType
                                                                )
                                                            }
                                                        >
                                                            <i className="material-icons">close</i>
                                                        </Button>
                                                    </Tooltip> */}
                                                </div>
                                            </Fragment>
                                        ),
                                    },
                                ]}
                                data={(query) =>
                                    new Promise((resolve, reject) => {
                                        apiService
                                            .post("UNAUTHORIZEDDATA", {
                                                data: {
                                                    StudentId: this.state.studentId,
                                                    PageNbr: query.page + 1,
                                                    PageSize: query.pageSize,
                                                    Search: query.search,
                                                },
                                                keyName: "GetMyHostsList",
                                            })
                                            .then((response) => {
                                                console.log(response);
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
                                    minBodyHeight: "270px",
                                    pageSize: 5,
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
                )
            },
            {
                menuItem: "Cancelled Series/Sessions",
                render: () => (
                    <Tab.Pane className="dataContent">
                        <div className="responsiveTable">
                            <MaterialTable
                                tableRef={tableRef}
                                title=""
                                key="5"
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
                                                {JSON.parse(rowData.SeriesInfo)[0].KeyType}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Title",
                                        field: "Title",
                                        width: "25%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Title
                                                   </div>
                                                {JSON.parse(rowData.SeriesInfo)[0].Se[0].SD[0].Title}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Refund Time",
                                        width: "30%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Refund Time
                                                 </div>
                                                <FormatDateTime
                                                    date={rowData.create_time}
                                                    format="MMM DD, YYYY hh:mm A"
                                                ></FormatDateTime>{" "}
                                                     ({userTimezone})
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Refund Id",
                                        width: "10%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Refund Id
                                                    </div>
                                                {rowData.Refund}{" "}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Cost",
                                        width: "10%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Cost
                                             </div>
                                                $ {(JSON.parse(rowData.SeriesInfo)[0].Se[0].SD[0].Fee).toFixed(2)} {" "}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Paid Amount",
                                        width: "10%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Paid Amount
                                               </div>
                                                 $ {(JSON.parse(rowData.SeriesInfo)[0].Se[0].SD[0].SC[0].E[0].DiscountedFee).toFixed(2)} {" "}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Refund Amount",
                                        width: "10%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Refund Amount
                                                </div>
                                                {"$" + rowData.RefundAmount}{" "}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Refund Status",
                                        width: "10%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                Refund Status
                                                </div>
                                                {JSON.parse(rowData.SeriesInfo)[0].Se[0].SD[0].SC[0].RefundState} </Fragment>
                                        ),
                                    }

                                ]}
                                data={(query) =>
                                    new Promise((resolve, reject) => {
                                        apiService
                                            .post("UNAUTHORIZEDDATA", {
                                                data: {
                                                    StudentId: this.state.studentId,
                                                    PageNbr: query.page + 1,
                                                    PageSize: query.pageSize,
                                                    Search: query.search,
                                                },
                                                keyName: "GetStudentCancelledSession",
                                            })
                                            .then((response) => {
                                                //var abc = JSON.parse(response.Data.ResultDataList[0].data).filter((x) => typeof x.SeriesInfo !== "undefined");                                                
                                                resolve({
                                                    data: response.Data.ResultDataList[0].data === null ? [] : JSON.parse(response.Data.ResultDataList[0].data).filter((x) => typeof x.SeriesInfo !== "undefined"),
                                                    page: query.page,
                                                    totalCount: response.Data.ResultDataList[0].totalCount,
                                                });
                                            });
                                    })
                                }
                                options={{
                                    draggable: false,
                                    sorting: false,
                                    pageSize: 5,
                                    pageSizeOptions: [5, 10, 25, 50, 100],
                                    minBodyHeight: "270px",
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
            {
                menuItem: "Pending Cancellation Request",
                render: () => (
                    <Tab.Pane className="dataContent">
                        <div className="responsiveTable">
                            <MaterialTable
                                tableRef={tableRef}
                                title=""
                                key="6"
                                columns={[
                                    {
                                        title: "Title",
                                        field: "Title",
                                        width: "25%",
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
                                        title: "Requested Date",
                                        width: "25%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Requested Date
                        </div>
                                                <FormatDateTime
                                                    date={rowData.CancelledRequestDate}
                                                    format="MMM DD, YYYY hh:mm A"
                                                ></FormatDateTime>{" "}
                        ({userTimezone}){/* ({rowData.TimeZone}) */}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Teacher Name",
                                        field: "Title",
                                        width: "25%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Teacher Name
                        </div>
                                                {rowData.TeacherName}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Cost",
                                        width: "25%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Cost
                                                  </div>
                                                {"$ " + rowData.Fee}{" "}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Paid Amount",
                                        width: "25%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Paid Amount
                        </div>
                                                {"$ " + rowData.DiscountedFee}{" "}
                                            </Fragment>
                                        ),
                                    }
                                ]}
                                data={(query) =>
                                    new Promise((resolve, reject) => {
                                        apiService
                                            .post("UNAUTHORIZEDDATA", {
                                                data: {
                                                    StudentId: this.state.studentId,
                                                    PageNbr: query.page + 1,
                                                    PageSize: query.pageSize,
                                                    Search: query.search,
                                                },
                                                keyName: "GetStudentCancelledSeriesRequest",
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
                    <Tab.Pane className="dataContent">
                        <div className="responsiveTable">
                            <MaterialTable
                                tableRef={tableRef}
                                title=""
                                key="7"
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
                                        title: "Teacher",
                                        width: "20%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Teacher
                        </div>
                                                {rowData.TeacherName}{" "}
                                            </Fragment>
                                        ),
                                    },
                                    {
                                        title: "Dispute Date",
                                        width: "25%",
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
                                        width: "8%",
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
                                        width: "8%",
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
                                        field: "Type",
                                        width: "8%",
                                        render: (rowData) => (
                                            <Fragment>
                                                <div data-testid="td-before" className="tdBefore">
                                                    Status
                        </div>
                                                {rowData.Status}
                                            </Fragment>
                                        ),
                                    },
                                ]}
                                data={(query) =>
                                    new Promise((resolve, reject) => {
                                        apiService
                                            .post("UNAUTHORIZEDDATA", {
                                                data: {
                                                    StudentId: this.state.studentId,
                                                    PageNbr: query.page + 1,
                                                    PageSize: query.pageSize,
                                                    Search: query.search,
                                                },
                                                keyName: "GetStudentDisputedSession",
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

            // {
            //     menuItem: 'Favorites', render: () => <Tab.Pane className="dataContent">

            //     </Tab.Pane >
            // }
        ];
        // this.setState({ panes });
        this.setState({ panes, loading: false });
        console.log(this.state.panes);
    };

    handleViewDetails = (SeriesId, SessionId) => {
        if (SeriesId !== null && SeriesId > 0) {
            history.push(`${PUBLIC_URL}/SeriesDetail/${SeriesId}`);
        } else if (SessionId !== null && SessionId > 0) {
            history.push(`${PUBLIC_URL}/SessionDetail/${SessionId}`);
        }
    };
    handleTutorDetails = (TutorId) => {
        history.push(`${PUBLIC_URL}/TutorProfile/${TutorId}`);
    };

    handleJoinNow = (sessionid) => {
        window.location = `${PUBLIC_URL}/meeting.html?sessionId=${sessionid}&type=1`;
    };

    isShowDispute = (status, success) => {
        const { disputeData } = this.state;
        if (success) {
            let { studentTodaySessionData } = this.state;
            studentTodaySessionData.map((item) => {
                if (item.SessionId === disputeData.SessionId) {
                    item.DisputeId = 1;
                }
            });
            this.setState({ studentTodaySessionData });
        }
        this.setState({ showDisputeModal: status });
    };

    handleDispute = (teacherId, sessionId, disputeStatus, enrollmentId) => {
        let { disputeData } = this.state;
        disputeData = {
            TeacherId: teacherId,
            SessionId: sessionId,
            DisputeStatus: disputeStatus,
            EnrollmentId: enrollmentId,
        };
        this.setState({ disputeData });
        this.isShowDispute(true, false);
    };

    handleRemoveFavourite = (tutorRefId, refId) => {
        apiService
            .post("ADDFAVOURITE", {
                studentId: this.state.studentId,
                refrenceId: tutorRefId,
                refrenceTypeId: refId,
                RecordDeleted: "Y",
                actionPerformedBy: this.state.actionPerformedBy,
            })
            .then(
                (response) => {
                    if (response.Success) {
                        this.props.actions.showAlert({
                            message: response.Message,
                            variant: "success",
                        });
                    }else{
                        this.props.actions.showAlert({ message: response.Message, variant: "error" });
                    }
                    tableRef.current && tableRef.current.onQueryChange();
                    this.setState({ loading: false });
                },
                (error) => {
                    this.props.actions.showAlert({
                        message: "Trouble in adding to favorite",
                        variant: "error",
                    });
                    this.setState({ loading: false });
                }
            );
    };

    render() {
        const {
            loading,
            panes,
            activeIndex,
            studentDashboardData,
            studentTodaySessionData,
            upcomingSessionData,
            recentSessionData,
            disputeData,
            localDatetime
        } = this.state;

        const { userTimezone } = this.props;
        const data = [
            ["Series", "Session"],
            [
                "Completed Sessions",
                studentDashboardData.CountRecentEnrolled > 0
                    ? studentDashboardData.CountRecentEnrolled
                    : 0,
            ],
            [
                "Pending Sessions",
                studentDashboardData.CountUpcomingEnrolled > 0
                    ? studentDashboardData.CountUpcomingEnrolled
                    : 0,
            ],
        ];
        const params = {
            slidesPerView: 1,
            rebuildOnUpdate: true,
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
                                                {/* <div className="thumbImage"><img src={`${APP_URLS.API_URL}${studentDashboardData.ImageFile}`} alt="image" /></div> */}
                                                <div className="thumbDesc">
                                                    <h1>Welcome {studentDashboardData.Name}</h1>
                                                    {/* <p>{studentDashboardData.Description}</p> */}
                                                </div>
                                            </div>
                                            {(() => {
                                                if (
                                                    studentDashboardData.CountRecentEnrolled > 0 ||
                                                    studentDashboardData.CountUpcomingEnrolled > 0
                                                ) {
                                                    return (
                                                        <div className="sessionStatus">
                                                            <div className="sessionInner borderRgt">
                                                                <h3>
                                                                    {studentDashboardData.CountRecentEnrolled > 0
                                                                        ? studentDashboardData.CountRecentEnrolled
                                                                        : 0}
                                                                </h3>
                                                                <h4>Completed Sessions</h4>
                                                            </div>
                                                            <div className="sessionInner">
                                                                <h3>
                                                                    {studentDashboardData.CountUpcomingEnrolled >
                                                                        0
                                                                        ? studentDashboardData.CountUpcomingEnrolled
                                                                        : 0}
                                                                </h3>
                                                                <h4>Pending Sessions</h4>
                                                            </div>
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div> Not Enrolled in any Series/Session yet.</div>
                                                    );
                                                }
                                            })()}
                                        </div>
                                        {(() => {
                                            if (
                                                studentDashboardData.CountRecentEnrolled > 0 ||
                                                studentDashboardData.CountUpcomingEnrolled > 0
                                            ) {
                                                return (
                                                    <div className="col-md-4">
                                                        <div className="progressBar">
                                                            <div className="progressDesc">
                                                                <h2>Progress</h2>
                                                                <Chart
                                                                    chartType="PieChart"
                                                                    data={data}
                                                                    width={"100%"}
                                                                    height={"200px"}
                                                                    options={{
                                                                        pieHole: 0.9,
                                                                        is3D: false,
                                                                        // backgroundColor: "#4c5a67",
                                                                        pieSliceTextStyle: {
                                                                            color: "black",
                                                                        },
                                                                        backgroundColor: "#ebebeb",
                                                                        pieSliceText: "value",
                                                                        chartArea: { width: "100%", height: "70%" },
                                                                        legend: { position: "end" },
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {Object.keys(studentTodaySessionData).length > 0 && (
                    <section>
                        <div className="container">
                            <div className="todaySession">
                                <Swiper {...params}>
                                    {Object.keys(studentTodaySessionData).length > 0 &&
                                        studentTodaySessionData.map((data, index) => (
                                            <row key={index}>
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
                                                                                    $ {data.DiscountedFee}
                                                                                </div>
                                                                                <div className="thumbDesc">
                                                                                    <div className="thumbTitle">
                                                                                        <div className="profileIcon" onClick={() => this.handleTutorDetails(data.TeacherId)}>
                                                                                            <img width="" height=""  src={`${APP_URLS.API_URL}${data.TeacherImageFile}`} alt="image" />
                                                                                        </div>
                                                                                        <h2 onClick={() => this.handleTutorDetails(data.TeacherId)}>
                                                                                            {data.TeacherName}
                                                                                        </h2>
                                                                                    </div>
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
                                                                                    <span className="users" title="Spots Left">
                                                                                        <i className="fa fa-users"  ></i>
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
                                                                                <div className="thumbBtn statusLabel">
                                                                                    {data.ShowButton && data.ShowButton === 'Y' && <button className="btn btn-white" onClick={() => this.handleJoinNow(data.SessionId)} >Join Now</button>}
                                                                                {data.ShowButton && data.ShowButton === 'N' && <span className="sessionCompleted">Session Completed</span>}
                                                                            

                                                                                    {data.SessionStatus === "N" && data.Status && data.Status === "Session Started" && (
                                                                                        <button className="btn btn-white color" onClick={() => this.handleJoinNow(data.SessionId)}>Join Now
                                                                                        </button>
                                                                                    )}
                                                                                    {data.SessionStatus === "N" && data.Status && data.Status === "Session Ended" && (
                                                                                        <span className="sessionStatus">
                                                                                            Session Ended
                                                                                        </span>
                                                                                    )}
                                                                                    {data.SessionStatus === "N" && data.Status && data.Status === "Show Time" && (
                                                                                        <span className="sessionStatus">
                                                                                            You can join the session at{" "}
                                                                                            {moment(commonFunctions.getUtcDatetime(data.StartTime)).subtract(5, "minutes").format("hh:mm A")}{" "}
                                                                                                ({userTimezone})
                                                                                        </span>
                                                                                    )}
                                                                                    {data.SessionStatus === "Y" && (
                                                                                        <span className="sessionStatus">
                                                                                            <Tooltip title="This class has been blocked due to a potential violation of our Terms and Conditions" className="danger">
                                                                                                <div>Session Blocked</div>
                                                                                            </Tooltip>
                                                                                        </span>
                                                                                    )}
                                                                                    {data.DisputeId > 0 && (
                                                                                        <span className="sessionStatus">
                                                                                            Dispute Raised
                                                                                        </span>
                                                                                    )}
                                                                                    {data.DisputeId === null && data.StartTime &&
                                                                                        moment(commonFunctions.getUtcDate(data.StartTime, "YYYY-MM-DD")).isSame(moment(localDatetime), "date") && moment(localDatetime).isAfter(commonFunctions.getUtcDatetime(data.StartTime),
                                                                                            "seconds") && (
                                                                                            <button className="btn btn-white" onClick={() => this.handleDispute(data.TeacherId, data.SessionId, data.DisputeStatus, data.EnrollmentId)}                                                                                            >
                                                                                                Dispute
                                                                                            </button>
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
                <section className="dashboardTabbing">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12">
                                <h3 className="mb-5 text-center">
                                    Completed and Upcoming Series/Sessions
                </h3>
                                <div className="dashboardTabs">
                                    <Tab
                                        panes={panes}
                                        activeIndex={activeIndex}
                                        menu={{ secondary: true }}
                                        onTabChange={this.handleTabChange}
                                    ></Tab>
                                </div>
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
                <Dispute
                    ShowDispute={this.state.showDisputeModal}
                    disputeData={disputeData}
                    onDisputeClose={this.isShowDispute}
                ></Dispute>
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
            changeUserMode: bindActionCreators(actions.changeUserMode, dispatch)

        },
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(StudentDashboard);
