import React, { Component, Fragment } from 'react';
import MaterialTable, { MTableBody } from 'material-table';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import ChatIcon from '@material-ui/icons/Chat';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import { apiService } from "../../services/api.service";
import Badge from '@material-ui/core/Badge';
import ChatBot from "./ChatModule";
import { APP_URLS } from "../../config/api.config";
import { PUBLIC_URL } from "../../config/api.config";
import { history } from '../../helpers/history';
import Tooltip from '@material-ui/core/Tooltip';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import Loader from 'react-loaders';
import moment from 'moment';
import FormatDateTime from '../../shared/components/functional/DateTimeFormatter';
import { commonFunctions } from "../../shared/components/functional/commonfunctions";
import { localStorageService } from '../../services/localStorageService';
class NotificationMessage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            studentType: -1,
            teacherType: -1,
            privateSessionNotification: [],
            openChatWindow: false,
            chatTeacherUserId: -1,
            chatStudentUserId: -1,
            recipientImage: '',
            privateSessionLogId: 0,
            loading: false,
            //userTimezone: moment.tz(moment.tz.guess(true)).format("z").indexOf("+") !== -1 || moment.tz(moment.tz.guess(true)).format("z").indexOf("-") !== -1 ? this.props.userTimezone : moment.tz(moment.tz.guess(true)).format("z")
        }
    }

    handleChatWindow = (privateSessionLogId) => {
        let { privateSessionNotification, openChatWindow } = this.state;
        const { auth } = this.props;
        let teacherUserId, studentUserId, userImage, logId;
        // if (openChatWindow === true) {
        //     this.setState({ openChatWindow: false });
        //     return false;
        // }
        privateSessionNotification.map(item => {
            if (item.PrivateSessionLogId === privateSessionLogId) {
                item.NewMessageCount = 0;
                teacherUserId = item.TeacherUserId;
                studentUserId = item.StudentUserId;
                logId = item.PrivateSessionLogId;
                userImage = auth.userMode === 'student' ? item.TeacherImage : item.StudentImage;
            }
        });
        this.setState({
            openChatWindow: true,
            chatTeacherUserId: teacherUserId,
            chatStudentUserId: studentUserId,
            recipientImage: userImage,
            privateSessionLogId: logId,
            privateSessionNotification
        });
    }

    componentDidMount = () => {
        this.timeout = window.setInterval(() => this.getPrivateNotification(), 60000);
        // initial call
        this.getPrivateNotification()
        const timezone = localStorageService.getUserTimeZone();
        this.props.actions.updateTimezone(timezone);
    }

    getPrivateNotification = async () => {
        const { auth } = this.props;
        apiService.post('UNAUTHORIZEDDATA', { "data": { "StudentId": auth.userMode === 'student' ? auth.user.StudentId : -1, "TeacherId": auth.userMode === 'tutor' ? auth.user.TeacherId : -1, "PrivateSessionLogId": -1 }, "keyName": "GetTutorPrivateSessionNotifications" })
            .then(response => {
                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        this.setState({
                            privateSessionNotification: response.Data.ResultDataList,
                            studentType: response.Data.ResultDataList[0].StudentType,
                            teacherType: response.Data.ResultDataList[0].TeacherType,
                        });
                    }
                    else {
                        this.setState({
                            privateSessionNotification: [],
                        });
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
    handleChatClose = () => {
        this.setState({
            openChatWindow: false
        });
    }

    handlePrivateSessionAccept = (privateSessionLogId) => {
        let data = this.state;
        const { auth } = this.props;
        let { privateSessionNotification } = this.state;
        this.setState({ loading: true });
        apiService.post('ACCEPTPRIVATESESSIONREQUEST',
            {
                "PrivateSessionLogId": privateSessionLogId,
                "ActionPerformedBy": this.props.auth.user.FirstName
            }).then(response => {
                if (response.Success) {
                    privateSessionNotification.map(item => {
                        if (item.PrivateSessionLogId === privateSessionLogId) {
                            item.IsAccept = 'Y'
                        }
                    })
                    this.props.actions.showAlert({ message: response.Message, variant: "success" });
                    this.setState({ privateSessionNotification });
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

    handleAddToCart = (sessionId, studentId, refType) => {

        this.setState({ loading: true });
        apiService.post('ENROLLMENTREQUEST', {
            "studentId": studentId,
            "refrenceId": Number(sessionId),
            "refrenceTypeId": refType,
            "actionPerformedBy": this.props.auth.user.FirstName
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

    handlePrivateSessionDeny = (privateSessionLogId) => {
        let data = this.state;
        const { auth } = this.props;
        let { privateSessionNotification } = this.state;
        this.setState({ loading: true });
        apiService.post('DENYSESSION',
            {
                "PrivateSessionLogId": privateSessionLogId,
                "ActionPerformedBy": this.props.auth.user.FirstName
            }).then(response => {
                if (response.Success) {

                    privateSessionNotification.map(item => {
                        if (item.PrivateSessionLogId === privateSessionLogId) {
                            item.RecordDeleted = 'Y'
                        }
                    })
                    this.props.actions.showAlert({ message: response.Message, variant: "success" });
                    this.setState({ privateSessionNotification });
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

    handleTutorDetails = (teacherId) => {
        history.push(`${PUBLIC_URL}/TutorProfile/${teacherId}`);
    }

    componentWillUnmount = () => {
        clearTimeout(this.timeout);
    }

    render() {
        const { openChatWindow, privateSessionNotification, privateSessionLogId, loading, chatStudentUserId, chatTeacherUserId, studentType, teacherType, recipientImage } = this.state;
        const { auth, userTimezone } = this.props;

        const moment = require('moment-timezone');
        return (
            <section className="studentProfile">
                <div className="container">
                    <div className="responsiveTable alertNotification">
                        <MaterialTable
                            title="Private Session Notifications"
                            columns={[
                                // {
                                //     title: auth.userMode === 'student' ? 'Teacher Image' : 'Student Image',
                                //     render: rowData => (<Fragment><div data-testid="td-before" className="tdBefore">Student Image</div>
                                //         {auth.userMode === 'student' ? <button type="button" onClick={() => this.handleTutorDetails(rowData.TeacherId)} className="link-button"> <img style={{ height: 36, borderRadius: '50%', backgroundColor: "#f9f9f9" }} src={`${APP_URLS.API_URL}${rowData.TeacherImage}`} /></button>
                                //             : <img style={{ height: 36, borderRadius: '50%', backgroundColor: "#f9f9f9" }} src={`${APP_URLS.API_URL}${rowData.StudentImage}`} />
                                //         }</Fragment>
                                //     ),
                                // },
                                {
                                    title: auth.userMode === 'student' ? "Teacher Name" : "Student Name",
                                    render: rowData => (<Fragment><div data-testid="td-before" className="tdBefore">Student Name</div>
                                        {auth.userMode === 'student' ? <button type="button" onClick={() => this.handleTutorDetails(rowData.TeacherId)} className="link-button stNameBtn">{rowData.TeacherName}</button>
                                            : rowData.StudentName}</Fragment>
                                    )
                                },
                                {
                                    title: "Title",
                                    render: (rowData) => (<Fragment><div data-testid="td-before" className="tdBefore">Title</div>
                                        {rowData.SessionTitle} </Fragment>
                                    ),
                                },
                                {
                                    title: "Category",
                                    render: (rowData) => (<Fragment><div data-testid="td-before" className="tdBefore">Category</div>
                                        {rowData.SessionCategoryName} </Fragment>
                                    ),
                                },
                                {
                                    title: "Timing",
                                    render: (rowData) => (<Fragment><div data-testid="td-before" className="tdBefore">Timing</div>
                                        <FormatDateTime
                                            date={rowData.StartTime}
                                            format="MM/DD/YYYY hh:mm A"
                                        /> -  <FormatDateTime
                                            date={rowData.EndTime}
                                            format="hh:mm A"
                                        />
                                        <b>({userTimezone})</b>
                                    </Fragment>
                                    ),
                                    width: '300px'
                                },
                                // {
                                //     title: "Requested Date & Time",
                                //     field: "CreatedDate",
                                //     render: (rowData) => (<Fragment><div data-testid="td-before" className="tdBefore">Requested Date Time</div>
                                //         <FormatDateTime
                                //             date={rowData.StartTime}
                                //             format="MM/DD/YYYY hh:mm A"
                                //         />
                                //     </Fragment>
                                //     ),
                                //     width: '200px'
                                // },
                                {
                                    title: "Status",
                                    render: rowData => (<Fragment><div data-testid="td-before" className="tdBefore">Status</div>{
                                        rowData.IsAccept === 'Y' ? <label className="badge-dot"><i class="bg-success"></i>Accepted</label> : moment().isAfter(commonFunctions.getUtcDatetime(rowData.EndTime), 'second') ? <label className="label label-lg label-light-warning label-inline">Timed Out</label> : rowData.RecordDeleted === 'N' ? <label className="label label-lg label-light-warning label-inline">Requested</label> : <label className="label label-lg label-light-danger label-inline">Denied</label>
                                    }</Fragment>
                                    ),
                                    width: '130px'
                                },
                                {
                                    title: "Notes",
                                    field: "Notes",
                                    render: rowData => (
                                        <Fragment>
                                            <div data-testid="td-before" className="tdBefore">Notes</div>
                                            {rowData.Notes}
                                        </Fragment>
                                    )
                                },
                                {
                                    title: "Action",
                                    render: (rowData) => (
                                        < Fragment ><div data-testid="td-before" className="tdBefore">Action</div><div class="tbActionBtn">
                                            {
                                                auth.userMode === "student" ?
                                                    <Fragment>
                                                        {rowData.IsAccept === 'Y' && moment().isBefore(commonFunctions.getUtcDatetime(rowData.StartTime), 'second') &&
                                                            <Tooltip title="Add to Cart" aria-label="Add to Cart" className="success">
                                                                <Button variant="outlined" onClick={() => this.handleAddToCart(rowData.SessionId, rowData.StudentId, rowData.SessionType)} size="small" color="success"><AddShoppingCartIcon /></Button>
                                                            </Tooltip>
                                                        }
                                                        <Tooltip title="Chat" aria-label="chat">
                                                            <Badge badgeContent={`${rowData.NewMessageCount}`} color="secondary">
                                                                <Button variant="outlined" onClick={() => this.handleChatWindow(rowData.PrivateSessionLogId)} size="small" color="info"><i class="fa fa-commenting-o"></i></Button>
                                                            </Badge>
                                                        </Tooltip>
                                                    </Fragment>
                                                    :
                                                    <Fragment>
                                                        {rowData.IsAccept === 'N' && rowData.RecordDeleted === 'N' && commonFunctions.getUtcDatetime(rowData.EndTime) > new Date() &&
                                                            <Fragment>
                                                                <Tooltip title="Accept" aria-label="accept" className="success">
                                                                    <Button variant="outlined" onClick={() => this.handlePrivateSessionAccept(rowData.PrivateSessionLogId)} size="small" color="info"><i class="material-icons">done</i></Button>
                                                                </Tooltip>
                                                                <Tooltip title="Deny" aria-label="deny" className="danger">
                                                                    <Button variant="outlined" onClick={() => this.handlePrivateSessionDeny(rowData.PrivateSessionLogId)} size="small" color="danger"><i class="material-icons">close</i></Button>
                                                                </Tooltip>
                                                            </Fragment>
                                                        }
                                                        <Tooltip title="Chat" aria-label="chat">
                                                            <Badge badgeContent={`${rowData.NewMessageCount}`} color="secondary">
                                                                <Button variant="outlined" onClick={() => this.handleChatWindow(rowData.PrivateSessionLogId)} size="small" color="info"><i class="fa fa-commenting-o"></i></Button>
                                                            </Badge>
                                                        </Tooltip>
                                                    </Fragment>
                                            }</div>
                                        </Fragment>
                                    )
                                }

                            ]}
                            data={privateSessionNotification}
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
                                }
                            }}
                            localization={{
                                pagination: {
                                    labelRowsSelect: "rows per page",
                                },
                            }}
                            components={{
                                Body: props =>
                                    <Fragment> {
                                        props.renderData &&
                                            props.renderData.length === 0 ?
                                            <div className="alignCenterExt">No Records found</div>
                                            : <MTableBody  {...props} />

                                    }
                                    </Fragment>
                            }}
                        />
                    </div>
                    <ChatBot isOpenStatus={openChatWindow}
                        //recipientId={auth.userMode === 'student' ? chatTeacherId : chatStudentId}
                        recipientId={auth.userMode === 'student' ? chatTeacherUserId : chatStudentUserId}
                        recipientType={auth.userMode === 'student' ? teacherType : studentType}
                        senderType={auth.userMode === 'student' ? studentType : teacherType}
                        //senderId={auth.userMode === 'student' ? auth.user.StudentId : auth.user.TeacherId}
                        senderId={auth.user.UserId}
                        recipientImage={recipientImage}
                        privateSessionLogId={privateSessionLogId}
                        onClose={this.handleChatClose}>
                    </ChatBot>
                </div >
                {
                    loading &&
                    <div className="loaderDiv"><div className="loader">
                        <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                    </div></div>
                }
            </section>
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
      updateTimezone: bindActionCreators(actions.updateTimezone, dispatch)

        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(NotificationMessage);