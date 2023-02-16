import React, { Component, Fragment } from 'react';
import FacebookLogin from 'react-facebook-login';
import { FACEBOOK_APP_ID } from '../../../../config/api.config';

class FacebookButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            accesstoken: '',
            tokenId: ''
        }
    }
    responseFacebook = (response) => {
        console.log(response, 'in FB');
        if(response.status == 'unknown'){
            return;
        }
        this.setState({ username: response.name, email: response.email, accessToken: response.accessToken, tokenId: response.id });
        this.props.onSignIn(this.state);
    }

    render() {
        return (
            <Fragment>
                <FacebookLogin
                    appId={FACEBOOK_APP_ID}
                    textButton="Continue with Facebook"
                    cssClass="facebook"
                    fields="name,email,picture"
                    tag='div'
                    callback={this.responseFacebook}
                    icon="fa-facebook"
                />
            </Fragment>
        );
    }
}

export default FacebookButton;