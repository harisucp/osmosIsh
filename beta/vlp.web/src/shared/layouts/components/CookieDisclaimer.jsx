import { withCookies } from 'react-cookie';
import React, { Component, Fragment } from 'react';

import "../../../assets/scss/cookie_disclaimer.scss";

class CookieDisclaimer extends Component {
    constructor(props) {
        super(props);

        const cookieConsent = props.cookies.get("CookieConsent") || false;

        if (!cookieConsent) document.querySelector('body').classList.add('cookie-consent');
        this.state = {
            cookieConsent: cookieConsent
        };
    }

    handleCookieConsent = (isAccepted) => {
        if(isAccepted) {
            this.props.cookies.set('CookieConsent', true, { path: '/' });
        }

        document.querySelector('body').classList.remove('cookie-consent');
        this.setState({ cookieConsent: true });
    }

    render() {
        if (this.state.cookieConsent) return null;

        return (
            <div id="cookie-prompt" className="cookiealert">
                <div className="row">
                    <div className="container">
                        <span className="cookieCloseBtn" onClick={() => this.handleCookieConsent(false) }><i className="fa fa-times" aria-hidden="true"></i></span>
                        <div className="col-md-10 col-sm-9">
                            <p className="text-left">We use cookies and other tracking technologies to improve your browsing experience on our website, to analyze our website traffic, and to understand where our visitors are coming from.Please read our cookie policy for more information. By browsing our website,you consent to our use of cookies and other tracking technologies. <a href="/privacypolicy" target="_blank">Click here</a> for more information. </p>
                        </div>
                        <div className="col-md-2 col-sm-3">
                            <p className="accept"><a href="javascript:void(0);" onClick={() => this.handleCookieConsent(true) } className="cookieBtn">Accept Cookies</a></p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    
}

export default withCookies(CookieDisclaimer);