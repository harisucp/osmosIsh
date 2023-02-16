import React, { Component, Fragment } from 'react';
import { PUBLIC_URL } from "../../config/api.config";
import { apiService } from "../../services/api.service";
import { history } from '../../helpers/history';
import * as actions from "../../store/actions";
import Loader from 'react-loaders';
import { bindActionCreators } from "redux";
import queryString from 'query-string';
import signin from "../../assets/images/signinnew.png";
import { connect } from 'react-redux';
class PaymentVerify extends Component{
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            status: null,
        }
    }

    componentDidMount = () => {
        this.handleVerifyPayment();
    }

    handleVerifyPayment = () => {
        this.setState({ loading: true, status: null });
        let queryParams = queryString.parse(this.props.location.search);
        apiService.getPaymentVerify('PAYMENTVERIFY', { "transactionId": Number(queryParams.transactionId), "paymentId": queryParams.paymentId, "token": queryParams.token , "PayerID": queryParams.PayerID})
            .then(response => {
                // console.log(typeof response); return false;
                if (response) {
                    this.setState({ status: true,  loading: false });
                    history.push(`${PUBLIC_URL}/PagePaymentSuccess`);
                }else{
                    this.setState({ loading: false, status: false });
                    history.push(`${PUBLIC_URL}/PageFailedPayment`);  
                }
            },
                (error) =>
                    this.setState((prevState) => {
                        this.setState({ loading: false, status: false });
                        history.push(`${PUBLIC_URL}/PageFailedPayment`);
                    })
            );
    }
    render() {
        const { loading, status } = this.state;
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
                                            {loading === true && <h4>Hold on, we are verifying your Payment.</h4>}
                                            {
                                                loading === false && <div className="error-details">
                                                    {status === false && <Fragment><h5>We are having trouble in payment.</h5></Fragment>}
                                                    {status === true && <Fragment><h5>Your payment has successfully done!</h5><p> Start browsing our classes. </p><button onClick={history.push(`${PUBLIC_URL}/CourseSearch`)} className="btn btn-blue"><img width="" height=""  src={signin} alt="image" />Find a class</button></Fragment>}
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
export default connect(mapStateToProps, mapDispatchToProps)(PaymentVerify);