import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import { history } from "../../helpers/history";
import { PUBLIC_URL } from "../../config/api.config";
import { APP_URLS } from "../../config/api.config";
import Select from "react-select";
import Rating from "@material-ui/lab/Rating";
import { apiService } from "../../services/api.service";
// import ReadMoreReact from "read-more-react";
import Loader from "react-loaders";
import Heart from "react-animated-heart";
import { localStorageService } from "../../services/localStorageService";
import Pagination from "@material-ui/lab/Pagination";
class PrivateSession extends Component {
    constructor(props) {
        super(props);
        // let { match, auth } = this.props;
        let { auth } = this.props;
        this.state = {
            categoryId: 0,
            searchTutor: "",
            sessionCategories: [],
            allTutorData: null,
            loading: false,
            isRequestDone: false,
            teacherId:
                auth.user && typeof auth.user.TeacherId !== "undefined"
                    ? auth.user.TeacherId
                    : -1,
            actionPerformedBy:
                auth.user && typeof auth.user.FirstName !== "undefined"
                    ? auth.user.FirstName
                    : "",
            studentId:
                auth.user && typeof auth.user.StudentId !== "undefined"
                    ? auth.user.StudentId
                    : -1,
            pageNumber: 1,
            pageSize: 30,
            totalcount: 0,
            sortBy:''
        };
        this.addToFavourite = this.addToFavourite.bind(this);
    }

    componentDidMount() {
        localStorageService.updateUserMode("student");
        this.props.actions.changeUserMode("student");
        this.getSessionCategories();
        this.getAllTutor(-1, true, false);
    }

    handleSelectChange = (opt, meta) => {
        this.setState({ categoryId: opt.value});
        this.getAllTutor(opt.value, false, false);
    };

    getAllTutor = (categoryId, isloading, isRequest) => {
        this.setState({ loading: isloading, isRequestDone: isRequest });
        const {
            searchTutor,
            teacherId,
            studentId,
            pageNumber,
            pageSize,
            sortBy
        } = this.state;

        apiService
            .post("UNAUTHORIZEDDATA", {
                data: {
                    CategoryId: categoryId > 0 ? categoryId : -1,
                    IsPrivateSession: "Y",
                    SearchTutor: searchTutor,
                    StudentId: studentId,
                    TeacherId: teacherId,
                    PageNbr: pageNumber,
                    PageSize: pageSize,
                    SortBy: sortBy
                },
                keyName: "GetAllTutors",
            })
            .then(
                (response) => {
                    if (response.Success) {
                        if (
                            response.Data !== null &&
                            Object.keys(response.Data).length > 0 &&
                            response.Data.ResultDataList.length > 0 && response.Data.ResultDataList[0].data
                        ) {


                            let responseData = JSON.parse(
                                response.Data.ResultDataList[0].data
                            );
                            responseData.forEach(item => {
                                item.IsFavourite = item.FavoriteId > 0 ? true : false;
                            });
                            // responseData.map((item) => {
                            //     item.IsFavourite = item.FavoriteId > 0 ? true : false;
                            // });
                            console.log(responseData);
                            this.setState({
                                allTutorData: responseData,
                                totalcount: response.Data.ResultDataList[0].totalCount,
                            });
                        } else {
                            this.setState({ allTutorData: null });
                        }
                    }else{
                        this.props.actions.showAlert({ message: response.Message, variant: "error" });
                    }
                    this.setState({ loading: false, isRequestDone: true });
                },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
                        this.setState({ loading: false, isRequestDone: true });
                    })
            );
    };

    getSessionCategories = () => {
        this.setState({ loading: true });
        apiService
            .post("UNAUTHORIZEDDATA", {
                data: { SessionCategoryId: -1 },
                keyName: "GetSessionCategories",
            })
            .then(
                (response) => {
                    if (response.Success) {
                        if (
                            response.Data !== null &&
                            Object.keys(response.Data).length > 0 &&
                            response.Data.ResultDataList.length > 0
                        ) {
                            this.setState({
                                sessionCategories: response.Data.ResultDataList,
                            });
                        }
                    }
                    this.setState({ loading: false });
                },
                (error) =>
                    this.setState((prevState) => {
                        console.log(`SessionCategories:${error}`);
                        this.props.actions.showAlert({
                            message: "Something went wrong...",
                            variant: "error",
                        });
                        this.setState({ loading: false });
                    })
            );
    };
    handleChange = (e) => {
        this.setState(
            { searchTutor: e.target.value, pageNumber: 1 },
            this.handleFilterRecord
        );
    };

    handleFilterRecord = () => {
        const { categoryId } = this.state;
        this.getAllTutor(categoryId, false);
    };
    onKeyDown = (event) => {
        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        // if (event.key === 'Enter') {}
        this.handleFilterRecord();
    };

    addToFavourite = (tutorRefId, refId, status) => {
        let data = this.state.allTutorData;
        data.forEach((item) => {
            if (item.TeacherId === tutorRefId) {
                item.IsFavourite = !item.IsFavourite;
            }
        });
        // data.map((item) => {
        //     if (item.TeacherId === tutorRefId) {
        //         item.IsFavourite = !item.IsFavourite;
        //     }
        // });
        this.setState({ allTutorData: data });
        apiService
            .post("ADDFAVOURITE", {
                studentId: this.state.studentId,
                refrenceId: tutorRefId, // tutor id
                refrenceTypeId: refId,
                RecordDeleted: status === true ? "Y" : "N",
                actionPerformedBy: this.state.actionPerformedBy,
            })
            .then(
                (response) => {
                    if (response.Success) {
                        this.props.actions.showAlert({
                            message: response.Message,
                            variant: "success",
                        });
                    }else{
                        this.props.actions.showAlert({ message: response.Message, variant: "error" });
                    }
                },
                (error) => {
                    data.forEach((item) => {
                        if (item.TeacherId === tutorRefId) {
                            item.IsFavourite = !item.IsFavourite;
                        }
                    });
                    // data.map((item) => {
                    //     if (item.TeacherId === tutorRefId) {
                    //         item.IsFavourite = !item.IsFavourite;
                    //     }
                    // });
                    this.setState({ allTutorData: data });
                    this.props.actions.showAlert({
                        message: "Trouble in adding to favourite",
                        variant: "error",
                    });
                }
            );
    };

    handlePaginatorChange = (e, pageNumber) => {
        this.setState({ pageNumber }, () => {
            this.getAllTutor(this.state.categoryId, true)
        });
    };
    handleSortByChange = (opt, meta) => {
        this.setState({ sortBy: opt.value }, () => {
            this.getAllTutor(this.state.categoryId, true)
        });
    }

    render() {
        const {
            allTutorData,
            categoryId,
            sessionCategories,
            loading,
            isRequestDone,
            searchTutor,
            pageNumber,
            pageSize,
            totalcount,
            sortBy
        } = this.state;
        let categories = [];
        categories.push({ value: -1, label: "All Categories" });
        sessionCategories.forEach((item) => {
            categories.push({
                value: item.SessionCategoryId,
                label: item.SessionCategoryName,
            });
        });

        let sortByOptions = [
            { value: 'priceDesc', label: 'Highest Price' },
            { value: 'priceAsc', label: 'Lowest Price' },
            { value: 'rating', label: 'Rating' },
            { value: 'ratingCount', label: '# of Ratings' }
        ];

        return (
            <Fragment>
                <section className="series-Session">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12  col-md-12 col-sm-12">
                                <div className="resetForm">
                                    <h1 className="text-center">Private Session </h1>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="filter">
                                                <div className="row">
                                                    <div className="col-md-4 col-lg-4 col-sm-12">
                                                        <Select
                                                            styles={{
                                                                menu: (styles) => ({ ...styles, zIndex: 999 }),
                                                            }}
                                                            name="categoryId"
                                                            placeholder="Choose by Category"
                                                            value={categories.filter(
                                                                (obj) => obj.value === categoryId
                                                            )}
                                                            onChange={this.handleSelectChange}
                                                            options={categories}
                                                        />
                                                    </div>
                                                    <div className="col-md-4 col-lg-4 col-sm-12">
                                                        <div className="sortBy">
                                                            <Select
                                                                value={sortByOptions.filter(obj => obj.value === sortBy)}
                                                                onChange={this.handleSortByChange}
                                                                name="sortBy"
                                                                placeholder='Sort By...'
                                                                options={sortByOptions}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 col-lg-4 col-sm-12">
                                                        <div className="inputSearch psinputSearch">
                                                            <input
                                                                type="text"
                                                                name="searchTutor"
                                                                value={searchTutor}
                                                                onChange={this.handleChange}
                                                                className="form-control"
                                                                placeholder="Search tutor name, description"
                                                            />
                                                            <div
                                                                className="searchIcon"
                                                                onClick={this.handleFilterRecord}
                                                            >
                                                                {" "}
                                                                <span>
                                                                    <i className="fa fa-search"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {allTutorData !== null && (
                                        <div className="row">
                                            <div className="col-sm-12 mb-4">
                                                <Pagination
                                                    count={Math.ceil(totalcount / pageSize)}
                                                    variant="outlined"
                                                    shape="rounded"
                                                    size="small"
                                                    page={pageNumber}
                                                    name="pageNbr"
                                                    onChange={this.handlePaginatorChange}
                                                    color="primary"
                                                />
                                            </div>
                                            {allTutorData.map((item, index) => (
                                                
                                                <div className="col-lg-4 col-md-6 col-sm-6" key={index}>
                                                    <div className="thumbDiv1">
                                                        <div className="thumbWrapper">
                                                            <div className="psUserNamePic">
                                                                <div className="thumbImage">
                                                                    <img
                                                                        src={`${APP_URLS.API_URL}${item.ImageFile}`}
                                                                        onClick={() =>
                                                                            history.push(
                                                                                `${PUBLIC_URL}/TutorProfile/${item.TeacherId}`
                                                                            )
                                                                        }
                                                                        alt={item.Name}
                                                                        width="65"
                                                                        height="65"
                                                                    ></img>
                                                                </div>
                                                                <h2
                                                                    onClick={() =>
                                                                        history.push(
                                                                            `${PUBLIC_URL}/TutorProfile/${item.TeacherId}`
                                                                        )
                                                                    }
                                                                >
                                                                    {item.Name}
                                                                </h2>
                                                            </div>
                                                            <div className="thumbDesc offerDetails">
                                                                <div className="thumbTitle">
                                                                    <div className="">
                                                                        <h5>Fee Per Hour $ {item.FeePerHours}</h5>
                                                                        <div className="rattingStar">
                                                                            <Rating
                                                                                name="read-only"
                                                                                precision={0.5}
                                                                                size="small"
                                                                                value={item.Rating > 0 ? item.Rating : 0}
                                                                                readOnly
                                                                            />
                                                                            <span className="rattingReview">
                                                                                ({item.RatingCount})
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {this.props.auth.loggedIn && (
                                                                    <span className="heartImage">
                                                                        <Heart
                                                                            isClick={item.IsFavourite}
                                                                            onClick={() =>
                                                                                this.addToFavourite(
                                                                                    item.TeacherId,
                                                                                    item.Type,
                                                                                    item.IsFavourite
                                                                                )
                                                                            }
                                                                        />
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="bioDetails psDetails">
                                                            <p
                                                                onClick={() =>
                                                                    history.push(
                                                                        `${PUBLIC_URL}/TutorProfile/${item.TeacherId}`
                                                                    )
                                                                }
                                                            >
                                                                {item.Description}
                                                            </p>
                                                        </div>
                                                        <div className="enrollNow">
                                                            <button
                                                                className="btn btn-blue"
                                                                onClick={() =>
                                                                    history.push(
                                                                        `${PUBLIC_URL}/TutorProfile/${item.TeacherId}`
                                                                    )
                                                                }
                                                            >
                                                                See Profile
                              </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="col-sm-12">
                                                <Pagination
                                                    count={Math.ceil(totalcount / pageSize)}
                                                    variant="outlined"
                                                    shape="rounded"
                                                    size="small"
                                                    page={pageNumber}
                                                    name="pageNbr"
                                                    onChange={this.handlePaginatorChange}
                                                    color="primary"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {allTutorData === null &&
                                        // (Object.keys(allTutorData).length === 0 && (
                                        <div className="row">
                                            {" "}
                                            <div className="col-sm-12">
                                                <div className="blankSpace">
                                                    <img width="332" height="252" 
                                                        src={require("../../assets/images/undraw_empty.png")}
                                                    ></img>
                                                    {(!loading && isRequestDone) && (
                                                        <h4 className="blankSpaceMessage">
                                                            No Tutor Found.
                                                        </h4>
                                                    )}
                                                    {(loading || !isRequestDone) && (
                                                        <h4 className="blankSpaceMessage">
                                                            Loading Tutors List.
                                                        </h4>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        // ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {loading && (
                    <div className="loaderDiv">
                        <div className="loader">
                            <Loader
                                type="ball-clip-rotate-multiple"
                                style={{ transform: "scale(1.4)" }}
                            />
                        </div>
                    </div>
                )}
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        actions: {
            showAlert: bindActionCreators(actions.showAlert, dispatch),
            changeUserMode: bindActionCreators(actions.changeUserMode, dispatch),
        },
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(PrivateSession);
