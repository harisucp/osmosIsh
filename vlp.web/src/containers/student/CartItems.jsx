import React, { Component, Fragment } from 'react';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import { APP_URLS } from "../../config/api.config";
import Loader from 'react-loaders';
import Button from '@material-ui/core/Button';
import { PUBLIC_URL } from "../../config/api.config";
import { localStorageService } from '../../services/localStorageService';
import SignIn from "../../containers/home/SignIn";
import { history } from '../../helpers/history';
import { commonFunctions } from "../../shared/components/functional/commonfunctions";
import moment from 'moment';
import { confirmAlert } from 'react-confirm-alert';
class CartItems extends Component {
    constructor(props) {
        super(props);
        let { auth } = this.props;
        this.state = {
            transactionInfo: [],
            userId: typeof (auth.user) === "undefined" ? -1 : auth.user.UserId,
            studentId: typeof (auth.user) === "undefined" ? -1 : auth.user.StudentId,
            enrolledSeriesSession: [],
            loading: false,
            charityAmount: 2,
            serviceFee: 18,
            showSigninModal: false,
            calculatedCharityFee: 0,
            calculatedServiceFee: 0,
            cartItemCount: 0,
            savedForLaterCount: 0,
            totalPrice: 0,
            //Coupon Related States
            couponCode: "",
            isCouponValidateMessage: "",// Response Message from coupon Validation API
            isCouponValid: false,
            couponDiscount: 0,
            couponDiscountType: '',
            calculatedDiscount: 0,
            couponId: 0,
            userCouponLogId: 0
        }
        this.removeCartItems = this.removeCartItems.bind(this);
        this.switchFromToCart = this.switchFromToCart.bind(this);
    }

    componentDidMount = () => {
        if (this.props.auth.loggedIn === true) {
            this.getCartItems();
        }
        else {
            this.getLocalStorageCart();
        }

    }
    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.auth.loggedIn !== this.props.auth.loggedIn) {
            console.log('pokemons state has changed.', this.props.auth);
            this.setState({
                studentId: this.props.auth.user.StudentId,
                userId: this.props.auth.user.UserId
            }, () => {
                this.getCartItems();
            })
          }
        // if (this.props.auth.loggedIn === true) {
        //     this.getCartItems();
        // }
    }
    getCartItems = () => {
        this.setState({ loading: true });
        apiService.post('UNAUTHORIZEDDATA', { "data": { "StudentId": this.state.studentId }, "keyName": "GetEnrollmentsByStudent" })
            .then(response => {
                if (response.Success) {
                    if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        this.setState({
                            enrolledSeriesSession: response.Data.ResultDataList
                        });
                        this.calculateCartDetails();
                        this.prepareTransactionData(response.Data.ResultDataList);
                    }else{
                        this.setState({
                            enrolledSeriesSession : []
                        })
                    }
                }else{
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                }
                this.setState({ loading: false });
            },
                (error) =>
                    this.setState((prevState) => {
                        console.log(`Session Detail:${error}`);
                        this.props.actions.showAlert({ message: 'Something went wrong...', variant: "error" });
                        this.setState({ loading: false });
                    })
            );
    }

    prepareTransactionData = (cardData) => {
        let cartItems = [];
        let cartItemInfo = {};
        const { totalPrice, calculatedCharityFee, calculatedServiceFee } = this.state;
        cardData.forEach((item, key) => {
            cartItemInfo = {
                "TransactionId": item.TransactionId > 0 ? item.TransactionId : 0,
                "EnrollmentId": item.EnrollmentId,
                "UserId": this.state.userId,
                "CouponId": null,
                "Description": '',
                "PaypalTransactionId": null,
                "IsPaymentSuccess": "N",
                "charity": calculatedCharityFee,
                "AmountPaid": totalPrice,
                "ServiceFee": calculatedServiceFee,
                "IsSavedForLater": item.IsSavedForLater
            }
            cartItems[key] = cartItemInfo;
        })
        // cardData.map((item, key) => {
        //     cartItemInfo = {
        //         "TransactionId": item.TransactionId > 0 ? item.TransactionId : 0,
        //         "EnrollmentId": item.EnrollmentId,
        //         "UserId": this.state.userId,
        //         "CouponId": null,
        //         "Description": '',
        //         "PaypalTransactionId": null,
        //         "IsPaymentSuccess": "N",
        //         "charity": calculatedCharityFee,
        //         "AmountPaid": totalPrice,
        //         "ServiceFee": calculatedServiceFee,
        //         "IsSavedForLater": item.IsSavedForLater
        //     }
        //     cartItems[key] = cartItemInfo;
        // })
        this.setState({ transactionInfo: cartItems });
    };

    removeCartItems = (enrollmentId) => {
        if (this.props.auth.loggedIn) {
            this.setState({ loading: true });
            apiService.post('DELETEENROLLMENT', { "enrollmentId": enrollmentId, "actionPerformedBy": this.props.auth.user.FirstName })
                .then(response => {
                    if (response.Success) {
                        let data = this.state.enrolledSeriesSession;
                        let removedItemData = data.filter(x => x.EnrollmentId === enrollmentId);
                        data = data.filter(x => x.EnrollmentId !== enrollmentId);
                        this.setState({ enrolledSeriesSession: data }, () => this.calculateCartDetails());
                        this.prepareTransactionData(data);
                        if (removedItemData[0].IsSavedForLater === "N") {
                            this.props.actions.decreementCart(1);
                        }
                        this.props.actions.showAlert({ message: response.Message, variant: "success" });
                    }else{
                        this.props.actions.showAlert({ message: response.Message, variant: "error" });
                    }
                    this.setState({ loading: false });
                },
                    (error) => 
                        this.setState((prevState) => {
                            console.log(`Delete Cart Item:${error}`);
                            this.props.actions.showAlert({ message: 'Something went wrong...', variant: "error" });
                            this.setState({ loading: false });
                        })
                );
        }
        else {
            let cartData = localStorageService.fetchCartItem();
            cartData = cartData.filter(x => x.EnrollmentId !== enrollmentId)
            this.props.actions.decreementCart(1);
            this.setState({ enrolledSeriesSession: cartData !== null ? cartData : [] }, () => this.calculateCartDetails());
            this.prepareTransactionData(cartData);
            localStorageService.updateCartItemStatus(cartData);
        }
    }

    preCreatePaymentValidation = (CalculatedAmount) => {
        const { enrolledSeriesSession } = this.state;
        const isLimitExceed = enrolledSeriesSession.filter(x => x.NumberOfJoineesAllowed > 16 && x.IsSavedForLater === "N");

        if (Object.entries(isLimitExceed).length > 0) {
            confirmAlert({
                message: <label>You have selected a session where there may be more than 16 attendees. While all attendees will be able to see the host, only the first 16 attendees to join the session will have their video feed visible.</label>,
                buttons: [
                    {
                        label: 'Okay',
                        onClick: () => this.CreatePayment(CalculatedAmount)
                    },
                    {
                        label: 'cancel',
                        onClick: () => { return false; }
                    }
                ]
            })
        }
        else {
            this.CreatePayment(CalculatedAmount);
        }
    }

    CreatePayment = (CalculatedAmount) => {
        let { enrolledSeriesSession, transactionInfo, cartItemCount, isCouponValid, couponId, userCouponLogId } = this.state;
        let overDatedData = cartItemCount.filter(x => x.SeriesId === null && moment().isAfter(commonFunctions.getUtcDatetime(x.StartTime), 'second'));
        let blockedTutor = cartItemCount.filter(x => x.TutorBlocked === "Y");
        let blockedClass = cartItemCount.filter(x => x.ClassBlocked === "Y");
        let deletedClass = cartItemCount.filter(x => x.RecordDeleted === "Y");
        if (overDatedData.length > 0) {
            this.props.actions.showAlert({ message: "The session you have added has already taken place and needs to be removed from your cart.", variant: "error" });
            return false;
        }
        if (blockedTutor.length > 0) {
            this.props.actions.showAlert({ message: "Please remove blocked tutor`s series/sessions from your cart.", variant: "error" });
            return false;
        }
        if (blockedClass.length > 0) {
            this.props.actions.showAlert({ message: "Please remove blocked series/session from your cart.", variant: "error" });
            return false;
        }
        if (deletedClass.length > 0) {
            this.props.actions.showAlert({ message: "Please remove cancelled series/session from your cart.", variant: "error" });
            return false;
        }

        this.setState({ loading: true });

        let cartItem = transactionInfo.filter(x => x.IsSavedForLater === 'N');
        let enrollmentId = '';
        cartItem.map((item, key) => {
            enrollmentId += item.EnrollmentId + ',';
        });
        localStorageService.storeCalendarCartItem({data: enrolledSeriesSession, amount: CalculatedAmount, orderTime:new Date(moment().format("MM/DD/YYYY hh:mm A"))});
        // return false;
        apiService.post('CREATEPAYMENT', {
            "studentId": this.props.auth.user.StudentId,
            "enrollments": enrollmentId.substring(0, enrollmentId.length - 1),
            "amount": CalculatedAmount,
            "subTotal": 0,
            "charity": 0,
            "actionPerformedBy": this.props.auth.user.FirstName,
            "couponId": isCouponValid === true ? couponId : 0,
            "userCouponLogId": isCouponValid === true ? userCouponLogId : 0
        }).then(response => {
            window.open(response.Message, "_self");
        }, (error) =>
            this.setState((prevState) => {
                this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
                this.setState({ loading: false });
            })
        );
    }
    switchFromToCart = (enrollmentId, moveToCart) => {
        if (this.state.studentId > 0) {
            this.handleCouponCodeChange("");
            this.setState({ loading: true });
            apiService.post('SWITCHITEMFROMTOCART',
                { "isSavedForLater": moveToCart, "enrollmentId": enrollmentId, "actionPerformedBy": this.props.auth.user.FirstName })
                .then(response => {
                    if (response.Success) {
                        let data = this.state.enrolledSeriesSession;
                        data.map(item => {
                            if (item.EnrollmentId === enrollmentId) {
                                item.IsSavedForLater = moveToCart;
                            }
                        });
                        this.setState({ enrolledSeriesSession: data }, () => this.calculateCartDetails());
                        this.prepareTransactionData(data);
                        if (moveToCart === 'Y') {
                            this.props.actions.decreementCart(1);
                            this.props.actions.showAlert({ message: "Your item has been Saved For Later.", variant: "success" });
                        }
                        else {
                            this.props.actions.increementCart(1);
                            this.props.actions.showAlert({ message: "Your item has been moved to your cart.", variant: "success" });
                        }
                    }else{
                        this.props.actions.showAlert({ message: response.Message, variant: "error" });
                    }
                    this.setState({ loading: false });
                },
                    (error) =>
                        this.setState((prevState) => {
                            console.log(`Delete Cart Item:${error}`);
                            this.props.actions.showAlert({ message: 'Something went wrong...', variant: "error" });
                            this.setState({ loading: false });
                        })
                );
        }
        else {
            this.isShowSignIn(true);
            // let cartItems = localStorageService.fetchCartItem();
            // cartItems.map(item => {
            //     if (item.EnrollmentId === enrollmentId) {
            //         item.IsSavedForLater = moveToCart;
            //     }
            // });
            // localStorageService.updateCartItemStatus(cartItems);
            // this.setState({ enrolledSeriesSession: cartItems }, () => this.calculateCartDetails());
            // if (moveToCart === 'Y') {
            //     this.props.actions.decreementCart(1);
            //     this.props.actions.showAlert({ message: "Your item has been Saved For Later.", variant: "success" });
            // }
            // else {
            //     this.props.actions.increementCart(1);
            //     this.props.actions.showAlert({ message: "Your item has been moved to your cart.", variant: "success" });
            // }
        }
    }

    getLocalStorageCart = () => {
        let cartItem = localStorageService.fetchCartItem();
        this.setState({ enrolledSeriesSession: cartItem !== null ? cartItem : [] }, () => this.calculateCartDetails());
    }

    // handleTutorDetails = (TutorId) => {
    //     history.push(`${PUBLIC_URL}/TutorProfile/${TutorId}`);
    // }

    isShowSignIn = (status) => {
        this.setState({ showSigninModal: status });
    }

    calculateCartDetails = () => {
        const { enrolledSeriesSession, charityAmount, serviceFee } = this.state;
        let totalPrice = 0, cartItemCount, savedForLaterCount, calculatedCharityAmount, calculatedServiceAmount;
        if (Object.keys(enrolledSeriesSession).length > 0) {
            totalPrice = enrolledSeriesSession.filter(x => x.IsSavedForLater === "N").reduce((prev, current) => { return prev + current.Fee }, 0);
            cartItemCount = enrolledSeriesSession.filter(x => x.IsSavedForLater === "N");
            savedForLaterCount = enrolledSeriesSession.filter(x => x.IsSavedForLater === "Y");
            if (totalPrice > 0) {
                calculatedServiceAmount = ((serviceFee / 100) * totalPrice).toFixed(2);
                if (!(calculatedServiceAmount >= 2)) {
                    calculatedServiceAmount = 2;
                }
                calculatedCharityAmount = ((charityAmount / 100) * totalPrice).toFixed(2);
            }
            this.setState({ totalPrice, calculatedCharityFee: calculatedCharityAmount, calculatedServiceFee: calculatedServiceAmount, cartItemCount, savedForLaterCount });
        }
    }


    handleViewDetails = (SeriesId, SessionId) => {
        if (SeriesId !== null && SeriesId > 0) {
            history.push(`${PUBLIC_URL}/SeriesDetail/${SeriesId}`);
        }
        else if (SessionId !== null && SessionId > 0) {
            history.push(`${PUBLIC_URL}/SessionDetail/${SessionId}`);
        }
    }
    handleShowCancelledMessage = (item) => {
        if (item.RecordDeleted === "Y") {
            this.props.actions.showAlert({ message: "Series/Session detail is not available as it has been cancelled by host.", variant: "error" });
        }
        else {
            history.push(item.SeriesId === null ? `${PUBLIC_URL}/SessionDetail/${item.SessionId}` : `${PUBLIC_URL}/SeriesDetail/${item.SeriesId}`);
            // // item.SeriesId === null ? `${ PUBLIC_URL } / SessionDetail / ${ item.SessionId }` : `${ PUBLIC_URL } / SeriesDetail / ${ item.SeriesId }`
        }
    }

    validatePromoCode = () => {
        const { auth } = this.props;
        const { couponCode, totalPrice } = this.state;

        if (couponCode === "") {
            this.props.actions.showAlert({ message: "Please enter valid coupon code.", variant: "error" });
            return false;
        }
        this.setState({ loading: true });
        let { transactionInfo } = this.state;

        let cartItem = transactionInfo.filter(x => x.IsSavedForLater === 'N');
        let enrollmentId = '';
        cartItem.map((item, key) => {
            enrollmentId += item.EnrollmentId + ',';
        });
        apiService.post("VALIDATECOUPONCODE", {
            "couponCode": couponCode,
            "userEmail": auth.user.Email,
            "userDate": moment(new Date()).format("YYYY-MM-DD"),
            "totalAmount": totalPrice,
            "studentId": this.props.auth.user.StudentId,
            "enrollments": enrollmentId.substring(0, enrollmentId.length - 1)
        })
            .then(response => {
                if (response.Success) {
                    var data = response.Data;
                    this.setState({
                        isCouponValid: true,
                        isCouponValidateMessage: response.Message,
                        couponId: data.CouponId,
                        userCouponLogId: data.UserCouponLogId,
                        couponDiscount: data.Discount,
                        couponDiscountType: data.DiscountType,
                        calculatedDiscount: data.Discount,
                        loading: false
                    });
                }else{
                    this.setState({
                        isCouponValid: false,
                        isCouponValidateMessage: response.Message,
                        loading: false
                    });
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                }
            },
                (error) =>
                    this.setState((prevState) => {
                        this.setState({ isCouponValid: false, isCouponValidateMessage: error });
                        this.setState({
                            isCouponValid: false,
                            isCouponValidateMessage: error,
                            couponId: 0,
                            userCouponLogId: 0,
                            couponDiscount: 0,
                            couponDiscountType: '',
                            calculatedDiscount: 0,
                            loading: false
                        });
                    })
            )
    }

    handleCouponCodeChange = (value) => {
        this.setState({ couponCode: value, isCouponValid: false, isCouponValidateMessage: '', couponDiscountType: '', calculatedDiscount: 0, couponDiscount: 0, couponId: 0, userCouponLogId: 0 });
    }

    render() {
        const { enrolledSeriesSession, loading, charityAmount, serviceFee, calculatedCharityFee, calculatedServiceFee, calculatedDiscount,
            cartItemCount, savedForLaterCount, totalPrice, couponCode, isCouponValidateMessage, couponDiscount, isCouponValid, couponDiscountType } = this.state;

        const { auth } = this.props;
        return (
            <Fragment>
                <section className="shopptinPage">
                    <div className="container">
                        <div className="row cartItemDiv">
                            {(() => {
                                if (Object.keys(enrolledSeriesSession).length > 0) {
                                    return <div className="col-lg-12 col-md-12 col-sm-12">
                                        <h3 className="text-center">Cart Items</h3>
                                        <div className="row itemDiv">
                                            <Fragment>
                                                {(() => {
                                                    if (Object.keys(cartItemCount).length === 0) {
                                                        return <div className="col-lg-12 col-md-12 col-sm-12">
                                                            <div className='imageDiv1'>
                                                                <div className="row">
                                                                    <div className="col-md-12 text-left">
                                                                        <h3>My Cart </h3>
                                                                    </div>
                                                                    <div className="col-md-12 text-left">
                                                                        <hr />
                                                                    </div>
                                                                </div>
                                                                <span className="noProduct"><img width="" height=""  alt='Empty Cart' className='imageContainer img-fluid' src={require("../../assets/images/undraw_empty_cart.png")}></img></span>
                                                                <h3 className="text-center">Empty cart</h3>
                                                                {!auth.loggedIn &&
                                                                    <h5 className="text-center">Signin to see the items you added previously</h5>}
                                                            </div>
                                                        </div>
                                                    }
                                                })()}
                                                <div className={Object.keys(cartItemCount).length === 0 ? "col-md-12 mt-4" : "col-lg-8 col-md-12 mt-4"}>
                                                    {(() => {
                                                        if (Object.keys(cartItemCount).length > 0) {
                                                            return <div className="gridSection">
                                                                <div className="row">
                                                                    <div className="col-md-12">
                                                                        <h3>My Cart ({Object.keys(cartItemCount).length})</h3>
                                                                    </div>
                                                                </div>
                                                                {enrolledSeriesSession.map((item, key) => {
                                                                    return item.IsSavedForLater === 'N' ? <Fragment>
                                                                        <div className="row" >
                                                                            <div className="col-md-4">
                                                                                <div className="thumbImage cartItemThumb" onClick={() => this.handleViewDetails(item.SeriesId, item.SessionId)}
                                                                                    style={{ backgroundImage: `url(${APP_URLS.API_URL}${item.ImageFile}` }} >
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-8">
                                                                                <div className="discriptionCol">
                                                                                    <Fragment>
                                                                                        <div className="date">
                                                                                            <span className="mainCaption" onClick={() => this.handleShowCancelledMessage(item)}>
                                                                                                {item.Title}
                                                                                                {/* <a href={item.SeriesId === null ? `${ PUBLIC_URL } / SessionDetail / ${ item.SessionId }` : `${ PUBLIC_URL } / SeriesDetail / ${ item.SeriesId }`} >{item.Title}</a> */}
                                                                                            </span>
                                                                                            <div className="divider"></div>
                                                                                            <a className="subcaption" href={`${PUBLIC_URL}/TutorProfile/${item.TeacherId}`}>By {item.FullName}</a>
                                                                                            <div className="divider"></div>
                                                                                            <span className="itemPrice">$ {item.Fee}</span>
                                                                                        </div>
                                                                                    </Fragment>
                                                                                </div>
                                                                                <div className="actionBtn">
                                                                                    <div className="row">
                                                                                        <Button variant="outlined" onClick={() => this.removeCartItems(item.EnrollmentId)} >Remove</Button>
                                                                                        <Button variant="contained" color="primary" onClick={() => this.switchFromToCart(item.EnrollmentId, 'Y')} >Save For Later</Button>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="actionBtn">
                                                                                    <div className="row">
                                                                                        {item.SeriesId === null && moment().isAfter(commonFunctions.getUtcDatetime(item.StartTime), 'second') &&
                                                                                            <label className="infoLabel">This class is no longer available</label>
                                                                                        }
                                                                                        {item.ClassBlocked === 'Y' &&
                                                                                            <label className="infoLabel">Series/Session Blocked</label>
                                                                                        }
                                                                                        {item.TutorBlocked === 'Y' &&
                                                                                            <label className="infoLabel">Tutor Blocked</label>
                                                                                        }
                                                                                        {item.RecordDeleted === 'Y' &&
                                                                                            <label className="infoLabel">Series/Session Cancelled</label>
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div> </Fragment> : null
                                                                })}
                                                            </div>
                                                        }
                                                    })()}
                                                    {(() => {
                                                        if (Object.keys(savedForLaterCount).length > 0) {
                                                            return <Fragment>
                                                                <div className="gridSection mt-5">
                                                                    <div className="row">
                                                                        <div className="col-md-12">
                                                                            <h3>Save For Later ({Object.keys(savedForLaterCount).length})</h3>
                                                                        </div>
                                                                    </div>
                                                                    {enrolledSeriesSession.map((item, key) => {
                                                                        return item.IsSavedForLater === 'Y' ? <div className="row" >
                                                                            <div className={(Object.keys(cartItemCount).length > 0 ? 'col-md-4' : 'col-md-3')}>
                                                                                <div className="thumbImage cartItemThumb" onClick={() => this.handleViewDetails(item.SeriesId, item.SessionId)}
                                                                                    style={{ backgroundImage: `url(${APP_URLS.API_URL}${item.ImageFile}` }} >
                                                                                </div>
                                                                            </div>
                                                                            <div className={(Object.keys(cartItemCount).length > 0 ? 'col-md-8' : 'col-md-9')}>
                                                                                <div className="discriptionCol">
                                                                                    <Fragment>
                                                                                        <div className="date">
                                                                                            <span className="mainCaption" onClick={() => this.handleShowCancelledMessage(item)}>
                                                                                                {item.Title}
                                                                                                {/* <a href={item.RecordDeleted === "Y" ? "" : item.SeriesId === null ? `${ PUBLIC_URL } / SessionDetail / ${ item.SessionId }` : `${ PUBLIC_URL } / SeriesDetail / ${ item.SeriesId }`} ></a> */}
                                                                                            </span>
                                                                                            <div className="divider"></div>
                                                                                            <a className="subcaption" href={`${PUBLIC_URL}/TutorProfile/${item.TeacherId}`}>By {item.FullName}</a>
                                                                                            <div className="divider"></div>
                                                                                            <span className="itemPrice">$ {item.Fee}</span>
                                                                                        </div>
                                                                                    </Fragment>
                                                                                </div>
                                                                                <div className="actionBtn">
                                                                                    <div className="row">
                                                                                        <Button variant="outlined" onClick={() => this.removeCartItems(item.EnrollmentId)} >Remove</Button>
                                                                                        <Button variant="contained" color="primary" onClick={() => this.switchFromToCart(item.EnrollmentId, 'N')} >Move To Cart</Button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                        </div> : null
                                                                    })}
                                                                </div>
                                                            </Fragment>
                                                        }
                                                    })()}
                                                </div>
                                                {
                                                    (() => {
                                                        if (Object.keys(cartItemCount).length > 0) {
                                                            return <div className="col-lg-4 col-md-12 col-sm-12">
                                                                <div className="cosSideBsr">
                                                                    {auth.loggedIn &&
                                                                        < div className="shippingColSection">
                                                                            <table className="table scsTable">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th><h4>Promotional Code</h4></th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td className="text-center">Have a coupon? </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>
                                                                                            <div className="input-group ssFrom">
                                                                                                <input type="text" className="form-control" placeholder="Enter code here" value={couponCode} onChange={(e) => this.handleCouponCodeChange(e.target.value)} />
                                                                                                <span className="input-group-btn">
                                                                                                    <button className="btn btn-theme subscriptionBtn" onClick={this.validatePromoCode}>Apply Code</button>
                                                                                                </span>
                                                                                            </div>
                                                                                            <label className={isCouponValid ? "successMessage" : "errorMessage"}>{isCouponValidateMessage}</label>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>}
                                                                    <div className="shippingColSection">
                                                                        <table className="table scsTable">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th colspan="2"><h4>Price Details</h4></th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr className="addBottomBorder">
                                                                                    <td>Price ({Object.keys(cartItemCount).length} {Object.keys(cartItemCount).length > 1 ? "items" : "item"})</td>
                                                                                    <td>${totalPrice.toFixed(2)}
                                                                                    </td>
                                                                                </tr>
                                                                                {/* Coupon Discount  */}
                                                                                {isCouponValid &&
                                                                                    < tr className="addBottomBorder">
                                                                                        <td>Discount</td>
                                                                                        <td>${calculatedDiscount > totalPrice ? totalPrice.toFixed(2) : calculatedDiscount.toFixed(2)} </td>
                                                                                    </tr>
                                                                                }
                                                                                {/* EnD */}

                                                                                <tr className="addBottomBorder">
                                                                                    <td>Total Price</td>
                                                                                    <td>${(totalPrice.toFixed(2) - calculatedDiscount.toFixed(2)) > 0 ? (totalPrice - calculatedDiscount).toFixed(2) : '0'}</td>
                                                                                </tr>

                                                                                <tr className="addBottomBorder">
                                                                                    {!((totalPrice.toFixed(2) - calculatedDiscount.toFixed(2)) > 0) && !totalPrice.toFixed(2) &&
                                                                                        <td colSpan='2' className='errorMessage'>Please note that you are not eligible for a refund and this coupon will expire once used.</td>
                                                                                    }
                                                                                </tr>
                                                                                <tr className="addBottomBorder">
                                                                                    <td>20% Service Fee Included</td>
                                                                                </tr>
                                                                                {
                                                                                    <tr>
                                                                                        {auth.loggedIn === true &&
                                                                                            <td colspan="2" className="text-center">
                                                                                                <Button variant="contained" color="primary" onClick={() => this.preCreatePaymentValidation((totalPrice.toFixed(2) - calculatedDiscount.toFixed(2)) > 0 ? (totalPrice.toFixed(2) - calculatedDiscount.toFixed(2)) : 0)} >Checkout</Button>
                                                                                            </td>
                                                                                        }
                                                                                        {auth.loggedIn === false &&
                                                                                            <td colspan="2" className="text-center">
                                                                                                <Button variant="contained" color="primary" onClick={() => this.isShowSignIn(true)} >Sign in</Button>
                                                                                                <h3 className="mt-3">Sign In to checkout</h3>
                                                                                            </td>
                                                                                        }
                                                                                    </tr>
                                                                                }
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        }
                                                    })()
                                                }
                                            </Fragment>
                                        </div>
                                    </div>
                                }
                                else {
                                    return <div className="col-lg-12 col-md-12 col-sm-12">
                                        <div className='imageDiv'>
                                            <img width="350" height="280"  className='imageContainer' alt='Empty Cart'  src={require("../../assets/images/undraw_empty_cart.png")}></img>
                                            <h3 className="text-center">Empty cart </h3>
                                        </div>
                                    </div>
                                }
                            })()}
                            <div>
                            </div>
                            {/* <div >
                                <div class="successMessageWrapper">
                                    <h1>Congratulations! You've <span>completed</span> payment.</h1>
                                </div>
                            </div> */}
                        </div>
                    </div>
                    <SignIn showSignIn={this.state.showSigninModal} onSignInClose={this.isShowSignIn}></SignIn>
                </section>
                {
                    loading &&
                    <div className="loaderDiv"><div className="loader">
                        <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                    </div></div>
                }
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
            showAlert: bindActionCreators(actions.showAlert, dispatch),
            increementCart: bindActionCreators(actions.increementCart, dispatch),
            updateCart: bindActionCreators(actions.updateCart, dispatch),
            decreementCart: bindActionCreators(actions.decreementCart, dispatch)
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(CartItems);