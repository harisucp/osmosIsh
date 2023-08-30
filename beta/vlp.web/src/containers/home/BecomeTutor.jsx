import React, { Component, Fragment } from 'react';
import { apiService } from "../../services/api.service";
import { PUBLIC_URL } from "../../config/api.config";
import { history } from '../../helpers/history';
import SignIn from "../../containers/home/SignIn";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import SimpleReactValidator from 'simple-react-validator';
import FacebookButton from "../../shared/components/ui/form/FacebookButton"
import GoogleButton from "../../shared/components/ui/form/GoogleButton";
import Loader from 'react-loaders';
import video from "../../assets/video/osmos-video.mp4";
// import five from "../../assets/images/git-image.png";
import { APP_URLS, CAPTCHA_SITE_KEY } from "../../config/api.config";
import Swiper from 'react-id-swiper';
import ReCAPTCHA from "react-google-recaptcha"
import 'swiper/css/swiper.css';
// import { id } from 'date-fns/esm/locale';
import ResponsiveImage from './../common/ResponsiveImage';

class BecomeTutorSignUp extends Component {
    constructor(props) {
        super(props);
        // const user = this.props.auth.user;
        this.state = {
            signUpForm: {
                fullName: null,
                email: null,
                password: null,
                IsBecomeTutor: true,
                isExternalSignUp: false,
                externalProvider: null,
                externalToken: null
            },
            dummyString: '',
            showSigninModal: false,
            allTutorData: [],
            loading: false,
            site_key: CAPTCHA_SITE_KEY,
            captchaRef: React.createRef()
        };
        this.validator = new SimpleReactValidator({
            messages: {
                not_in: "Email Already Exist."
            }
        });
        this.getAllTutor = this.getAllTutor.bind(this);
        this.handleScroll = this.handleScroll.bind(this);

    }

    componentDidMount = () => {
        window.addEventListener('scroll', this.handleScroll, true);
        this.refs.vidRef.pause();
        this.getAllTutor();
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll = () => {

        if (Object.keys(this.refs).length > 0) {
            if (window.pageYOffset > 50) {
                this.refs.vidRef.pause();
            }
            // else {
            //     this.refs.vidRef.play();
            // }
        }
    }
    handleSignUp = async () => {
        if (this.validator.allValid() === false) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        const token = await this.state.captchaRef.current.getValue();
        const { signUpForm } = this.state;
        this.setState({ loading: true });
        apiService.post('SIGNUP', {
            "FullName": signUpForm.fullName.charAt(0).toUpperCase() + signUpForm.fullName.slice(1),
            "Email": signUpForm.email,
            "password": signUpForm.password,
            "IsBecomeTutor": signUpForm.IsBecomeTutor,
            "IsExternalSignUp": signUpForm.isExternalSignUp,
            "ExternalProvider": signUpForm.externalProvider,
            "ExternalToken": signUpForm.externalToken
        })
            .then(response => {
                if (response.Success) {
                    this.props.actions.showAlert({ message: "Tutor Account Created successfully. A verification link has been sent to your registered email account. Please verify your account , In order to use Osmos-ish Services", variant: "success" });
                    this.state.captchaRef.current.reset();
                    history.push(`${PUBLIC_URL}/`);
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
    }

    getAllTutor = () => {
        this.setState({ loading: true });
        apiService.post('UNAUTHORIZEDDATA', { "data": { "CategoryId": -1, "IsPrivateSession": "N", "StudentId": -1, "PageNbr": -1, "PageSize": -1 }, "keyName": "GetAllTutors" })
            .then(response => {
                if (response.Success) {

                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        this.setState({ allTutorData: JSON.parse(response.Data.ResultDataList[0].data) });
                    }
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
    }

    handleChange = (e) => {
        const { signUpForm } = this.state;
        signUpForm[e.target.name] = e.target.value;
        this.setState({ signUpForm });
    }

    handleClose = () => {
        this.updateFormSignUp(null, null, null, false, null, null);
    }

    updateFormSignUp = (email, username, password, isExternalSignUp, externalProvider, externalToken) => {
        const signUpForm = { ...this.state.signUpForm }
        signUpForm.email = email;
        signUpForm.fullName = username;
        signUpForm.password = password;
        signUpForm.isExternalSignUp = isExternalSignUp;
        signUpForm.externalProvider = externalProvider;
        signUpForm.externalToken = externalToken;
        this.setState({ signUpForm });
        this.validator = new SimpleReactValidator();
    }

    getGoogleResponse = (response) => {
        this.updateFormSignUp(response.email, response.username, null, true, 'google', response.tokenId);
        this.handleUserExist();
    }

    getFacebookResponse = (response) => {
        this.updateFormSignUp(response.email, response.username, null, true, 'facebook', response.tokenId);
        this.handleUserExist();
    }

    isShowSignIn = (status) => {
        this.setState({ showSigninModal: status });
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
                        this.handleClose();
                    }
                } else {
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                }
                this.setState({ loading: false });
            },
                (error) => {
                    this.setState({ loading: false });
                    if (signUpForm.isExternalSignUp === false) {
                        this.setState({ dummyString: signUpForm.email });
                        this.validator.showMessageFor('email');
                    }
                    else {

                        this.handleClose();
                        this.props.actions.showAlert({ message: "Email already exists.", variant: "error" });
                    }
                });
    }

    handlePrivatePolicyNavigate = () => {
        history.push(`${PUBLIC_URL}/PrivacyPolicy`);
    }

    handleTermConditionNavigate = () => {
        history.push(`${PUBLIC_URL}/TermCondition`);
    }
    handleTutorDetails = (TutorId) => {
        history.push(`${PUBLIC_URL}/TutorProfile/${TutorId}`);
    }
    render() {
        const { signUpForm, allTutorData, loading, dummyString, site_key, captchaRef } = this.state;
        const params = {
            spaceBetween: 5,
            slidesPerView: 4,
            rebuildOnUpdate: true,
            slidesPerGroup: 1,
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true,
                dynamicBullets: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            },
            breakpoints: {
                0: {
                    slidesPerView: 1,
                    spaceBetween: 0,
                },
                550: {
                    slidesPerView: 3,
                    spaceBetween: 0,
                },
                988: {
                    slidesPerView: 4,
                    spaceBetween: 0,
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 0
                },
            }
        }
        return (
            <Fragment>
                <section className="becomeTutor">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-5 col-md-5 col-sm-12 alignSelf">
                                <div className="bannerHeading">
                                    <h1>Become <br />A Host</h1>
                                </div>
                            </div>
                            <div className="col-lg-7 col-md-7 col-sm-12">
                                <div className="btImage">
                                    <video width="400" ref="vidRef" height="240" controls>
                                        {<source src={video} type="video/mp4" />}
                                    </video>
                                </div>
                            </div>
                            <div className="col-lg-12 col-md-12 col-sm-12">
                                <ol className="breadcrumb">
                                    <li> <a href='javascript:;'> Home</a> </li>
                                    <li>Become A Tutor </li>
                                </ol>
                            </div>
                        </div>
                        <div className="signUpForm">
                            <div className="row">
                                <div className="col-lg-7 col-md-7 col-sm-12">
                                    <div className="getToKnow">
                                        <h2>Get To Know Us</h2>
                                        <p className="mt-4">Welcome to Osmos-ish: a live, virtual learning platform where we strive to connect eager students with experienced teachers, tutors, trainers, and instructors. Teachers have the flexibility of setting their own schedule, whether it’s a one time class, series of classes, or even accepting an invitation for a one-on-one lesson. Osmos-ish isn’t limited to just academics: people of all backgrounds ranging from fitness to music can create a profile! Learning something new has never been easier.</p>
                                        {/* <div className="resizeImage"><img src={five} alt="image" className="img-fluid mt-4 " /></div> */}
                                    </div>
                                </div>
                                <div className="col-lg-5 col-md-5 col-sm-12">
                                    <div className="sidebaarSignUp">
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
                                                    onBlur={() => { this.validator.showMessageFor('email'); this.handleUserExist(); }}
                                                    onChange={this.handleChange} placeholder="Enter Email" />
                                                <div className="icon"><i className="fa fa-envelope" aria-hidden="true"></i></div>
                                                {this.validator.message('email', signUpForm.email, `required|email|not_in:${dummyString}`)}
                                            </div>
                                            {signUpForm.isExternalSignUp === false &&
                                                <div className="form-group">
                                                    <input type="password" className="form-control" name="password" value={signUpForm.password}
                                                        onBlur={() => this.validator.showMessageFor('password')}
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
                                            <div className='captchaDiv'>
                                                <ReCAPTCHA sitekey={site_key} ref={captchaRef} />
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
                                                    </button>.
                                                </p>
                                            </div> */}
                                        </div>
                                        <hr />
                                        <div className="signUp">
                                            <p>Already have an account?
                                                <button
                                                    type="button"
                                                    className="link-button" onClick={() => this.isShowSignIn(true)}>
                                                    Log In
                                                </button></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {
                    allTutorData &&
                    <section className="expertTutor">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 col-sm-12 text-center">
                                    <h2 className="mb-5">Expert Tutors</h2>
                                </div>
                                <div className="col-sm-12">
                                    <Swiper {...params}>
                                        {allTutorData.map((item, index) => (

                                            <div className="etReview text-center" key={index}>
                                                <div className="btImage">
                                                    <div className="etCircleImage">
                                                        <button type="button" onClick={() => this.handleTutorDetails(item.TeacherId)} className="link-button">
                                                            <ResponsiveImage 
                                                                src={item.ImageFile}
                                                                alt="tutorImage"
                                                                width="150"
                                                                height="150" />
                                                            </button>
                                                    </div>
                                                </div>
                                                <h4 onClick={() => this.handleTutorDetails(item.TeacherId)}>{item.Name}</h4>
                                                <h6>Tutor</h6>
                                            </div>
                                        ))}
                                    </Swiper>
                                </div>
                            </div>
                        </div>
                    </section>
                }
                <SignIn showSignIn={this.state.showSigninModal} onSignInClose={this.isShowSignIn}></SignIn>
                {
                    loading &&
                    <div className="loaderDiv"><div className="loader">
                        <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                    </div></div>
                }
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
export default connect(mapStateToProps, mapDispatchToProps)(BecomeTutorSignUp);
