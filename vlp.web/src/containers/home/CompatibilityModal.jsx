import React from "react";
import { Modal } from "react-bootstrap";
import Datetime from "react-datetime";
import TimePicker from "rc-time-picker";
import { commonFunctions } from "../../shared/components/functional/commonfunctions";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import Button from "@material-ui/core/Button";
import moment from "moment";
const CompatibilityModal = ({ onShow, onClose }) => {
  return (
    <Modal
      className="welcomeScreen"
      show={onShow}
      onHide={onClose}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="sign-up-title">
          Hello, we have noticed that you are using a web browser which limits
          some of your functionality on Osmos-ish.
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12">
            <h5>Minimum Requirements are as follows:</h5>
            <ul class="requiredList">
              <li>
                - Google Chrome (version 78 and later), for macOS, Windows, and
                Ubuntu LTS 16.04 and later{" "}
              </li>
              <li>
                - Mozilla Firefox (version 60 and later), for macOS and Windows
              </li>
              <li>- IOS (version 10.0 and later)</li>
              <li>
                - Android OS (version 5.0 and later, ARM and ARM64 architecture)
              </li>
              <li>- Opera (version 66 and later), for macOS and Windows</li>
              <li>- Chromium-based Edge (version 79 and later), for Windows</li>
              <li>
                - Chromium-based Electron (Electron 7 and later, with Chromium
                version 78 and later)
              </li>
            </ul>
            <br></br>
            <h5>
              Currently we have identified limitations you may experience using
              your current browser:
            </h5>
            <ul class="requiredList">
              <li>
                - Google Chrome for Android also supported for audio and video
                only (no content sharing){" "}
              </li>
              <li>
                - Safari (version 12, audio and video only, no content sharing),
                for macOS
              </li>
              <li>
                - Safari (version 12.1.1 and later, audio and video only, no
                content sharing), for iOS
              </li>
              <li>
                - Safari (version 13 and later, content sharing with screen
                capture requires turning on the Develop, Experimental Features,
                Screen Capture feature in the browser), for macOS
              </li>
            </ul>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};
export default CompatibilityModal;
