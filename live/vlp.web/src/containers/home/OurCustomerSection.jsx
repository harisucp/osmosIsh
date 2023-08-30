import React, { Component, Fragment } from 'react';
import { apiService } from '../../services/api.service';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import Loader from 'react-loaders';
import { APP_URLS } from "../../config/api.config";
import ReadMoreReact from 'read-more-react';
import Swiper from 'react-id-swiper';
import 'swiper/css/swiper.css';
class OurCustomer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            customerDetails: [],
            loading: false
        }
    };
    getCustomerReviews = () => {
        this.setState({ loading: true });
        apiService.post('UNAUTHORIZEDDATA', { "Data": { "StudentId": -2 }, "KeyName": "GetCustomerReviews" })
            .then(response => {
                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        this.setState({ customerDetails: response.Data.ResultDataList });
                    }

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

    componentDidMount() {
        this.getCustomerReviews();
    }

    render() {
        const { customerDetails, loading } = this.state;

        const params = {
            loop: true,
            autoplay: {
                delay: 5000,
            }
        }

        return (
            <Fragment>
                {customerDetails.length > 0 && <section className="customers">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="headingTitle text-center">
                                    <h3>Some words from our happy <br /> customers.</h3>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="testimonialCarousel">
                                    {/* <div className="headingInnerTitle">
                                        <h4>Some words from our happy <br /> customers.</h4>
                                    </div> */}
                                    <div className="testimonialInner">
                                        <Swiper {...params}>
                                            {customerDetails.map((customer, index) => {
                                                return (
                                                    <div className="item" key={index}>
                                                        <div className="thumbSlider">
                                                            <div className="icon"><img src={`${APP_URLS.API_URL}${customer.ImageFile}`} alt="customerimage" width="88" height="93"/></div>
                                                            <ReadMoreReact text={customer.Comments}
                                                                min={150}
                                                                ideal={170}
                                                                max={400}
                                                                readMoreText="Read more" />
                                                            <h5>{customer.StudentName}</h5>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </Swiper>
                                    </div>
                                    {/* </div> */}
                                </div>
                            </div>
                        </div>
                        {loading &&
                            <div className="loaderDiv"><div className="loader">
                                <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                            </div></div>}
                    </div>
                </section>
                }
            </Fragment >
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
export default connect(mapStateToProps, mapDispatchToProps)(OurCustomer);
