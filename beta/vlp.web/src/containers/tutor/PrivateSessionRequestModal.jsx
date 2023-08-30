import React, { Component, Fragment } from "react";
import { Modal } from "react-bootstrap";
import Button from "@material-ui/core/Button";
import Select from "react-select";
import TimePicker from "rc-time-picker";
import SimpleReactValidator from "simple-react-validator";
import DateFnsUtils from "@date-io/date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import { apiService } from "../../services/api.service";
import Loader from "react-loaders";
import moment from "moment";
import { commonFunctions } from "../../shared/components/functional/commonfunctions";
import FormatDateTime from "../../shared/components/functional/DateTimeFormatter";
import { localStorageService } from '../../services/localStorageService';
var weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

class PrivateSessionRequestModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      privateSessionRequestObject: {
        sessionTitle: "",
        categoryId: "",
        selectDate: null,
        duration: moment.utc().hours(0).minutes(15),
        StartTime: "",
        StartTimeUTC: "",
        notes: "",
        loading: false,
      },
      timeSlots: [],
    };
    this.getdisabledHours = this.getdisabledHours.bind(this);
    this.validator = new SimpleReactValidator();
  }


  handleDurationChange = (value) => {
    var d = new Date(moment(value).format("MM/DD/YYYY hh:mm A"));
    var minutes = d.getHours() * 60 + d.getMinutes();
    if (minutes > 0) {
      this.setState({
        privateSessionRequestObject: {
          ...this.state.privateSessionRequestObject,
          duration: value,
        },
      });
    } else {
      this.setState({
        privateSessionRequestObject: {
          ...this.state.privateSessionRequestObject,
          duration: moment.utc().hours(0).minutes(15),
        },
      });
    }
  };
  handleRequestPrivateSession = () => {
    const { privateSessionRequestObject } = this.state;
    if (this.validator.allValid() === false) {
      this.validator.showMessages();
      this.forceUpdate();
      return false;
    } else {
      const { teacherId, auth } = this.props;
      let StartTime = moment(privateSessionRequestObject.StartTime).format(
        "hh:mm a"
      );
      let SelectData = moment(privateSessionRequestObject.selectDate).format(
        "YYYY-MM-DD"
      );
      var d = new Date(
        moment(privateSessionRequestObject.duration).format(
          "MM/DD/YYYY hh:mm a"
        )
      );
      var minutes = d.getHours() * 60 + d.getMinutes();
      let data = {
        studentId: auth.user.StudentId,
        teacherId: teacherId,
        sessionTitle: privateSessionRequestObject.sessionTitle,
        startTime: `${SelectData} ${StartTime}`.replace(/-/g,"/"),
        StartTimeUTC: privateSessionRequestObject.StartTimeUTC,
        duration: parseInt(minutes),
        notes: privateSessionRequestObject.notes,
        actionPerformedBy: auth.user.FirstName,
        SessionCategoryId: privateSessionRequestObject.categoryId,
      };
      this.setState({ loading: true });
      apiService.post("PRIVATESESSIONREQUEST", data).then(
        (response) => {
          if(response.Success){
            this.setState({
              privateSessionRequestObject: {
                ...this.state.privateSessionRequestObject,
                sessionTitle: "",
                categoryId: "",
                selectDate: null,
                duration: moment.utc().hours(0).minutes(15),
                StartTime: "",
                notes: "",
                StartTimeUTC: "",
              },
            });
            this.props.onHide();
            this.props.actions.showAlert({
              message: response.Message,
              variant: "success",
            });
          }else{
            this.props.actions.showAlert({ message: response.Message, variant: "error" });
          }
          this.setState({ loading: false });
        },
        (error) => {
          this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
          this.setState({ loading: false });
        }
      );
    }
  };
  handleChange = (e, name) => {
    const { privateSessionRequestObject } = this.state;
    if (name) {
      if (name === "selectDate") {
        privateSessionRequestObject[name] = e;
        this.getHours();
        privateSessionRequestObject["StartTime"] = "";
      } else {
        privateSessionRequestObject[name] = e.value;
      }
    } else {
      privateSessionRequestObject[e.target.name] = e.target.value;
    }
    this.setState({ privateSessionRequestObject });
  };

  handleStartTimeChange = (e, name) => {
    const { privateSessionRequestObject, timeSlots } = this.state;
    if (timeSlots.length > 0) {
      privateSessionRequestObject[name] = e;
      let StartTime = moment(e).format("hh:mm a");
      let SelectData = moment(privateSessionRequestObject.selectDate).format(
        "YYYY-MM-DD"
      );
      const dateTime = moment(`${SelectData} ${StartTime}`.replace(/-/g,"/")).format(
        "MM/DD/YYYY hh:mm:ss A"
      );
      privateSessionRequestObject["StartTimeUTC"] = moment
        .tz(
          dateTime,
          "MM/DD/YYYY hh:mm:ss A",
          this.props.PrivateSessionTimeZone
        )
        .utc()
        .format("MM/DD/YYYY hh:mm:ss A");
      this.setState({ privateSessionRequestObject });
    } else {
      this.props.actions.showAlert({
        message: "Please select the Select Date field",
        variant: "error",
      });
    }
  };
  disableWeekends = (date) => {
    let disabled;
    if (this.props.PrivateSessionAvailableDaySlots) {
      let disableDays = this.props.PrivateSessionAvailableDaySlots.filter(
        (item) => !item.Opened
      );

      disableDays.map((t) => {
        if (t.Day === weekday[date.getDay()]) {
          disabled = true;
        }
      });
      return disabled;
    }
  };
  getHours = () => {
    const { privateSessionRequestObject } = this.state;
    let times = [];
    this.props.PrivateSessionAvailableDaySlots.map((t) => {
      if (t.Day === weekday[privateSessionRequestObject.selectDate.getDay()]) {
        // t.PrivateSessionAvailableDaySlots.map((item, index) => {
        //   let startTime = new Date(`1999-09-09 ${item.Start}`).getHours();
        //   let endTimes = new Date(`1999-09-09 ${item.End}`).getHours();
        //   for (let i = startTime; i <= endTimes; i++) {
        //     times.push(i);
        //   }
        // });
        this.setState({ timeSlots: t.PrivateSessionAvailableDaySlots });
        //times.push(t.PrivateSessionAvailableDaySlots);
      }
    });
    // this.setState({ timeSlots: times });
  };

  getdisabledHours() {
    const { timeSlots } = this.state;
    var list = [];
    if (timeSlots.length > 0) {
      for (var i = 0; i <= 24; i++) {
        list.push(i);
      }
      timeSlots.map((i) => {
        list = list.filter((item) => item !== i);
      });
    }
    return list;
  }
  handleClose = () => {
    this.props.onHide();
    this.setState({
      privateSessionRequestObject: {
        ...this.state.privateSessionRequestObject,
        sessionTitle: "",
        categoryId: "",
        selectDate: null,
        duration: moment.utc().hours(0).minutes(15),
        StartTime: "",
        StartTimeUTC: "",
        notes: "",
      },
      timeSlots: [],
    });
    this.validator = new SimpleReactValidator();
  };

  render() {
    const { showSessionRequest, categories, userTimezone } = this.props;
    const { privateSessionRequestObject, loading } = this.state;
    return (
      <Fragment>
        <Modal
          show={showSessionRequest}
          onHide={this.handleClose}
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
              <label>Title : </label>
              <input
                type="text"
                name="sessionTitle"
                className="form-control"
                placeholder="Session Title"
                value={privateSessionRequestObject.sessionTitle}
                onChange={this.handleChange}
              />
              {this.validator.message(
                "Session Title",
                privateSessionRequestObject.sessionTitle,
                "required|max:200"
              )}
            </div>
            <div className="categoryControl">
              <label>Category : </label>
              <Select
                name="categoryId"
                placeholder="Choose Private Session Category"
                value={categories.filter(
                  (obj) => obj.value === privateSessionRequestObject.categoryId
                )}
                onChange={(e) => {
                  this.handleChange(e, "categoryId");
                }}
                options={categories}
                onBlur={() => this.validator.showMessageFor("fullName")}
              />
              {this.validator.message(
                "Category ",
                privateSessionRequestObject.categoryId,
                "required"
              )}
            </div>

            <div className="categoryControl">
              <label>Select Date : </label>
              <MuiPickersUtilsProvider
                className="fullWidthField"
                utils={DateFnsUtils}
              >
                <DatePicker
                  // label="Basic example"
                  // disablePast
                  minDate={commonFunctions.convertUtcToAnotherTimezone(
                    new Date(),
                    this.props.PrivateSessionTimeZone,
                    "MM/DD/YYYY"
                  )}
                  // defaultValue={commonFunctions.convertUtcToAnotherTimezone(new Date(), this.props.PrivateSessionTimeZone, "MM/DD/YYYY")}
                  value={privateSessionRequestObject.selectDate}
                  className="form-control"
                  onChange={(e) => {
                    this.handleChange(e, "selectDate");
                  }}
                  shouldDisableDate={this.disableWeekends}
                />
              </MuiPickersUtilsProvider>
              {this.validator.message(
                "Start Date",
                privateSessionRequestObject.selectDate,
                "required"
              )}
            </div>
            <div className="categoryControl">
              {this.state.timeSlots && this.state.timeSlots.length > 0 && (
                <div>
                  Private Session Availablility as per
                  <b>
                    {" "}
                    (
                    {this.props.PrivateSessionTimeZone && moment().tz(this.props.PrivateSessionTimeZone).format("z")}
                    ){" "}
                  </b>{" "}
                  timezone.
                </div>
              )}
              {this.state.timeSlots &&
                this.state.timeSlots.map((time, index) => {
                  return (
                    <Fragment key={index}>
                      <div
                        class=""
                        style={{
                          width: "100%",
                        }}
                      >
                        {index + 1}.)
                          {" "}
                        <FormatDateTime
                          date={new Date(`1999-09-09 ${time.Start}`.replace(/-/g,"/"))}
                          format="hh:mm A"
                        />
                        {" "}
                        -{" "}
                        <FormatDateTime
                          date={new Date(`1999-09-09 ${time.End}`.replace(/-/g,"/"))}
                          format="hh:mm A"
                        />
                      </div>
                    </Fragment>
                  );
                })}
            </div>
            <div className="categoryControl">
              <label>
                Start Time{" "}
                <b>
                  ({this.props.PrivateSessionTimeZone && moment().tz(this.props.PrivateSessionTimeZone).format("z")}
                  )
                </b>{" "}
                :{" "}
              </label>
              <TimePicker
                showSecond={false}
                //disabledHours={this.getdisabledHours}
                hideDisabledOptions
                minuteStep={15}
                value={privateSessionRequestObject.StartTime}
                style={{ width: "100%", marginRight: "10px" }}
                defaultValue={privateSessionRequestObject.StartTime}
                onChange={(e) => this.handleStartTimeChange(e, "StartTime")}
                use12Hours
                minDate={new Date()}
              />
              {this.validator.message(
                "Start Time",
                privateSessionRequestObject.StartTime,
                "required"
              )}
            </div>
            <div>
              <label>
                Start Time as per{" "}
                {/* <b>({moment().tz(moment.tz.guess(true)).format("z")})</b> :{" "} */}
                <b>({userTimezone})</b> :{" "}
              </label>
              <span>
                {" "}
                {privateSessionRequestObject.StartTimeUTC &&
                  moment(
                    commonFunctions.getUtcDate(
                      privateSessionRequestObject.StartTimeUTC
                    )
                  ).format("MMM DD, YYYY hh:mm A")}
              </span>
            </div>

            <div className="categoryControl">
              <label>Duration :</label>
              <TimePicker
                showSecond={false}
                minuteStep={15}
                value={privateSessionRequestObject.duration}
                style={{ width: "100%" }}
                onChange={this.handleDurationChange}
              />
              {this.validator.message(
                "Duration ",
                privateSessionRequestObject.duration,
                "required"
              )}
            </div>
            <div className="categoryControl mt-3">
              <label>Note : </label>
              <textarea
                name="notes"
                value={privateSessionRequestObject.notes}
                onChange={this.handleChange}
              ></textarea>
              {/* {this.validator.message('Notes ', privateSessionRequestObject.notes, 'required')} */}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleClose}
            >
              Close
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleRequestPrivateSession}
            >
              Request Private Session
            </Button>
          </Modal.Footer>
        </Modal>
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
    userTimezone: state.timezone.userTimezone
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
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivateSessionRequestModal);
