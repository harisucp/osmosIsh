import React, { Component, Fragment } from 'react';
import { Modal } from 'react-bootstrap';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import Button from '@material-ui/core/Button';
import Loader from 'react-loaders';
import OtpInput from 'react-otp-input';

import SimpleReactValidator from 'simple-react-validator';

class Twilio extends Component {
    constructor(props) {
        super(props);
        this.state = {
            otp: "",
            verificationNumber: "",
            showModal: false,
            loading: false,
            interval: null,
            minutes: 0,
            seconds: 0,
            showTimer: false
        }
    }
    handleChange = otp => this.setState({ otp });

    handleClose = () => {
        this.clearCountDown(this.state.interval);
        this.setState({ otp: "" });
        this.props.onTwilioClose(false);
    }

    componentWillReceiveProps = (props) => {
        if (props.showTwilioPoup === true) {
            this.sendPhoneVerificationToken(props.VerificationNumber);
            this.setState({ verificationNumber: props.VerificationNumber });
        }
        else if (props.showTwilioPoup === false) {
            this.setState({ verificationNumber: "", showModal: false });
        }
    };

    sendPhoneVerificationToken = (phoneNumber) => {
        const { auth } = this.props;
        this.setState({ loading: true });
        apiService.post('SENDPHONEVERIFICATIONTOKEN', {
            "userId": auth.user.UserId,
            "phoneNumber": phoneNumber
        })
            .then(response => {
                // let data = { "UserId": 5414, "IsLockOut": true }
                // let success = true;
                if (response.Success) {
                    this.setState({ showModal: true });
                    this.startCountDown();
                    this.props.onLockStatus(response.Data);
                    this.props.actions.showAlert({ message: response.Message, variant: "success" });
                }
                else {
                    this.props.onLockStatus(response.Data);
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                    this.clearCountDown(this.state.interval);
                    this.handleClose();
                }
                this.setState({ loading: false });
            },
                (error) =>
                    this.setState((prevState) => {
                        this.handleClose();
                        this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
                        this.setState({ loading: false });
                    })
            );
    }

    startCountDown() {
        let countDown = 120; // 2 minutes in seconds

        const interval = setInterval(() => {
            const minutes = Math.floor(countDown / 60);
            let seconds = countDown % 60;

            seconds = seconds < 10 ? '0' + seconds : seconds;

            // console.log(`${minutes}:${seconds}`);

            this.setState({
                showTimer: true,
                minutes: minutes,
                seconds: seconds,
                interval: interval
            })

            // console.log(`${this.state.minutes}:${this.state.seconds}`);

            if (--countDown < 0) {
                this.clearCountDown(interval);
                this.setState({ showTimer: false })
                // console.log('Time is up!');
            }
        }, 1000); // update the timer every second
    }

    clearCountDown(interval) {
        console.log('clear ');
        this.setState({ showTimer: false })
        clearInterval(interval);
    }

    verifyPhoneNumber = () => {
        const { auth } = this.props;
        let userId = auth.user.UserId;
        let otp = this.state.otp.toString()
        this.setState({ loading: true });
        apiService.post('VERIFYPHONE', { "userid": userId, "otp": otp, "phoneNumber": this.state.verificationNumber }).then(response => {
            if (response.Success) {
                this.props.onVerified(true);
                this.props.actions.showAlert({ message: response.Message, variant: "success" });
                this.clearCountDown(this.state.interval);
                this.handleClose();
            } else {
                this.props.actions.showAlert({ message: response.Message, variant: "error" });
            }
            this.setState({ loading: false });
        },
            (error) =>
                this.setState((prevState) => {
                    this.props.onVerified(false);
                    this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
                    this.setState({ loading: false });
                })
        );
    }
    render() {
        const { loading, showModal, showTimer, minutes, seconds } = this.state;
        return (
            <div>
                <Fragment>

                    <Modal show={showModal} onHide={this.handleClose}
                        size='lg'
                        backdrop="static"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title >
                                Enter verification code
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="twiliopopup formWrapper">

                                <div className="form-group">
                                    <label>Enter One Time Password</label>
                                    <OtpInput
                                        value={this.state.otp}
                                        onChange={this.handleChange}
                                        numInputs={4}
                                        separator={<span>-</span>}
                                        isInputNum={true}
                                    />
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            {
                                showTimer && <span>{minutes}:{seconds}</span>
                            }

                            <Button type="button" disabled={showTimer} className="link-button" onClick={() => this.sendPhoneVerificationToken(this.state.verificationNumber)}>Resend OTP</Button>
                            <Button variant="contained" color="primary" onClick={this.verifyPhoneNumber}>Submit</Button>
                        </Modal.Footer>
                    </Modal >

                    {loading &&
                        <div className="loaderDiv"><div className="loader">
                            <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                        </div></div>
                    }
                </Fragment >

            </div >
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

export default connect(mapStateToProps, mapDispatchToProps)(Twilio);

