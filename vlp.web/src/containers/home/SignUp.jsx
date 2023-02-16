import React, { Component, Fragment } from 'react';
import { Modal } from 'react-bootstrap';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import SimpleReactValidator from 'simple-react-validator';
import FacebookButton from "../../shared/components/ui/form/FacebookButton"
import GoogleButton from "../../shared/components/ui/form/GoogleButton";
import { history } from "../../helpers/history";
import { PUBLIC_URL } from "../../config/api.config";
import Loader from 'react-loaders';
class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            signUpForm: {
                fullName: "",
                email: "",
                password: "",
                isBecomeTutor: false,
                isExternalSignUp: false,
                externalProvider: null,
                externalToken: null,
                ageConfirmation: null,
                policyConfirmation: null
            },
            dummyString: '',
            loading: false
        };
        this.validator = new SimpleReactValidator({
            messages: {
                not_in: "Email Already Exist."
            }
        });
        this.onKeyDown = this.onKeyDown.bind(this);
        this.handleUserExist = this.handleUserExist.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.updateFormSignUp = this.updateFormSignUp.bind(this);
        this.getGoogleResponse = this.getGoogleResponse.bind(this);
        this.getFacebookResponse = this.getFacebookResponse.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.openSignInModal = this.openSignInModal.bind(this);
    }

    handleChange = (e) => {
        const { signUpForm } = this.state;
        signUpForm[e.target.name] = e.target.value;
        this.setState({ signUpForm });
    }

    handleClose = () => {
        this.props.onSignUpClose(false);
        this.updateFormSignUp("", "", "", false, null, null);
        this.validator = new SimpleReactValidator();
    }

    updateFormSignUp = (email, username, password, isExternalSignUp, externalProvider, externalToken, ageConfirmation, policyConfirmation) => {
        const signUpForm = { ...this.state.signUpForm }
        signUpForm.email = email;
        signUpForm.fullName = username;
        signUpForm.password = password;
        signUpForm.isExternalSignUp = isExternalSignUp;
        signUpForm.externalProvider = externalProvider;
        signUpForm.externalToken = externalToken;
        signUpForm.ageConfirmation = externalToken;
        signUpForm.policyConfirmation = externalToken;
        this.validator = new SimpleReactValidator();
        this.setState({ signUpForm });
    }

    getGoogleResponse = (response) => {
        this.updateFormSignUp(response.email, response.username, null, true, 'google', response.tokenId);
        this.handleUserExist();
    }

    getFacebookResponse = (response) => {
        this.updateFormSignUp(response.email, response.username, null, true, 'facebook', response.tokenId);
        this.handleUserExist();
    }

    openSignInModal = () => {
        this.handleClose();
        this.props.showSignInModal();
    }

    onKeyDown = (event) => {
        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        if (event.key === 'Enter') {
            this.handleSignUp();
        }
    }

    handlePrivatePolicyNavigate = () => {
        this.props.onSignUpClose(false);
        history.push(`${PUBLIC_URL}/PrivacyPolicy`);
    }

    handleTermConditionNavigate = () => {
        this.props.onSignUpClose(false);
        history.push(`${PUBLIC_URL}/TermCondition`);
    }

    handleUserExist = () => {
        const { signUpForm } = this.state;
        this.setState({ loading: true });
        apiService.post('CHECKUSER', { "Email": signUpForm.email })
            .then(response => {

                if (response.Success) {
                    if (signUpForm.isExternalSignUp === false) {
                        this.setState({ dummyString: '' });
                        this.validator.showMessageFor('email');
                    }
                    else {
                        this.handleSignUp();
                    }
                }else{
                    this.props.actions.showAlert({message: response.Message , variant :"error"});
                }
                this.setState({ loading: false });
            },
                (error) => {
                    this.setState({ loading: false });
                    if (signUpForm.isExternalSignUp === false) {
                        this.setState({ dummyString: signUpForm.email });
                        this.validator.showMessageFor('email')
                    }
                    else {
                        this.props.actions.showAlert({ message: "Email already exists.", variant: "error" });
                    }
                });
    }

    handleSignUp = () => {
        if (this.validator.allValid() === false) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        const { signUpForm } = this.state;
        this.setState({ loading: true });
        apiService.post('SIGNUP', {
            "FullName": signUpForm.fullName.charAt(0).toUpperCase() + signUpForm.fullName.slice(1),
            "Email": signUpForm.email,
            "password": signUpForm.password,
            "isBecomeTutor": signUpForm.isBecomeTutor,
            "isExternalSignUp": signUpForm.isExternalSignUp,
            "externalProvider": signUpForm.externalProvider,
            "externalToken": signUpForm.externalToken
        })
            .then(response => {
                if (response.Success) {
                    this.props.actions.showAlert({ message: 'Student account created successfully. A verification link has been sent to your registered email account. Please verify your account, In order to use Osmos-ish Services.', variant: "success" });
                    this.handleClose();
                }
                else
                {
                    this.props.actions.showAlert({ message: response.Message, variant: "info" });
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
        const { signUpForm, loading, dummyString } = this.state;
        return (
            <Fragment>
                <Modal show={this.props.showSignUp} onHide={this.handleClose}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="sign-up-title">
                            Sign up for your Osmos-ish account!
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="loginBox">
                            {/* <div className="facebook"></div> */}
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
                                    onBlur={() => { this.validator.showMessageFor('email') }}
                                    onChange={this.handleChange} placeholder="Enter Email" />
                                <div className="icon"><i className="fa fa-envelope" aria-hidden="true"></i></div>
                                {this.validator.message('email', signUpForm.email, `required|email|not_in:${dummyString}`)}
                            </div>

                            {signUpForm.isExternalSignUp === false &&
                                <div className="form-group">
                                    <input type="password" className="form-control" name="password" value={signUpForm.password}
                                        onBlur={() => this.validator.showMessageFor('password')} onKeyDown={this.onKeyDown}
                                        onChange={this.handleChange} placeholder="Enter Password" />
                                    <div className="icon"><i className="fa fa-unlock-alt" aria-hidden="true"></i></div>
                                    {this.validator.message('password', signUpForm.password, 'required|min:6|max:12')}
                                </div>
                            }
                            <div className="form-group form-check inlineAlign">
                                <label className="checkbox">
                                    <input type="checkbox" name="ageConfirmation" checked={signUpForm.ageConfirmation}
                                        onChange={this.handleChange} /><span className="primary"></span>
                                </label> I understand that I must be at least 18 years old or have an adult create an account on my behalf in order to use Osmos-ish
                                {this.validator.message('ageConfirmation', signUpForm.ageConfirmation, 'required')}
                            </div>
                            <div className="form-group form-check inlineAlign">
                                <label className="checkbox">
                                    <input type="checkbox" name="policyConfirmation" checked={signUpForm.policyConfirmation}
                                        onChange={this.handleChange} /><span className="primary"></span>
                                </label> By signing up, I agree to the <button
                                    type="button"
                                    onClick={this.handleTermConditionNavigate}
                                    className="link-button">
                                    Terms & Conditions
                                                        </button> and <button
                                    type="button"
                                    onClick={this.handlePrivatePolicyNavigate}
                                    className="link-button">
                                    Privacy Policy
                                                </button>
                                {this.validator.message('policyConfirmation', signUpForm.policyConfirmation, 'required')}
                            </div>

                            <div className="form-button">
                                <button className="btn btn-blue logCss" onClick={this.handleSignUp}> Sign Up</button>
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
                                    Sign In
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
export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
