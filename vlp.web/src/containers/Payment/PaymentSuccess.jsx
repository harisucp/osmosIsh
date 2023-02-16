import React, { Component, Fragment } from 'react';
import { PUBLIC_URL } from "../../config/api.config";
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import { localStorageService } from '../../services/localStorageService';
import { APP_URLS } from "../../config/api.config";
import FormatDateTime from '../../shared/components/functional/DateTimeFormatter';
import { history } from '../../helpers/history';
import AddToCalendar from "react-add-to-calendar";
import "react-add-to-calendar/dist/react-add-to-calendar.css";
class PagePaymentSuccess extends Component {
    constructor(props) {
        super(props);
        // let { auth } = this.props;
        this.state = {
            cartCount: 0,
            description: "Hello, in order to join a video session, 5 minutes before your start time, you will need to go to your Host or User dashboard at osmosish.com and below the information with your progress, there will be a card with your class information and a button to join.",
            CalendarCartItem: []
        };
    }
    componentDidMount = () => {
        this.getCartItems();
        const CalendarCartItem = localStorageService.getCalendarCartItem();
        console.log(CalendarCartItem);
        this.setState({ CalendarCartItem });
    }

    getCartItems = () => {

        this.setState({ loading: true });
        apiService.post('UNAUTHORIZEDDATA', { "data": { "StudentId": this.props.auth.user.StudentId }, "keyName": "GetCartItemCount" })
            .then(response => {
                if (response.Success) {

                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        this.setState({ cartCount: response.Data.ResultDataList[0].CartCount });
                        this.props.actions.updateCart(response.Data.ResultDataList[0].CartCount);
                    }


                } else {
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

    handleViewDetails = (SeriesId, SessionId) => {
        if (SeriesId !== null && SeriesId > 0) {
            history.push(`${PUBLIC_URL}/SeriesDetail/${SeriesId}`);
        }
        else if (SessionId !== null && SessionId > 0) {
            history.push(`${PUBLIC_URL}/SessionDetail/${SessionId}`);
        }
    }
    render() {
        const { CalendarCartItem, description } = this.state;
        const { userTimezone } = this.props;
        return (
            <section className="series-Session">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12  col-md-12 col-sm-12">
                            <div className="notFoundForm">
                                <div className="row mb-4">
                                    <div className="blankSpace">
                                        <img width="" height="" style={{ 'width': '100px' }} src={require('../../assets/images/Green-tick.png')} alt={'Payment SuccessFull'}></img>
                                        <div className="mainCaption mb-4">
                                            Thank you for your purchase!
                                        </div>
                                        <p className='subcaptionlight'>Your order confirmation has been sent to {this.props.auth.user.Email}</p>
                                        <div className="row">
                                            <div className="col-md-2"></div>
                                            <div className="col-md-8 main-transaction-success p-4 mb-4">
                                                {CalendarCartItem.data && CalendarCartItem.data.length &&
                                                    CalendarCartItem.data.map((item, key) => {
                                                        return <Fragment>
                                                            <div className='mb-4' key={key} style={(CalendarCartItem.data.length !== key + 1) ? { 'border-bottom': '1px solid lightgray' } : {}} >
                                                                <p className="mainCaption text-left">
                                                                    {item.Title}
                                                                    {/* <a href={item.SeriesId === null ? `${ PUBLIC_URL } / SessionDetail / ${ item.SessionId }` : `${ PUBLIC_URL } / SeriesDetail / ${ item.SeriesId }`} >{item.Title}</a> */}
                                                                </p>
                                                                <p className="subcaptionlight time text-left">
                                                                    <i className='fa fa-clock-o'></i>
                                                                    <span> <FormatDateTime date={item.StartTime} format="dddd, MMM DD, YYYY"></FormatDateTime> </span>
                                                                    <span><FormatDateTime date={item.StartTime} format="h:mmA"></FormatDateTime></span>-
                                                                    <span><FormatDateTime date={item.Endtime} format="h:mmA"></FormatDateTime> </span>
                                                                    {userTimezone}
                                                                </p>
                                                                <p className="text-left">
                                                                    <i className='fa fa-user-o'></i>
                                                                    <a className="subcaption" href={`${PUBLIC_URL}/TutorProfile/${item.TeacherId}`}> {item.FullName}</a>
                                                                </p>
                                                                <p className="subcaptionlight time text-left"><i className='fa fa-ticket'></i> 1 Ticket</p>
                                                                <p className="text-left mb-4">
                                                                    <AddToCalendar buttonTemplate={{ 'calendar-plus-o': 'left' }} event={{ title: item.Title, description: description, location: "osmosish.com", startTime: item.StartTime, endTime: item.Endtime }} />
                                                                </p>
                                                            </div>
                                                            {/* <tr key={key}>
                                                            <td className="col-md-4">
                                                            <img className="thumbImage cartItemThumb" onClick={() => this.handleViewDetails(item.SeriesId, item.SessionId)}
                                                            src={`${APP_URLS.API_URL}${item.ImageFile}`} />
                                                            </td>
                                                            <td className="col-md-4">
                                                            <div className="discriptionCol">
                                                            <Fragment>
                                                                        <div className="date">
                                                                            <span className="mainCaption">
                                                                                {item.Title}
                                                                                {/* <a href={item.SeriesId === null ? `${ PUBLIC_URL } / SessionDetail / ${ item.SessionId }` : `${ PUBLIC_URL } / SeriesDetail / ${ item.SeriesId }`} >{item.Title}</a> *
                                                                            </span>
                                                                            <div className="divider"></div>
                                                                            <a className="subcaptionlight" href={`${PUBLIC_URL}/TutorProfile/${item.TeacherId}`}>By {item.FullName}</a>
                                                                            <div className="divider"></div>
                                                                            <span className="itemPrice">$ {item.Fee}</span>
                                                                        </div>
                                                                    </Fragment>
                                                                </div>
                                                            </td>
                                                            <td className="col-md-4 actionBtn pt-4">
                                                            <AddToCalendar buttonTemplate={{ 'calendar-plus-o': 'left' }} event={{ title: item.Title, description: item.Description, location: "", startTime: item.StartTime, endTime: item.Endtime }} />
                                                            {/* <Button variant="outlined" onClick={() => this.removeCartItems(item.EnrollmentId)} >Remove</Button> *
                                                            </td>
                                                        </tr> */}
                                                        </Fragment>
                                                    })

                                                }
                                                {CalendarCartItem &&
                                                    <div className='mb-4 p-4'>
                                                        <div className='mb-2 row'>
                                                            <p className="mainCaption col-md-6 text-left">General Admission</p>
                                                            <p className="mainCaption col-md-6 text-right">Free</p>
                                                        </div>
                                                        <div className="row">
                                                            <p className="subcaptionlight col-md-6 text-left">My Ticket</p>
                                                        </div>
                                                        
                                                        <div className='row'>
                                                            <p className="subcaptionlight col-md-6 text-left">Order Total</p>
                                                            <p className="subcaptionlight col-md-6 text-right">${CalendarCartItem.amount}</p>
                                                        </div>
                                                        <div className='row'>
                                                            <p className="subcaptionlight col-md-6 text-left">Order Number</p>
                                                            <p className="subcaptionlight col-md-6 text-right">{this.state.orderNumber || "123213232133233"}</p>
                                                        </div>
                                                        <div className='row'>
                                                            <p className="subcaptionlight col-md-4 text-left">Order Time</p>
                                                            <p className="subcaptionlight col-md-8 time text-right">
                                                                <i className='fa fa-clock-o'></i>
                                                                <span> <FormatDateTime date={CalendarCartItem.orderTime} format="dddd, MMM DD, YYYY"></FormatDateTime> </span>
                                                                <span><FormatDateTime date={CalendarCartItem.orderTime} format="h:mmA"></FormatDateTime></span>-
                                                                {userTimezone}
                                                            </p>
                                                        </div>

                                                    </div>
                                                }
                                            </div>
                                            <div className="col-md-2"></div>
                                        </div>
                                        <p>
                                            <button
                                                type="button"
                                                className="btn btn-blue btn-lg"
                                                onClick={() => this.props.history.push(`${PUBLIC_URL}/StudentDashboard`)}>
                                                View Your Schedule
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>);
    }
}


const mapStateToProps = state => {
    return {
        auth: state.auth,
        userTimezone: state.timezone.userTimezone,
    };
};
const mapDispatchToProps = dispatch => {
    return {
        actions: {
            showAlert: bindActionCreators(actions.showAlert, dispatch),
            updateCart: bindActionCreators(actions.updateCart, dispatch),
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(PagePaymentSuccess);