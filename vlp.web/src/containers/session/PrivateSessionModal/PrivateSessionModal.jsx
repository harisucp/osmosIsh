import React, { Component, Fragment } from "react";
import ReactDOM from "react-dom";
import { Modal, Table, InputGroup } from "react-bootstrap";
import SimpleReactValidator from "simple-react-validator";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { apiService } from "../../../services/api.service";
import Select from "react-select";
import moment from "moment";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../../../store/actions";
import Switch from "@material-ui/core/Switch";
import AddHours from "./AddTime";
import { de } from "date-fns/locale";
import { TimezonePicker } from "baseui/timezonepicker";
import Loader from "react-loaders";
import { FormControl } from "baseui/form-control";
import { SIZE } from "baseui/input";

class PrivateSessionModal extends Component {
  constructor(props) {
    super(props);
    let { auth, match } = this.props;

    this.state = {
      privateSessionAvailableDays: [],
      tutorProfileData: {
        privateSession: "N",
        FeePerHours: 0,
        selectedSessionCategory: [],
        PrivateSessionTimeZone: "",
      },
      sessionCategories: [],
      getDataInprogress: false,
      loading: false,
    };
    this.validator = new SimpleReactValidator({
      messages: {
        min: `The minimum hourly fee is $10.`,
      },
    });
  }
  // handle click event of the Add button
  handleAddHours = (index) => {
    const { privateSessionAvailableDays } = this.state;
    let privateSessionAvailableArr = privateSessionAvailableDays[index];
    let privateSessionAvailableDaySlotsArray =
      privateSessionAvailableArr["PrivateSessionAvailableDaySlots"];
    let lastRecordOfArray = privateSessionAvailableDaySlotsArray[privateSessionAvailableDaySlotsArray.length - 1];
    let startTime = moment(`1999-09-09 ${lastRecordOfArray.End}`.replace(/-/g, "/")).format("hh:mm a");
    let endTime = moment(`1999-09-09 ${startTime}`.replace(/-/g, "/")).add(1, 'hours').format("hh:mm a");
    privateSessionAvailableDaySlotsArray.push({
      Start: startTime,
      End: endTime,
    });
    this.setState({ privateSessionAvailableDays });
  };

  // handle click event of the Remove button
  handleRemoveClick = (index, name) => {
    console.log(index, name);
    const list = this.state.privateSessionAvailableDays;
    let arr = list[name]["PrivateSessionAvailableDaySlots"];
    arr.splice(index, 1);
    this.setState({ privateSessionAvailableDays: list });
  };


  checkTimeAvailability(selectedTime, existingTimeSlots, selectedIndex, name) {
    console.log(selectedTime, existingTimeSlots);
    for (const [index, timeSlot] of existingTimeSlots.entries()) {
      // const start = moment(timeSlot.Start, "h:mma").unix();
      const prevStart = existingTimeSlots[selectedIndex-1] && moment(existingTimeSlots[selectedIndex-1]?.Start, "h:mma").unix();
      const nextStart = existingTimeSlots[selectedIndex+1] && moment(existingTimeSlots[selectedIndex+1]?.Start, "h:mma").unix();
      // const end = moment(timeSlot.End, "h:mma").unix();
      const prevEnd = existingTimeSlots[selectedIndex-1] && moment(existingTimeSlots[selectedIndex-1]?.End, "h:mma").unix();
      const nextEnd = existingTimeSlots[selectedIndex+1] && moment(existingTimeSlots[selectedIndex+1]?.End, "h:mma").unix();
      const selected = moment(selectedTime, "h:mma").unix();
      // console.log(index, selectedIndex, timeSlot.Start, start, nextStart, timeSlot.End, end, nextEnd, selectedTime, selected);
        if(index !== selectedIndex && ((name == 'Start' && (prevStart && selected <= prevStart) || (prevEnd && selected < prevEnd)) || (name == 'End' && (nextStart && selected > nextStart) && (nextEnd && selected >= nextEnd)))){
        // console.log('in if');
        return true;
      }
      // if (moment(selectedTime, "h:mma").isBefore(moment(start, "h:mma")) || moment(selectedTime, "h:mma").isBefore(moment(end, "h:mma"))) {
      //   console.log('in if');
      //   return true;
      // }
    }
    return false;
  }

  // handle input change
  handleChange = (e, index, day_name, name) => {
    console.log(e, index, day_name, name);
    const list = JSON.parse(
      JSON.stringify(this.state.privateSessionAvailableDays)
    );
    const tempList = JSON.parse(
      JSON.stringify(this.state.privateSessionAvailableDays)
    );
    // console.log({ list }, { tempList });

    const { tutorProfileData } = this.state;
    if (name) {
      if (e === null) {
        list[day_name]["PrivateSessionAvailableDaySlots"][index][name] = "";
      } else {
        if (tempList[day_name]["PrivateSessionAvailableDaySlots"].length > 1) {
          let duplicateCheck = this.checkTimeAvailability(moment(
            e
          ).format("hh:mm a"), tempList[day_name]["PrivateSessionAvailableDaySlots"], index, name);
          // console.log(duplicateCheck, 'dup');
          if (duplicateCheck) {
            this.props.actions.showAlert({
              message: "You cannot add one slot multiple time",
              variant: "error",
            });
          } else {
            list[day_name]["PrivateSessionAvailableDaySlots"][index][name] = moment(
              e
            ).format("hh:mm a");
          }
        } else {
          list[day_name]["PrivateSessionAvailableDaySlots"][index][name] = moment(
            e
          ).format("hh:mm a");
        }
        // list[day_name]["PrivateSessionAvailableDaySlots"][index][name] = moment(
        //   e
        // ).format("hh:mm a");
      }
      let startTime =
        list[day_name]["PrivateSessionAvailableDaySlots"][index]["Start"];
      let endTime =
        list[day_name]["PrivateSessionAvailableDaySlots"][index]["End"];

      startTime = moment(`1999-09-09 ${startTime}`.replace(/-/g, "/")).format("h:mma");
      endTime = moment(`1999-09-09 ${endTime}`.replace(/-/g, "/")).format("h:mma");
      // console.log(list);
      if (moment(startTime, "h:mma").isBefore(moment(endTime, "h:mma"))) {
        this.setState({ privateSessionAvailableDays: list });
        console.log("Correct. Start Time is below End Time");
      } else {
        this.props.actions.showAlert({
          message: "Start time can't be greater than or equal to end time",
          variant: "error",
        });
      }
    } else {
      if (e.target.type === "checkbox") {
        if (e.target.name === "privateSession") {
          tutorProfileData[e.target.name] = e.target.checked ? "Y" : "N";
          this.setState({ tutorProfileData });
        } else {
          list[index]["Opened"] = e.target.checked;
          list[index]["PrivateSessionAvailableDaySlots"] = [
            { Start: "09:00 am", End: "10:00 am" },
          ];
          this.setState({ privateSessionAvailableDays: list });
        }
      }
      if (e.target.name === "FeePerHours") {
        tutorProfileData[e.target.name] =
          e.target.value !== "" ? Number(e.target.value) : "";
        this.setState({ tutorProfileData });
      }
    }
  };

  // Calling Get data the for Private Session Available Day Slots.
  getPrivateSessionAvailableDaySlots = (teacherId) => {
    if (teacherId) {
      apiService
        .post("UNAUTHORIZEDDATA", {
          data: { TeacherId: teacherId },
          keyName: "GetPrivateSessionAvailableDaySlots",
        })
        .then((response) => {
          if (response.Data) {
            let PrivateSessionAvailableDaySlots = response.Data.ResultDataList;
            const { tutorProfileData } = this.state;
            let PrivateSessionAvailable;
            if (PrivateSessionAvailableDaySlots.length > 0) {
              if (
                PrivateSessionAvailableDaySlots[0].PrivateSessionAvailableDays ===
                null
              ) {
                PrivateSessionAvailable = [
                  {
                    Day: "Sunday",
                    Opened: false,
                    PrivateSessionAvailableDaySlots: [{ Start: "", End: "" }],
                  },
                  {
                    Day: "Monday",
                    Opened: false,
                    PrivateSessionAvailableDaySlots: [{ Start: "", End: "" }],
                  },
                  {
                    Day: "Tuesday",
                    Opened: false,
                    PrivateSessionAvailableDaySlots: [{ Start: "", End: "" }],
                  },
                  {
                    Day: "Wednesday",
                    Opened: false,
                    PrivateSessionAvailableDaySlots: [{ Start: "", End: "" }],
                  },
                  {
                    Day: "Thursday",
                    Opened: false,
                    PrivateSessionAvailableDaySlots: [{ Start: "", End: "" }],
                  },
                  {
                    Day: "Friday",
                    Opened: false,
                    PrivateSessionAvailableDaySlots: [{ Start: "", End: "" }],
                  },
                  {
                    Day: "Saturday",
                    Opened: false,
                    PrivateSessionAvailableDaySlots: [{ Start: "", End: "" }],
                  },
                ];
              } else {
                PrivateSessionAvailable = JSON.parse(
                  PrivateSessionAvailableDaySlots[0].PrivateSessionAvailableDays
                );
                PrivateSessionAvailable.map((item, i) => {
                  if (item.PrivateSessionAvailableDaySlots)
                    item.PrivateSessionAvailableDaySlots.map((slot, j) => {
                      console.log(slot.Start);
                      slot.Start = "09:00 am";
                      slot.End = "10:00 am";
                      console.log(slot);
                    })
                })

              }
              tutorProfileData["privateSession"] =
                PrivateSessionAvailableDaySlots[0]["PrivateSession"];
              tutorProfileData["FeePerHours"] =
                PrivateSessionAvailableDaySlots[0]["FeePerHours"];
              tutorProfileData["selectedSessionCategory"] =
                PrivateSessionAvailableDaySlots[0]["PrivateSessionCategories"] !==
                  null
                  ? PrivateSessionAvailableDaySlots[0]["PrivateSessionCategories"]
                    .split(",")
                    .map((e) => parseInt(e))
                  : [];
              tutorProfileData["PrivateSessionTimeZone"] =
                PrivateSessionAvailableDaySlots[0]["PrivateSessionTimeZone"];

              this.setState({
                privateSessionAvailableDays: PrivateSessionAvailable,
                tutorProfileData,
              });
            }
          }
        });
    }
  };

  AddColumn = (name, index) => {
    const list = this.state.privateSessionAvailableDays;
    let opened = list[index]["Opened"];
    let privateSessionAvailableDaySlots =
      list[index]["PrivateSessionAvailableDaySlots"];
    let day = list[index]["Day"];
    return (
      <Fragment>
        <th scope="row">{day}</th>
        <td>
          <FormControlLabel
            control={
              <Switch
                checked={opened}
                onChange={(e) => {
                  this.handleChange(e, index, name);
                }}
                name={list.day}
                // color="#30648a"
                color="secondary"
              />
            }
          />
        </td>
        <td>
          {opened && (
            <AddHours
              list={privateSessionAvailableDaySlots}
              day_index={index}
              handleRemoveClick={this.handleRemoveClick}
              handleChange={this.handleChange}
              handleAddHours={this.handleAddHours}
            />
          )}
        </td>
      </Fragment>
    );
  };

  componentWillReceiveProps = () => {
    if (!this.props.showPrivateSessionModal) {
      this.getSessionCategories();
      this.getPrivateSessionAvailableDaySlots(this.props.teacherId);
    }
  };

  getSessionCategories = () => {
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
              this.setState({
                sessionCategories: response.Data.ResultDataList,
              });
            }
          }
          this.setState({ loading: false });
        },
        (error) =>
          this.setState((prevState) => {
            console.log(`SessionCategories:${error}`);
            this.props.actions.showAlert({
              message: error.Message,
              variant: "error",
            });
            this.setState({ loading: false });
          })
      );
  };

  handleApply = () => {
    if (this.validator.allValid() === false) {
      this.validator.showMessages();
      this.forceUpdate();
      return false;
    }
    const { privateSessionAvailableDays, tutorProfileData } = this.state;
    // Check slots are selected or not
    let isSlotAvailable = false;
    privateSessionAvailableDays.map((item) => {
      if (item.Opened === true) {
        isSlotAvailable = true;
      }
    });
    if (isSlotAvailable === false) {
      this.props.actions.showAlert({
        message: "Atleast one slot is required to select.",
        variant: "error",
      });
      return false;
    }
    //
    let PrivateSessionAvailable = tutorProfileData.privateSession;
    let TutorFeePerHours = tutorProfileData.FeePerHours;
    let PrivateSessionCategories = tutorProfileData.selectedSessionCategory.toString();
    let PrivateSessionTimeZone = tutorProfileData.PrivateSessionTimeZone;
    let data = {
      teacherId: this.props.teacherId,
      actionPerformedBy: "Admin",
      PrivateSession: PrivateSessionAvailable,
      FeePerHours: TutorFeePerHours,
      PrivateSessionCategories: PrivateSessionCategories,
      PrivateSessionTimeZone: PrivateSessionTimeZone,
    };

    this.setState({ loading: true });
    if (PrivateSessionAvailable === "Y") {
      data["PrivateSessionAvailableDays"] = privateSessionAvailableDays.map(
        (item, index) => {
          return {
            Day: item.Day,
            Opened: item.Opened,
            PrivateSessionAvailableDaySlots: item.PrivateSessionAvailableDaySlots
              ? item.PrivateSessionAvailableDaySlots.map((time, index) => {
                if (item.Opened === false) {
                  return null;
                } else if (time.Start === "" && time.End === "") {
                  return null;
                } else {
                  return time;
                }
              })
              : null,
          };
        }
      );
    } else {
      data["PrivateSessionAvailableDays"] = null;
    }
    apiService.post("CREATEUPDATEPRIVATESESSIONAVAILABLESLOTS", data).then(
      (response) => {
        this.setState({ loading: false });
        this.props.actions.showAlert({
          message: response.Message,
          variant: "success",
        });
        this.handleClose();
      },
      (error) => {
        this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
        this.setState({ loading: false });
      }
    );
  };
  handleTagSelect = (opt, { action, removedValue }) => {
    const { tutorProfileData } = this.state;
    switch (action) {
      case "select-option": {
        tutorProfileData.selectedSessionCategory.push(
          opt[opt.length - 1].value
        );
        break;
      }
      case "remove-value": {
        tutorProfileData.selectedSessionCategory = tutorProfileData.selectedSessionCategory.filter(
          (item) => item !== removedValue.value
        );
        break;
      }
    }
    this.setState({ tutorProfileData });
  };
  componentDidUpdate(nextProps, nextState) {
    if (
      this.props.PrivateSessionTimeZone !== nextProps.PrivateSessionTimeZone
    ) {
      this.setState({
        tutorProfileData: {
          ...this.state.tutorProfileData,
          PrivateSessionTimeZone: this.props.PrivateSessionTimeZone,
        },
      });
    }
  }

  handleClose = () => {
    this.props.handleClose();
    this.setState({
      tutorProfileData: {
        ...this.state.tutorProfileData,
        privateSession: "N",
        FeePerHours: 0,
        selectedSessionCategory: [],
        PrivateSessionTimeZone: "",
      },
      privateSessionAvailableDays: [],
      sessionCategories: [],
    });
  };
  render() {
    const {
      privateSessionAvailableDays,
      tutorProfileData,
      getDataInprogress,
      sessionCategories,
      loading,
    } = this.state;
    let categoryOptions = [];
    sessionCategories.map((item) => {
      categoryOptions.push({
        value: item.SessionCategoryId,
        label: item.SessionCategoryName,
      });
    });

    return (
      <Fragment>
        <Modal
          show={this.props.showPrivateSessionModal}
          onHide={this.handleClose}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          className="private-session-modal"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Private Session Availability Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-lg-6 col-md-6 col-sm-6">
                <div className="form-group apsCheckbox">
                  <label htmlFor="uname1">Is Available</label>
                  <input
                    type="checkbox"
                    className="form-control"
                    name="privateSession"
                    onChange={this.handleChange}
                    checked={
                      tutorProfileData.privateSession === "Y" ? true : false
                    }
                  />
                </div>
              </div>

              {tutorProfileData &&
                tutorProfileData.privateSession === "Y" &&
                !getDataInprogress && (
                  <Fragment>
                    <div className="col-lg-6  col-md-6 col-sm-12">
                      <div className="form-group padRight">
                        <label htmlFor="uname1">Hourly Fee</label>
                        <InputGroup>
                          <InputGroup.Prepend>
                            <InputGroup.Text>$</InputGroup.Text>
                          </InputGroup.Prepend>
                          <input
                            type="number"
                            name="FeePerHours"
                            value={tutorProfileData.FeePerHours}
                            onChange={this.handleChange}
                            min="10"
                            className="form-control"
                            placeholder="Hourly Fee in USD $"
                          />
                        </InputGroup>
                        {this.validator.message(
                          "Hourly Fee",
                          tutorProfileData.FeePerHours,
                          "required|integer|min:10,num"
                        )}
                      </div>
                    </div>
                    <div className="col-lg-12  col-md-12 col-sm-12">
                      <div className="form-group padleft">
                        <label htmlFor="uname1">Category</label>
                        <Select
                          isMulti
                          name="selectedSessionCategory"
                          value={tutorProfileData.selectedSessionCategory.map(
                            (item) => {
                              return categoryOptions.filter(
                                (obj) => obj.value === item
                              )[0];
                            }
                          )}
                          closeMenuOnSelect={false}
                          isClearable={false}
                          onChange={this.handleTagSelect}
                          options={categoryOptions}
                        />
                        {this.validator.message(
                          "selectedSessionCategory",
                          tutorProfileData.selectedSessionCategory,
                          "required"
                        )}
                      </div>
                    </div>
                    <div className="col-lg-12  col-md-12 col-sm-12">
                      <div className="form-group padleft">
                        <label htmlFor="uname1">Time Zone</label>
                        <TimezonePicker
                          value={tutorProfileData.PrivateSessionTimeZone}
                          onChange={(e) => this.props.handleTimezoneChange(e)}
                          size={SIZE.mini}
                          date={new Date()}
                        />
                        {this.validator.message(
                          "Time Zone",
                          tutorProfileData.PrivateSessionTimeZone,
                          "required"
                        )}
                      </div>
                    </div>
                  </Fragment>
                )}
            </div>
            {tutorProfileData && tutorProfileData.privateSession === "Y" && (
              <Table borderless>
                <tbody>
                  {privateSessionAvailableDays.map((item, index) => {
                    return <tr key={index}>{this.AddColumn(item.day, index)}</tr>;
                  })}
                </tbody>
              </Table>
            )}
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-blue" onClick={this.handleClose}>
              Cancel
            </button>
            <button className="btn btn-blue" onClick={this.handleApply}>
              Apply
            </button>
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
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      showAlert: bindActionCreators(actions.showAlert, dispatch),
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivateSessionModal);
