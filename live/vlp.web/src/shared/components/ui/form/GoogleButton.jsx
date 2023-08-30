import React, { Component, Fragment } from 'react';
import { GoogleLogin } from 'react-google-login';
import { GOOGLE_APP_ID } from '../../../../config/api.config';

class GoogleButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            accesstoken: '',
            tokenId: ''
        }
    }
    responseGoogle = (response) => {
        this.setState({ username: response.profileObj.name, email: response.profileObj.email, accessToken: response.tokenId, tokenId: response.googleId });
        this.props.onSignIn(this.state);
    }
    render() {
        return (
            <Fragment>
                <GoogleLogin
                    clientId={GOOGLE_APP_ID}
                    buttonText="Continue with Google"

                    className="google"
                    fields="name,email,picture"
                    onSuccess={this.responseGoogle}
                    onFailure={this.responseGoogle}
                    icon="fa-Google"
                />
            </Fragment>
        );
    }
}

export default GoogleButton;