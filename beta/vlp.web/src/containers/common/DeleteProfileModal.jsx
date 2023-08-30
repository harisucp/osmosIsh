import React, { Component, Fragment } from 'react';
import { Modal } from 'react-bootstrap';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import Button from '@material-ui/core/Button';
import Loader from 'react-loaders';
import OtpInput from 'react-otp-input';
import { history } from "../../helpers/history";
import { PUBLIC_URL } from "../../config/api.config";

import SimpleReactValidator from 'simple-react-validator';

class DeleteProfileModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        }
    }
    handleClose = () => {
        this.props.onDeleteProfileModalClose(false);
    }


    deleteAccount = () => {
        const { auth, studentId, teacherId } = this.props;
        this.setState({ loading: true });
        apiService.post('DELETEUSER', {
            "StudentId": studentId ? studentId : -1,
            "TeacherId": teacherId ? teacherId : -1,
            "ActionPerformedBy": this.props.auth.user.FirstName
        }).then(response => {
            if (response.Success) {
                this.props.actions.showAlert({ message: response.Message, variant: "success" });
                this.handleClose();
                apiService.logout();
                this.props.actions.logout();
                this.props.actions.updatecart(0);
                history.push(`${PUBLIC_URL === '' ? '/' : PUBLIC_URL}`);

            }else{
                this.props.actions.showAlert({ message: response.Message, variant: "error" });
            }
            this.setState({ loading: false });
        },
            (error) => {
                this.handleClose();
                this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
                this.setState({ loading: false });
            });
    }

    render() {
        const { loading } = this.state;
        const { showModal } = this.props;
        return (
            <div>
                <Fragment>
                    <Modal show={showModal} onHide={this.handleClose}
                        size='lg'
                        backdrop="static"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title >
                                Delete Account
                              </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Are you sure you want to delete your account? This cannot be undone.
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="contained" color="primary" onClick={this.handleClose}>Cancel</Button>
                            <Button variant="contained" color="primary" onClick={this.deleteAccount}>Delete</Button>
                        </Modal.Footer>
                    </Modal >

                    {loading &&
                        <div className="loaderDiv"><div className="loader">
                            <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                        </div></div>
                    }
                </Fragment >

            </div >
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
            showAlert: bindActionCreators(actions.showAlert, dispatch),
            logout: bindActionCreators(actions.logout, dispatch),
            updatecart: bindActionCreators(actions.updateCart, dispatch)
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DeleteProfileModal);

