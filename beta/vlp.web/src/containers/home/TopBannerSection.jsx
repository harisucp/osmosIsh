import React, { Component, Fragment } from 'react';
import SignUp from "../../containers/home/SignUp";
import SignIn from "../../containers/home/SignIn";
import { localStorageService } from "../../services/localStorageService";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
class PageBanner extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showSignUpModal: false,
            showSigninModal: false,

        };
    }
    componentDidMount = () => {

    }
    isShowSignUp = (status) => {
        this.setState({ showSignUpModal: status });
    }
    isShowSignIn = (status) => {
        this.setState({ showSigninModal: status });
    }
    render() {
        const { isLoggedIn } = this.state;

        return (
            <Fragment>

                <section className="slideBanner">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="bannerHeading">
                                    <h1>Host or join live online video sessions...</h1>
                                    <p>From Yoga to Math and everything in-between.  No monthly fees, recorded videos or meeting links. Hosts can set their own price per attendee, schedule & session size.</p>
                                    {this.props.auth.loggedIn === false &&
                                        <button type="button" className="btn btn-blue btnCss" onClick={() => this.isShowSignUp(true)} >Register Now</button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bannerImage"></div>
                </section>
                <section className="expert">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-4 pad-0">
                                <div className="thumbBox">
                                    <div className="icon"><img width="77" height="81"  src={require("../../assets/images/icon50.png")} alt="expert_icon" /></div>
                                    <div className="thumbText">
                                        <h2>Pick a Subject</h2>
                                        <p>Begin your experience by choosing your desired subject from our list of offerings. </p>
                                    </div>
                                    <div className="text"><img width="57" height="76"  src={require("../../assets/images/oneicon.png")} alt="oneicon" /></div>
                                </div>
                            </div>
                            <div className="col-md-4 pad-0">
                                <div className="thumbBox bgGrey">
                                    <div className="icon"><img width="77" height="56"  src={require("../../assets/images/expert_icon.png")} alt="time" /></div>
                                    <div className="thumbText">
                                        <h2>Choose an Expert</h2>
                                        <p>Select an instructor that specializes in that subject. </p>
                                    </div>
                                    <div className="text"><img width="54" height="76"  src={require("../../assets/images/twoicon.png")} alt="twoicon" /></div>
                                </div>
                            </div>
                            <div className="col-md-4 pad-0">
                                <div className="thumbBox">
                                    <div className="icon"><img width="72" height="69"  src={require("../../assets/images/time.png")} alt="time" /></div>
                                    <div className="thumbText">
                                        <h2>Schedule the Time</h2>
                                        <p>Find a time that works best for you. Join an already scheduled class, or request a private one-on-one
session. </p>
                                    </div>
                                    <div className="text"><img width="56" height="77"  src={require("../../assets/images/threeicon.png")} alt="threeicon" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <SignIn showSignIn={this.state.showSigninModal} onSignInClose={this.isShowSignIn}></SignIn>
                <SignUp showSignUp={this.state.showSignUpModal} onSignUpClose={this.isShowSignUp} showSignInModal={() => this.isShowSignIn(true)}></SignUp>
            </Fragment>
        )
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
export default connect(mapStateToProps, mapDispatchToProps)(PageBanner);

