import React, { Component, Fragment } from 'react';
import Select from 'react-select';
import { Modal } from 'react-bootstrap';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import SimpleReactValidator from 'simple-react-validator';
import Loader from 'react-loaders';
// import Rating from '@material-ui/lab/Rating';
import { TextArea } from 'semantic-ui-react';
import Button from '@material-ui/core/Button';
class Dispute extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dispute: {
                reason: "",
                disputeReasonId: '',
            },
            showDisputeModal: false,
            loading: false,
            disputeCategories: [],
            disputeData: {}
        };

        this.validator = new SimpleReactValidator();
    }

    componentDidMount = () => {
        this.getDisputeReasons();
    }

    handleChange = (e) => {
        const { dispute } = this.state;
        dispute[e.target.name] = e.target.value;
        this.setState({ dispute });
    }

    handleDisputeSubmit = () => {
        this.setState({ loading: true });
        if (this.validator.allValid() === false) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        const { dispute, disputeData } = this.state;
        apiService.post('COMMONSAVE', {
            "data": [{
                DisputeId: 0,
                Reason: dispute.reason,
                DisputeReason: dispute.disputeReasonId,
                DisputeStatus: disputeData.DisputeStatus,
                TeacherId: disputeData.TeacherId,
                StudentId: this.props.auth.user.StudentId,
                SessionId: disputeData.SessionId,
                TutorResponse: 'N',
                EnrollmentId: disputeData.EnrollmentId
            }],
            "entityName": "Disputes",
            "additionalFields": {
                "userName": "Admin"
            }
        })
            .then(response => {
                if (response.Success) {
                    this.props.onDisputeClose(false, true);
                    this.props.actions.showAlert({ message: "Dispute submitted successfully", variant: "success" });
                }else{
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                }
                this.setState({ loading: false, showDisputeModal: false });
            },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
                        this.setState({ loading: false });
                    })
            )

    }

    getDisputeReasons = () => {
        this.setState({ loading: true });
        apiService.post('UNAUTHORIZEDDATA', { "data": { "CategoryId": "DisputeReason" }, "keyName": "GetGlobalCodesByCategory" })
            .then(response => {
                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        this.setState({ disputeCategories: response.Data.ResultDataList });
                    }

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

    componentWillReceiveProps = (props) => {

        this.setState({ showDisputeModal: props.ShowDispute, disputeData: props.disputeData });

    }
    handleSelectChange = (opt, meta) => {
        const { dispute } = this.state;
        dispute[meta.name] = opt.value;
        this.setState({ dispute });
    }

    handleClose = () => {
        const { dispute } = this.state;
        dispute.reason = '';
        dispute.disputeReasonId = '';
        this.setState({ dispute, showDisputeModal: false });
        this.props.onDisputeClose(false, false);
    }

    render() {
        const { dispute, loading, disputeCategories } = this.state;
        let disputeReasons = [];
        disputeCategories.forEach(item => {
            disputeReasons.push({ value: item.GlobalCodeId, label: item.CodeName });
        });
        // disputeCategories.map((item) => {
        //     disputeReasons.push({ value: item.GlobalCodeId, label: item.CodeName });
        // });
        return (
            <Fragment>
                <Modal show={this.state.showDisputeModal} onHide={this.handleClose}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title >
                            Dispute
                              </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="formWrapper">
                            <div className="form-group">
                                <div className="filter">
                                    <Select
                                        name="disputeReasonId"
                                        placeholder='Choose Dispute Reason'
                                        value={disputeReasons.filter(obj => obj.value === dispute.disputeReasonId)}
                                        onChange={this.handleSelectChange}
                                        options={disputeReasons}
                                    />
                                </div>
                                {this.validator.message('disputeReasonId', dispute.disputeReasonId, 'required')}
                            </div>
                            <div className="form-group">
                                <label>Reason</label>
                                <TextArea className="form-control" name="reason" onChange={this.handleChange}
                                    placeholder="Reason" value={dispute.reason}></TextArea>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outlined" onClick={this.handleClose} color="primary">Cancel</Button>
                        <Button variant="contained" onClick={this.handleDisputeSubmit} color="primary">Submit</Button>
                    </Modal.Footer>
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

export default connect(mapStateToProps, mapDispatchToProps)(Dispute);
