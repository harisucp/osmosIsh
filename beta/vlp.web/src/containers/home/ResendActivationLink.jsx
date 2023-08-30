import React, { Component, Fragment } from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import { apiService } from '../../services/api.service';
import SimpleReactValidator from 'simple-react-validator';
import Loader from 'react-loaders';

class ResenActivationLink extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resendActivationLink: {
                email: ""
            },
            loading: false
        };
        this.validator = new SimpleReactValidator();
    }
    handleChange = (e) => {
        const { resendActivationLink } = this.state;
        resendActivationLink[e.target.name] = e.target.value;
        this.setState({ resendActivationLink });
    }
    handleClose = () => {
        this.props.onResendActivationModalClose(false);
        this.setState({ resendActivationLink: { ...this.state.resendActivationLink, email: '' }, loading: false });
        this.validator = new SimpleReactValidator();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.validator.allValid() === false) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        const { resendActivationLink } = this.state;
        this.setState({ loading: true });
        apiService.post('RESENDVERIFICATIONLINK', { "Email": resendActivationLink.email })
            .then(response => {
                if (response.Success) {
                    this.handleClose();
                    this.props.actions.showAlert({ message: response.Message, variant: "success", open: false });
                }else{
                    this.props.actions.showAlert({ message: response.Message, variant: "error", open: false  });
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
        const { resendActivationLink, loading } = this.state;
        return (
            <Fragment>
                <Modal show={this.props.showResendEmailModal} onHide={this.handleClose}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="fogot-password-title">
                            Generate Account Activation Link
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={this.handleSubmit}>
                            <div className="formWrapper">
                                <div className="form-group">
                                    <input onChange={this.handleChange}
                                        value={resendActivationLink.email} name="email"
                                        onBlur={() => this.validator.showMessageFor('email')}
                                        className="form-control" placeholder="Enter Email" />
                                    <div className="icon"><i className="fa fa-envelope" aria-hidden="true"></i></div>
                                    {this.validator.message('email', resendActivationLink.email, 'required|email')}
                                </div>

                                <div className="form-button">
                                    <button type="submit" className="btn btn-blue logCss">Resend Activation Link</button>
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
export default connect(mapStateToProps, mapDispatchToProps)(ResenActivationLink)
