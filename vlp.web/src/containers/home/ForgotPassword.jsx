import React, { Component, Fragment } from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import { apiService } from '../../services/api.service';
import SimpleReactValidator from 'simple-react-validator';
import Loader from 'react-loaders';

class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            forgotPasswordForm: {
                email: ""
            },
            loading: false
        };
        this.validator = new SimpleReactValidator();
    }
    handleChange = (e) => {
        const { forgotPasswordForm } = this.state;
        forgotPasswordForm[e.target.name] = e.target.value;
        this.setState({ forgotPasswordForm });
    }
    handleClose = () => {
        this.props.onForgotPasswordClose(false);
        this.setState({ forgotPasswordForm: { ...this.state.forgotPasswordForm, email: '' }, loading: false });
        this.validator = new SimpleReactValidator();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.validator.allValid() === false) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        const { forgotPasswordForm } = this.state;
        this.setState({ loading: true });
        apiService.post('FORGOTPASSWORD', { "Email": forgotPasswordForm.email })
            .then(response => {
                if (response.Success) {
                    this.validator = new SimpleReactValidator();
                    this.setState({ forgotPasswordForm: { ...forgotPasswordForm, email: '' }});
                    this.props.actions.showAlert({ message: response.Message, variant: "success", open: false });
                }else{
                    this.props.actions.showAlert({ message: response.Message, variant: "error", open: false }); 
                }
                this.setState({ loading: false });
                this.props.onForgotPasswordClose(false);
            },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });

                        this.setState({ loading: false });
                    })
            );
    }

    render() {
        const { forgotPasswordForm, loading } = this.state;
        return (
            <Fragment>
                <Modal show={this.props.showForgotPassword} onHide={this.handleClose}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="fogot-password-title">
                            Forgot Password Osmos-ish Account!
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={this.handleSubmit}>
                            <div className="formWrapper">
                                <div className="form-group">
                                    <input onChange={this.handleChange}
                                        value={forgotPasswordForm.email} name="email"
                                        onBlur={() => this.validator.showMessageFor('email')}
                                        className="form-control" placeholder="Enter Email" />
                                    <div className="icon"><i className="fa fa-envelope" aria-hidden="true"></i></div>
                                    {this.validator.message('email', forgotPasswordForm.email, 'required|email')}
                                </div>

                                <div className="form-button">
                                    <button type="submit" className="btn btn-blue logCss">Reset Your Password</button>
                                </div>
                            </div>
                        </form>
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
export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword)
