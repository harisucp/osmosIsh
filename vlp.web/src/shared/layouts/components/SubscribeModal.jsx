import React, { Component, Fragment } from 'react';
import { Modal } from 'react-bootstrap';
import SimpleReactValidator from 'simple-react-validator';
import { apiService } from '../../../services/api.service';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../../store/actions";
import Loader from 'react-loaders';

import "../../../assets/scss/subscribe_modal.scss";

class SubscribeModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            subscribeForm: {
                first_name: '',
                last_name: '',
                email: '',
            },
            loading: false,
            subscribeModal: true

        };
        this.validator = new SimpleReactValidator();
        this.onKeyDown = this.onKeyDown.bind(this);
    }
    resetForm = () => {
        this.validator = new SimpleReactValidator();
        const { subscribeForm } = this.state;
        subscribeForm.first_name = '';
        subscribeForm.last_name = '';
        subscribeForm.email = '';
        this.setState({ subscribeForm, loading: false, subscribeModal: false });
    }

    onKeyDown = (event) => {
        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        if (event.key === 'Enter') {
            this.handleSubscribe();
        }
    }

    handleSubscribeClicked = () => {
        this.setState({ showForm: true });
    }

    handleChange = (e) => {
        const { subscribeForm } = this.state;
        subscribeForm[e.target.name] = e.target.value;
        this.setState({ subscribeForm });
    }

    handleSubscribe = () => {
        if (this.validator.allValid() === false) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        this.setState({ loading: true });
        const { subscribeForm } = this.state;
        apiService.post("SUBSCRIBEEMAILTOSENDY", {
            "FirstName": subscribeForm.first_name,
            "LastName": subscribeForm.last_name,
            "Email": subscribeForm.email
        }).then(response => {
                if (response.Success) {
                    this.resetForm();
                    this.props.actions.showAlert({ message: response.Message, variant: "success" });
                }else{
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                }
                this.setState({ loading: false });
            },
                (error) =>
                    this.setState((prevState) => {
                        this.setState({ loading: false });
                        this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });

                    })
            );

    }

    render() {
        const { subscribeForm, subscribeModal, loading } = this.state;
        return (
            <Fragment>
                <Modal className="subscribe_modal" show={subscribeModal}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <button type="button" className="close" onClick={() => this.props.onClose()}>
                        <span>×</span>
                    </button>
                    <Modal.Body>
                        <h4>Subscribe now <br />and get a coupon for 30% off</h4>
                        <div className="formWrapper">
                            <div className="form-group row">
                                <label class="col-sm-4 col-form-label">First Name</label>
                                <div class="col-sm-8">
                                    <input type="text" className="form-control" name='first_name'
                                        value={subscribeForm.name} onChange={this.handleChange}
                                        onBlur={() => this.validator.showMessageFor('first_name')} />
                                    {this.validator.message('first_name', subscribeForm.first_name, 'required')}
                                </div>
                            </div>

                            <div className="form-group row">
                                <label class="col-sm-4 col-form-label">Last Name</label>
                                <div class="col-sm-8">
                                    <input type="text" className="form-control" name='last_name'
                                        value={subscribeForm.name} onChange={this.handleChange}
                                        onBlur={() => this.validator.showMessageFor('last_name')} />
                                    {this.validator.message('last_name', subscribeForm.last_name, 'required')}
                                </div>
                            </div>

                            <div className="form-group row">
                                <label class="col-sm-4 col-form-label">Email</label>
                                <div class="col-sm-8">
                                    <input type="email" className="form-control" name='email'
                                        value={subscribeForm.email} onChange={this.handleChange}
                                        onBlur={() => this.validator.showMessageFor('email')} />
                                    {this.validator.message('email', subscribeForm.email, 'required|email')}
                                </div>
                            </div>

                            <div className="form-button">
                                <button className="btn btn-blue logCss" type="button" onClick={this.handleSubscribe}>Subscribe</button>
                            </div>
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
export default connect(mapStateToProps, mapDispatchToProps)(SubscribeModal);
