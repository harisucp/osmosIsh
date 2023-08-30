import React, { Component, Fragment } from 'react';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import Loader from 'react-loaders';
import 'swiper/css/swiper.css';
import { APP_URLS } from "../../config/api.config";
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
import SimpleReactValidator from 'simple-react-validator';
import ChipInput from 'material-ui-chip-input';
import DateFnsUtils from '@date-io/date-fns';
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import moment from 'moment';
import { commonFunctions } from "../../shared/components/functional/commonfunctions";
//import TimeField from 'react-simple-timefield';
//Filepond
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { FilePond, File, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import 'filepond/dist/filepond.min.css';
//
import { PUBLIC_URL } from "../../config/api.config";
import { history } from '../../helpers/history';
import TimePicker from 'rc-time-picker';

registerPlugin(FilePondPluginFileValidateType);
class CreateSeries extends Component {
    constructor(props) {
        super(props);
        let { auth, match } = this.props;
        this.state = {
            sessionData: {
                sessionId: -1,
                sessionTitle: '',
                sessionCategoryId: '',
                description: '',
                isImageUploaded: false,
                isVideoUploaded: false,
                image: [],
                video: [],
                numberOfJoineesAllowed: "1",
                startTime: moment(new Date()).format("YYYY-MM-DD hh:mm A"),
                duration: moment.utc().hours(0).minutes(30),
                sessionFee: '',
                language: [],
                teacherId: auth.user.TeacherId,
                timeZoneId: '',
                actionPerformedBy: auth.user.FirstName,
                sessionTags: [],
                studentId: -1,
                sessionType: 0
            },

            sessionCategoryId: -1,
            privateSessionLogId: match.params.PrivateSessionLogId > 0 ? match.params.PrivateSessionLogId : -1,
            loading: false,
            sessionCategories: [],
            sessionDetail: [],
            timeZoneCategories: [],
            subject: '1-0-1 seesion',
            message: '1-0-1 seesion',
            tags: '',

        }
        this.validator = new SimpleReactValidator();
        this.createSession = this.createSession.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleDateControls = this.handleDateControls.bind(this);
        this.addChip = this.addChip.bind(this);
        this.removeChip = this.removeChip.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
    }
    componentDidMount = () => {
        this.getPrivateNotification();
        this.getSessionCategories();
        this.getTimeZoneCategories();
        // this.getSessionDetail();
    }

    //Api Calls
    getSessionCategories = () => {
        this.setState({ loading: true });
        apiService.post('UNAUTHORIZEDDATA', { "data": { "SessionCategoryId": -1 }, "keyName": "GetSessionCategories" })
            .then(response => {
                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        this.setState({ sessionCategories: response.Data.ResultDataList });
                    }
                }
                this.setState({ loading: false });
            },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: error.Message, variant: "error" });
                        this.setState({ loading: false });
                    })
            );
    }
    getTimeZoneCategories = () => {
        this.setState({ loading: true });
        apiService.post('UNAUTHORIZEDDATA', { "data": { "CategoryId": "TimeZones" }, "keyName": "GetGlobalCodesByCategory" })
            .then(response => {
                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        this.setState({ timeZoneCategories: response.Data.ResultDataList });
                    }
                }
                this.setState({ loading: false });
            },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: error.Message, variant: "error" });
                        this.setState({ loading: false });
                    })
            );
    }

    getPrivateNotification = async () => {

        const { auth } = this.props;
        this.setState({ loading: true });
        apiService.post('UNAUTHORIZEDDATA', { "data": { "StudentId": -1, "TeacherId": -1, "PrivateSessionLogId": this.state.privateSessionLogId }, "keyName": "GetTutorPrivateSessionNotifications" })
            .then(response => {
                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        let data = response.Data.ResultDataList[0];
                        let date = moment(data.StartTime).format("YYYY/MM/DD hh:mm A");
                        this.setState({
                            sessionData: {
                                ...this.state.sessionData,
                                sessionCategoryId: data.SessionCategoryId,
                                startTime: commonFunctions.getUtcDatetime(data.StartTime),
                                teacherId: data.TeacherId,
                                sessionType: data.SessionType,
                                studentId: data.StudentId
                            },

                        });
                    }
                }else{
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                }
                this.setState({ loading: false });
            },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: error.Message, variant: "error" });
                        this.setState({ loading: false });
                    })
            );
    }

    createSession = () => {
        if (this.validator.allValid() === false) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        var formData = new FormData();
        Object.entries(this.state.sessionData).map(([key, val]) => {
            if (key === "image" || key === "video") {
                formData.append(key, val[0]);
            }
            else if (key === 'duration') {
                var d = new Date(moment(val).format('YYYY-MM-DD HH:mm A'));
                var minutes = d.getHours() * 60 + d.getMinutes();
                formData.append(key, minutes);
            }
            else if (key === 'startTime') {
                formData.append(key, commonFunctions.convertToUtc(val));
            }
            else if (key === "description") {
                formData.append(key, val !== null ? val : "");
            }
            else {
                formData.append(key, val);
            }
        });

        this.setState({ loading: true });
        apiService.postFile('CREATEUPDATESESSION', formData)
            .then(response => {

                if (response.Success) {
                    this.props.actions.showAlert({ message: 'Session created Successfully', variant: "success" });
                    this.handlePrivateSessionAccept();
                    history.push(`${PUBLIC_URL}/TutorDashBoard`);
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

    getSessionDetail = () => {
        this.setState({ loading: true });
        apiService.post('UNAUTHORIZEDDATA', { "data": { "SessionId": this.state.sessionData.sessionId }, "keyName": "SessionDetail" })
            .then(response => {
                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        let sessionDetail = response.Data.ResultDataList[0];
                        const { sessionData } = this.state;
                        this.setState({
                            sessionData: {
                                ...sessionData,
                                sessionId: sessionDetail.SessionId,
                                sessionTitle: sessionDetail.SessionTitle,
                                sessionCategoryId: sessionDetail.SessionCategoryId,
                                description: sessionDetail.Description,
                                isImageUploaded: sessionDetail.Image !== null ? true : false,
                                // isVideoUploaded: false,
                                image: sessionDetail.Image === null ? [] : sessionDetail.Image,
                                //video: [],
                                numberOfJoineesAllowed: sessionDetail.NumberOfJoineesAllowed,
                                startTime: commonFunctions.getUtcDate(sessionDetail.StartTime, "YYYY-MM-DD hh:mm A"),
                                duration: moment.duration(sessionDetail.Duration, "minutes").format("h:mm"),
                                sessionFee: sessionDetail.SessionFee,
                                language: sessionDetail.Language ? sessionDetail.Language.split(',') : [],
                                teacherId: sessionDetail.TeacherId,
                                timeZoneId: sessionDetail.TimeZone,
                                actionPerformedBy: sessionDetail.CreatedBy,
                                sessionTags: sessionDetail.SessionTags ? sessionDetail.SessionTags.split(',') : []
                            }
                        })
                    }
                }else{
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                }
                this.setState({ loading: false });
            },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: error.Message, variant: "error" });
                        this.setState({ loading: false });
                    })
            );
    }

    // Handler functions
    handleSelectChange = (opt, meta) => {
        const { sessionData } = this.state;
        sessionData[meta.name] = opt.value;
        this.setState({ sessionData });
    }

    handleTextChange = (e) => {
        const { sessionData } = this.state;
        sessionData[e.target.name] = e.target.value === "00:00" ? "" : e.target.value;
        this.setState({ sessionData });
    }

    handleFileUpload = (fileItems) => {
        const { sessionData } = this.state;
        if (fileItems[0] && fileItems[0].fileType.search("image") > -1) {
            sessionData.image = fileItems.map(fileItem => fileItem.file);
            sessionData.isImageUploaded = true;
            sessionData.isVideoUploaded = false;
            sessionData.video = [];
        }
        else if (fileItems[0] && fileItems[0].fileType.search("video") > -1) {
            sessionData.video = fileItems.map(fileItem => fileItem.file);
            sessionData.isVideoUploaded = true;
            sessionData.isImageUploaded = false;
            sessionData.image = [];
        }
        else {
            sessionData.image = [];
            sessionData.video = [];
            sessionData.isVideoUploaded = false;
            sessionData.isImageUploaded = false;
        }
        this.setState({ sessionData });
    }

    handleDurationChange = (value) => {
        var d = new Date(moment(value).format('YYYY-MM-DD HH:mm'));
        var minutes = d.getHours() * 60 + d.getMinutes();
        if (minutes > 0) {
            this.setState({ sessionData: { ...this.state.sessionData, duration: value } });
        }
        else {
            this.setState({ sessionData: { ...this.state.sessionData, duration: moment.utc().hours(0).minutes(15) } });
        }
    }

    handleDateControls = (datetime, name) => {
        const { sessionData } = this.state;
        sessionData[name] = datetime;
        this.setState({ sessionData });
    }

    addChip = (value, name) => {
        const { sessionData } = this.state;
        sessionData[name].push(value.charAt(0).toUpperCase() + value.slice(1));
        this.setState({ sessionData });
    };

    removeChip = (chip, index, name) => {
        const { sessionData } = this.state;
        sessionData[name].splice(index, 1);
        this.setState({ sessionData });
    };

    handlePrivateSessionAccept = () => {
        let { sessionData, sessionCategoryId, privateSessionLogId, subject, message } = this.state;
        const { auth } = this.props;
        this.setState({ loading: true });
        apiService.post('REQUESTPRIVATESESSION',
            {
                "studentId": Number(sessionData.studentId),
                "teacherId": sessionData.teacherId,
                "startTime": commonFunctions.convertToUtc(sessionData.startTime),
                "endTime": moment(commonFunctions.convertToUtc(sessionData.startTime)).add(sessionData.duration, "minutes"),
                "sessionCategoryId": Number(sessionData.sessionCategoryId),
                "privateSessionLogId": Number(privateSessionLogId),
                "subject": subject,
                "message": message,
                "actionPerformedBy": auth.user.FirstName,
                "sessionType": sessionData.SessionType,
                "isAccept": "Y",
                "recordDeleted": "N"
            }).then(response => {
                if (response.Success) {
                    this.props.actions.showAlert({ message: response.Message, variant: "success" });
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
    render() {
        const { sessionData, loading, tags, sessionCategories, timeZoneCategories } = this.state;
        let categoryOptions = [];
        sessionCategories.map((item) => {
            categoryOptions.push({ value: item.SessionCategoryId, label: item.SessionCategoryName });
        });
        let timeZone = [];
        timeZoneCategories.map((item) => {
            timeZone.push({ value: item.GlobalCodeId, label: item.CodeName });
        });
        return (
            <Fragment>
                <section className="series-Session">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12  col-md-12 col-sm-12">
                                <div className="resetForm">
                                    <h1 className="text-center">{sessionData.sessionId > 0 ? "Edit Private Session" : "Create Private Session"}</h1>
                                    <div className="grayWrapper">
                                        <div className="row">
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padRight">
                                                    <label htmlFor="uname1">Title</label>
                                                    <input type="text" name='sessionTitle' value={sessionData.sessionTitle} onChange={this.handleTextChange}
                                                        className="form-control" placeholder="Session Title" />
                                                    {this.validator.message('Title', sessionData.sessionTitle, 'required|max:250')}
                                                </div>
                                            </div>
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padleft">
                                                    <label htmlFor="uname1">Category</label>
                                                    <Select
                                                        name="sessionCategoryId"
                                                        value={categoryOptions.filter(obj => obj.value === sessionData.sessionCategoryId)}
                                                        onChange={this.handleSelectChange}
                                                        options={categoryOptions}
                                                    />
                                                    {this.validator.message('Category', sessionData.sessionCategoryId, 'required')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padRight">
                                                    <label htmlFor="uname1">Description</label>
                                                    <textarea className="form-control" name="description" onChange={this.handleTextChange}
                                                        value={sessionData.description} placeholder="Description"></textarea>
                                                    {this.validator.message('Description', sessionData.description, 'required')}
                                                </div>
                                            </div>
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padleft">
                                                    <label htmlFor="uname1">Add a Cover Photo (1200x800 or 3:2 ratio up to 5mb)</label>
                                                    <FilePond
                                                        allowFileTypeValidation={true}
                                                        acceptedFileTypes={['image/png', 'image/jpeg']}
                                                        allowMultiple={false}
                                                        onupdatefiles={this.handleFileUpload}
                                                        imagePreviewHeight="160"
                                                        allowFileSizeValidation={true}
                                                        labelMaxFileSize="File types allowed: JPG,PNG"
                                                        labelMaxFileSizeExceeded="Maximum file size is 5MB."
                                                        maxFileSize="5MB"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-12  col-md-12 col-sm-12">
                                <div className="resetForm">
                                    <h3 className="text-center mt-5">Session Information</h3>
                                    <div className="grayWrapper">
                                        <div className="row">
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padRight">
                                                    <label htmlFor="uname1">Maximum # of students</label>
                                                    <input type="number" min="0" name="numberOfJoineesAllowed" onChange={this.handleTextChange} disabled={true}
                                                        value={sessionData.numberOfJoineesAllowed} className="form-control" placeholder=" Maximum # of students" />
                                                    {this.validator.message('Maximum # of students', sessionData.numberOfJoineesAllowed, 'required')}
                                                </div>
                                            </div>
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padleft">
                                                    <label htmlFor="uname1">Fee for Session (Total)</label>
                                                    <input type="number"
                                                        name="sessionFee"
                                                        value={sessionData.sessionFee}
                                                        onChange={this.handleTextChange}
                                                        className="form-control" min="0" placeholder="Session Fee in USD $" />
                                                    {this.validator.message('Session Fee', sessionData.sessionFee, 'required|currency')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padRight">
                                                    <label htmlFor="uname1">Start Time</label>
                                                    <div className="form-control commonInputField">
                                                        <MuiPickersUtilsProvider className="fullWidthField" utils={DateFnsUtils}>
                                                            <DateTimePicker
                                                                variant="inline"
                                                                inputVariant="outlined"
                                                                value={sessionData.startTime}
                                                                minDate={new Date()}
                                                                minutesStep={15}
                                                                autoOk={true}
                                                                onChange={value => this.handleDateControls(value, "startTime")}
                                                                format="MM/dd/yyyy hh:mm a"
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                        {this.validator.message('Start Datetime', sessionData.startTime, 'required')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padleft">
                                                    <label htmlFor="uname1">Duration of class</label>
                                                    {/* <TimeField
                                                        name="duration"
                                                        value={sessionData.duration}
                                                        onChange={this.handleTextChange}
                                                        className="form-control"
                                                        style={{ width: "490px" }}
                                                    /> */}
                                                    <TimePicker
                                                        showSecond={false}
                                                        minuteStep={15}
                                                        value={sessionData.duration}
                                                        style={{ width: '100%' }}
                                                        onChange={this.handleDurationChange}
                                                    />
                                                    {this.validator.message('Session Duration', sessionData.duration, 'required')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padRight">
                                                    <label htmlFor="uname1">Time Zone</label>
                                                    <Select
                                                        name="timeZoneId"
                                                        value={timeZone.filter(obj => obj.value === sessionData.timeZoneId)}
                                                        onChange={this.handleSelectChange}
                                                        options={timeZone}
                                                    />
                                                    {this.validator.message('Time Zone', sessionData.timeZoneId, 'required')}
                                                </div>
                                            </div>
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padleft">
                                                    <label htmlFor="uname1">Language Tags</label>
                                                    {/* <Select
                                                        name="language"
                                                        isMulti
                                                        closeMenuOnSelect={false}
                                                        value={languageOptions.filter(obj => obj.label === sessionData.language)}
                                                        onChange={this.handleSelectChange}
                                                        options={languageOptions}
                                                    /> */}
                                                    <div className="form-control commonInputField">
                                                        <ChipInput
                                                            value={sessionData.language}
                                                            onAdd={value => this.addChip(value, "language")}
                                                            onDelete={(chip, index) => this.removeChip(chip, index, "language")}
                                                            variant="outlined"
                                                            allowDuplicates={false}
                                                            newChipKeyCodes={[9, 13, 187, 188]}
                                                        />
                                                    </div>
                                                    {this.validator.message('Language', sessionData.language, 'required')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padRight">
                                                    <label htmlFor="uname1">Session Tags</label>
                                                    <div className="form-control commonInputField">
                                                        <ChipInput
                                                            value={sessionData.sessionTags}
                                                            onAdd={value => this.addChip(value, "sessionTags")}
                                                            onDelete={(chip, index) => this.removeChip(chip, index, "sessionTags")}
                                                            variant="outlined"
                                                            allowDuplicates={false}
                                                            newChipKeyCodes={[9, 13, 187, 188]}
                                                        />
                                                    </div>
                                                    {this.validator.message('Session tags', sessionData.sessionTags, 'required')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 col-sm-12 mt-4 text-right">
                                                <button className="btn btn-blue" type="button" onClick={() => history.goBack()}>Back</button>
                                                <button className="btn btn-blue" onClick={this.createSession}>{sessionData.sessionId > 0 ? "Edit" : "Create"}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {loading &&
                    <div className="loaderDiv"><div className="loader">
                        <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                    </div></div>}
            </Fragment >
        );
    }
}

const mapStateToProps = state => {
    return {
        auth: state.auth
    };
};
const mapDispatchToProps = dispatch => {
    return {
        actions: {
            showAlert: bindActionCreators(actions.showAlert, dispatch)
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(CreateSeries);
