import React, { Component, Fragment } from 'react';
import { apiService } from '../../services/api.service';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import SimpleReactValidator from 'simple-react-validator';
import Loader from 'react-loaders';
class SubscribeUs extends Component {
    constructor(props) {
        super(props)
        this.state = {
            subscriptionform: {
                email: ""
            },
            loading: false
        }
        this.validator = new SimpleReactValidator();
    }
    handleChange = (e) => {

        const { subscriptionform } = this.state;
        subscriptionform[e.target.name] = e.target.value;
        this.setState({ subscriptionform });
    }
    resetForm = () => {
        this.validator = new SimpleReactValidator();
        const { subscriptionform } = this.state;
        subscriptionform.email = '';
        this.setState({ subscriptionform, loading: false });

    }
    handleSubmit = (e) => {
        e.preventDefault();
        if (this.validator.allValid() === false) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        const { subscriptionform } = this.state;
        this.setState({ loading: true });
        apiService.post('SUBSCRIBEEMAIL', { "Email": subscriptionform.email })
            .then(response => {
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
    onKeyDown = (event) => {
        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        if (event.key === 'Enter') {
            this.handleSubmit(event);
        }
    }
    render() {
        const { subscriptionform, loading } = this.state;
        return (
            <Fragment>
                <section className="newsLetter">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="headingTitle text-center">
                                    <div className="icon"><img width="99" height="109"  src={require("../../assets/images/newsicon.png")} alt="newsicon" /></div>
                                    <h3>Don’t miss a thing!</h3>
                                    <p>Subscribe to our mailing list to stay up to date</p>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="inputText">
                                    <input onKeyDown={this.onKeyDown}
                                        onBlur={() => this.validator.showMessageFor('email')}
                                        onChange={this.handleChange} value={subscriptionform.email}
                                        name="email" type="text" className="form-control"
                                        placeholder="Enter your email address" />
                                    <span><img width="20" height="22"  onClick={this.handleSubmit} src={require("../../assets/images/inputicon.png")} alt="inputicon" /></span>
                                    {this.validator.message('email', subscriptionform.email, 'required|email')}
                                </div>

                            </div>
                        </div>
                    </div>
                    {loading &&
                        <div className="loaderDiv"><div className="loader">
                            <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                        </div></div>}
                </section>

            </Fragment>
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
export default connect(mapStateToProps, mapDispatchToProps)(SubscribeUs)


