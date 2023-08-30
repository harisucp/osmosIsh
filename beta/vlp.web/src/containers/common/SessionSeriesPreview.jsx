import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import { APP_URLS } from "../../config/api.config";
import FormatDateTime from '../../shared/components/functional/DateTimeFormatter';
import Rating from '@material-ui/lab/Rating';
import { Modal } from 'react-bootstrap';

class SessionSeriesPreview extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }
    render() {
        const { data } = this.props;
        const { userTimezone } = this.props;
        return (
            <Fragment>
                <Modal show={true} onHide={() => {this.props.close()}}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    {/* <Modal.Header closeButton>
                        <Modal.Title id="sign-in-title">
                            Confirm Changes
                        </Modal.Title>
                    </Modal.Header> */}
                    <Modal.Body>
                        <div>
                            <div className="thumbDiv">
                                <div className="thumbImage" style={{ backgroundImage: `url(${data.ImageFile})` }}></div>
                                <div className="dateDescriptionSection">
                                    <div className="thumbDesc">
                                        <div className="row">
                                            <div className="col-lg-7 col-md-7 col-sm-12">
                                                <div className="thumbTitle">
                                                    <div className="profileIcon"><img src={`${APP_URLS.API_URL}${data.TeacherImageFile}`} alt="Teacher Profile Image" width="40" height="40" /></div>
                                                    <h2 className="headerInfo">{data.Name}</h2>
                                                </div>
                                            </div>
                                            <div className="col-lg-5 col-md-5 col-sm-12">
                                                <div className="starRating">
                                                    <Rating name="read-only" precision={0.5} size='small' value={data.Rating} readOnly />
                                                    <span>({data.RatingCount})</span>
                                                </div>
                                            </div>
                                        </div>
                                        <h4 >{data.Title}</h4>
                                        <span className="sessionType">
                                             {data.SeriesId === null && <span className='session'>(Session)</span>}
                                             {data.SeriesId != null && <span className='series'>(Series)</span>}
                                        </span>
                                            <p className="wordlimitBrowse">{data.Description}</p>
                                    </div>
                                        <Fragment>
                                        <div className="dateTime searchPanelDateTime">
                                             <span className="date">
                                                <span >
                                                   <FormatDateTime date={data.StartTime} format="ddd"></FormatDateTime></span>
                                                <span className="duration">
                                                   <FormatDateTime date={data.StartTime} format="MMM DD, YYYY"></FormatDateTime>
                                                </span>
                                             </span>
                                             <span className="time">
                                                <span><FormatDateTime date={data.StartTime} format="h:mm A"></FormatDateTime></span>
                                                {/* ({data.TimeZone}) */}({userTimezone})
                                                <span className="duration">{data.Duration}</span>
                                             </span>

                                          </div>
                                        </Fragment>
                                    
                                </div>
                                <div className="priceDiv">
                                    <span className="price">$ {data.Fee}</span>
                                    <span className="users" title="Spots Left"><i className="fa fa-users"  ></i>{data.TotalSeats - data.OccupiedSeats}</span>

                                </div>
                                <div className="row">
                                    <div className="enrollNow col-md-6" ><a className="btn btn-blue" onClick={() => this.props.close()}>Cancel</a></div>
                                    <div className="enrollNow col-md-6" ><a className="btn btn-blue" onClick={() => this.props.submit()}>Create</a></div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
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
            showAlert: bindActionCreators(actions.showAlert, dispatch)
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(SessionSeriesPreview);
