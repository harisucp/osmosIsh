import React, { Component, Fragment } from "react";
import PageBanner from "./TopBannerSection";
import BrowseSection from "./BrowseSection";
import UpcomingSessionSection from "./UpcomingSessionSection";
import OurCustomer from "./OurCustomerSection";
import SubscribeUs from "./SubscribeUsSection";
import CompatibilityModal from "./CompatibilityModal";
import { OperationCanceledException } from "typescript";
import { localStorageService } from '../../services/localStorageService';

import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCompatibilityModal: false
    };
  }
  handleCloseModal = () => {
    const { showCompatibilityModal } = this.state;
    this.setState({ showCompatibilityModal: !showCompatibilityModal });
    sessionStorage.setItem("IsCompatibilityModalClosed", true);
  };

  componentDidMount = () => {

    localStorageService.updateUserMode("student");
    this.props.actions.changeUserMode("student");
    try {
      var getUserMedia = navigator.mediaDevices.getUserMedia;
    } catch (e) {
      var showModal = sessionStorage.getItem("IsCompatibilityModalClosed") && sessionStorage.getItem("IsCompatibilityModalClosed") === "true" ? false : true;
      this.setState({ showCompatibilityModal: showModal });
    }
  };
  render() {
    return (
      <Fragment>
        <PageBanner></PageBanner>
        {/* browse section */}
        <BrowseSection></BrowseSection>
        {/* upcoming Sesssion */}
        <UpcomingSessionSection></UpcomingSessionSection>
        {/* OurCustomer */}
        <OurCustomer></OurCustomer>
        {/* SubscribeUs */}
        <SubscribeUs></SubscribeUs>
        <CompatibilityModal
          onShow={this.state.showCompatibilityModal}
          onClose={this.handleCloseModal}
        />
      </Fragment>
    );
  }
}
const mapStateToProps = state => {
  return {
    auth: state.auth,
    userTimezone: state.timezone.userTimezone

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
export default connect(mapStateToProps, mapDispatchToProps)(Home);

