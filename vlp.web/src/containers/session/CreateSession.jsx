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
import { confirmAlert } from 'react-confirm-alert';
import DateFnsUtils from '@date-io/date-fns';
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import moment from 'moment';
import { TimezonePicker } from "baseui/timezonepicker";
import { FormControl } from 'baseui/form-control';
import { SIZE } from "baseui/input";
import { commonFunctions } from "../../shared/components/functional/commonfunctions";
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
//Filepond
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { FilePond, File, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
//
import { PUBLIC_URL } from "../../config/api.config";
import { history } from '../../helpers/history';
import { format } from 'date-fns/esm';
import 'rc-time-picker/assets/index.css';
import TimePicker from 'rc-time-picker';
import { localStorageService } from "../../services/localStorageService";
import SessionSeriesPreview from "../common/SessionSeriesPreview";

registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

const DatePicker = ({ value, onChange }) => {
    return (
        <MuiPickersUtilsProvider className="fullWidthField" utils={DateFnsUtils}>
            <DateTimePicker
                autoOk={true}
                variant="inline"
                inputVariant="outlined"
                value={value}
                minDate={new Date()}
                minutesStep={5}
                onChange={onChange}
                format="MM/dd/yyyy hh:mm a"
            />
        </MuiPickersUtilsProvider>
    )
}
class CreateSession extends Component {
    constructor(props) {
        super(props);
        let { auth, match } = this.props;
        this.state = {
            sessionData: {
                sessionId: match.params.SessionId > 0 ? match.params.SessionId : -1,
                sessionTitle: '',
                sessionCategoryId: '',
                agenda: '',
                description: '',
                isImageUpdated: false,
                isVideoUpdated: false,
                image: [],
                video: [],
                numberOfJoineesAllowed: '',
                startTime: moment().add(2, 'hours').minutes(0),
                otherStartTime: [],
                duration: moment.utc().hours(0).minutes(30),
                sessionFee: '',
                language: [],
                teacherId: this.props.auth.user.TeacherId,
                timeZone: '',
                actionPerformedBy: "admin",
                sessionTags: [],
                copySessionId: 0
            },
            loading: false,
            sessionCategories: [],
            numberOfJoineesEnrolled: 0,
            sessionDetail: [],
            timeZoneCategories: [],
            tags: '',
            showImage: false,
            previewData: {},
            showPreviewData: false,
            copySession: match.params.copysession === "true" ? true : false
        }
        this.validator = new SimpleReactValidator({
            // messages: {
            //     min: "Minimum fee for session is $2."
            // }
        });
        this.createSession = this.createSession.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleDateControls = this.handleDateControls.bind(this);
        this.addChip = this.addChip.bind(this);
        this.removeChip = this.removeChip.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
    }
    componentDidMount = () => {
        const { auth } = this.props;
        if ((auth.user.IsProfileUpdated === 'N' || auth.user.IsProfileUpdated === null)) {
            this.props.actions.showAlert({ message: "Please add details to your profile in order to continue.", variant: "info" });
            history.push(`${PUBLIC_URL}/CreateTutor`);
        }
        localStorageService.updateUserMode("tutor");
        this.props.actions.changeUserMode("tutor");
        this.getSessionCategories();
        this.getTimeZoneCategories();
        this.getSessionDetail();
    }

    //Api Calls
    getSessionCategories = () => {
        this.setState({ loading: true });
        apiService.post('GETDATA', { "data": { "SessionCategoryId": -1 }, "keyName": "GetSessionCategories" })
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
                        console.log(`SessionCategories:${error}`);
                        this.props.actions.showAlert({ message: 'Something went wrong...', variant: "error" });
                        this.setState({ loading: false });
                    })
            );
    }
    getTimeZoneCategories = () => {
        this.setState({ loading: true });
        apiService.post('GETDATA', { "data": { "CategoryId": "TimeZones" }, "keyName": "GetGlobalCodesByCategory" })
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
                        console.log(`SessionCategories:${error}`);
                        this.props.actions.showAlert({ message: 'Something went wrong...', variant: "error" });
                        this.setState({ loading: false });
                    })
            );
    }

    preValidateCreateSession = () => {
        if (this.validator.allValid() === false) {
            this.validator.showMessages();
            this.forceUpdate();
            this.props.actions.showAlert({ message: "Please make sure that all required fields have been filled out.", variant: "error" });
            return false;
        }
        const { sessionData } = this.state;
        if (sessionData.numberOfJoineesAllowed > 16) {
            confirmAlert({
                message: <label>Up to 16 attendees videos will be displayed on a first-come, first-served basis. If you need to be able to see all of your students, we recommend limiting your session to 16 or less.</label>,
                buttons: [
                    {
                        label: 'Okay',
                        // onClick: () => this.createSession()
                        onClick: () => this.showPreview()
                    },
                    {
                        label: 'Cancel',
                        onClick: () => { return false; }
                    }
                ]
            })
        }
        else {
            // this.createSession();
            this.showPreview();
        }

    }

    validateStartDateTimes = () => {
        const { startTime, otherStartTime, duration } = this.state.sessionData;

        const otherStartDateTimeStamps = [];
        otherStartDateTimeStamps.push(startTime.valueOf());

        otherStartTime.forEach(date => {
            otherStartDateTimeStamps.push(date.valueOf());
        });

        otherStartDateTimeStamps.sort();

        var d = new Date(moment(duration).format('MM/DD/YYYY hh:mm A'));
        var durationInMinutes = d.getHours() * 60 + d.getMinutes();

        let valid = true;

        for (let i = 1; i < otherStartDateTimeStamps.length; i++) {
            const startDate = otherStartDateTimeStamps[i - 1];
            const endDate = otherStartDateTimeStamps[i];

            const diffInMinutes = moment(endDate).diff(moment(startDate), 'minutes');

            if (diffInMinutes < durationInMinutes) {
                valid = false;
                break;
            }
        }

        return valid;
    }

    cancelPreview = () => {
        this.setState({ showPreviewData: false, previewData: {} })
    }

    showPreview = () => {
        if (!this.validateStartDateTimes()) {
            this.props.actions.showAlert({ message: 'Please enter valid start time.', variant: "error" });
            return;
        }
        const sessionData = this.state.sessionData;
        var formData = {};
        Object.entries(sessionData).map(([key, val]) => {
            if ((key === "image" || key === "video") && (val !== null && typeof val !== "undefined" && val.length > 0)) {
                formData[key] = val[0];
            }
            else if (key === 'duration') {
                var d = new Date(moment(val).format('MM/DD/YYYY hh:mm A'));
                var minutes = d.getHours() * 60 + d.getMinutes();
                formData[key] = minutes;
            }
            else if (key === 'startTime') {
                // formData.append(key, commonFunctions.convertToUtc(val));
                formData[key] = moment.tz(moment(val).format('MM/DD/YYYY h:mm:ss A'), 'MM/DD/YYYY h:mm:ss A', this.state.sessionData.timeZone).utc().format("YYYY-MM-DD hh:mm A");
            }
            else if (key === "description") {
                formData[key] = val !== null ? val : "";
            }
            else if (key === "otherStartTime") {
                val.forEach(d => {
                    formData[`${key}[]`] = moment.tz(moment(d).format('MM/DD/YYYY h:mm:ss A'), 'MM/DD/YYYY h:mm:ss A', this.state.sessionData.timeZone).utc().format("YYYY-MM-DD hh:mm A");
                })
            }
            else {
                formData[key] = val;
            }
        });

        const userInfo = localStorageService.getUserDetail();
        const newFormData = {
            SessionId: formData.SessionId,
            SeriesId: null,
            Title: formData.sessionTitle,
            Description: formData.description,
            Name: userInfo["FirstName"] + " " + userInfo["LastName"],
            TeacherId: formData.teacherId,
            ImageFile: sessionData.base64file || sessionData.image,
            TeacherImageFile: userInfo.UserImage,
            StartTime: formData.startTime,
            Duration: formData.duration,
            Fee: formData.sessionFee,
            TotalSeats: formData.numberOfJoineesAllowed,
            OccupiedSeats: 0,
            TimeZone: formData.timeZone,
            Rating: 0,
            RatingCount: 0,
        }
        this.setState({ previewData: newFormData, showPreviewData: true })
    }

    createSession = () => {
        if (!this.validateStartDateTimes()) {
            this.props.actions.showAlert({ message: 'Please enter valid start time.', variant: "error" });
            return;
        }

        var formData = new FormData();
        Object.entries(this.state.sessionData).map(([key, val]) => {
            if ((key === "image" || key === "video") && (val !== null && typeof val !== "undefined" && val.length > 0)) {
                formData.append(key, val[0]);
            }
            else if (key === 'duration') {
                var d = new Date(moment(val).format('MM/DD/YYYY hh:mm A'));
                var minutes = d.getHours() * 60 + d.getMinutes();
                formData.append(key, minutes);
            }
            else if (key === 'startTime') {
                // formData.append(key, commonFunctions.convertToUtc(val));
                formData.append(key, moment.tz(moment(val).format('MM/DD/YYYY h:mm:ss A'), 'MM/DD/YYYY h:mm:ss A', this.state.sessionData.timeZone).utc().format("YYYY-MM-DD hh:mm A"));
            }
            else if (key === "description") {
                formData.append(key, val !== null ? val : "");
            }
            else if (key === "otherStartTime") {
                val.forEach(d => {
                    formData.append(`${key}[]`, moment.tz(moment(d).format('MM/DD/YYYY h:mm:ss A'), 'MM/DD/YYYY h:mm:ss A', this.state.sessionData.timeZone).utc().format("YYYY-MM-DD hh:mm A"));
                })
            }
            else {
                formData.append(key, val);
            }
        });
        this.setState({ loading: true });
        const { sessionData } = this.state;
        apiService.postFile('CREATEUPDATESESSION', formData)
            .then(response => {
                if (response.Success) {
                    this.props.actions.showAlert({ message: sessionData.sessionId > 0 ? 'Session updated successfully.' : 'Session created successfully.', variant: "success" });
                    history.push(`${PUBLIC_URL}/TutorDashBoard`);
                } else {
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                }
                this.setState({ loading: false });
            },
                (error) =>
                    this.setState((prevState) => {
                        console.log(`Create Session:${error}`);
                        this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
                        this.setState({ loading: false });
                    })
            );
    }

    getTimeFromMins = (mins) => {
        // do not include the first validation check if you want, for example,
        // getTimeFromMins(1530) to equal getTimeFromMins(90) (i.e. mins rollover)
        if (mins >= 24 * 60 || mins < 0) {
            throw new RangeError("Valid input should be greater than or equal to 0 and less than 1440.");
        }
        var h = mins / 60 | 0,
            m = mins % 60 | 0;
        return moment.utc().hours(h).minutes(m);
    }

    getSessionDetail = () => {
        this.setState({ loading: true });
        apiService.post('GETDATA', { "data": { "SessionId": this.state.sessionData.sessionId }, "keyName": "SessionDetail" })
            .then(response => {
                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        let sessionDetail = response.Data.ResultDataList[0];
                        const { sessionData, copySession } = this.state;
                        this.setState({
                            sessionData: {
                                ...sessionData,
                                sessionId: copySession ? -1 : sessionDetail.SessionId,
                                sessionTitle: sessionDetail.SessionTitle,
                                sessionCategoryId: sessionDetail.SessionCategoryId,
                                description: sessionDetail.Description,
                                // isVideoUpdated: false,
                                image: sessionDetail.Image ? APP_URLS.API_URL + sessionDetail.Image : null,
                                copySessionId: copySession ? sessionDetail.SessionId : 0,
                                //video: [],
                                numberOfJoineesAllowed: sessionDetail.NumberOfJoineesAllowed,
                                startTime: copySession ? moment().add(2, 'hours').minutes(0) : commonFunctions.getUtcDatetime(sessionDetail.StartTime),
                                duration: this.getTimeFromMins(sessionDetail.Duration),
                                sessionFee: sessionDetail.SessionFee,
                                language: sessionDetail.Language ? sessionDetail.Language.split(',') : [],
                                teacherId: sessionDetail.TeacherId,
                                timeZone: sessionDetail.TimeZone,
                                actionPerformedBy: sessionDetail.CreatedBy,
                                sessionTags: sessionDetail.SessionTags ? sessionDetail.SessionTags.split(',') : [],
                                agenda: sessionDetail.Agenda
                            },
                            numberOfJoineesEnrolled: copySession ? -1 : sessionDetail.NumberOfJoineesEnrolled,
                            showImage: sessionDetail.Image ? true : false
                        })
                    }
                } else {
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                }
                this.setState({ loading: false });
            },
                (error) =>
                    this.setState((prevState) => {
                        console.log(`SeriesCategories:${error}`);
                        this.props.actions.showAlert({ message: 'Something went wrong...', variant: "error" });
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
        if (e.target.name === "sessionTitle" && e.target.value != '') {
            if (/^[a-zA-Z0-9 ]*[a-zA-Z ]+[a-zA-Z0-9 ]*$/.test(e.target.value)) {
                sessionData[e.target.name] = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
            }
        }
        else if (e.target.name === "sessionFee") {
            sessionData[e.target.name] = e.target.value !== "" ? Number(e.target.value) : e.target.value;
        }
        else {
            sessionData[e.target.name] = e.target.value;
        }
        this.setState({ sessionData });
    }
    handleFileUpload = (fileItems) => {

        const { sessionData } = this.state;
        if (fileItems[0] && fileItems[0].fileType.search("image") > -1) {
            sessionData.image = fileItems.map(fileItem => fileItem.file);
            sessionData.isImageUpdated = true;
            sessionData.isVideoUpdated = false;
            this.converFileToBase64(sessionData.image);
            sessionData.video = [];
        }
        else if (fileItems[0] && fileItems[0].fileType.search("video") > -1) {
            sessionData.video = fileItems.map(fileItem => fileItem.file);
            sessionData.isVideoUpdated = true;
            sessionData.isImageUpdated = false;
            sessionData.image = [];
        }
        else {
            sessionData.image = [];
            sessionData.video = [];
            sessionData.isVideoUpdated = false;
            sessionData.isImageUpdated = false;
        }
        this.setState({ sessionData });
    }

    converFileToBase64 = (file) => {
        let that = this;
        const { sessionData } = this.state;
        var reader = new FileReader();
        reader.onloadend = function () {
            sessionData.base64file = reader.result
            that.setState({ sessionData });
        }
        reader.readAsDataURL(file[0]);
    }

    handleDateControls = (datetime, name) => {
        const { sessionData } = this.state;
        sessionData[name] = datetime;
        this.setState({ sessionData });
    }
    handleOtherStartDateTimeControls = (datetime, index) => {
        const { sessionData } = this.state;
        sessionData.otherStartTime[index] = datetime;
        this.setState({ sessionData });
    }
    addChip = (value, name) => {
        if (/^[a-zA-Z0-9 ]*[a-zA-Z ]+[a-zA-Z0-9 ]*$/.test(value)) {
            const { sessionData } = this.state;
            sessionData[name].push(value.charAt(0).toUpperCase() + value.slice(1));
            this.setState({ sessionData });
        }

    };
    removeChip = (chip, index, name) => {
        const { sessionData } = this.state;
        sessionData[name].splice(index, 1);
        this.setState({ sessionData });
    };

    handleDurationChange = (value) => {
        var d = new Date(moment(value).format('MM/DD/YYYY hh:mm A'));
        var minutes = d.getHours() * 60 + d.getMinutes();
        if (minutes > 0) {
            this.setState({ sessionData: { ...this.state.sessionData, duration: value } });
        }
        else {
            this.setState({ sessionData: { ...this.state.sessionData, duration: moment.utc().hours(0).minutes(15) } });
        }
    }

    ChangeImage = () => {
        const { sessionData } = this.state;
        sessionData.copySessionId = 0;
        sessionData.image = [];
        sessionData.isImageUpdated = true;
        this.setState({ showImage: false, sessionData })
    }
    handleTimezoneChange = (timezone) => {

        const { sessionData } = this.state;
        sessionData.timeZone = timezone.id;
        this.setState({ sessionData });
    }

    addStartTimeHandler = () => {
        const { sessionData } = this.state;
        const { startTime, otherStartTime, duration } = sessionData;

        const otherStartDateCount = otherStartTime.length;
        const lastStartTime = otherStartDateCount > 0 ? otherStartTime[otherStartDateCount - 1] : startTime;

        sessionData.otherStartTime.push(moment(lastStartTime).add(duration.hours(), 'hours').add(duration.minutes(), 'minutes'));
        this.setState({ sessionData });
    }

    removeStartTimeHandler = (index) => {
        const { sessionData } = this.state;
        sessionData.otherStartTime.splice(index, 1);
        this.setState({ sessionData });
    }

    render() {
        const { sessionData, loading, tags, sessionCategories, timeZoneCategories, numberOfJoineesEnrolled } = this.state;

        let categoryOptions = [];
        sessionCategories.map((item) => {
            categoryOptions.push({ value: item.SessionCategoryId, label: item.SessionCategoryName });
        });
        let timeZone = [];
        timeZoneCategories.map((item) => {
            timeZone.push({ value: item.GlobalCodeId, label: item.CodeName });
        });
        let languageOptions = [];
        return (
            <Fragment>
                <section className="series-Session">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12  col-md-12 col-sm-12">
                                <div className="resetForm">
                                    <h1 className="text-center">{sessionData.sessionId > 0 ? "Edit Session" : "Create Session"}</h1>
                                    <div className="grayWrapper">
                                        <div className="row">
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padRight">
                                                    <label htmlFor="uname1">Title</label>
                                                    <input type="text" name='sessionTitle' value={sessionData.sessionTitle}
                                                        disabled={numberOfJoineesEnrolled > 0 ? true : false}
                                                        onChange={this.handleTextChange}
                                                        className="form-control" placeholder="Session Title" />
                                                    {this.validator.message('Title', sessionData.sessionTitle, 'required|max:200')}
                                                </div>
                                            </div>
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padleft">
                                                    <label htmlFor="uname1">Category</label>
                                                    <Select styles={{ menu: styles => ({ ...styles, zIndex: 999 }) }}
                                                        name="sessionCategoryId"
                                                        value={categoryOptions.filter(obj => obj.value === sessionData.sessionCategoryId)}
                                                        onChange={this.handleSelectChange}
                                                        options={categoryOptions}
                                                        isDisabled={numberOfJoineesEnrolled > 0 ? true : false}
                                                    />
                                                    {this.validator.message('Category', sessionData.sessionCategoryId, 'required')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padRight">
                                                    <label htmlFor="uname1">Description</label>
                                                    <textarea className="form-control" name="description"
                                                        disabled={numberOfJoineesEnrolled > 0 ? true : false}
                                                        onChange={this.handleTextChange}
                                                        value={sessionData.description} placeholder="Description"></textarea>
                                                    {this.validator.message('Description', sessionData.description, 'required')}
                                                </div>
                                            </div>
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padleft">
                                                    <label htmlFor="uname1">Add a Cover Photo (1200x800 or 3:2 ratio up to 5mb)</label>

                                                    {this.state.showImage && <div className="closeImage" onClick={this.ChangeImage}><span className="closeButton"><i class="fa fa-times" aria-hidden="true"></i></span><img width="" height="" src={sessionData.image} alt="image" /></div>}
                                                    {!this.state.showImage &&
                                                        <FilePond
                                                            allowFileTypeValidation={true}
                                                            acceptedFileTypes={['image/png', 'image/jpeg']}
                                                            allowMultiple={false}
                                                            onupdatefiles={this.handleFileUpload}
                                                            imagePreviewHeight="160"
                                                            allowImageCrop={true}
                                                            allowFileSizeValidation={true}
                                                            labelMaxFileSize="File types allowed: JPG,PNG"
                                                            labelMaxFileSizeExceeded="Maximum file size is 5MB."
                                                            maxFileSize="5MB"
                                                        />
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-lg-12  col-md-12 col-sm-12">
                                                <div className="form-group padRight">
                                                    <label htmlFor="uname1">Agenda</label>
                                                    <textarea className="form-control" name="agenda" onChange={this.handleTextChange}
                                                        value={sessionData.agenda} placeholder="Items to be discussed during session."></textarea>
                                                    {this.validator.message('agenda', sessionData.agenda, 'required')}
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
                                                    <input type="number" min="0" name="numberOfJoineesAllowed"
                                                        disabled={numberOfJoineesEnrolled > 0 ? true : false}
                                                        onChange={this.handleTextChange}
                                                        value={sessionData.numberOfJoineesAllowed} className="form-control" placeholder="Maximum # of students" />
                                                    {this.validator.message('Maximum # of students', sessionData.numberOfJoineesAllowed, 'required|integer|between:1,250,num')}
                                                </div>
                                            </div>
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padleft">
                                                    <label htmlFor="uname1">Fee for Session (Total)</label>
                                                    <input type="number"
                                                        name="sessionFee"
                                                        value={sessionData.sessionFee}
                                                        onChange={this.handleTextChange}
                                                        disabled={numberOfJoineesEnrolled > 0 ? true : false}
                                                        className="form-control" min="0"
                                                        placeholder="Session Fee in USD $" />
                                                    {this.validator.message('sessionFee', sessionData.sessionFee, 'required|integer')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padRight">
                                                    <label htmlFor="uname1">Start Time</label>
                                                    <div className="input-group">
                                                        <div className="form-control commonInputField">
                                                            <DatePicker value={sessionData.startTime} onChange={value => this.handleDateControls(value, "startTime")} />
                                                            {this.validator.message('Start Datetime', sessionData.startTime, 'required')}
                                                        </div>
                                                        {sessionData.sessionId < 0 && <div className="input-group-append">
                                                            <button type="button" onClick={this.addStartTimeHandler} title="Host the same session on multiple dates"><i className="fa fa-plus"></i></button>
                                                        </div>}
                                                    </div>
                                                </div>

                                                {sessionData.otherStartTime.map((value, index) => {
                                                    return (
                                                        <div className="form-group">
                                                            <div className="input-group">
                                                                <div className="form-control commonInputField">
                                                                    <DatePicker value={value} onChange={value => this.handleOtherStartDateTimeControls(value, index)} />
                                                                </div>
                                                                <div className="input-group-append">
                                                                    <button type="minus" className="btn btn-danger" title="Remove" onClick={() => this.removeStartTimeHandler(index)}><i className="fa fa-trash"></i></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padleft">
                                                    <label htmlFor="uname1">Duration of class</label>
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
                                                    {/* <Select styles={{ menu: styles => ({ ...styles, zIndex: 999 }) }}
                                                        name="timeZoneId"
                                                        value={timeZone.filter(obj => obj.value === sessionData.timeZoneId)}
                                                        onChange={this.handleSelectChange}
                                                        options={timeZone}
                                                        isDisabled={numberOfJoineesEnrolled > 0 ? true : false}
                                                    /> */}
                                                    <FormControl>
                                                        <TimezonePicker
                                                            value={sessionData.timeZone}
                                                            onChange={(e) => this.handleTimezoneChange(e)}
                                                            size={SIZE.mini}
                                                            disabled={sessionData.sessionId > 0 ? true : false}
                                                        />
                                                    </FormControl>
                                                    {this.validator.message('Time Zone', sessionData.timeZone, 'required')}
                                                </div>
                                            </div>

                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padleft">
                                                    <label htmlFor="uname1">Languages Used During Class</label>
                                                    <div className="form-control commonInputField">
                                                        <ChipInput
                                                            value={sessionData.language}
                                                            onAdd={value => this.addChip(value, "language")}
                                                            onDelete={(chip, index) => this.removeChip(chip, index, "language")}
                                                            variant="outlined"
                                                            disableUnderline={true}
                                                            allowDuplicates={false}
                                                            newChipKeyCodes={[9, 13, 187, 188]}
                                                            disabled={numberOfJoineesEnrolled > 0 ? true : false}
                                                        />
                                                    </div>
                                                    {this.validator.message('Language', sessionData.language, 'required')}
                                                </div>
                                            </div>
                                            <div className="col-lg-6  col-md-6 col-sm-12">
                                                <div className="form-group padRight">
                                                    <label htmlFor="uname1">Session Description Tags</label>
                                                    <div className="form-control commonInputField">
                                                        <ChipInput
                                                            value={sessionData.sessionTags}
                                                            onAdd={value => this.addChip(value, "sessionTags")}
                                                            onDelete={(chip, index) => this.removeChip(chip, index, "sessionTags")}
                                                            variant="outlined"
                                                            allowDuplicates={false}
                                                            disabled={numberOfJoineesEnrolled > 0 ? true : false}
                                                            newChipKeyCodes={[9, 13, 187, 188]}
                                                        />
                                                    </div>
                                                    {this.validator.message('Session description tags', sessionData.sessionTags, 'required')}
                                                </div>
                                            </div>


                                        </div>

                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 col-sm-12 mt-4 text-right">
                                                <button className="btn btn-blue" type="button" onClick={() => history.goBack()}>Back</button>
                                                <button className="btn btn-blue" onClick={this.preValidateCreateSession}>Save</button>
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
                {this.state.showPreviewData && <SessionSeriesPreview data={this.state.previewData} submit={() => this.createSession()} close={() => this.cancelPreview()}></SessionSeriesPreview>}
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
            showAlert: bindActionCreators(actions.showAlert, dispatch),
            changeUserMode: bindActionCreators(actions.changeUserMode, dispatch)
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(CreateSession);
