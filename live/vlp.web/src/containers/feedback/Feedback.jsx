import React, { Component, Fragment } from 'react';
import { Modal } from 'react-bootstrap';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import SimpleReactValidator from 'simple-react-validator';
import Loader from 'react-loaders';
import Rating from '@material-ui/lab/Rating';
import { TextArea } from 'semantic-ui-react';
import Button from '@material-ui/core/Button';
import Dispute from '../Dispute/dispute';
import { PUBLIC_URL } from "../../config/api.config";
class Feedback extends Component {
    constructor(props) {
        super(props);
        let { auth, match } = this.props;
        this.state = {
            feedback: {
                rating: '',
                review: ""
            },
            disputeData: [],
            disputeCodeId: 0,
            enrollmentId: 0,
            studentId: this.props.auth.user.StudentId,
            tutorId: 0,
            sessionData: [],
            sessionId: parseInt(match.params.SessionId),
            showRatingModal: false,
            showDisputeModal: false,
            loading: false,
        };
        this.validator = new SimpleReactValidator();
    }

    handleChange = (e) => {
        const { feedback } = this.state;
        feedback[e.target.name] = e.target.value;
        this.setState({ feedback });
    }

    handleRating = (invokedBy, value) => {
        const { feedback } = this.state;
        feedback[invokedBy] = value;
        this.setState({ feedback });
    }

    handleFeedbackSubmit = () => {

        if (this.validator.allValid() === false) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        this.setState({ loading: true });
        const { feedback, studentId, sessionId, tutorId, disputeCodeId, enrollmentId } = this.state;
        apiService.post('SESSIONREVIEWRATING', {
            "StudentId": studentId,
            "SessionId": sessionId,
            "Review": feedback.review,
            "Rating": feedback.rating,
            "ActionPerformedBy": "admin"
        })
            .then(response => {

                if (response.Success) {
                    this.props.actions.showAlert({ message: response.Message, variant: "success" });
                    if (Number(feedback.rating) === 1) {
                        this.setState({
                            disputeData: {
                                DisputeStatus: disputeCodeId,
                                TeacherId: tutorId,
                                SessionId: sessionId,
                                EnrollmentId: enrollmentId
                            },
                            showDisputeModal: true
                        });
                    }
                    this.setState({ showRatingModal: false, feedback: { rating: 0, review: "" } });

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
            )
    }
    isShowDispute = (status, success) => {
        this.setState({ showDisputeModal: status });
    }

    handleClose = () => {
        const { feedback } = this.state;
        feedback.rating = '';
        feedback.review = '';
        this.setState({ feedback, showRatingModal: false });
    }

    handleFeedBack = () => {

        let { match } = this.props;
        if (match.params.ShowModal && match.params.ShowModal === 'y') {
            this.setState({ showRatingModal: true });
        }
    }
    componentDidMount = () => {
        this.handleFeedBack();
        this.getDisputeRaiseCode();
        this.getSessionTutorId();
    }
    getDisputeRaiseCode = () => {
        this.setState({ loading: true });
        apiService.post('UNAUTHORIZEDDATA', { "data": { "CategoryId": "DisputeStatus" }, "keyName": "GetGlobalCodesByCategory" })
            .then(response => {

                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        const codeData = response.Data.ResultDataList.filter(x => x.CodeName === "Raised");
                        this.setState({ disputeCodeId: codeData[0].GlobalCodeId });
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

    getSessionTutorId = () => {
        this.setState({ loading: true });
        const { auth, match } = this.props;
        
        apiService.post('UNAUTHORIZEDDATA', {
            "data": { SessionId: this.state.sessionId, StudentId: match.params.ShowModal === 'n' ? -1 : auth.user.StudentId > 0 ? auth.user.StudentId : -1 },
            "keyName": "GetSessionTutor"
        })
            .then(response => {

                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        const responseData = response.Data.ResultDataList[0];
                        this.setState({ tutorId: responseData.TeacherId, enrollmentId: responseData.EnrollmentId });
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
    render() {
        const { feedback, loading } = this.state;
        return (
            <Fragment>
                <section class="series-Session">
                    <div class="container">
                        <div class="row">
                            <div class="col-sm-12">
                                <div className="feedback">
                                    <div className="row">
                                        <div className="blankSpace">
                                            <img width="" height=""  src={require('../../assets/images/feedback.png')}></img>
                                            <h2 class="text-lowercase">Thank you for using Osmos-ish</h2>
                                            <p>
                                                <button
                                                    type="button"
                                                    className="btn btn-blue btn-lg"
                                                    onClick={() => this.props.history.push(`${PUBLIC_URL}/CourseSearch`)}>
                                                    {/* <span className="fa fa-home"></span> */}
                                                    Browse Other Classes
                                        </button>
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            {/* <button type="button" onClick={this.handleFeedBack}>Show Feeback</button> */}
                        </div>
                    </div>
                </section>
                <Modal show={this.state.showRatingModal} onHide={this.handleClose}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title >
                            Feedback
                              </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="formWrapper">
                            <div className="form-group feedbackReview">
                                <label>Rating</label>
                                <Rating size='large' name="rating" value={feedback.rating} onChange={(event, newValue) => {
                                    this.handleRating('rating', newValue)
                                }
                                } />
                                {this.validator.message('Rating', feedback.rating, 'required')}
                            </div>
                            <div className="form-group">
                                <label>Review</label>
                                <TextArea className="form-control" name="review" onChange={this.handleChange}
                                    placeholder="Please share public feedback on how your class went." value={feedback.review}></TextArea>
                                {this.validator.message('Feedback', feedback.review, 'required')}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="button" className="link-button" onClick={this.handleClose}>Skip</Button>
                        <Button variant="contained" onClick={this.handleFeedbackSubmit} color="primary">Rate</Button>
                    </Modal.Footer>
                </Modal >
                <Dispute ShowDispute={this.state.showDisputeModal} disputeData={this.state.disputeData} onDisputeClose={this.isShowDispute}></Dispute>
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

export default connect(mapStateToProps, mapDispatchToProps)(Feedback);
