import React, { Component, Fragment } from 'react';
import { apiService } from '../../services/api.service';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { history } from '../../helpers/history';
import * as actions from "../../store/actions";
import { APP_URLS, PUBLIC_URL } from '../../config/api.config';
import queryString from 'query-string';
import Loader from 'react-loaders';
import SignIn from "../../containers/home/SignIn";
import signin from "../../assets/images/signinnew.png";
import ResendActivationLink from "../../containers/home/ResendActivationLink";
class VerifyAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            status: null,
            showSigninModal: false,
            showResendEmailActivation: false
        }
    }
    componentDidMount = () => {
        this.handleVerifyAccount();
    }

    handleVerifyAccount = () => {
        this.setState({ loading: true, status: null });
        let queryParams = queryString.parse(this.props.location.search);
        apiService.postFile('VERIFYACCOUNT', { "token": queryParams.Token, "email": queryParams.Email })
            .then(response => {

                if (response.Success) {
                    this.props.actions.showAlert({ message: response.Message, variant: "success" });
                    this.setState({ status: true });
                }else{
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                }
                this.setState({ loading: false });
            },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
                        this.setState({ loading: false, status: false });
                    })
            );
    }
    isShowSignIn = (status) => {
        this.setState({ showSigninModal: status });
    }

    isShowResendActivationLink = (status) => {
        this.setState({ showResendEmailActivation: status })
    }

    render() {
        const { loading, status, showResendEmailActivation } = this.state;
        return (
            <section className="series-Session">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12  col-md-12 col-sm-12">
                            <div className="notFoundForm">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="blankSpace">
                                            {/* <img src={require('../../assets/images/undraw_verify.png')}></img> */}
                                            {loading === true && <h4>Hold on, we are verifying your account.</h4>}
                                            {
                                                loading === false && <div className="error-details">
                                                    {status === false && <Fragment><h5>We are having trouble activating your account</h5> <span onClick={() => this.isShowResendActivationLink(true)} on><u>Need a link to resend activation.</u></span></Fragment>}
                                                    {status === true && <Fragment><h5>Your account has been successfully verified!</h5><p> Start browsing our classes. </p><button onClick={history.push(`${PUBLIC_URL}/CourseSearch`)} className="btn btn-blue"><img width="" height=""  src={signin} alt="image" />Find a class</button></Fragment>}
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <SignIn showSignIn={this.state.showSigninModal} onSignInClose={this.isShowSignIn}></SignIn>
                <ResendActivationLink showResendEmailModal={showResendEmailActivation} onResendActivationModalClose={this.isShowResendActivationLink}></ResendActivationLink>
                {loading &&
                    <div className="loaderDiv"><div className="loader">
                        <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                    </div></div>}
            </section>
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
export default connect(mapStateToProps, mapDispatchToProps)(VerifyAccount);