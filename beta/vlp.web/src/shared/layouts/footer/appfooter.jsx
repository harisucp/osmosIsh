import React, { Component, Fragment } from 'react';
import "../../../assets/scss/footer.scss";
import { PUBLIC_URL } from "../../../config/api.config";
import { history } from "../../../helpers/history";
import { Block } from '@material-ui/icons';
import { None } from 'amazon-chime-sdk-js';

class AppFooter extends Component {
    state = {
        showScrollToTop: false
    }
    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll, true);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }
    handleScroll = () => {
        if (window.pageYOffset > 100) {
            this.setState({ showScrollToTop: true });
        }
        else {
            this.setState({ showScrollToTop: false });
        }
    };
    handleNavigate = () => {
        history.push(`${PUBLIC_URL}/ContactUs`);
    }

    handlePrivatePolicyNavigate = () => {
        history.push(`${PUBLIC_URL}/PrivacyPolicy`);
    }
    handleTermConditionNavigate = () => {
        history.push(`${PUBLIC_URL}/TermCondition`);
    }
    handleNavigateTo = (path) => {
        history.push(`${PUBLIC_URL}/${path}`);
    }

    scrollToTop() {
        window.scroll(0, 0);
    }
    render() {
        const { showScrollToTop } = this.state;
        return (
            <Fragment>

                <footer>
                    <section className="footLink">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-5 col-md-12">
                                    <div className="footerDesc">
                                        <h5 className="lowerCase">Osmos-ish</h5>

                                        <p>A live engagement platform connecting hosts and users with a built-in and easy-to-use payment integration. Hosts can set their own rates and schedule, while users can choose from a variety of subjects.</p>
                                    </div>
                                </div>
                                <div className="col-lg-2 col-md-4">
                                    <div className="footerDesc">
                                        <h5>Company</h5>
                                        <ul>
                                            <li><button type="button" className="link-button" onClick={() => this.handleNavigateTo('')}><i className="fa fa-caret-right" aria-hidden="true"></i> Home</button></li>
                                            <li><button type="button" className="link-button" onClick={() => this.handleNavigateTo('ContactUs')}><i className="fa fa-caret-right" aria-hidden="true"></i> Contact Us</button></li>
                                            <li><a className="link-button" href="/blog"><i className="fa fa-caret-right" aria-hidden="true"></i> Blog</a></li>

                                        </ul>
                                    </div>
                                </div>
                                <div className="col-lg-2 col-md-4">
                                    <div className="footerDesc">
                                        <h5>How it Works</h5>
                                        <ul>
                                            <li><button type="button" className="link-button" onClick={() => this.handleNavigateTo('HowItwork')}><i className="fa fa-caret-right" aria-hidden="true"></i> How It Works</button></li>
                                            <li><button type="button" className="link-button" onClick={() => this.handleNavigateTo('Faq/Hosts')}><i className="fa fa-caret-right" aria-hidden="true"></i> FAQ</button></li>
                                            {/* <li><button type="button" className="link-button" onClick={()=>this.handleNavigateTo('Faq/affiliateProgram')}><i className="fa fa-caret-right" aria-hidden="true"></i> Affiliate Program</button></li>   */}
                                        </ul>
                                    </div>
                                </div>

                                <div className="col-lg-3 col-md-4">
                                    <div className="footerDesc">
                                        <h5>Follow Us</h5>
                                        {/* <div className="widgetBody emailSection mb-3">
                                            <a href={`${PUBLIC_URL}/ContactUs`}><i className="fa fa-envelope fa-2x" aria-hidden="true"></i> hello@osmos-ish.com</a>
                                        </div> */}
                                        <div className="socialLinks">
                                            <ul className="d-flex">
                                                <li><a href="https://www.instagram.com/osmos.ish/" title="Instagram"><img width="20" height="20" src={require("../../../assets/images/insta-image.png")} className="instaImage" alt="insta-image"></img></a></li>
                                                <li><a href="https://www.facebook.com/osmosish" title="Facebook"><i className="fa fa-facebook"></i></a></li>
                                                <li><a href="https://twitter.com/osmos_ish" title="Twitter"><i className="fa fa-twitter"></i></a></li>
                                                <li><a href="https://www.pinterest.com/Osmosish/" title="Pinterest"><i className="fa fa-pinterest"></i></a></li>
                                                <li><a href="https://www.linkedin.com/company/osmos-ish/" title="Pinterest"><i className="fa fa-linkedin"></i></a></li>
                                                <li><a href="https://www.youtube.com/channel/UCqrAnarhND5UYv-EQD2GTYA" title="Pinterest"><i className="fa fa-youtube"></i></a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </section>
                    <div className="container">
                        {/* <div className="row">
                            <div className="col-sm-12">
                                <div className="headingTitle text-center">
                                    <h3>So how can we make you shine?</h3>
                                </div>
                            </div>
                        </div> */}
                        {/* <div className="row">
                            <div className="col-md-4 col-sm-4">
                                <div className="widget">
                                    <div className="widgetTitle">Email</div>
                                    <div className="widgetBody">
                                        <a href={`${PUBLIC_URL}/ContactUs`}><i className="fa fa-envelope fa-2x" aria-hidden="true"></i></a>
                                       </div>
                                </div>
                            </div>
                            <div className="col-md-4 col-sm-4">
                                <div className="widget">
                                    <div className="widgetTitle"></div>
                                    <div className="widgetBody">
                                       </div>
                                </div>
                            </div>
                            <div className="col-md-4 col-sm-4">
                                <div className="widget">
                                    <div className="widgetTitle">Follow Us</div>
                                    <div className="widgetBody">
                                        <div className="socialLinks">
                                            <ul>
                                                <li><a href="https://www.instagram.com/osmos.ish/" title="Instagram"><img width="" height=""  src={require("../../../assets/images/insta-image.png")} className="instaImage" alt="insta-image"></img></a></li>
                                                <li><a href="https://www.facebook.com/osmosish" title="Facebook"><i className="fa fa-facebook"></i></a></li>
                                                <li><a href="https://twitter.com/osmos_ish" title="Twitter"><i className="fa fa-twitter"></i></a></li>
                                                <li><a href="https://www.pinterest.com/Osmosish/" title="Pinterest"><i className="fa fa-pinterest"></i></a></li>
                                                <li><a href="https://www.linkedin.com/company/osmos-ish/" title="Pinterest"><i className="fa fa-linkedin"></i></a></li>
                                                <li><a href="https://www.youtube.com/channel/UCqrAnarhND5UYv-EQD2GTYA" title="Pinterest"><i className="fa fa-youtube"></i></a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </div>
                    <div className="ppWrapper">
                        <div className="container">
                            <div className="col-sm-12">
                                <div className="copyrightDesc">
                                    <ul>
                                        <li><button type="button" className="link-button" onClick={this.handleTermConditionNavigate}>Terms &amp; Conditions</button></li>
                                        <li>
                                            <button type="button" className="link-button" onClick={this.handlePrivatePolicyNavigate}><img width="15" height="19" src={require("../../../assets/images/privacy-policy_icon.png")} alt="image"></img> Privacy Policy</button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                    </div>
                </footer>
                {
                    showScrollToTop &&
                    <button type="button" className="scroll-up" title="Bottom to Top Scroll" onClick={() => { this.scrollToTop(); }}>
                        <span className="top-text"><i className="fa fa-angle-up"></i></span> <span className="scroll">back to top</span>
                    </button>
                }
            </Fragment>
        )
    }
}

export default AppFooter;