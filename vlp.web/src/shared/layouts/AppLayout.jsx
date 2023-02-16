import React, { Component, Fragment } from 'react';
import { connect } from "react-redux";
import { Router, Switch, Route, Redirect } from "react-router-dom";
import appRoutes from "../../routes/app";
import PrivateRoute from "../components/functional/privateroute";
import { history } from "../../helpers/history";
import AppHeader from "./header/appheader";
import Appfooter from "./footer/appfooter";
import Alert from "../components/ui/Alert";
import * as actions from "../../store/actions";
import { bindActionCreators } from "redux";
import IdleTimer from 'react-idle-timer';
import { apiService } from '../../services/api.service';
import { localStorageService } from '../../services';
import { TIMEOUT_IN_MINUTES } from '../../config/api.config';
import { PUBLIC_URL } from "../../config/api.config";
import NotFound from "../../containers/not_found/PageNotFound";
import moment from "moment";
import AutoLogoutModal from '../layouts/components/AutoLogoutModal';
import CookieDisclaimer from "./components/CookieDisclaimer";
// import SubscribeModal from "./components/SubscribeModal";


class AppLayout extends Component {
    constructor(props) {
        super(props)
        this.idleTimer = null
        this.onAction = this._onAction.bind(this)
        this.onActive = this._onActive.bind(this)
        this.onIdle = this._onIdle.bind(this)
        this.state = {
            showMenu: false,
            // showSubscribeModal: false,
            notifications: {},
            showAutoLogoutModal: false
        };

    }

    _onAction(e) {
        const { auth } = this.props;
        //console.log('user did something', e);
        if (auth.loggedIn) {
            localStorageService.SetExpiresAtInMinutes();
        }
    }

    _onActive(e) {
    }

    _onIdle(e) {
        console.log('user is idle');
        if (!localStorageService.IsPasswordActive()) {
            this.handleLogout();
            this.setState({ showAutoLogoutModal: true });
        };
        // this.handleLogout();
    }

    handleLogout = (e) => {
        apiService.logout();
        this.props.actions.logout();
        this.props.actions.updatecart(0);
        history.push(`${PUBLIC_URL === '' ? '/' : PUBLIC_URL}`);
    }
    handleOnCloseAutoLogoutModal = () => {
        this.setState({ showAutoLogoutModal: false });
    }

    componentDidMount = async () => {
        history.listen((location, action) => {
            window.scrollTo(0, 0);
            this.props.actions.performSearch(false);
        });
        window.addEventListener("storage", e => {
            if (e.key === "LoggedIn" && e.oldValue === "true" && e.newValue === "false") {
                this.handleLogout();
            }
        });

        // const { auth } = this.props;
        // if(!auth.loggedIn) {
        //     setTimeout(() => {
        //         this.setState({ showSubscribeModal: true });
        //     }, 10000);
        // }

    }
    render() {
        const { actions, alert, auth } = this.props;
        const { showAutoLogoutModal } = this.state;
        return (
            <Fragment>
                {
                    auth.loggedIn
                    &&
                    !localStorageService.isRememberMeChecked() &&
                    (
                        <IdleTimer
                            ref={ref => { this.idleTimer = ref }}
                            element={document}
                            onActive={this.onActive}
                            onIdle={this.onIdle}
                            onAction={this.onAction}
                            debounce={250}
                            timeout={1000 * 60 * TIMEOUT_IN_MINUTES} />)
                }
                <Router history={history}  >

                    {/* Header Part */}
                    <AppHeader auth={auth} onLogout={this.handleLogout}  ></AppHeader>

                    {/* End of Header */}

                    {/* Routes Genertaion */}
                    <Switch>
                        {
                            appRoutes.map((prop, key) => {
                                if (prop.redirect)
                                    return <Redirect from={prop.path} to={prop.to} key={key} />;

                                return (
                                    prop.auth ?
                                        <PrivateRoute {...prop} key={key} />
                                        : <Route {...prop} key={key} />
                                );
                            })

                        }
                        <Route path="*" component={NotFound} />
                    </Switch>
                    {/* End Of Routes Generation */}

                    {/* Footer Part */}
                    <Appfooter></Appfooter>
                    <CookieDisclaimer></CookieDisclaimer>
                    {/* {showSubscribeModal && <SubscribeModal onClose={() => this.setState({ showSubscribeModal: false })}></SubscribeModal>} */}
                    {/* End of Footer */}
                </Router>
                <AutoLogoutModal showAutoLogoutModal={showAutoLogoutModal} onClose={this.handleOnCloseAutoLogoutModal} ></AutoLogoutModal>
                <Alert {...alert} onHideAlert={actions.hideAlert} />
            </Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        alert: state.alert,
        auth: state.auth,
        // global: state.global
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        actions: {
            logout: bindActionCreators(actions.logout, dispatch),
            hideAlert: bindActionCreators(actions.hideAlert, dispatch),
            updatecart: bindActionCreators(actions.updateCart, dispatch),
            performSearch: bindActionCreators(actions.performSearch, dispatch)

        },
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(AppLayout);