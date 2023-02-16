import React, { Component, Fragment } from 'react';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import FormatDateTime from '../../shared/components/functional/DateTimeFormatter';
import { APP_URLS } from "../../config/api.config";
import ReadMoreReact from 'read-more-react';
import Rating from '@material-ui/lab/Rating';
import Loader from 'react-loaders';
import { PUBLIC_URL } from "../../config/api.config";
import { history } from '../../helpers/history';
import moment from 'moment-timezone';
import { commonFunctions } from '../../shared/components/functional/commonfunctions';
import { localStorageService } from '../../services/localStorageService';
class UpcomingSession extends Component {
    constructor(props) {
        super(props);
        this.state = {
            upcomingSessionData: [],
            loading: false,
            // Page size & limit must be same value. 
            pageSize: 5,
            loadMoreLimit: 20,
            limit: 1,
            searchText: '',
            //userTimezone: moment.tz(moment.tz.guess(true)).format("z").indexOf("+") !== -1 || moment.tz(moment.tz.guess(true)).format("z").indexOf("-") !== -1 ? this.props.userTimezone : moment.tz(moment.tz.guess(true)).format("z")


        };
    }
    // API calls
    getSessionDetail = (searchText, pageNumber, pageSize) => {
        this.setState({ loading: true });
        apiService.post('UNAUTHORIZEDDATA',
            {
                "data": {
                    "SearchText": searchText,
                    "SessionType": "Upcoming Session",
                    "CategoryId": null,
                    "StartDate": '1990-01-01',
                    "EndDate": '2099-01-01',
                    "MinPrice": 0,
                    "MaxPrice": 1000,
                    "userid": null,
                    "PageNbr": pageNumber,
                    "PageSize": pageSize,
                    "Type": "Series & Session",
                    "Tag": null

                },
                "keyName": "GetSeriesSessions"
            }).then(response => {

                if (response.Success) {
                    if (response.Data && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                        let filterData = response.Data.ResultDataList === null ? [] : response.Data.ResultDataList.filter(x => x.SeriesId > 0 ? moment(commonFunctions.getUtcDatetime(JSON.parse(x.SeriesDetail)[0].StartTime)).isAfter(moment(), 'second') : moment(commonFunctions.getUtcDatetime(x.StartTime)).isAfter(moment(), 'second'));
                        this.setState({ upcomingSessionData: filterData });
                    }
                    else {
                        this.setState({ upcomingSessionData: [] });
                    }
                }else{
                    this.props.actions.showAlert({ message: response.Message, variant: "error" });
                }
                this.setState({ loading: false });
            },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
                        this.setState({ loading: false });
                    })
            );
    }

    componentDidMount = () => {
        this.getSessionDetail(null, 1, this.state.pageSize);
        let timezone = localStorageService.getUserTimeZone();
        this.props.actions.updateTimezone(timezone);
    }
    // handler functions 
    handleLoadMore = () => {
        const { pageSize, limit, loadMoreLimit } = this.state;
        let newPageSize = pageSize + loadMoreLimit ;
        this.setState({ pageSize: newPageSize });
        this.getSessionDetail(null, 1, newPageSize);
    }

    handleFilterRecord = () => {
        this.getSessionDetail(this.state.searchText, 1, this.state.pageSize);
    }
    onKeyDown = (event) => {

        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        if (event.key === 'Enter') {
            this.handleFilterRecord();
        }
    }

    handleEnrollNow = (UserId) => { }

    handleChange = (e) => {
        this.setState({ searchText: e.target.value });
    }
    //Navigation 
    handleViewDetails = (SeriesId, SessionId) => {
        if (SeriesId !== null && SeriesId > 0) {
            history.push(`${PUBLIC_URL}/SeriesDetail/${SeriesId}`);
        }
        else if (SessionId !== null && SessionId > 0) {
            history.push(`${PUBLIC_URL}/SessionDetail/${SessionId}`);
        }
    }

    handleTutorDetails = (TutorId) => {
        history.push(`${PUBLIC_URL}/TutorProfile/${TutorId}`);
    }
    resetSearch = () => {

        this.setState({ searchText: '' })
        this.getSessionDetail('', 1, this.state.pageSize);

    }

    handleTutorDetails = (TutorId) => {
        history.push(`${PUBLIC_URL}/TutorProfile/${TutorId}`);
    }

    render() {
        const { upcomingSessionData, loading, searchText } = this.state;
        const { userTimezone } = this.props;
        return (
            <Fragment>
                <section className="sessions">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="headingTitle text-center">
                                    <h3>Upcoming series and sessions</h3>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="filters">
                                    <div className="searchFilter">
                                        <div className="inputSearch">
                                            <input type="text" name="searchText" value={searchText} onChange={this.handleChange} onKeyDown={this.onKeyDown} className="form-control" placeholder="Search by session or tutor" />
                                            <div className="searchIcon" onClick={this.handleFilterRecord}> <span><i className="fa fa-search"></i></span></div>
                                        </div>
                                    </div>
                                    <div className="refreshIcon"><label><span><i className="fa fa-refresh" onClick={this.resetSearch}></i></span></label></div>
                                </div>
                                {upcomingSessionData.map((data, index) => (
                                    <div className="filterData upcomingSessionSeries" key={index}>
                                        <div className="thumbDivList ">
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <div className="thumbImage" onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)} style={{ backgroundImage: `url(${APP_URLS.API_URL}${data.ImageFile})` }}>
                                                        {data.SeriesId != null && data.SeriesId > 0 && JSON.parse(data.SeriesDetail) &&
                                                            <Fragment>
                                                                <div className="filterWeek">
                                                                    <span><FormatDateTime date={JSON.parse(data.SeriesDetail)[0].StartTime}
                                                                        format="MMM DD, YYYY"></FormatDateTime></span>
                                                                    <div className="divider"></div>
                                                                    <span><FormatDateTime date={JSON.parse(data.SeriesDetail)[0].StartTime}
                                                                        format="ddd"></FormatDateTime></span>
                                                                </div>
                                                                <div className="year">
                                                                    <span><FormatDateTime date={JSON.parse(data.SeriesDetail)[0].StartTime}
                                                                        format="h:mm A"></FormatDateTime> ({userTimezone})
                                                                        {/* ({data.TimeZone}) */}
                                                                    </span>
                                                                    <div className="divider"></div>
                                                                    <span>{JSON.parse(data.SeriesDetail)[0].SD[0].Duration}</span>
                                                                </div>
                                                            </Fragment>
                                                        }
                                                        {data.SeriesId == null &&
                                                            <Fragment>
                                                                <div className="filterWeek">
                                                                    <span><FormatDateTime date={data.StartTime}
                                                                        format="MMM DD, YYYY"></FormatDateTime></span>
                                                                    <div className="divider"></div>
                                                                    <span><FormatDateTime date={data.StartTime}
                                                                        format="ddd"></FormatDateTime></span>
                                                                </div>

                                                                <div className="year">
                                                                    <span><FormatDateTime date={data.StartTime}
                                                                        format="h:mm A"></FormatDateTime> ({userTimezone})
                                                                        {/* ({data.TimeZone}) */}
                                                                    </span>
                                                                    <div className="divider"></div>
                                                                    <span>{data.Duration}</span>
                                                                </div>
                                                            </Fragment>
                                                        }
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <div className="thumbDesc">
                                                        <div className="thumbTitle">
                                                            <div className="profileIcon"><img onClick={() => this.handleTutorDetails(data.TeacherId)} src={`${APP_URLS.API_URL}${data.TeacherImageFile}`} alt="image" width="40" height="40" /></div>
                                                            <h2 className="headerInfo" onClick={() => this.handleTutorDetails(data.TeacherId)}>{data.Name}</h2>
                                                        </div>
                                                        <div>
                                                            <h4 onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)}>{data.Title}</h4>
                                                            <span onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)} className="sessionType">({data.SeriesId === null ? 'Session' : 'Series'})</span>
                                                        </div>
                                                    </div>

                                                    <div className="priceDiv">
                                                        <span className="price">$ {data.Fee}</span>
                                                        <span className="users"  title="Spots Left"><i className="fa fa-users"></i>{data.TotalSeats - data.OccupiedSeats}</span>
                                                        <div className="starRating">
                                                            <Rating name="read-only" precision={0.5} size='small' value={data.Rating} readOnly />
                                                            <span>({data.RatingCount})</span>
                                                        </div>
                                                    </div>
                                                    <button className="enrollNow" onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)}><a className="btn btn-blue">Enroll Now</a></button>
                                                </div>
                                                <div className="col-md-5">
                                                    <h5>Description:</h5>
                                                    <div className="wordLimit">
                                                        <p onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)}>{data.Description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                                )}
                                {
                                    upcomingSessionData.length === 0 && <div className="filterData">
                                        <h5 className="text-center">No upcoming session found.</h5>
                                    </div>
                                }
                            </div>
                            {
                                upcomingSessionData.length > 0 && upcomingSessionData.length < upcomingSessionData[0].MaxRows && <div className="col-sm-12">
                                    <div className="loadMore" onClick={this.handleLoadMore}><button className="btn btn-grey">Load More</button></div>
                                </div>
                            }
                        </div>
                    </div>

                    {loading &&
                        <div className="loaderDiv"><div className="loader">
                            <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                        </div></div>
                    }
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
export default connect(mapStateToProps, mapDispatchToProps)(UpcomingSession);
