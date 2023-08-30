import React, { Component, Fragment } from "react";
import { apiService } from "../../services/api.service";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import { forwardRef } from "react";
import Loader from "react-loaders";
import "swiper/css/swiper.css";
import { APP_URLS } from "../../config/api.config";
import FormatDateTime from "../../shared/components/functional/DateTimeFormatter";
import Select from "react-select";
import ChipInput from "material-ui-chip-input";
import SimpleReactValidator from "simple-react-validator";
import moment from "moment";
import { PUBLIC_URL } from "../../config/api.config";
import { history } from "../../helpers/history";
import DateFnsUtils from "@date-io/date-fns";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import TimePicker from "rc-time-picker";
import "rc-time-picker/assets/index.css";
import { TimezonePicker } from "baseui/timezonepicker";
import { FormControl } from "baseui/form-control";
import { SIZE } from "baseui/input";
//Filepond
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { confirmAlert } from 'react-confirm-alert';
import "filepond/dist/filepond.min.css";
// FIlepond End
import MaterialTable, { MTableBody } from "material-table";
import { commonFunctions } from "../../shared/components/functional/commonfunctions";
import "react-datetime/css/react-datetime.css";
import EditSeriesModal from "./EditSeriesModal";
import { localStorageService } from "../../services/localStorageService";

registerPlugin(FilePondPluginFileValidateType);
class EditSeries extends Component {
  constructor(props) {
    super(props);
    let { auth, match } = this.props;
    this.state = {
      seriesData: {
        seriesId: match.params.SeriesId > 0 ? match.params.SeriesId : 0,
        seriesTitle: "",
        seriesCategoryId: 0,
        description: "",
        agenda: "",
        image: [],
        isImageUpdated: false,
        video: [],
        IsVideoUpdated: false,
        numberOfJoineesAllowed: "",
        seriesFee: "",
        language: [],
        teacherId: 1,
        timeZone: "",
        seriesTags: [],
        actionPerformedBy: auth.user.FirstName,
      },
      sessionCount: 0,
      seriesCategories: [],
      seriesDetail: [],
      timeZoneCategories: [],
      sessionDetail: [],
      loading: false,
      showImage: false,
      numberOfJoineesEnrolled: 0,
      showEditSeriesModal: false,
      startDateTimeFormatInModel: false,
    };
    this.validator = new SimpleReactValidator();
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleTagSelect = this.handleTagSelect.bind(this);
    this.addChip = this.addChip.bind(this);
    this.removeChip = this.removeChip.bind(this);
    this.editSeries = this.editSeries.bind(this);
    this.editSession = this.editSession.bind(this);
    this.handleDateControls = this.handleDateControls.bind(this);
  }
  componentDidMount = () => {
    localStorageService.updateUserMode("tutor");
    this.props.actions.changeUserMode("tutor");
    this.getSeriesCategories();
    this.getTimeZoneCategories();
    this.getSeriesDetails();

  };
  // Api calls ======================

  getSeriesCategories = () => {
    this.setState({ loading: true });
    apiService
      .post("GETDATA", {
        data: { SessionCategoryId: -1 },
        keyName: "GetSessionCategories",
      })
      .then((response) => {
        if (response.Success) {
          if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
            this.setState({ seriesCategories: response.Data.ResultDataList });
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

  getTimeZoneCategories = () => {
    this.setState({ loading: true });
    apiService
      .post("GETDATA", {
        data: { CategoryId: "TimeZones" },
        keyName: "GetGlobalCodesByCategory",
      })
      .then(
        (response) => {
          if (response.Success) {
            if (
              response.Data !== null &&
              Object.keys(response.Data).length > 0 &&
              response.Data.ResultDataList.length > 0
            ) {
              this.setState({
                timeZoneCategories: response.Data.ResultDataList,
              });
            }
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

  getSeriesDetails = () => {
    this.setState({ loading: true });
    apiService.post("GETDATA", { data: { SeriesId: this.state.seriesData.seriesId }, KeyName: "SeriesDetail" })
      .then(
        (response) => {
          if (response.Success) {
            if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
              let seriesDetail = response.Data.ResultDataList[0];
              
              const { seriesData } = this.state;
              this.setState({
                seriesData: {
                  ...seriesData,
                  seriesId: seriesDetail.SeriesId,
                  seriesTitle: seriesDetail.SeriesTitle,
                  seriesCategoryId: seriesDetail.SeriesCategoryId,
                  description: seriesDetail.Description,
                  agenda: seriesDetail.Agenda,
                  image: seriesDetail.Image ? APP_URLS.API_URL + seriesDetail.Image : null,
                  video: seriesDetail.Video,
                  numberOfJoineesAllowed: Number(seriesDetail.NumberOfJoineesAllowed),
                  seriesFee: Number(seriesDetail.SeriesFee),
                  language: seriesDetail.Language ? seriesDetail.Language.split(",") : [],
                  teacherId: this.props.auth.user.TeacherId,
                  timeZone: seriesDetail.TimeZone,
                  seriesTags: seriesDetail.SeriesTags ? seriesDetail.SeriesTags.split(",") : [],
                  actionPerformedBy: seriesDetail.CreatedBy,
                },
                numberOfJoineesEnrolled: seriesDetail.NumberOfJoineesEnrolled,
                sessionDetail: seriesDetail.SessionDetail ? JSON.parse(seriesDetail.SessionDetail) : [],
                sessionCount: seriesDetail.SessionDetail ? Object.entries(JSON.parse(seriesDetail.SessionDetail)).length : 0,
                showImage: seriesDetail.Image ? true : false,
              });
              const count = seriesDetail.SessionDetail ? Object.entries(JSON.parse(seriesDetail.SessionDetail)).length : 0;
              this.validator = new SimpleReactValidator({
                messages: {
                  min: `As per the number of sessions entered, minimum series fee should be $${count > 0 ? count * 2 : 2}.`,
                }
              });
            }
          }else{
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

  preValidateEditSeries = () => {
    if (this.validator.allValid() === false) {
      this.validator.showMessages();
      this.forceUpdate();
      this.props.actions.showAlert({ message: "Please make sure that all required fields have been filled out.", variant: "error" });
      return false;
    }

    const { seriesData } = this.state;
    if (seriesData.numberOfJoineesAllowed > 16) {
      confirmAlert({
        message: <label>Up to 16 attendees videos will be displayed on a first-come, first-served basis. If you need to be able to see all of your students, we recommend limiting your session to 16 or less.</label>,
        buttons: [
          {
            label: 'Okay',
            onClick: () => this.editSeries()
          },
          {
            label: 'Cancel',
            onClick: () => { return false; }
          }
        ]
      })
    }
    else {
      this.editSeries();
    }

  }

  editSeries = () => {
    var formData = new FormData();
    Object.entries(this.state.seriesData).map(([key, val]) => {
      if (
        (key == "image" || key == "video") &&
        val !== null &&
        typeof val !== "undefined"
      ) {
        formData.append(key, val[0]);
      } else if (key === "description") {
        formData.append(key, val !== null ? val : "");
      } else {
        formData.append(key, val);
      }
    });
    this.setState({ loading: true });
    apiService.postFile("UPDATESERIESDETAIL", formData).then(
      (response) => {
        if (response.Success) {
          this.props.actions.showAlert({
            message: "Series updated Successfully",
            variant: "success",
          });
          history.push(`${PUBLIC_URL}/TutorDashboard`);
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
  };

  editSession = () => {
    const {
      Duration,
      SeriesId,
      SessionId,
      StartDateTime,
      TeacherId,
      actionPerformedBy,
      timeZone,
    } = this.state.seriesData;
    this.setState({ loading: true });
    var formData = new FormData();
    const { seriesData } = this.state;

    var removeOffsetDateTime = moment(StartDateTime).format("YYYY-MM-DD HH:mm");
    let seriesUpdateData = {
      Duration: Duration,
      SeriesId: SeriesId,
      SessionId: SessionId,
      StartDateTime: moment
        .tz(removeOffsetDateTime, timeZone)
        .utc()
        .format("YYYY-MM-DD HH:mm"),
      TeacherId: TeacherId,
    };
    formData.append("ActionPerformedBy", actionPerformedBy);
    Object.entries(seriesUpdateData).map(function ([key, val]) {
      formData.append(key, val);
    });
    apiService.postFile("UPDATESERIESSESSIONDETAIL", formData).then(
      (response) => {
        if (response.Success) {
          this.props.actions.showAlert({
            message: "Session Updated Successfully",
            variant: "success",
          });
        }else{
          this.props.actions.showAlert({ message: response.Message, variant: "error" });
        }
        this.setState({ loading: false, showEditSeriesModal: false });
        this.getSeriesDetails();
      },
      (error) =>
        this.setState((prevState) => {
          this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
          this.setState({ loading: false });
        })
    );
  };

  //Handler Fucntions
  handleTextChange = (e) => {
    const { seriesData } = this.state;
    if (e.target.name === "seriesTitle") {
      seriesData[e.target.name] = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
    }
    else if (e.target.name === "seriesFee") {
      seriesData[e.target.name] = e.target.value !== "" ? Number(e.target.value) : "";
      this.validator.showMessageFor("seriesFee");
    }
    else {
      seriesData[e.target.name] = e.target.value;
    }

    this.setState({ seriesData });
  };

  handleSelectChange = (opt, meta) => {
    const { seriesData } = this.state;
    seriesData[meta.name] = opt.value;
    this.setState({ seriesData });
  };

  handleTagSelect = (opt, { action, removedValue }) => {
    const { seriesData } = this.state;
    switch (action) {
      case "select-option": {
        seriesData.selectedWeekDays.push(opt[opt.length - 1].value);
        break;
      }
      case "remove-value": {
        seriesData.selectedWeekDays = seriesData.selectedWeekDays.filter(
          (item) => item !== removedValue.value
        );
        break;
      }
    }
    this.setState({ seriesData });
  };

  handleFileUpload = (fileItems) => {
    let { seriesData } = this.state;
    if (fileItems[0] && fileItems[0].fileType.search("image") > -1) {
      seriesData.image = fileItems.map((fileItem) => fileItem.file);
      seriesData.isImageUpdated = true;
      seriesData.isVideoUpdated = false;
      seriesData.video = [];
    } else if (fileItems[0] && fileItems[0].fileType.search("video") > -1) {
      seriesData.video = fileItems.map((fileItem) => fileItem.file);
      seriesData.isVideoUpdated = true;
      seriesData.isImageUpdated = false;
      seriesData.image = [];
    } else {
      seriesData.image = [];
      seriesData.video = [];
      seriesData.isVideoUpdated = false;
      seriesData.isImageUpdated = false;
    }
    this.setState({ seriesData });
  };
  addChip = (value, name) => {
    const { seriesData } = this.state;
    seriesData[name].push(value.charAt(0).toUpperCase() + value.slice(1));
    this.setState({ seriesData });
  };
  removeChip = (chip, index, name) => {
    const { seriesData } = this.state;
    seriesData[name].splice(index, 1);
    this.setState({ seriesData });
  };
  handleDateControls = (datetime, name) => {
    const { seriesData } = this.state;
    seriesData[name] = moment(datetime).format("YYYY-MM-DD hh:mm A");
    this.setState({ seriesData });
  };

  ChangeImage = () => {
    const { seriesData } = this.state;
    seriesData.image = [];
    seriesData.isImageUpdated = true;
    this.setState({ showImage: false, seriesData });
  };

  getTimeFromMins = (mins) => {
    // do not include the first validation check if you want, for example,
    // getTimeFromMins(1530) to equal getTimeFromMins(90) (i.e. mins rollover)
    if (mins >= 24 * 60 || mins < 0) {
      throw new RangeError(
        "Valid input should be greater than or equal to 0 and less than 1440."
      );
    }
    var h = (mins / 60) | 0,
      m = mins % 60 | 0;
    return moment.utc().hours(h).minutes(m);
  };

  handleTimezoneChange = (timezone) => {
    const { seriesData } = this.state;
    seriesData.timeZone = timezone.id;
    this.setState({ seriesData });
  };
  handleEditSeriesModal = (e, data) => {
    const { seriesData } = this.state;
    if (typeof data !== "undefined" && moment(commonFunctions.convertUtcToAnotherTimezone(data.StartDateTime, seriesData.timeZone)).isBefore(moment(), "second")) {
      this.props.actions.showAlert({
        message: "Session Already Completed",
        variant: "error",
      });
      return false;
    }
    const { showEditSeriesModal } = this.state;
    this.setState({ showEditSeriesModal: !showEditSeriesModal });

    if (!showEditSeriesModal) {
      this.setState({
        seriesData: {
          ...this.state.seriesData,
          Duration: data.Duration,
          SeriesId: data.SeriesId,
          SessionId: data.SessionId,
          StartDateTime: data.StartDateTime,
          TeacherId: data.TeacherId,
        },
        startDateTimeFormatInModel: true,
      });
    }
  };

  handleModalChange = (time, name) => {
    if (name === "StartTimeDate") {
      //let startDateTime = commonFunctions.convertToUtc(time);
      let startDateTime = time;
      this.setState({
        seriesData: { ...this.state.seriesData, StartDateTime: startDateTime },
        startDateTimeFormatInModel: false,
      });
    } else if (name === "Duration") {
      var d = new Date(moment(time).format("MM/DD/YYYY hh:mm A"));
      var minutes = d.getHours() * 60 + d.getMinutes();
      if (minutes > 0) {
        this.setState({
          seriesData: { ...this.state.seriesData, Duration: minutes },
        });
      } else {
        this.setState({
          seriesData: { ...this.state.seriesData, Duration: 15 },
        });
      }
    }
  };

  render() {

    const { seriesData, seriesCategories, timeZoneCategories, showEditSeriesModal, startDateTimeFormatInModel, sessionDetail, loading, numberOfJoineesEnrolled, sessionCount } = this.state;
    let categoryOptions = [];
    seriesCategories.map((item) => {
      categoryOptions.push({
        value: item.SessionCategoryId,
        label: item.SessionCategoryName,
      });
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
                  <h1 className="text-center">Edit Series</h1>
                  <div className="grayWrapper">
                    <div className="row">
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label for="uname1">Title</label>
                          <input
                            type="text"
                            name="seriesTitle"
                            value={seriesData.seriesTitle}
                            onChange={this.handleTextChange}
                            className="form-control"
                            placeholder="Series Title"
                            disabled={
                              numberOfJoineesEnrolled > 0 ? true : false
                            }
                          />
                          {this.validator.message(
                            "Title",
                            seriesData.seriesTitle,
                            "required|max:200"
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padleft">
                          <label for="uname1">Category</label>
                          <Select
                            name="seriesCategoryId"
                            value={categoryOptions.filter(
                              (obj) => obj.value === seriesData.seriesCategoryId
                            )}
                            onChange={this.handleSelectChange}
                            options={categoryOptions}
                            placeholder="Series Category Type"
                            isDisabled={
                              numberOfJoineesEnrolled > 0 ? true : false
                            }
                          />
                          {this.validator.message(
                            "Category",
                            seriesData.seriesCategoryId,
                            "required"
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label for="una me1">Description</label>
                          <textarea
                            className="form-control"
                            name="description"
                            onChange={this.handleTextChange}
                            value={seriesData.description}
                            placeholder="Series Description"
                            disabled={
                              numberOfJoineesEnrolled > 0 ? true : false
                            }
                          ></textarea>
                          {this.validator.message(
                            "Description",
                            seriesData.description,
                            "required"
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padleft">
                          <label htmlFor="uname1">Add File</label>
                          {this.state.showImage && (
                            <div
                              className="closeImage"
                              onClick={this.ChangeImage}
                            >
                              <span className="closeButton">
                                <i class="fa fa-times" aria-hidden="true"></i>
                              </span>
                              <img width="" height=""  src={seriesData.image} alt="image" />
                            </div>
                          )}
                          {!this.state.showImage && (
                            <FilePond
                              allowMultiple={false}
                              acceptedFileTypes={["image/jpeg", "image/png"]}
                              onupdatefiles={this.handleFileUpload}
                              imagePreviewHeight="160"
                              allowFileSizeValidation={true}
                              labelMaxFileSize="File types allowed: JPG,PNG"
                              labelMaxFileSizeExceeded="Maximum file size is 5MB."
                              maxFileSize="5MB"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12  col-md-12 col-sm-12">
                        <div className="form-group padRight">
                          <label for="una me1">Agenda</label>
                          <textarea
                            className="form-control"
                            name="agenda"
                            onChange={this.handleTextChange}
                            value={seriesData.agenda}
                            placeholder="Items to be discussed during session"
                          ></textarea>
                          {this.validator.message("Agenda", seriesData.agenda, "required")}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label htmlFor="uname1">Maximum # of students</label>
                          <input
                            type="number"
                            name="numberOfJoineesAllowed"
                            min="0"
                            onChange={this.handleTextChange}
                            disabled={
                              numberOfJoineesEnrolled > 0 ? true : false
                            }
                            value={seriesData.numberOfJoineesAllowed}
                            className="form-control"
                            placeholder="Maximum # of students"
                          />
                          {this.validator.message(
                            "Maximum # of students",
                            seriesData.numberOfJoineesAllowed,
                            'required|integer|between:1,250,num'
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padleft">
                          <label htmlFor="uname1">Fee for Series (Total)</label>
                          <input
                            type="number"
                            name="seriesFee"
                            value={seriesData.seriesFee}
                            onChange={this.handleTextChange}
                            disabled={numberOfJoineesEnrolled > 0 ? true : false}
                            className="form-control"
                            min="0"
                            placeholder="Series Fee in USD $"
                          />
                          {this.validator.message("seriesFee", seriesData.seriesFee, `required|integer|min:${sessionCount > 0 ? sessionCount * 2 : 2},num`)}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label for="uname1">Time Zone</label>
                          <FormControl>
                            <TimezonePicker value={seriesData.timeZone} onChange={(e) => this.handleTimezoneChange(e)} size={SIZE.mini} disabled={true} />
                          </FormControl>
                          {this.validator.message("Time Zone", seriesData.timeZone, "required")}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padleft">
                          <label for="uname1">
                            Languages Used During Class
                          </label>
                          <div className="form-control commonInputField">
                            <ChipInput
                              value={seriesData.language}
                              onAdd={(value) => this.addChip(value, "language")}
                              onDelete={(chip, index) =>
                                this.removeChip(chip, index, "language")
                              }
                              variant="outlined"
                              disabled={numberOfJoineesEnrolled > 0 ? true : false}
                              allowDuplicates={false}
                              newChipKeyCodes={[9, 13, 187, 188]}
                            />
                            {this.validator.message(
                              "Language",
                              seriesData.language,
                              "required"
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label htmlFor="uname1">
                            Series Description Tags
                          </label>
                          <div className="form-control commonInputField">
                            <ChipInput
                              value={seriesData.seriesTags}
                              onAdd={(value) => this.addChip(value, "seriesTags")}
                              onDelete={(chip, index) => this.removeChip(chip, index, "seriesTags")}
                              variant="outlined"
                              allowDuplicates={false}
                              disabled={numberOfJoineesEnrolled > 0 ? true : false}
                              newChipKeyCodes={[9, 13, 187, 188]}
                            />
                            {this.validator.message("Series description tags", seriesData.seriesTags, "required")}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12 col-md-12 col-sm-12 mt-4 text-right">
                        <button
                          className="btn btn-blue"
                          type="button"
                          onClick={() => history.goBack()}
                        >
                          Back
                        </button>
                        <button
                          className="btn btn-blue"
                          onClick={this.preValidateEditSeries}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-12  col-md-12 col-sm-12">
                  <div className="resetForm">
                    <h3 className="text-center mt-5">Series Information</h3>
                    <div className="grayWrapper">
                      <div className="row">
                        <div className="col-lg-12  col-lg-12 col-lg-12">
                          <div className="responsiveTable">
                            <MaterialTable
                              title="Sessions Information"
                              columns={[
                                {
                                  title: "Start Date Time",
                                  field: "StartDateTime",
                                  render: (rowData) => (
                                    <Fragment>
                                      <div data-testid="td-before" className="tdBefore">
                                        Start Date Time
                                      </div>
                                      {commonFunctions.convertUtcToAnotherTimezone(
                                        rowData.StartDateTime,
                                        seriesData.timeZone
                                      )}
                                    </Fragment>
                                  ),
                                },
                                {
                                  title: "Duration",
                                  field: "Duration",
                                  render: (rowData) => (
                                    <Fragment>
                                      <div
                                        data-testid="td-before"
                                        className="tdBefore"
                                      >
                                        Start Date Time
                                      </div>
                                      {rowData.Duration} min
                                    </Fragment>
                                  ),
                                },
                                {
                                  title: "SeriesId",
                                  field: "SeriesId",
                                  hidden: "true",
                                  render: (rowData) => (
                                    <Fragment>
                                      <div
                                        data-testid="td-before"
                                        className="tdBefore"
                                      >
                                        SeriesId
                                      </div>
                                      {rowData.SeriesId}
                                    </Fragment>
                                  ),
                                },
                                {
                                  title: "TeacherId",
                                  field: "TeacherId",
                                  hidden: "true",
                                  render: (rowData) => (
                                    <Fragment>
                                      <div
                                        data-testid="td-before"
                                        className="tdBefore"
                                      >
                                        TeacherId
                                      </div>
                                      {rowData.TeacherId}
                                    </Fragment>
                                  ),
                                },
                                {
                                  title: "SessionId",
                                  field: "SessionId",
                                  hidden: "true",
                                  render: (rowData) => (
                                    <Fragment>
                                      <div
                                        data-testid="td-before"
                                        className="tdBefore"
                                      >
                                        SessionId
                                      </div>
                                      {rowData.SessionId}
                                    </Fragment>
                                  ),
                                },
                              ]}
                              actions={[
                                {
                                  icon: "edit",
                                  tooltip: "edit",
                                  onClick: (event, rowData) =>
                                    this.handleEditSeriesModal(event, rowData),
                                },
                              ]}
                              data={sessionDetail}
                              options={{
                                pageSize: 5,
                                minBodyHeight: "270px",
                                pageSizeOptions: [5, 10, 25, 50, 100, 200],
                                paging: true,
                              }}
                              components={{
                                Body: (props) => (
                                  <Fragment>
                                    {" "}
                                    {props.renderData && props.renderData.length === 0 ? (<div className="alignCenterExt"> No Records found
                                    </div>
                                    ) : (<MTableBody {...props} />)}
                                  </Fragment>
                                ),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
        <EditSeriesModal
          onShow={showEditSeriesModal}
          seriesData={seriesData}
          onClose={this.handleEditSeriesModal}
          startDateTimeFormatInModel={startDateTimeFormatInModel}
          getTimeFromMins={this.getTimeFromMins}
          onChange={this.handleModalChange}
          editSession={this.editSession}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      showAlert: bindActionCreators(actions.showAlert, dispatch),
      changeUserMode: bindActionCreators(actions.changeUserMode, dispatch)
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(EditSeries);
