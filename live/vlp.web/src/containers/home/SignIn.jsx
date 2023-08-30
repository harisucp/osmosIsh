import React, { Component, Fragment } from 'react';
import { Modal } from 'react-bootstrap';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import ForgotPassword from '../home/ForgotPassword';
import SimpleReactValidator from 'simple-react-validator';
import FacebookButton from "../../shared/components/ui/form/FacebookButton";
import GoogleButton from "../../shared/components/ui/form/GoogleButton";
import SignUp from "../../containers/home/SignUp";
import Loader from 'react-loaders';
import { history } from '../../helpers/history';
import { localStorageService } from "../../services/localStorageService";
// import { PUBLIC_URL } from "../../config/api.config";
import ResendActivationLink from "../../containers/home/ResendActivationLink";
// import { useHistory } from "react-router-dom";
class SignIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            signInForm: {
                email: '',
                password: '',
                remember: false
            },
            loading: false,
            showResendEmailActivation: false,
            showForgotPasswordModal: false,
            showSignupModal: false
        };
        this.validator = new SimpleReactValidator();
        this.onKeyDown = this.onKeyDown.bind(this);
    }
    isShowForgotPassword = (status) => {
        this.handleClose();
        this.setState({ showForgotPasswordModal: status })
    }
    isShowSignUp = (status) => {
        this.handleClose();
        this.setState({ showSignupModal: status });
    }

    isShowResendActivationLink = (status) => {
        this.handleClose();
        this.setState({ showResendEmailActivation: status })
    }

    handleChange = (e) => {
        const { signInForm } = this.state;
        if (e.target.name === 'remember') {
            signInForm[e.target.name] = e.target.checked;
        } else {
            signInForm[e.target.name] = e.target.value;
        }
        this.setState({ signInForm });
    }
    handleSignIn = () => {
        // let historyData = useHistory();
        // console.log(historyData); return;
        if (this.validator.allValid() === false) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        const { signInForm } = this.state;
        this.setState({ loading: true });
        apiService.signin(signInForm.email, signInForm.password, signInForm.remember)
            .then(response => {
                if (response.Success) {
                    this.props.actions.loginSuccess(response.Data);
                    this.props.actions.updateCart(localStorageService.getCartItemCount() > 0 ? localStorageService.getCartItemCount() : 0);
                    this.props.actions.changeUserMode(localStorageService.getUserMode());
                    if (localStorageService.getLocalCartItemCount() > 0 && localStorageService.getUserMode() === "student") {
                        this.enrollLocalCart(response.Data.StudentId);
                    }
                    this.handleClose();
                    this.props.actions.showAlert({ message: response.Message, variant: "success" });
                    // reload to loadpage agin for logged in user
                //    history.push(`${PUBLIC_URL}/`);
                history.go(1);
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
            )
    }

    enrollLocalCart = (studentId) => {
        this.setState({ loading: true });
        let cartItem = localStorageService.fetchCartItem();
        const { auth } = this.props;
        let enrollments = [];
        cartItem.forEach((item, key) => {
            enrollments[key] = {
                "StudentId": studentId,
                "RefrenceId": item.SeriesId === null ? Number(item.SessionId) : Number(item.SeriesId),
                "RefrenceTypeId": item.SourceTypeId,
                "EnrollmentDate": new Date()
            }
        });

        apiService.post('MULTIPLEENROLLMENTS',
            { "enrollments": JSON.stringify(enrollments), "actionPerformedBy": auth.user.FirstName })
            .then(response => {
                const count = localStorageService.getCartItemCount();
                if (response.Success) {
                    // const count = localStorageService.getCartItemCount();
                    this.props.actions.updateCart(localStorageService.getCartItemCount() > 0 ? Number(count) + response.Data.Count : response.Data.Count);
                }
                localStorageService.removeCartItemsFromLocal();
                this.props.actions.showAlert({ message: Number(count) === response.Data.Count ? "equal" : (response.Data.Count > 0 && Number(count) === response.Data.Count ? "greater" : (response.Data.Count === 0 && Number(count) > 0 ? "third" : "last else")) , variant: response.Success ? "success" : "error" });
                this.setState({ loading: false });
            },
                (error) =>
                
                    this.setState((prevState) => {
                        // localStorageService.removeCartItemsFromLocal();
                        this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
                        this.setState({ loading: false });
                    })
            );

    }

    getFacebookResponse = (response) => {
        this.externalSignIn(response.accessToken, 'Facebook');
    }

    getGoogleResponse = (response) => {
        this.externalSignIn(response.accessToken, 'Google');
    }

    externalSignIn = (tokenId, providerName) => {
        this.setState({ loading: true });

        apiService.externalSignIn(tokenId, providerName)
            .then(response => {
                if (response.Success) {
                    this.props.actions.loginSuccess(response.Data);
                    this.props.actions.updateCart(localStorageService.getCartItemCount() > 0 ? localStorageService.getCartItemCount() : 0);
                    this.props.actions.changeUserMode(localStorageService.getUserMode());

                    if (localStorageService.getLocalCartItemCount() > 0 && localStorageService.getUserMode() === "student") {
                        this.enrollLocalCart(response.Data.StudentId);
                    }
                    this.handleClose();
                    this.props.actions.showAlert({ message: response.Message, variant: "success" });
                    // history.push(`${PUBLIC_URL}/`);
                    history.go(1);
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

    handleClose = () => {
        const { signInForm } = this.state;
        signInForm.email = "";
        signInForm.password = "";
        this.setState({ signInForm });
        this.props.onSignInClose(false);
        this.validator = new SimpleReactValidator();
    }

    clearSignInInputs = () => {
        this.setState({ signInForm: { ...this.state.signInForm, email: "", password: "" } });
        this.validator = new SimpleReactValidator();
    }
    showSignInModal = () => {
        this.props.onSignInClose(true)
    }
    onKeyDown = (event) => {
        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        if (event.key === 'Enter') {
            this.handleSignIn();
        }
    }
    render() {
        const { signInForm, loading } = this.state;
        return (
            <Fragment>
                <Modal show={this.props.showSignIn} onHide={this.handleClose}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="sign-in-title">
                            Sign in with your Osmos-ish account!
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="loginBox">
                            <FacebookButton onSignIn={this.getFacebookResponse}></FacebookButton>
                            <GoogleButton onSignIn={this.getGoogleResponse}></GoogleButton>
                        </div>
                        <div className="formWrapper">
                            <div className="form-group">
                                <input type="email" className="form-control" name='email'
                                    value={signInForm.email} onChange={this.handleChange}
                                    onBlur={() => this.validator.showMessageFor('email')} placeholder="Enter Email" />
                                <div className="icon"><i className="fa fa-envelope" aria-hidden="true"></i></div>
                                {this.validator.message('email', signInForm.email, 'required|email')}
                            </div>

                            <div className="form-group">
                                <input type="password" className="form-control" name="password"
                                    value={signInForm.password} onChange={this.handleChange} onKeyDown={this.onKeyDown}
                                    onBlur={() => this.validator.showMessageFor('password')} placeholder="Enter Password" />
                                <div className="icon"><i className="fa fa-unlock-alt" aria-hidden="true"></i></div>
                                {this.validator.message('password', signInForm.password, 'required|min:6|max:12')}
                            </div>

                            <div className="form-check">
                                <label className="checkbox">
                                    <input type="checkbox" name="remember" checked={signInForm.remember}
                                        onChange={this.handleChange} /><span className="primary"></span>
                                </label>
                                <span className="checkActive">Remember Password</span>
                            </div>

                            <div className="form-group buttonCenter">
                                <button onClick={() => this.isShowResendActivationLink(true)} className="link-button"><u>Resend Account Activation Link</u></button>
                            </div>
                            <div className="form-button">
                                <button className="btn btn-blue logCss" onClick={this.handleSignIn}> Sign In</button>
                                <span>Or <button type="button" className="link-button" onClick={() => this.isShowForgotPassword(true)}>Forgot Password</button></span>
                            </div>
                        </div>
                        <hr />
                        <div className="signUp">
                            <p>Don't have an account?<button type="button" className="link-button" onClick={() => this.isShowSignUp(true)}> Sign Up</button></p>
                        </div>
                        {loading &&
                            <div className="loaderDiv"><div className="loader">
                                <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                            </div></div>}
                    </Modal.Body>

                </Modal >
                <ForgotPassword showForgotPassword={this.state.showForgotPasswordModal} onForgotPasswordClose={this.isShowForgotPassword}></ForgotPassword>
                <SignUp showSignUp={this.state.showSignupModal} showSignInModal={this.showSignInModal} onSignUpClose={this.isShowSignUp}></SignUp>
                <ResendActivationLink showResendEmailModal={this.state.showResendEmailActivation} onResendActivationModalClose={this.isShowResendActivationLink}></ResendActivationLink>
            </Fragment >

        );
    }
}

const mapStateToProps = state => {
    return {
        auth: state.auth,
    };
};
const mapDispatchToProps = dispatch => {
    return {
        actions: {
            showAlert: bindActionCreators(actions.showAlert, dispatch),
            loginSuccess: bindActionCreators(actions.loginSuccess, dispatch),
            updateCart: bindActionCreators(actions.updateCart, dispatch),
            changeUserMode: bindActionCreators(actions.changeUserMode, dispatch),
            increementCart: bindActionCreators(actions.increementCart, dispatch)
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);
