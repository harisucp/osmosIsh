import React from "react";
import { Modal } from "react-bootstrap";
import Datetime from "react-datetime";
import TimePicker from "rc-time-picker";
import { commonFunctions } from "../../shared/components/functional/commonfunctions";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import Button from "@material-ui/core/Button";
import moment from "moment";
const EditSeriesModal = ({
  onShow,
  onClose,
  onChange,
  getTimeFromMins,
  seriesData,
  editSession,
  startDateTimeFormatInModel,
}) => {
  return (
    <Modal
      show={onShow}
      onHide={onClose}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="sign-up-title">Edit Session Modal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12">
            <div className="form-group">
              <label>Start Date Time</label>
              <div className="form-control commonInputField">
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <DateTimePicker
                    variant="inline"
                    inputVariant="outlined"
                    value={
                      startDateTimeFormatInModel
                        ? commonFunctions.convertUtcToAnotherTimezone(
                            seriesData.StartDateTime,
                            seriesData.timeZone
                          )
                        : seriesData.StartDateTime
                    }
                    autoOk={true}
                    minutesStep={15}
                    name="StartTimeDate"
                    minDate={new Date()}
                    onChange={(e) => onChange(e, "StartTimeDate")}
                    format="MM/dd/yyyy hh:mm a"
                  />
                </MuiPickersUtilsProvider>
              </div>
            </div>
          </div>
          <div className="col-lg-12 col-md-12 col-sm-12">
            <div className="form-group">
              <label>Duration</label>
              <TimePicker
                showSecond={false}
                minuteStep={15}
                value={getTimeFromMins(seriesData.Duration)}
                style={{ width: "100%" }}
                name={"Duration"}
                onChange={(e) => onChange(e, "Duration")}
              />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={editSession}
          color="primary"
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default EditSeriesModal;
