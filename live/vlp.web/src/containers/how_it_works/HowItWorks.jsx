import React, { Component, Fragment } from 'react';
import SignUp from "../../containers/home/SignUp";
import SignIn from "../../containers/home/SignIn";
class HowItWork extends Component {
    constructor(props) {
        super(props);
        const { auth } = this.props;
        this.state = {
            showSignupModal: false,
            showSigninModal: false

        };
    }
    isShowSignUp = (status) => {
        this.setState({ showSignupModal: status });
    }

    isShowSignIn = (status) => {
        this.setState({ showSigninModal: status });
    }
    render() {
        return (
            <Fragment>
                <a className="autoScrollSignin btn-blue" onClick={() => this.isShowSignUp(true)}><i className="fa fa-sign-in" aria-hidden="true"></i> Sign Up</a>
                <section className="becomeTutor hiwWrapper">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 text-center">
                                <div className="bannerHeading mb-5">
                                    <h1>How It Works</h1>
                                </div>
                            </div>
                            <div className="col-lg-12 col-md-12 col-sm-12">
                                <div className="hiwSection">
                                    <div className="row">
                                        <div className="col text-center">
                                            <div className="hiwcol">
                                                <span className="hiwHoverEffect1"><img width="150" height="182"  src={require("../../assets/images/hiw-icon.png")} alt="image1" className="hiw-icon" /></span>
                                            </div>
                                            <h5>Search</h5>
                                        </div>
                                        <div className="col text-center">
                                            <div className="hiwcol">
                                                <span className="hiwHoverEffect2"><img width="86" height="174"  src={require("../../assets/images/subject_1.png")} alt="image2" className="hiw-icon-1" /></span>
                                            </div>
                                            <h5>Subjects</h5>
                                        </div>
                                        <div className="col text-center">
                                            <div className="hiwcol">
                                                <span className="hiwHoverEffect3"><img width="86" height="174"  src={require("../../assets/images/teacher-profile_1.png")} alt="image3" className="hiw-icon-2" /></span>
                                            </div>
                                            <h5>Teacher Profiles</h5>
                                        </div>
                                        <div className="col text-center">
                                            <div className="hiwcol">
                                                <span className="hiwHoverEffect4"><img width="86" height="174"  src={require("../../assets/images/class-schedule_1.png")} alt="image4" className="img-fluid" /></span>
                                            </div>
                                            <h5>Class Schedule</h5>
                                        </div>
                                        <div className="col text-center">
                                            <div className="hiwcol">
                                                <span className="hiwHoverEffect5"><img width="86" height="174"  src={require("../../assets/images/favourite_teachers.png")} alt="image5" className="img-fluid" /></span>
                                            </div>
                                            <h5>Favorite Teachers</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="hiwRow1">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-12">
                                <div className="hiwRow1Inner">
                                    <h2 className="mb-3 blueText">Learning Made Easy</h2>
                                    <p>Osmos-ish is the perfect platform for learning something new. Students can take advantage of one-on-one instructor or group lessons all with the click of a button. Maximize learning experience by favoriting go-to instructors and setting up weekly sessions!</p>
                                    <ul className="circleCheckListing">
                                        <li>Create a student profile.</li>
                                        <li>Choose your desired subject matter.</li>
                                        <li>Select your class time and get ready to learn.</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-12">
                                <div className="thumbnailImage">
                                    <img width="540" height="423"  src={require("../../assets/images/thumb-image.png")} alt="image6" className="img-fluid" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="hiwRow2">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-12">
                                <div className="thumbnailImage">
                                    <img width="540" height="418"  src={require("../../assets/images/thumb-image-1.jpg")} alt="image7" className="img-fluid" />
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-12">
                                <div className="hiwRow2Inner">
                                    <h2 className="mb-3 mt-3">How to Maximize your Online Learning Experience</h2>
                                    <p>Learning something new is not a “one size fits all” process, which is why we strive to create a unique and
                                    balanced learning platform for both teachers and students. With Osmos-ish, students can find the right
                                    environment for them in order to excel. We recommend trying out both group and private lessons to see
                                    which model works best for you.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="ourCustomer">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 text-center mb-4">
                                <h2>Become an Osmos-ish Instructor</h2>
                            </div>
                        </div>
                        <div className="downArrow">
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-12">
                                    <div className="thumbnailImage">
                                        <img width="324" height="218"  src={require("../../assets/images/graphics-image.png")} alt="image8" className="img-fluid" />
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-12">
                                    <h3 className="mb-3 mt-3">Fill out your Teacher Profile</h3>
                                    <p>Create a detailed teacher profile to ensure students can find you. You’ll be able to list your credentials, experience, and the subjects you specialize in.</p>

                                </div>
                            </div>
                        </div>
                        <div className="downArrow1">
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-12 text-right">
                                    <h3 className="mb-3 mt-3">Setup a Class</h3>
                                    <p>Create a session, series, or list your availability for one on one sessions. As a teacher, you have
                                        the option to set the capacity for your classes as well.</p>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-12">
                                    <div className="thumbnailImage">
                                        <img width="370" height="236"  src={require("../../assets/images/graphics-image-1.png")} alt="image9" className="img-fluid" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="downArrow2">
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-12">
                                    <div className="thumbnailImage">
                                        <img width="356" height="299"  src={require("../../assets/images/graphics-image-2.png")} alt="image10" className="img-fluid" />
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-12">
                                    <h3 className="mb-3 mt-3">Set Your Own Price</h3>
                                    <p>At Osmos-ish, we are proud to give teachers the flexibility of setting their own price for their
                                    lessons. Teachers can specify the price based on their experience, as well as the capacity of the
                                        class. A percentage will be deducted for administrative fees.</p>
                                </div>
                            </div>
                        </div>
                        <div className="downArrow3">
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-12 text-right">
                                    <h3 className="mb-3 mt-3">Be Prepared to Teach</h3>
                                    <p>The most important part of being an Osmos-ish teacher is creating a great lesson plan. Create
                                    something unique to keep the students engaged and participating. Use your experience to build
                                        lesson plans geared towards the students and helping them learn.</p>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-12">
                                    <div className="thumbnailImage">
                                        <img width="420" height="276"  src={require("../../assets/images/graphics-image-3.png")} alt="image11" className="img-fluid" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <SignIn showSignIn={this.state.showSigninModal} onSignInClose={this.isShowSignIn}></SignIn>
                <SignUp showSignUp={this.state.showSignupModal} onSignUpClose={this.isShowSignUp} showSignInModal={() => this.isShowSignIn(true)} ></SignUp>
            </Fragment>
        );
    }
}


export default HowItWork;