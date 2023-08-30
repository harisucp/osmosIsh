import React, { Component, Fragment } from 'react';
import { apiService } from '../../services/api.service';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import { Tab } from 'semantic-ui-react';
import 'swiper/css/swiper.css';
import 'semantic-ui-css/semantic.min.css'
import { APP_URLS } from "../../config/api.config";
import Swiper from 'react-id-swiper';
import 'swiper/css/swiper.css';
import FormatDateTime from '../../shared/components/functional/DateTimeFormatter';
import { PUBLIC_URL } from "../../config/api.config";
import { history } from '../../helpers/history';
import { commonFunctions } from '../../shared/components/functional/commonfunctions';
import moment from 'moment';
import { localStorageService } from '../../services/localStorageService';
const params = {
    spaceBetween: 15,
    slidesPerView: 3,
    rebuildOnUpdate: true,
    slidesPerGroup: 1,
    // centeredSlides: true,
    loopFillGroupWithBlank: true,
    pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        dynamicBullets: true,
        clickable: true
    },
    breakpoints: {
        0: {
            slidesPerView: 1,
            spaceBetween: 15,
        },
        550: {
            slidesPerView: 2,
            spaceBetween: 15,
        },
        988: {
            slidesPerView: 2,
            spaceBetween: 15,
        },
        1024: {
            slidesPerView: 3,
            spaceBetween: 15
        },
    }
}

class ReviewSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeIndex: 0,
            sessionData: [],
            pastSession: [],
            pastSeries: [],
            relatedSeries: [],
            relatedSession: [],
            similarSession: [],
            similarSeries: [],
            panes: [],
            // userTimezone: moment.tz(moment.tz.guess(true)).format("z").indexOf("+") !== -1 || moment.tz(moment.tz.guess(true)).format("z").indexOf("-") !== -1 ? this.props.userTimezone : moment.tz(moment.tz.guess(true)).format("z")
        }
        this.handleTabChange = this.handleTabChange.bind(this);
        //   this.tabsData = this.tabsData.bind(this);
    };

    componentDidMount = async () => {
        const { sessionData } = this.props;
        let timezone = localStorageService.getUserTimeZone();
        this.props.actions.updateTimezone(timezone);
        await this.setState({
            sessionData: sessionData,
            pastSession: JSON.parse(sessionData.PastSessions) ? JSON.parse(sessionData.PastSessions).filter(x => moment(commonFunctions.getUtcDatetime(x.StartDate)).isBefore(moment(), 'second')) : [],
            pastSeries: JSON.parse(sessionData.PastSeries) ? JSON.parse(sessionData.PastSeries).filter(x => moment(commonFunctions.getUtcDatetime(x.StartDate)).isBefore(moment(), 'second')) : [],
            relatedSeries: JSON.parse(sessionData.RelatedSeries) ? JSON.parse(sessionData.RelatedSeries).filter(x => moment(commonFunctions.getUtcDatetime(x.StartDate)).isAfter(moment(), 'second')) : [],
            relatedSession: JSON.parse(sessionData.RelatedSessions) ? JSON.parse(sessionData.RelatedSessions).filter(x => moment(commonFunctions.getUtcDatetime(x.StartDate)).isAfter(moment(), 'second')) : [],
            similarSession: JSON.parse(sessionData.SimilarSeries) ? JSON.parse(sessionData.SimilarSeries).filter(x => moment(commonFunctions.getUtcDatetime(x.StartDate)).isAfter(moment(), 'second')) : [],
            similarSession: JSON.parse(sessionData.SimilarSessions) ? JSON.parse(sessionData.SimilarSessions).filter(x => moment(commonFunctions.getUtcDatetime(x.StartDate)).isAfter(moment(), 'second')) : [],
        });

        this.tabData();

    }

    handleViewDetails = (SeriesId, SessionId) => {

        if (SeriesId !== null && SeriesId > 0) {
            history.push(`${PUBLIC_URL}/SeriesDetail/${SeriesId}`);
        }
        else if (SessionId !== null && SessionId > 0) {
            window.location.assign(`${PUBLIC_URL}/SessionDetail/${SessionId}`);
        }
    }

    handleTutorDetails = (TutorId) => {
        history.push(`${PUBLIC_URL}/TutorProfile/${TutorId}`);
    }

    tabData = () => {

        const { sessionData, pastSession, pastSeries, relatedSeries, relatedSession, similarSession, similarSeries } = this.state;
        const { userTimezone } = this.props;
        let panes = [];
        panes = [
            {
                menuItem: { content: 'Recent Series/Sessions' },
                render: () => <Tab.Pane >
                    <div className="row">
                        <div className="col-sm-12">
                            <Swiper {...params}>
                                {pastSession && pastSession.map((data, index) => (
                                    <div className="schedule" key={index}>
                                        <div className="cardBody">
                                            <div className="thumbImage"
                                                onClick={() => this.handleViewDetails(null, data.SessionId)}
                                                style={{ backgroundImage: `url(${APP_URLS.API_URL}${data.sd[0].ImageFile})` }}>
                                            </div>
                                            <div className="thumbContent">
                                                <h3 onClick={() => this.handleViewDetails(null, data.SessionId)}>{data.sd[0].TITLE} </h3>
                                                <div className="date">
                                                    <span className="tutorName" onClick={() => this.handleTutorDetails(data.TeacherId)}> By {data.sd[0].Name}</span>
                                                    <div className="divider"></div>
                                                    <span>
                                                        <FormatDateTime date={data.StartDate}
                                                            format="MMM DD, YYYY hh:mm A"></FormatDateTime> ({userTimezone})
                                                    </span>
                                                </div>
                                                <div className="comments">
                                                    {/* <span><i className="fa fa-thumbs-o-up" aria-hidden="true"></i>10</span>
                                                <span><i className="fa fa-comment-o" aria-hidden="true"></i>3</span> */}
                                                </div>
                                                <p onClick={() => this.handleViewDetails(null, data.SessionId)}>{data.sd[0].Description}</p>
                                                <button className="btn btn-blue" onClick={() => this.handleViewDetails(null, data.SessionId)}>View Details</button>
                                            </div>
                                        </div>
                                    </div>
                                )
                                )}
                                {pastSeries && pastSeries.map((data, index) => (
                                    <div className="schedule" key={index}><div className="cardBody">
                                        <div className="thumbImage"
                                            onClick={() => this.handleViewDetails(data.SeriesId, null)}
                                            style={{ backgroundImage: `url(${APP_URLS.API_URL}${data.SeD[0].ImageFile})` }}>
                                        </div>
                                        <div className="thumbContent">
                                            <h3 onClick={() => this.handleViewDetails(data.SeriesId, null)}>{data.SeD[0].TITLE} </h3>
                                            <div className="date">
                                                <span className="tutorName" onClick={() => this.handleTutorDetails(data.TeacherId)}>By {data.SeD[0].Name}</span>
                                                <div className="divider"></div>
                                                <span>
                                                    <FormatDateTime date={data.StartDate}
                                                        format="MMM DD, YYYY hh:mm A"></FormatDateTime> ({userTimezone})
                                                </span>
                                            </div>
                                            <div className="comments">
                                                {/* <span><i className="fa fa-thumbs-o-up" aria-hidden="true"></i>10</span>
                                                <span><i className="fa fa-comment-o" aria-hidden="true"></i>3</span> */}
                                            </div>
                                            <p onClick={() => this.handleViewDetails(data.SeriesId, null)}>{data.SeD[0].Description}</p>
                                            <button className="btn btn-blue" onClick={() => this.handleViewDetails(data.SeriesId, null)}>View Details</button>
                                        </div>
                                    </div>
                                    </div>
                                )
                                )}

                            </Swiper>
                            {Object.keys(pastSession).length === 0 && Object.keys(pastSeries).length === 0 &&
                                <div className="noRecord">No record Found </div>
                            }
                        </div>
                    </div>
                </Tab.Pane >
            },
            {
                menuItem: `Related Sessions by ${sessionData.Name}`, render: () => <Tab.Pane>
                    <div className='row'>
                        <div className="col-sm-12">
                            <Swiper {...params}>
                                {relatedSession && relatedSession.map((data, index) => (

                                    <div className="schedule" key={index}>
                                        <div className="cardBody">
                                            <div className="thumbImage" onClick={() => this.handleViewDetails(null, data.SessionId)}
                                                style={{ backgroundImage: `url(${APP_URLS.API_URL}${data.SD[0].ImageFile})` }}>
                                            </div>
                                            <div className="thumbContent">
                                                <h3 onClick={() => this.handleViewDetails(null, data.SessionId)}>{data.SD[0].Title} </h3>
                                                <div className="date">
                                                    <span className="tutorName" onClick={() => this.handleTutorDetails(data.TeacherId)}>By {data.SD[0].Name}</span>
                                                    <div className="divider"></div>
                                                    <span>
                                                        <FormatDateTime date={data.StartDate}
                                                            format="MMM DD, YYYY hh:mm A"></FormatDateTime> ({userTimezone})
                                                    </span>
                                                </div>
                                                <div className="comments">
                                                    {/* <span><i className="fa fa-thumbs-o-up" aria-hidden="true"></i>10</span>
                                                <span><i className="fa fa-comment-o" aria-hidden="true"></i>3</span> */}
                                                </div>
                                                <p onClick={() => this.handleViewDetails(null, data.SessionId)}>{data.SD[0].SeriesDescription}</p>
                                                <button className="btn btn-blue" onClick={() => this.handleViewDetails(null, data.SessionId)}>Enroll Now</button>
                                            </div>
                                        </div>
                                    </div>
                                )
                                )}
                                {relatedSeries && relatedSeries.map((data, index) => (
                                    <div className="schedule" key={index}>
                                        <div className="cardBody">
                                            <div className="thumbImage"
                                                onClick={() => this.handleViewDetails(data.SeriesId, null)}
                                                style={{ backgroundImage: `url(${APP_URLS.API_URL}${data.SerD[0].ImageFile})` }}>
                                            </div>
                                            <div className="thumbContent">
                                                <h3 onClick={() => this.handleViewDetails(data.SeriesId, null)}>{data.SerD[0].TITLE} </h3>
                                                <div className="date">
                                                    <span className="tutorName" onClick={() => this.handleTutorDetails(data.TeacherId)}>By {sessionData.Name}</span>
                                                    <div className="divider"></div>
                                                    <span>
                                                        <FormatDateTime date={data.StartDate}
                                                            format="MMM DD, YYYY hh:mm A"></FormatDateTime> ({userTimezone})
                                                    </span>
                                                </div>
                                                <div className="comments">
                                                    {/* <span><i className="fa fa-thumbs-o-up" aria-hidden="true"></i>10</span>
                                                <span><i className="fa fa-comment-o" aria-hidden="true"></i>3</span> */}
                                                </div>
                                                <p onClick={() => this.handleViewDetails(data.SeriesId, null)}>{data.SerD[0].SeriesDescription}</p>
                                                <button className="btn btn-blue" onClick={() => this.handleViewDetails(data.SeriesId, null)}>Enroll Now</button>
                                            </div>
                                        </div>
                                    </div>
                                )
                                )}
                            </Swiper>
                            {Object.keys(relatedSession).length === 0 && Object.keys(relatedSeries).length === 0 &&
                                <div className="noRecord">No record Found </div>
                            }
                        </div>
                    </div >
                </Tab.Pane >
            },
            {
                menuItem: 'More Sessions Like This', render: () => <Tab.Pane>
                    <div className="row">
                        <div className="col-sm-12">
                            <Swiper {...params}>
                                {similarSeries && similarSeries.map((data, index) => (
                                    <div className="schedule" key={index}>
                                        <div className="cardBody">
                                            <div className="thumbImage"
                                                onClick={() => this.handleViewDetails(data.SeriesId, null)}
                                                style={{ backgroundImage: `url(${APP_URLS.API_URL}${data.SeD[0].ImageFile})` }}>
                                            </div>
                                            <div className="thumbContent">
                                                <h3 onClick={() => this.handleViewDetails(data.SeriesId, null)}>{data.SeD[0].TITLE} </h3>
                                                <div className="date">
                                                    <span className="tutorName" onClick={() => this.handleTutorDetails(data.TeacherId)}>By {data.SeD[0].Name}</span>
                                                    <div className="divider"></div>
                                                    <span>
                                                        <FormatDateTime date={data.SeD[0].ClosestSimilarSession[0].StartTime}
                                                            format="MMM DD, YYYY hh:mm A"></FormatDateTime> ({userTimezone})
                                                    </span>
                                                </div>
                                                <div className="comments">
                                                    {/* <span><i className="fa fa-thumbs-o-up" aria-hidden="true"></i>10</span>
                                                            <span><i className="fa fa-comment-o" aria-hidden="true"></i>3</span> */}
                                                </div>
                                                {/* <p>{data.sd[0].Description}</p> */}
                                                <p onClick={() => this.handleViewDetails(data.SeriesId, null)}>{data.SeD[0].Description}</p>
                                                <button className="btn btn-blue" onClick={() => this.handleViewDetails(data.SeriesId, null)}>Enroll Now</button>
                                            </div>
                                        </div>
                                    </div>
                                )
                                )}
                                {similarSession && similarSession.map((data, index) => (
                                    <div className="schedule" key={index}>
                                        <div className="cardBody">
                                            <div className="thumbImage"
                                                onClick={() => this.handleViewDetails(null, data.SessionId)}
                                                style={{ backgroundImage: `url(${APP_URLS.API_URL}${data.sd[0].ImageFile})` }}>
                                            </div>
                                            <div className="thumbContent">
                                                <h3 onClick={() => this.handleViewDetails(null, data.SessionId)}>{data.sd[0].TITLE} </h3>
                                                <div className="date">
                                                    <span className="tutorName" onClick={() => this.handleTutorDetails(data.TeacherId)}>By {data.sd[0].Name}</span>
                                                    <div className="divider"></div>
                                                    <span>
                                                        <FormatDateTime date={data.StartDate}
                                                            format="MMM DD, YYYY hh:mm A"></FormatDateTime> ({userTimezone})
                                                    </span>
                                                </div>
                                                <div className="comments">
                                                    {/* <span><i className="fa fa-thumbs-o-up" aria-hidden="true"></i>10</span>
                                                <span><i className="fa fa-comment-o" aria-hidden="true"></i>3</span> */}
                                                </div>
                                                <p onClick={() => this.handleViewDetails(null, data.SessionId)}>{data.sd[0].Description}</p>
                                                <button className="btn btn-blue" onClick={() => this.handleViewDetails(null, data.SessionId)}>Enroll Now</button>
                                            </div>
                                        </div>
                                    </div>
                                )
                                )}
                            </Swiper>
                            {Object.keys(similarSeries).length === 0 && Object.keys(similarSession).length === 0 &&
                                <div className="noRecord">No record Found </div>
                            }
                        </div>
                    </div >
                </Tab.Pane >
            }
        ]
        this.setState({ panes: panes });
    }

    handleTabChange = (e, { activeIndex }) => this.setState({ activeIndex })

    render() {
        const { activeIndex, panes } = this.state;
        const { userTimezone } = this.props;
        return (
            <Fragment>
                <section className="relatedSessions">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12">

                                <Tab
                                    panes={panes}
                                    activeIndex={activeIndex}
                                    menu={{ secondary: true }}
                                    onTabChange={this.handleTabChange}

                                >
                                </Tab>

                            </div>
                        </div>
                    </div>
                </section>
            </Fragment >
        )
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
            updateTimezone: bindActionCreators(actions.updateTimezone, dispatch)

        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(ReviewSection);
