import React, { Component, Fragment } from 'react';
import CourseSearchBanner from "./CourseSearchBannerSection";
import SearchPanel from "./SearchPanelSection";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import { history } from "../../helpers/history";
import { PUBLIC_URL } from "../../config/api.config";
import queryString from 'query-string';
import { localStorageService } from '../../services/localStorageService';
class CourseSearch extends Component {
    constructor(props) {
        super(props);
        let queryParams = queryString.parse(props.location.search);

        this.state = {
            search: queryParams.search || null,
            isAll: queryParams.isAll || null
        }
    }

    componentDidMount = () => {
        localStorageService.updateUserMode("student");
        this.props.actions.changeUserMode("student");
    }


    componentDidUpdate(prevProps) {

        const location = this.props.location;
        const prevLocation = prevProps.location;
        if (location.search !== prevLocation.search) {
            let queryParams = queryString.parse(location.search);
            this.setState({ search: queryParams.search || null, isAll: queryParams.isAll || null })
        }
    }

    render() {
        return (
            <Fragment>
                {/* PageBanner */}
                <CourseSearchBanner></CourseSearchBanner>
                {/* SearchPannel */}
                <SearchPanel search={this.state.search} isAll={this.state.isAll}></SearchPanel>
            </Fragment >
        );
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
            showAlert: bindActionCreators(actions.showAlert, dispatch),
            changeUserMode: bindActionCreators(actions.changeUserMode, dispatch)
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(CourseSearch);
