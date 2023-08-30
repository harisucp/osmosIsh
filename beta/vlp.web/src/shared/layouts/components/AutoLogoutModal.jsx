import React, { Component, Fragment } from 'react';
import { Modal } from 'react-bootstrap';
import "../../../assets/scss/autologout_modal.scss";

class AutoLogoutModal extends Component {
    render() {
        return (
            <Fragment>
                <Modal className="autologout_modal" show={this.props.showAutoLogoutModal}
                    size="md"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <button type="button" className="close" onClick={() => this.props.onClose()}>
                        <span>×</span>
                    </button>
                    <Modal.Body>
                        <i className="fa fa-hourglass-end"></i>
                        <h4>It looks like you left, so we logged you out to keep your account safe.</h4>
                        <button className="btn btn-blue logCss" type="button" onClick={() => this.props.onClose()}>Ok</button>
                    </Modal.Body>
                </Modal >
            </Fragment >

        );
    }
}
export default AutoLogoutModal;
