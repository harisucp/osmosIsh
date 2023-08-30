import React, { Component, Fragment } from 'react';
import { apiService } from '../../services/api.service';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import SimpleReactValidator from 'simple-react-validator';
import PropagateLoader from "react-spinners/PropagateLoader";
import { PUBLIC_URL } from "../../config/api.config";

class ResetPassword extends Component {
    constructor(props) {
        super(props);
        const params = new URLSearchParams(props.location.search);
        const token = params.get('Token')
        this.state = {
            resetPasswordForm: {
                newPassword: '',
                confirmNewPassword: '',
                token: token
            },
            loading: false

        }
        this.validator = new SimpleReactValidator({
            messages: {
                in: "Confirm New Password must match New Password"
            }
        });
    }
    handleChange = (e) => {
        const { resetPasswordForm } = this.state;
        resetPasswordForm[e.target.name] = e.target.value;
        this.setState({ resetPasswordForm });
    }
    handleSubmit = (e) => {
        e.preventDefault();
        if (this.validator.allValid() === false) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        const { resetPasswordForm } = this.state
        const data = {
            Password: resetPasswordForm.newPassword,
            Token: resetPasswordForm.token
        }
        this.setState({ loading: true });
        apiService.post('RESETFORGOTPASSWORD', data).then(response => {
            if (response.Success) {
                this.validator = new SimpleReactValidator();
                this.props.actions.showAlert({ message: "Your Password has been changed successfully. You will be redirected to home screen in a moment.", variant: "success" });
                this.setState({ message: response.Message, messageType: "success", resetPasswordForm: { ...this.state.resetPasswordForm, newPassword: "", confirmNewPassword: "" } })
                setTimeout(
                    function () {
                        this.props.history.push(`${PUBLIC_URL === '' ? '/' : PUBLIC_URL}`);
                    }
                        .bind(this),
                    5000
                );
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
    render() {
        const { resetPasswordForm, loading } = this.state;
        return (
            <Fragment>
                <section class="resetPassword">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-lg-4 offset-lg-4 col-md-6 offset-md-3 col-sm-8 offset-sm-2">
                                <div class="resetForm">
                                    <h1>Reset Password</h1>
                                    <form onSubmit={this.handleSubmit}>
                                        <div class="formWrapper">
                                            <div class="form-group">
                                                <input type="password" name="newPassword" onChange={this.handleChange}
                                                    value={resetPasswordForm.newPassword}
                                                    onBlur={() => this.validator.showMessageFor('newPassword')}
                                                    class="form-control" placeholder="New Password" />
                                                <div class="icon"><i class="fa fa-unlock-alt" aria-hidden="true"></i></div>
                                                {this.validator.message('New Password', resetPasswordForm.newPassword, 'required|min:6|max:12')}
                                            </div>

                                            <div class="form-group">
                                                <input type="password" name="confirmNewPassword" onChange={this.handleChange}
                                                    onBlur={() => this.validator.showMessageFor('confirmNewPassword')}
                                                    value={resetPasswordForm.confirmNewPassword} class="form-control" placeholder="Confirm Password" />
                                                <div class="icon"><i class="fa fa-unlock-alt" aria-hidden="true"></i></div>
                                                {this.validator.message('Confirm New Password', resetPasswordForm.confirmNewPassword, `required|in:${resetPasswordForm.newPassword}`)}
                                            </div>
                                            <div class="form-group">
                                                <button className="btn btn-blue logCss" type="Submit">Reset Your Password</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {loading &&
                    <div className="loaderDiv"><div className="loader">
                        <PropagateLoader size={20} color={"#ffff"} />
                    </div></div>}
            </Fragment>
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
export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);