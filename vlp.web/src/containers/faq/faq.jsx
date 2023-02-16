import React, { Component, Fragment } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import { fade, makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import queryString from 'query-string';
import { PUBLIC_URL } from "../../config/api.config";
import { history } from "../../helpers/history";
const d = new Date();
var year = d.getFullYear();
class TermCondition extends Component {
    
    constructor(props) {
        
        super(props);
        this.setState({ loading: true, status: null });
    }
    handleNavigateTo = (path) =>{
        history.push(`${PUBLIC_URL}/${path}`);
    }
    render() {
        let tabName = this.props.match.params.TabName;
        return (
            <Fragment>
                <div className="policy">
                    <div className="container">
                        <div className="row">

                            <div className="col-sm-12 faqTab">
                                {/* <div className="searchBar">
                                    <div className="searchIcon"><SearchIcon /></div>
                                    <InputBase
                                    placeholder="Search…"
                                    inputProps={{ 'aria-label': 'search' }}
                                    />
                                </div> */}
                                <ul className="nav nav-tabs">
                                    <li className={`${tabName === "Hosts" ? "active" : ""}`}><a data-toggle="tab" href="#Hosts">Hosts</a></li>
                                    <li className={`${tabName === "User" ? "active" : ""}`}><a data-toggle="tab" href="#User">User</a></li>
                                    <li className={`${tabName === "affiliateProgram" ? "active" : ""}`}><a data-toggle="tab" href="#affiliateProgram">Affiliate Program</a></li>
                                    <li className={`${tabName === "Ideas" ? "active" : ""}`}><a data-toggle="tab" href="#Ideas">Ideas</a></li>
                                    <li className={`${tabName === "Contact" ? "active" : ""}`}><a data-toggle="tab" href="#Contact">Contact Us</a></li>
                                </ul>
                                <div className="tab-content">
                                    <div id="Hosts" className={`tab-pane fade ${tabName === "Hosts" ? "in active" : ""}`}>
                                        <div className="panel-group background-container" id="accordion">
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" data-parent="#accordion" href="#collapse1"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        What Types Of Classes Can I Teach?
                                                        </a>
                                                    </h4>
                                                </div>
                                                <div id="collapse1" className="panel-collapse collapse in">
                                                    <div className="panel-body">
                                                        Please check out the ideas tab for session ideas.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse2"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        How Do I Get People To Attend?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse2" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    Make sure that your host profile is completely filled out and be sure to let others know via social media, phone calls and emails. We also recommend sharing your URL link to your host profile where all of your classes are visible.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse3"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        How Do I Create A Session, Or Series?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse3" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                        Login to your account, and be sure that your hosting profile is filled out as some items are required before starting your class. While in the hosting section of the website, click on “Create”. There you will be given the option to create a session or series and will need to fill out all necessary information. Be sure to fill out the description tags which will help users to find your session in our search engine.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse4"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        What Is The Recommended Image Size For The Cover Photo?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse4" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                        1200x800 with a maximum size of 5mb
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse5"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        Is There A Limit To The Video Conference Size?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse5" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                        There can be up to 250 users, however only the first 16 attendees will have their video screens shown.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse6"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        How Do I Setup The Ability For Users To Have A Private Session With Me?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse6" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    Login to your account, and be sure that your hosting profile is filled out as some items are required before starting your class. While in the hosting section of the website, click on “Create”. There you will be given the option to create a private session. Click on “Is available” for private sessions, and fill out the information. You can add multiple days and times, and we would recommend creating your hours based on the desired lengths of the sessions. Example: if you only want to do ½ hour sessions but are free for an hour at 10:00am, you can make yourself available at 10:00am to 10:30am and 10:30am to 11:00am.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse7">  
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        Is There A Subscription Or Listing Fee?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse7" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    There are no listing fees or subscriptions! Feel free to list as many classes as you would like without being charged. We do take a small portion when there are users attending your classes to pay for things like credit card receiving fees, host payment transactions, video conference hosting, and data usage.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse8"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        What Is The Service Fee?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse8" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                        Please check our terms and conditions for the latest service fee, however as of 12/01/2020 we are collecting 20%
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse9"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        What Happens If I Have To Cancel A Session?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse9" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                        Your students will be issued a full refund, and a review may be posted to your profile. Your calendar may stay blocked and you will not be able to create a new session for the same date.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse10"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        What Happens If A User Cancels Their Enrollment In My Session?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse10" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                         You will not receive money if the student cancels over 24 hours before the session starts.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse11"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        Will I Get A Reminder About The Session?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse11" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                        You will receive an email 30 minutes before the class begins to remind you to login.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse12"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        How Come You Don’t Have A Link To Join The Session?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse12" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                        One of our security measures to ensure that there aren’t any video session crashers is to not provide a link beforehand.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse13"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        How Do I Get Into The Video Session?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse13" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                        5 minutes before the session begins, you will need to login to your “Host” dashboard. There will be a card below that will show your upcoming class and a button to be able to enter.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse14"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        When Do I Get Paid?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse14" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                        You will get paid 3-5 days after each session. If there is a dispute over the session, payment may be delayed or not eligible.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse15"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        How do I use the video session?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse15" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                        Please check out our video instructions here <a target="_blank" href="https://youtu.be/FSAoJRSfiKU">https://youtu.be/FSAoJRSfiKU</a> 
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse16"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        How do I create a "Host" account?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse16" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    Please check out our video instructions here <a target="_blank" href="https://www.youtube.com/watch?v=Dn2xIa39oTs">https://www.youtube.com/watch?v=Dn2xIa39oTs</a> 
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion" href="#collapse17"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        Can I edit already created classes?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse17" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    Only some of the fields are editable when students aren't enrolled and there are more than 24 hours before the session begins. Items like the fee and title of session/series were not meant to be changed.
                                                    </div>
                                                </div>
                                            </div>

                                            
                                            
                                        </div>
                                    </div>

                                    <div id="User" className={`tab-pane fade ${tabName === "User" ? "in active" : ""}`}>
                                        <div className="panel-group background-container" id="accordion01">
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" data-parent="#accordion01" href="#collapse01"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        How Do I Search For Classes?
                                                        </a>
                                                    </h4>
                                                </div>
                                                <div id="collapse01" className="panel-collapse collapse in">
                                                    <div className="panel-body">
                                                    You can browse through sessions and series, or you can click on “Private Session” at the top to identify hosts that are willing to have 1 on 1 sessions with you.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion01" href="#collapse02"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        Are There Any Fees?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse02" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    Please check our terms and conditions for the latest service fee, however as of 12/01/2020 we are not collecting any fees.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion01" href="#collapse03"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        Will I Get A Reminder About The Session?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse03" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    You will receive an email 30 minutes before the class begins to remind you to login.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion01" href="#collapse04"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        How Come You Don’t Have A Link To Join The Session?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse04" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    One of our security measures to ensure that there aren’t any video session crashers is to not provide a link beforehand.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion01" href="#collapse05"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        Is There A Limit To The Video Conference Size?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse05" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    There can be up to 250 users, however only the first 16 attendees will have their video screens shown.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion01" href="#collapse06"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        How Do I Get Into The Video Session?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse06" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    5 minutes before the session begins, you will need to login to your “User” dashboard. There will be a card below that will show your upcoming class and a button to be able to enter.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion01" href="#collapse07"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        What Is The Cancellation Policy?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse07" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    Please check our terms and conditions for the latest cancellation fee, however as of 12/01/2020 if you cancel over 24 hours before the session begins, you will get a refund minus the service fee, while if you cancel with less than 24 hours before the session begins, you are not eligible for a refund.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion01" href="#collapse08"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        What Happens If The Host Cancels Their Class?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse08" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    You will receive a full refund.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion01" href="#collapse09"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        How do I use the video session?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse09" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                        Please check out our video instructions here <a target="_blank" href="https://youtu.be/FSAoJRSfiKU">https://youtu.be/FSAoJRSfiKU</a> 
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion01" href="#collapse010"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        How do I create a "User" account?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse010" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    Please check out our video instructions here <a target="_blank" href="https://www.youtube.com/watch?v=zG97QebrrQs">https://www.youtube.com/watch?v=zG97QebrrQs</a>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div id="affiliateProgram" className={`tab-pane fade ${tabName === "affiliateProgram" ? "in active" : ""}`}>
                                        <div className="panel-group background-container" id="accordion02">
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" data-parent="#accordion02" href="#collapse011"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        What Is The Affiliate Program?
                                                        </a>
                                                    </h4>
                                                </div>
                                                <div id="collapse011" className="panel-collapse collapse in">
                                                    <div className="panel-body">
                                                    We are looking to grow our community and need your help getting people to host classes online!  If you are able to bring hosts onboard, we are offering 3% of that hosts revenue for the <strong>entire year of {year}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion02" href="#collapse012"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        How Do I Enroll?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse012" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    Email us at work@osmosish.com with the subject “Affiliate Program” and include your phone number and email address for more information.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion02" href="#collapse013"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        How And When Will I Get Paid?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse013" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    You will be paid via paypal account 6-10 days after each session is completed. If there is a dispute from a user with the host for the class, payment may be delayed, or not eligible.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h4 className="panel-title">
                                                        <a data-toggle="collapse" className="collapsed" data-parent="#accordion02" href="#collapse014"> 
                                                        <i className="icon-plus fa fa-plus"></i>
                                                        Can I Use The Affiliate Code I Received For My Own Sessions That I Am Hosting?</a>
                                                    </h4>
                                                </div>
                                                <div id="collapse014" className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                    No you cannot. Hosts will be banned from the platform when found doing this.
                                                    </div>
                                                </div>
                                            </div>                                            
                                        </div>
                                    </div>

                                    <div id="Ideas" className={`tab-pane fade ${tabName === "Ideas" ? "in active" : ""}`}>
                                        <div className="background-container">
                                            <ul>
                                                <li>Just fun – trivia night, make cocktails,</li>
                                                <li>Conferences – business lectures, seminars</li>
                                                <li>Fitness activity classes - yoga, kickboxing, spin class, personal training, weight lifting, kickboxing, Pilates, pure barre, soccer, golf.</li>
                                                <li>Babysitting – allow parents some free time during their business calls</li>
                                                <li>Meet and greet with your favorite social media personality</li>
                                                <li>Educational – classes or tutoring for math, science, history, English, other languages, college entrance exams, music</li>
                                            </ul>
                                            
                                        </div>
                                    </div>
                                    <div id="Contact" className={`tab-pane fade ${tabName === "Contact" ? "in active" : ""}`}>
                                        <div className="background-container">                                        
                                            <h5 className=" faqMainCaption"><button type="button" className="link-button textUnderline" onClick={()=>this.handleNavigateTo('ContactUs')}>Contact Us</button></h5>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }
}


export default TermCondition;
