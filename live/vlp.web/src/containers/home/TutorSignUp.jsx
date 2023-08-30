
import React, { Component, Fragment } from 'react';
import { Modal } from 'react-bootstrap';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import SimpleReactValidator from 'simple-react-validator';
import FacebookButton from "../../shared/components/ui/form/FacebookButton"
import GoogleButton from "../../shared/components/ui/form/GoogleButton";
import Loader from 'react-loaders';
import { PUBLIC_URL } from "../../config/api.config";
import { history } from '../../helpers/history';
class TutorSignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            signUpForm: {
                fullName: null,
                email: null,
                password: null,
                IsTutor: 'Y',
                IsStudent: 'Y'
            },
            loading: false
        };
        this.validator = new SimpleReactValidator();
    }

    handleSignUp = () => {
        if (this.validator.allValid() === false) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        const { signUpForm } = this.state;
        this.setState({ loading: true });
        apiService.post('SIGNUP', { "FullName": signUpForm.fullName, "Email": signUpForm.email, "password": signUpForm.password, "IsTutor": signUpForm.IsTutor, "IsStudent": signUpForm.IsStudent })
            .then(response => {

                if (response.Success) {
                    this.props.actions.showAlert({ message: response.Message, variant: "success" });
                    this.handleClose();
                    this.props.history.push(`${PUBLIC_URL}/CreateTutor`);
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
    handleChange = (e) => {
        const { signUpForm } = this.state;
        signUpForm[e.target.name] = e.target.value;
        this.setState({ signUpForm });
    }
    getFacebookResponse = (response) => {
        this.updateFormSignUp(response.email, response.username, null);
    }

    handleClose = () => {
        this.props.onSignUpClose(false);
        this.updateFormSignUp(null, null, null);
        this.validator = new SimpleReactValidator();
    }
    updateFormSignUp = (email, username, password) => {
        const signUpForm = { ...this.state.signUpForm }
        signUpForm.email = email;
        signUpForm.fullName = username;
        signUpForm.password = password;
        this.setState({ signUpForm });
    }

    getGoogleResponse = (response) => {
        const signUpForm = { ...this.state.signUpForm }
        signUpForm.email = response.email;
        signUpForm.fullName = response.username;
        this.setState({ signUpForm });
    }

    openSignInModal = () => {
        this.handleClose();
        this.props.showSignInModal();
    }

    handlePrivatePolicyNavigate = () => {
        history.push(`${PUBLIC_URL}/PrivacyPolicy`);
    }
    handleTermConditionNavigate = () => {
        history.push(`${PUBLIC_URL}/TermCondition`);
    }

    render() {
        const { signUpForm, loading } = this.state;
        return (
            <Fragment>
                <Modal show={this.props.showTutorSignUp} onHide={this.handleClose}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="tutor-signup-title">
                            Teach on Osmos-Ish
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="loginBox">
                            <FacebookButton onSignIn={this.getFacebookResponse}></FacebookButton>
                            <GoogleButton className="google" onSignIn={this.getGoogleResponse}></GoogleButton>
                        </div>
                        <div className="formWrapper">
                            <div className="form-group">
                                <input type="text" className="form-control" name="fullName" value={signUpForm.fullName}
                                    onBlur={() => this.validator.showMessageFor('fullName')}
                                    onChange={this.handleChange} placeholder="Full Name" />
                                <div className="icon"><i className="fa fa-user" aria-hidden="true"></i></div>
                                {this.validator.message('fullName', signUpForm.fullName, 'required|max:50')}
                            </div>


                            <div className="form-group">
                                <input type="email" className="form-control" name="email" value={signUpForm.email}
                                    onBlur={() => this.validator.showMessageFor('email')}
                                    onChange={this.handleChange} placeholder="Enter Email" />
                                <div className="icon"><i className="fa fa-envelope" aria-hidden="true"></i></div>
                                {this.validator.message('email', signUpForm.email, 'required|email')}
                            </div>


                            <div className="form-group">
                                <input type="password" className="form-control" name="password" value={signUpForm.password}
                                    onBlur={() => this.validator.showMessageFor('password')}
                                    onChange={this.handleChange} placeholder="Enter Password" />
                                <div className="icon"><i className="fa fa-unlock-alt" aria-hidden="true"></i></div>
                                {this.validator.message('password', signUpForm.password, 'required|min:6|max:12')}
                            </div>
                            <div className="form-button">
                                <button className="btn btn-blue logCss" onClick={this.handleSignUp}>Sign Up</button>
                            </div>
                            {/* <div className="terms">
                                <p>By signing up, you agree to our <br />
                                    <button
                                        type="button"
                                        onClick={this.handleTermConditionNavigate}
                                        className="link-button">
                                        Terms of Use
                                    </button> and <button
                                        type="button"
                                        onClick={this.handlePrivatePolicyNavigate}
                                        className="link-button">
                                        Privacy Policy
                                    </button>.</p>
                            </div> */}
                        </div>
                        <hr />
                        <div className="signUp">
                            <p>Already have an account?
                            <button
                                    type="button"
                                    className="link-button" onClick={this.openSignInModal}>
                                    Log In
                                    </button></p>
                        </div>
                    </Modal.Body>
                </Modal >
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
export default connect(mapStateToProps, mapDispatchToProps)(TutorSignUp);
