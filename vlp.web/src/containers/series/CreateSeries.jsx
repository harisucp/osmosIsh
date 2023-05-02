import React, { Component, Fragment } from "react";
import { apiService } from "../../services/api.service";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import Loader from "react-loaders";
import "swiper/css/swiper.css";
import Select from "react-select";
import ChipInput from "material-ui-chip-input";
import SimpleReactValidator from "simple-react-validator";
import moment from "moment";
// import TimezoneSelect from 'react-timezone-select';
import { TimezonePicker } from "baseui/timezonepicker";
import { FormControl } from "baseui/form-control";
import { SIZE } from "baseui/input";
import { confirmAlert } from 'react-confirm-alert';
//Filepond
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImageValidateSize from 'filepond-plugin-image-validate-size';
import "filepond/dist/filepond.min.css";
import { APP_URLS } from "../../config/api.config";
//-- Datetime Picker
import DateFnsUtils from "@date-io/date-fns";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { PUBLIC_URL } from "../../config/api.config";
import { history } from "../../helpers/history";
import "rc-time-picker/assets/index.css";
import TimePicker from "rc-time-picker";
import { localStorageService } from "../../services/localStorageService";
import SessionSeriesPreview from "../common/SessionSeriesPreview";
registerPlugin(FilePondPluginFileValidateType, FilePondPluginImageValidateSize);
class CreateSeries extends Component {
  constructor(props) {
    super(props);
    let { auth, match } = this.props;

    this.state = {
      seriesData: {
        seriesId: match.params.SeriesId > 0 ? match.params.SeriesId : -1,
        seriesTitle: "",
        seriesCategoryId: "",
        description: "",
        image: [],
        video: "",
        numberOfJoineesAllowed: "",
        duration: moment.utc().hours(0).minutes(30),
        seriesFee: "",
        startDateTime: moment().add(2, "hours").minutes(0),
        language: [],
        teacherId: this.props.auth.user.TeacherId,
        timeZone: "",
        seriesTags: [],
        numberOfSessions: "",
        repeat: "",
        selectedWeekDays: [],
        actionPerformedBy: auth.user.FirstName,
        isImageUpdated: false,
        copySeriesId: 0
      },
      seriesCategories: [],
      seriesDetail: [],
      timeZoneCategories: [],
      sessionDetail: [],
      loading: false,
      showImage: false,
      previewData: {},
      showPreviewData: false,
      copySeries: match.params.copyseries === "true" ? true : false,
      showRatioError: false
    };
    this.validator = new SimpleReactValidator({
      messages: {
        // min: `As per the number of sessions entered, minimum series fee should be $${this.state.seriesData.numberOfSessions > 0 ? this.state.seriesData.numberOfSessions * 2 : 2}.`,
      }
    });
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleTagSelect = this.handleTagSelect.bind(this);
    this.addChip = this.addChip.bind(this);
    this.removeChip = this.removeChip.bind(this);
    this.createSeries = this.createSeries.bind(this);
    this.handleDateControls = this.handleDateControls.bind(this);
  }

  componentDidMount = () => {
    const { auth } = this.props;
    if (auth.user.IsProfileUpdated === "N" || auth.user.IsProfileUpdated === null) {
      this.props.actions.showAlert({
        message: "Please add details to your profile in order to continue.",
        variant: "info",
      });
      history.push(`${PUBLIC_URL}/CreateTutor`);
    }
    localStorageService.updateUserMode("tutor");
    this.props.actions.changeUserMode("tutor");
    this.getSeriesCategories();
    this.getTimeZoneCategories();
    if (this.state.seriesData.seriesId > 0) {
      this.getSeriesDetails();
    }
  };

  // Api calls
  getSeriesCategories = () => {
    this.setState({ loading: true });
    apiService
      .post("UNAUTHORIZEDDATA", {
        data: { SessionCategoryId: -1 },
        keyName: "GetSessionCategories",
      })
      .then(
        (response) => {
          if (response.Success) {
            if (
              response.Data !== null &&
              Object.keys(response.Data).length > 0 &&
              response.Data.ResultDataList.length > 0
            ) {
              this.setState({ seriesCategories: response.Data.ResultDataList });
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

  getTimeZoneCategories = () => {
    this.setState({ loading: true });
    apiService
      .post("UNAUTHORIZEDDATA", {
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
            console.log(`TimeZone categories:${error}`);
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
    apiService
      .post("GETDATA", { data: { SeriesId: this.state.seriesData.seriesId }, KeyName: "SeriesDetail" })
      .then((response) => {
        if (response.Success) {
          if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
            let seriesDetail = response.Data.ResultDataList[0];
            const { seriesData, copySeries } = this.state;
            this.setState({
              seriesData: {
                ...seriesData,
                seriesId: -1,
                seriesTitle: seriesDetail.SeriesTitle,
                seriesCategoryId: seriesDetail.SeriesCategoryId,
                description: seriesDetail.Description,
                agenda: seriesDetail.Agenda,
                image: seriesDetail.Image ? APP_URLS.API_URL + seriesDetail.Image : null,
                copySeriesId: copySeries ? seriesData.seriesId : 0,
                video: seriesDetail.Video,
                numberOfJoineesAllowed: Number(seriesDetail.NumberOfJoineesAllowed),
                seriesFee: Number(seriesDetail.SeriesFee),
                language: seriesDetail.Language ? seriesDetail.Language.split(",") : [],
                teacherId: this.props.auth.user.TeacherId,
                timeZone: seriesDetail.TimeZone,
                seriesTags: seriesDetail.SeriesTags ? seriesDetail.SeriesTags.split(",") : [],
                actionPerformedBy: seriesDetail.CreatedBy,
                numberOfSessions: Number(seriesDetail.SessionCount),
              },
              showImage: seriesDetail.Image ? true : false,
            });
            const count = Number(seriesDetail.SessionCount);
            this.validator = new SimpleReactValidator({
              messages: {
                // min: `As per the number of sessions entered, minimum series fee should be $${count > 0 ? count * 2 : 2}.`,
              }
            });
          }
        } else {
          this.props.actions.showAlert({ message: response.Message, variant: "error" });
        }
        this.setState({ loading: false });
      },
        (error) =>
          this.setState((prevState) => {
            console.log(`SeriesCategories:${error}`);
            this.props.actions.showAlert({
              message: "Something went wrong...",
              variant: "error",
            });
            this.setState({ loading: false });
          })
      );
  };
  preValidateCreateSeries = () => {

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
            // onClick: () => this.createSeries()
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
      // this.createSeries();
      this.showPreview();
    }

  }

  cancelPreview = () => {
    this.setState({ showPreviewData: false, previewData: {} })
  }

  showPreview = () => {
    if (this.validator.allValid() === false) {
      this.validator.showMessages();
      this.forceUpdate();
      return false;
    }
    const { seriesData } = this.state;
    var formData = {};
    Object.entries(seriesData).map(([key, val]) => {
      if (
        (key === "image" || key === "video") &&
        val !== null &&
        typeof (val) !== "undefined" &&
        val.length > 0
      ) {

        formData[key] = val[0];
      } else if (key === "duration") {
        var d = new Date(moment(val).format("MM/DD/YYYY hh:mm A"));
        var minutes = d.getHours() * 60 + d.getMinutes();
        formData[key] = minutes;
      } else if (key === "startDateTime") {
        // formData.append(key, commonFunctions.convertToFormattedUtc(val, "YYYY-MM-DD hh:mm A"));
        formData[key] =
          moment
            .tz(
              moment(val).format("MM/DD/YYYY h:mm:ss A"),
              "MM/DD/YYYY h:mm:ss A",
              this.state.seriesData.timeZone
            )
            .utc()
            .format("YYYY-MM-DD hh:mm A");
      } else if (key === "description") {
        formData[key] = val !== null ? val : "";
      } else {
        formData[key] = val;
      }
    });

    const userInfo = localStorageService.getUserDetail();
    const newFormData = {
      SessionId: null,
      SeriesId: formData.seriesId,
      Title: formData.seriesTitle,
      Description: formData.description,
      Name: userInfo["FirstName"] + " " + userInfo["LastName"],
      TeacherId: formData.teacherId,
      ImageFile: seriesData.base64file || seriesData.image,
      TeacherImageFile: userInfo.UserImage,
      StartTime: formData.startDateTime,
      Duration: formData.duration,
      Fee: formData.seriesFee,
      TotalSeats: formData.numberOfJoineesAllowed,
      OccupiedSeats: 0,
      TimeZone: formData.timeZone,
      Rating: 0,
      RatingCount: 0,
    }
    this.setState({ previewData: newFormData, showPreviewData: true })
  }

  createSeries = () => {
    if (this.validator.allValid() === false) {
      this.validator.showMessages();
      this.forceUpdate();
      return false;
    }
    const { seriesData } = this.state;
    // if (seriesData.numberOfJoineesAllowed > 16) {
    //   confirmAlert({
    //     message: <label>Up to 16 attendees videos will be displayed on a first-come, first-served basis. If you need to be able to see all of your students, we recommend limiting your session to 16 or less.</label>,
    //     buttons: [
    //       {
    //         label: 'Yes',
    //         onClick: () => { return true; }
    //       },
    //       {
    //         label: 'No',
    //         onClick: () => { return false; }
    //       }
    //     ]
    //   })
    // }
    var formData = new FormData();
    Object.entries(this.state.seriesData).map(([key, val]) => {
      if (
        (key === "image" || key === "video") &&
        val !== null &&
        typeof (val) !== "undefined" &&
        val.length > 0
      ) {
        formData.append(key, val[0]);
      } else if (key === "duration") {
        var d = new Date(moment(val).format("MM/DD/YYYY hh:mm A"));
        var minutes = d.getHours() * 60 + d.getMinutes();
        formData.append(key, minutes);
      } else if (key === "startDateTime") {
        // formData.append(key, commonFunctions.convertToFormattedUtc(val, "YYYY-MM-DD hh:mm A"));
        formData.append(
          key,
          moment
            .tz(
              moment(val).format("MM/DD/YYYY h:mm:ss A"),
              "MM/DD/YYYY h:mm:ss A",
              this.state.seriesData.timeZone
            )
            .utc()
            .format("YYYY-MM-DD hh:mm A")
        );
      } else if (key === "description") {
        formData.append(key, val !== null ? val : "");
      } else {
        formData.append(key, val);
      }
    });
    this.setState({ loading: true });
    console.log(formData);
    apiService.postFile("CREATESERIES", formData).then(
      (response) => {
        if (response.Success) {
          this.props.actions.showAlert({
            message: "Series created Successfully",
            variant: "success",
          });
          history.push(`${PUBLIC_URL}/TutorDashBoard`);
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
  ChangeImage = () => {
    const { seriesData } = this.state;
    seriesData.image = [];
    seriesData.copySeriesId = 0;
    seriesData.isImageUpdated = true;
    this.setState({ showImage: false, seriesData });
  };

  //Handler Fucntions
  handleTextChange = (e) => {
    console.log(e.target.value);
    const { seriesData } = this.state;
    if (e.target.name === "seriesTitle" && e.target.value != '') {
      if (/^[a-zA-Z0-9 ]*[a-zA-Z ]+[a-zA-Z0-9 ]*$/.test(e.target.value)) {
        seriesData[e.target.name] =
          e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
      }
    } else if (e.target.name === "seriesFee") {
      seriesData[e.target.name] =
        e.target.value !== "" ? Number(e.target.value) : "";
    } else {
      seriesData[e.target.name] = e.target.value;
      if (e.target.name === "numberOfSessions") {
        this.validator = new SimpleReactValidator({
          messages: {
            // min: `As per the number of sessions entered, minimum series fee should be $${this.state.seriesData.numberOfSessions > 0
            //   ? this.state.seriesData.numberOfSessions * 2
            //   : 2
            //   }.`,
          },
        });
      }
    }
    this.setState({ seriesData });
  };

  handleDurationChange = (value) => {
    var d = new Date(moment(value).format("MM/DD/YYYY hh:mm A"));
    var minutes = d.getHours() * 60 + d.getMinutes();
    if (minutes > 0) {
      this.setState({
        seriesData: { ...this.state.seriesData, duration: value },
      });
    } else {
      this.setState({
        seriesData: {
          ...this.state.seriesData,
          duration: moment.utc().hours(0).minutes(15),
        },
      });
    }
  };

  handleSelectChange = (opt, meta) => {
    const { seriesData } = this.state;
    if (meta.name === "repeat" && opt.value === "Daily") {
      this.validator = new SimpleReactValidator({
        messages: {
          // min: `As per the number of sessions entered, minimum series fee should be $${this.state.seriesData.numberOfSessions > 0
          //   ? this.state.seriesData.numberOfSessions * 2
          //   : 2
          //   }.`,
        },
      });
    }
    seriesData[meta.name] = opt.value;
    this.setState({ seriesData });
  };

  handleTimezoneChange = (timezone) => {
    const { seriesData } = this.state;
    seriesData.timeZone = timezone.id;
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
    // console.log(fileItems);
    if (!this.state.showRatioError) {
      let { seriesData, isVideoUpdated, isImageUpdated } = this.state;
      if (fileItems[0] && fileItems[0].fileType.search("image") > -1) {
        seriesData.image = fileItems.map((fileItem) => fileItem.file);
        seriesData.video = [];
        // this.converFileToBase64(seriesData.image);
      } else if (fileItems[0] && fileItems[0].fileType.search("video") > -1) {
        seriesData.video = fileItems.map((fileItem) => fileItem.file);
        seriesData.image = [];
      } else {
        seriesData.image = [];
        seriesData.video = [];
      }
      this.setState({ seriesData });
    }

  };

  checkImageRatio = (fileItem) => {
    let that = this;
    var reader = new FileReader();
    reader.readAsDataURL(fileItem.file);
    reader.onloadend = function () {
      //Initiate the JavaScript Image object.
      var image = new Image();

      //Set the Base64 string return from FileReader as source.
      image.src = reader.result;
      //Validate the File Height and Width.
      image.onload = function () {
        var height = this.height;
        var width = this.width;
        var ratio = height / width;
        console.log(ratio);
        if (ratio > 0.6 && ratio < 0.7) {
          return true;
        } else {
          that.setState({
            showRatioError: true
          })
          return false;
        }

      };
    }

  }
  converFileToBase64 = (file) => {
    console.log(file);
    let that = this;
    let imageFile = file[0];
    const { seriesData } = this.state;
    var reader = new FileReader();
    reader.onloadend = function () {
      seriesData.base64file = reader.result
      that.setState({ seriesData });
    }
    if (imageFile) {
      reader.readAsDataURL(imageFile);
    }
  }

  // converFileToBase64 = (file) => {
  //   let that = this;
  //   const { sessionData } = this.state;
  //   var reader = new FileReader();
  //   reader.onloadend = function () {
  //     sessionData.base64file = reader.result
  //     that.setState({ sessionData });
  //   }
  //   reader.readAsDataURL(file[0]);
  // }
  addChip = (value, name) => {
    if (/^[a-zA-Z0-9 ]*[a-zA-Z ]+[a-zA-Z0-9 ]*$/.test(value)) {
      const { seriesData } = this.state;
      seriesData[name].push(value.charAt(0).toUpperCase() + value.slice(1));
      this.setState({ seriesData });
    }

  };

  removeChip = (chip, index, name) => {
    const { seriesData } = this.state;
    seriesData[name].splice(index, 1);
    this.setState({ seriesData });
  };

  handleDateControls = (datetime, name) => {
    const { seriesData } = this.state;
    seriesData[name] = datetime;
    this.setState({ seriesData });
  };

  render() {
    const {
      seriesData,
      seriesCategories,
      timeZoneCategories,
      loading,
    } = this.state;
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

    let weekDaysOptions = [
      { value: "Monday", label: "Monday" },
      { value: "Tuesday", label: "Tuesday" },
      { value: "Wednesday", label: "Wednesday" },
      { value: "Thursday", label: "Thursday" },
      { value: "Friday", label: "Friday" },
      { value: "Saturday", label: "Saturday" },
      { value: "Sunday", label: "Sunday" },
    ];
    let repeatOptions = [
      { value: "Daily", label: "Daily" },
      { value: "Weekly", label: "Weekly" },
      { value: "Monthly", label: "Monthly" },
    ];
    let languageOptions = [];
    return (
      <Fragment>
        <section className="series-Session">
          <div className="container">
            <div className="row">
              <div className="col-lg-12  col-md-12 col-sm-12">
                <div className="resetForm">
                  <h1 className="text-center">Create Series</h1>
                  <div className="grayWrapper">
                    <div className="row">
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label htmlFor="uname1">Title</label>
                          <input
                            type="text"
                            name="seriesTitle"
                            value={seriesData.seriesTitle}
                            onChange={this.handleTextChange}
                            className="form-control"
                            placeholder="Series Title"
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
                          <label htmlFor="uname1">Category</label>
                          <Select
                            styles={{
                              menu: (styles) => ({ ...styles, zIndex: 999 }),
                            }}
                            name="seriesCategoryId"
                            value={categoryOptions.filter(
                              (obj) => obj.value === seriesData.seriesCategoryId
                            )}
                            onChange={this.handleSelectChange}
                            options={categoryOptions}
                            placeholder="Series Category Type"
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
                          <label htmlFor="una me1">Description</label>
                          <textarea
                            className="form-control"
                            name="description"
                            onChange={this.handleTextChange}
                            value={seriesData.description}
                            placeholder="Series Description"
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
                          <label htmlFor="uname1">Add a Cover Photo (1200x800 or 3:2 ratio up to 5mb)</label>
                          {this.state.showImage && (
                            <div className="closeImage" onClick={this.ChangeImage}>
                              <span className="closeButton">
                                <i class="fa fa-times" aria-hidden="true"></i>
                              </span>
                              <img width="" height="" src={seriesData.image} alt="image" />
                            </div>
                          )}
                          {!this.state.showImage && (
                            <FilePond
                              allowFileTypeValidation={true}
                              acceptedFileTypes={["image/png", "image/jpeg"]}
                              allowMultiple={false}
                              onupdatefiles={this.handleFileUpload}
                              imagePreviewHeight="160"
                              allowFileSizeValidation={true}
                              maxFileSize="5MB"
                              labelMaxFileSize="File types allowed: JPG,PNG"
                              labelMaxFileSizeExceeded="Maximum file size is 5MB."
                              imagePreviewFilterItem={this.checkImageRatio}
                            />)
                          }
                          {(!this.state.showImage && this.state.showRatioError) && (
                            <p className="text-danger">Please Try to upload 3:2 ratio Image for Cover</p>
                          )
                          }
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12  col-md-12 col-sm-12">
                        <div className="form-group padRight">
                          <label htmlFor="una me1">Agenda</label>
                          <textarea
                            className="form-control"
                            name="agenda"
                            onChange={this.handleTextChange}
                            value={seriesData.agenda}
                            placeholder="Items to be discussed during session."
                          ></textarea>
                          {this.validator.message(
                            "Agenda",
                            seriesData.agenda,
                            "required"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-12  col-md-12 col-sm-12">
                <div className="resetForm">
                  <h3 className="text-center mt-5">Series Information</h3>
                  <div className="grayWrapper">
                    <div className="row">
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label htmlFor="uname1">Maximum # of students</label>
                          <input
                            type="number"
                            name="numberOfJoineesAllowed"
                            onChange={this.handleTextChange}
                            min="0"
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
                            onBlur={() =>
                              this.validator.showMessageFor("Session Feea")
                            }
                            className="form-control"
                            min="0"
                            placeholder="Series Fee in USD $"
                          />
                          {/* {this.validator.message("Session Fee", seriesData.seriesFee, `required|integer|min:${seriesData.numberOfSessions > 0 ? seriesData.numberOfSessions * 2 : 2},num`)} */}
                          {this.validator.message("Session Fee", seriesData.seriesFee, `required|integer|min:0,num`)}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label htmlFor="uname1">Start Time</label>
                          <div className="form-control commonInputField">
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DateTimePicker
                                autoOk={true}
                                variant="inline"
                                inputVariant="outlined"
                                minDate={new Date()}
                                minutesStep={5}
                                value={seriesData.startDateTime}
                                onChange={(value) => this.handleDateControls(value, "startDateTime")}
                                format="MM/dd/yyyy hh:mm a"
                              />
                            </MuiPickersUtilsProvider>
                            {this.validator.message(
                              "Start Datetime",
                              seriesData.startDateTime,
                              "required"
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padleft">
                          <label htmlFor="uname1">Duration of each class</label>
                          <TimePicker
                            showSecond={false}
                            minuteStep={5}
                            value={seriesData.duration}
                            style={{ width: "100%" }}
                            onChange={this.handleDurationChange}
                          />
                          {this.validator.message(
                            "Series Duration",
                            seriesData.duration,
                            "required"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label htmlFor="uname1">Number of Sessions</label>
                          <input
                            type="number"
                            value={seriesData.numberOfSessions}
                            name="numberOfSessions"
                            onChange={this.handleTextChange}
                            className="form-control"
                            min="1"
                            placeholder="Series Session Count"
                          />
                          {this.validator.message(
                            "Number of Session",
                            seriesData.numberOfSessions,
                            "required"
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padleft">
                          <label htmlFor="uname1">Time Zone</label>
                          <FormControl>
                            <TimezonePicker
                              value={seriesData.timeZone}
                              onChange={(e) => this.handleTimezoneChange(e)}
                              size={SIZE.mini}
                            />
                          </FormControl>
                          {this.validator.message(
                            "Time Zone",
                            seriesData.timeZone,
                            "required"
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label htmlFor="uname1">Repeat</label>
                          <Select
                            styles={{
                              menu: (styles) => ({ ...styles, zIndex: 999 }),
                            }}
                            name="repeat"
                            value={repeatOptions.filter(
                              (obj) => obj.label === seriesData.repeat
                            )}
                            onChange={this.handleSelectChange}
                            options={repeatOptions}
                          />
                          {this.validator.message(
                            "Repeat",
                            seriesData.repeat,
                            "required"
                          )}
                        </div>
                      </div>
                      {seriesData.repeat && seriesData.repeat === "Daily" && (
                        <div className="col-lg-6  col-md-6 col-sm-12">
                          <div className="form-group padleft">
                            <label htmlFor="uname1">Days</label>
                            <Select
                              styles={{
                                menu: (styles) => ({ ...styles, zIndex: 999 }),
                              }}
                              name="selectedWeekDays"
                              isMulti
                              closeMenuOnSelect={false}
                              isClearable={false}
                              value={seriesData.selectedWeekDays.map((item) => {
                                return weekDaysOptions.filter(
                                  (obj) => obj.value === item
                                )[0];
                              })}
                              onChange={this.handleTagSelect}
                              options={weekDaysOptions}
                            />
                            {seriesData.repeat &&
                              seriesData.repeat === "Daily" &&
                              this.validator.message(
                                "Days",
                                seriesData.selectedWeekDays,
                                "required"
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="row">
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label htmlFor="uname1">
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
                              allowDuplicates={false}
                              placeholder=""
                              newChipKeyCodes={[9, 13, 187, 188]}
                            />
                          </div>
                          {this.validator.message(
                            "Language",
                            seriesData.language,
                            "required"
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padleft">
                          <label htmlFor="uname1">
                            Series Description Tags
                          </label>
                          <div className="form-control commonInputField">
                            <ChipInput
                              value={seriesData.seriesTags}
                              onAdd={(value) =>
                                this.addChip(value, "seriesTags")
                              }
                              onDelete={(chip, index) =>
                                this.removeChip(chip, index, "seriesTags")
                              }
                              variant="outlined"
                              allowDuplicates={false}
                              newChipKeyCodes={[9, 13, 187, 188]}
                            />
                          </div>
                          {this.validator.message(
                            "Series description tags",
                            seriesData.seriesTags,
                            "required"
                          )}
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
                          onClick={this.preValidateCreateSeries}
                        >
                          create
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
        </section>
        {this.state.showPreviewData && <SessionSeriesPreview data={this.state.previewData} submit={() => this.createSeries()} close={() => this.cancelPreview()}></SessionSeriesPreview>}
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
export default connect(mapStateToProps, mapDispatchToProps)(CreateSeries);
