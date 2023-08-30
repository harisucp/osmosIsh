import React, { Component, Fragment } from 'react';
import { apiService } from '../../services/api.service';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import SimpleReactValidator from 'simple-react-validator';
import Loader from 'react-loaders';
import { PUBLIC_URL } from "../../config/api.config";
import { history } from '../../helpers/history';

class ContactUs extends Component {

   constructor(props) {
      super(props);
      this.state = {
         contactUsForm: {
            name: "",
            email: "",
            subject: "",
            issuesFacing: "",
            message: ""
         },
         loading: false
      };
      this.validator = new SimpleReactValidator();
   }
   handleChange = (e) => {
      const { contactUsForm } = this.state;
      contactUsForm[e.target.name] = e.target.value;
      this.setState({ contactUsForm });
   }
   handleSubmit = (e) => {
      e.preventDefault();
      if (this.validator.allValid() === false) {
         this.validator.showMessages();
         this.forceUpdate();
         return false;
      }
      const { contactUsForm } = this.state;
      this.setState({ loading: true });
      apiService.post('CONTACTUS', this.state.contactUsForm)
         .then(response => {
            if (response.Success) {
               this.validator = new SimpleReactValidator();
               this.setState({ contactUsForm: { ...contactUsForm, name: "", email: "", subject: "", issuesFacing: "", message: "" } });
               this.props.actions.showAlert({ message: response.Message, variant: "success", open: false });
            } else {
               this.props.actions.showAlert({ message: response.Message, variant: "error", open: false });
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
      const { contactUsForm, loading } = this.state;
      return (
         <Fragment>
            <section className="contactBanner">
               <div className="container">
                  <div className="row">
                     <div className="col-lg-8 col-md-7 col-sm-7">
                        <div className="bannerTitle">
                           <h1>Contact Us</h1>
                           <div className="breadcrumbSection">
                              <ul>
                                 <li>Home <i className="fa fa-angle-right"></i></li>
                                 <li><a>Contact Us</a></li>
                              </ul>
                           </div>
                        </div>
                     </div>
                     <div className="col-lg-4 col-md-5 col-sm-5">
                        <div className="thumbImage"><img src={require("../../assets/images/contactimage.png")} width="264" height="221" alt="calendericon" /></div>
                     </div>
                  </div>
               </div>
            </section>
            <section className="contactDetail">
               <div className="container">
                  <div className="row">
                     <div className="col-sm-12">
                        <form onSubmit={this.handleSubmit}>
                           <div className="contactDesc">
                              <h2>Need help?</h2>
                              <p>Visit our <a href={`${PUBLIC_URL}/HowItwork`}>How it Works page</a> to learn more about Osmos-Ish.</p>
                              <p>If you can't find what you are looking for, let us know how we can help, and we will get back to you as soon as possible.</p>
                              <div className="row">
                                 <div className="col-sm-6">
                                    <div className="form-group">
                                       <label>Your Name</label>
                                       <input type="text" className="form-control" placeholder="Name" maxLength={50} onChange={this.handleChange} value={contactUsForm.name} name="name"
                                          onBlur={() => this.validator.showMessageFor('name')} />
                                       {this.validator.message('name', contactUsForm.name, 'required|max:50')}
                                    </div>
                                 </div>
                                 <div className="col-sm-6">
                                    <div className="form-group">
                                       <label>Your Email Address</label>
                                       <input type="text" className="form-control" placeholder="Email" onChange={this.handleChange} value={contactUsForm.email} name="email"
                                          onBlur={() => this.validator.showMessageFor('email')} />
                                       {this.validator.message('email', contactUsForm.email, 'required|email')}
                                    </div>
                                 </div>
                                 <div className="col-sm-6">
                                    <div className="form-group">
                                       <label>Subject</label>
                                       <input className="form-control account-input" onChange={this.handleChange} maxLength={100} value={contactUsForm.subject} name="subject"
                                          onBlur={() => this.validator.showMessageFor('subject')} type="text" />
                                       {this.validator.message('subject', contactUsForm.subject, 'required')}
                                    </div>
                                 </div>
                                 <div className="col-sm-6">
                                    <div className="form-group">
                                       <label>Issues you are facing</label>
                                       <select className="form-control account-input" name="issuesFacing" onChange={this.handleChange} onBlur={() => this.validator.showMessageFor('issuesFacing')} value={contactUsForm.issuesFacing}>
                                          <option value="">Select issues you are facing</option>
                                          <option value="Sign Up">Sign Up</option>
                                          <option value="Login">Login</option>
                                          <option value="Other">Other</option>
                                       </select>
                                       {this.validator.message('issuesFacing', contactUsForm.issuesFacing, 'required')}
                                    </div>
                                 </div>
                                 <div className="col-sm-12">
                                    <div className="form-group">
                                       <label>How can we help? Talk to us.</label>
                                       <textarea className="form-control" placeholder="Message" onChange={this.handleChange} value={contactUsForm.message} name="message"
                                          onBlur={() => this.validator.showMessageFor('message')} type="text"></textarea>
                                       {this.validator.message('message', contactUsForm.message, 'required')}
                                    </div>
                                 </div>
                                 <div className="col-sm-12">
                                    <button className="btn btn-blue" type="submit">Submit</button>
                                 </div>
                              </div>
                           </div>
                        </form>
                     </div>
                  </div>
               </div>
               {
                  loading &&
                  <div className="loaderDiv"><div className="loader">
                     <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                  </div></div>
               }
            </section>
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
export default connect(mapStateToProps, mapDispatchToProps)(ContactUs);
