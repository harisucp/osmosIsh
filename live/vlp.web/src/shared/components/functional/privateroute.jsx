import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { PUBLIC_URL } from "../../../config/api.config";
import { localStorageService } from '../../../services/localStorageService';

const PrivateRoute = ({ component: Component, path, auth, ...rest }) => {
    return (
        <Route {...rest} render={props => (
            localStorageService.isAuthenticated()
                ? <Component {...props} auth={auth} />
                : <Redirect to={{ pathname: `${PUBLIC_URL}/` }} />
        )} />
    );
}

const mapStateToProps = state => {
    return {
        auth: state.auth
    }
}


export default connect(mapStateToProps)(PrivateRoute);