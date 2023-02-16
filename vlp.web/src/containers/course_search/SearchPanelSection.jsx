import React, { Component, Fragment } from 'react';
import 'font-awesome/css/font-awesome.min.css';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import Loader from 'react-loaders';
import FormatDateTime from '../../shared/components/functional/DateTimeFormatter';
import { APP_URLS } from "../../config/api.config";
import Slider from '@material-ui/core/Slider';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Pagination from '@material-ui/lab/Pagination';
import ViewComfyIcon from '@material-ui/icons/ViewComfy';
import ListIcon from '@material-ui/icons/List';
import moment from 'moment';
import Select from 'react-select';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import sortJsonArray from 'sort-json-array';
import Rating from '@material-ui/lab/Rating';
import { PUBLIC_URL } from "../../config/api.config";
import { history } from '../../helpers/history';
import queryString from 'query-string';
import { ObjectFlags } from 'typescript';
import { commonFunctions } from '../../shared/components/functional/commonfunctions';
import _ from 'lodash';

class SearchPanel extends Component {
   constructor(props) {
      super(props);
      this.state = {
         startDatenew : moment().toString(),
         filterOptions: {
            searchText: props.search || null,//done
            searchType: props.isAll ? "All Classes" : "Series & Session",
            sessionType: "Upcoming Session",
            categoryId: 0,//done
            startDate: moment().toString(),//done
            endDate: moment().add(2, 'months').toString(),
            minPrice: 0,
            maxPrice: 1000,
            userid: null,
            pageNbr: 1,
            pageSize: "10",//done
            price: [0, 5000],
            countryId: 0
         },
         limit: 3,
         courseSearchData: [],
         sessionCategories: [],
         availableTags: [],
         selectedTags: [],
         coutriesOption: [],
         countriesList: [],
         keyName: [],
         dataMode: 'grid',
         dataModeValue: 0,
         loading: false,
         isRequestDone: false,
         sortBy: '',
         country: 0,
         sortedSelectedOption : { value: '', label: '' },
         sortedMeta : {
            "action": "select-option",
            "name": "sortBy"
         },
         showFilter: true,
         fetchedRowsCount: 0,
         userTimezone: this.props.userTimezone === null ? moment.tz(moment.tz.guess(true)).format("z") : this.props.userTimezone
      };
      this.changeMode = this.changeMode.bind(this);
      this.handleTextChange = this.handleTextChange.bind(this);
      this.handleSelectChange = this.handleSelectChange.bind(this);
      this.handlePaginatorChange = this.handlePaginatorChange.bind(this);
      this.handleSessionChange = this.handleSessionChange.bind(this);
      this.handleSlider = this.handleSlider.bind(this);
      this.handleStartDateChange = this.handleStartDateChange.bind(this);
      this.handleEndDateChange = this.handleEndDateChange.bind(this);
      this.handleApplyFilter = this.handleApplyFilter.bind(this);
      this.handleSessionType = this.handleSessionType.bind(this);
      this.handleResetFilter = this.handleResetFilter.bind(this);
      this.onKeyDown = this.onKeyDown.bind(this);
      this.handleTagSelect = this.handleTagSelect.bind(this);
      this.handleViewDetails = this.handleViewDetails.bind(this);
      this.handleSliderCommitted = this.handleSliderCommitted.bind(this);
      this.handleLoadMore = this.handleLoadMore.bind(this);
      this.getCourseSearchData = _.debounce(this.getCourseSearchData, 1000);
   }

   componentDidMount = () => {
      const { searchText } = this.state.filterOptions;
      this.getSessionCategories();
      this.getAvailableTags();
      this.getAllCountries(searchText || this.props.headerSearch);
   }

   componentDidUpdate(prevProps) {
      if (this.props.search !== prevProps.search) {
         this.setState({ filterOptions: { ...this.state.filterOptions, searchText: this.props.search } });
         this.getCourseSearchData(this.props.search);
      }
      if(this.props.performSearch && this.props.performSearch !== prevProps.performSearch)
      {
         this.getCourseSearchData(this.props.headerSearch);
      }
   }
   

   getCourseSearchData = (searchText, isLoading = true, isRequest = false) => {
      this.setState({ loading: isLoading, isRequestDone: isRequest });
      const { filterOptions, selectedTags, sortBy } = this.state;
      let formatedStartTime = commonFunctions.convertToFormattedUtc(filterOptions.startDate, 'MM-DD-YYYY');
      let formatedEndTime = commonFunctions.convertToFormattedUtc(filterOptions.endDate, 'MM-DD-YYYY');
      apiService.post('UNAUTHORIZEDDATA',
         {
            "data": {
               "SearchText": searchText,
               "SessionType": filterOptions.searchType === "All Classes" ? null : filterOptions.sessionType,
               "CategoryId": filterOptions.searchType === "All Classes" ? -1 : filterOptions.categoryId,
               "StartDate": formatedStartTime,
               "EndDate": formatedEndTime,
               "MinPrice": filterOptions.price[0],
               "MaxPrice": filterOptions.price[1],
               "userid": filterOptions.userid,
               "PageNbr": filterOptions.pageNbr,
               "PageSize": filterOptions.pageSize,
               "Type": filterOptions.searchType,
               "Tag": filterOptions.searchType === "All Classes" ? null : selectedTags.toString(),
               "CountryId": filterOptions.searchType === "All Classes" ? -1 : filterOptions.countryId
            },
            "keyName": "GetSeriesSessions"
         }).then(response => {
            if (response.Success) {
               if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                  let data = response.Data.ResultDataList;
                  let courseData = data.filter(item => item.SeriesId == null || (item.SeriesId > 0 && item.SeriesDetail !== null));
                  courseData = data.filter(item => { 
                     // console.log(moment(moment.utc(item.StartTime).local().format('MM-DD-YYYY')).unix(), moment(formatedStartTime).unix(), moment(moment.utc(item.EndTime).local().format('MM-DD-YYYY')).unix() , moment(formatedEndTime).unix(), (moment(moment.utc(item.StartTime).local().format('MM-DD-YYYY')).unix() >= moment(formatedStartTime).unix()) && (moment(moment.utc(item.EndTime).local().format('MM-DD-YYYY')).unix() <= moment(formatedEndTime).unix())); 
                     return (moment(moment.utc(item.StartTime).local().format('MM-DD-YYYY')).unix() >= moment(formatedStartTime).unix()) && (moment(moment.utc(item.EndTime).local().format('MM-DD-YYYY')).unix() <= moment(formatedEndTime).unix())
                  });
                  console.log(courseData);
                  if (sortBy) {
                     this.setState({ courseSearchData: courseData, fetchedRowsCount: data.length });
                     this.handleSelectChange(this.state.sortedSelectedOption, this.state.sortedMeta);
                  }else{
                      sortJsonArray(courseData, 'StartTime', 'asc');
                      this.setState({ courseSearchData: courseData, fetchedRowsCount: data.length });
                  }
                  
               }
               else {
                  this.setState({ courseSearchData: [] });
               }
            }else{
               this.props.actions.showAlert({ message: response.Message, variant: "error" });
            }
            this.setState({ loading: false, isRequestDone: true });
         },
            (error) => {
            console.log(error);
               this.setState((prevState) => {
                  this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
                  this.setState({ loading: false, isRequestDone: true });
               })
            }
         );
   }

   getAvailableTags = () => {
      this.setState({ loading: true });
      apiService.post('UNAUTHORIZEDDATA', { "data": {}, "keyName": "GetAllAvilableTags" })
         .then(response => {
            if (response.Success) {
               if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList && response.Data.ResultDataList.length > 0) {
                  this.setState({ availableTags: JSON.parse(response.Data.ResultDataList[0].Interest) });
               }
            }
            this.setState({ loading: false });
         },
            (error) =>
               this.setState((prevState) => {
                  console.log(`Tag:${error}`);
                  this.props.actions.showAlert({ message: 'Something went wrong...', variant: "error" });
                  this.setState({ loading: false });
               })
         );
   }
   getSessionCategories = () => {
      this.setState({ loading: true });
      apiService.post('UNAUTHORIZEDDATA', { "data": { "SessionCategoryId": -1 }, "keyName": "GetSessionCategories" })
         .then(response => {
            if (response.Success) {
               if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                  this.setState({ sessionCategories: response.Data.ResultDataList });
               }
            }
            this.setState({ loading: false });
         },
            (error) =>
               this.setState((prevState) => {
                  console.log(`SessionCategories:${error}`);
                  this.props.actions.showAlert({ message: 'Something went wrong...', variant: "error" });
                  this.setState({ loading: false });
               })
         );
   }

   getAllCountries = (searchText) => {
      this.setState({ loading: true });
      apiService.post('UNAUTHORIZEDDATA', { "data": { "CountryId": -1 }, "keyName": "GetAllCountries" })
         .then(response => {
            if (response.Success) {
               if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList && response.Data.ResultDataList.length > 0) {
                  let coutriesOption = [];
                  coutriesOption.push({ value: -1, label: 'All' });
                  response.Data.ResultDataList.map((item) => {
                     coutriesOption.push({ value: item.CountryId, label: item.Name });
                  });
                  let tempCountry = coutriesOption.find(x => x.label === 'All');
                  this.setState({ filterOptions: { ...this.state.filterOptions, countryId: tempCountry.value }, coutriesOption: coutriesOption, countriesList: response.Data.ResultDataList }, () => this.getCourseSearchData(searchText));
               }
               else {
                  this.setState({ coutriesOption: [], countriesList: [] });
               }
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

   changeMode = (event, ModeValue) => {
      if (ModeValue === 0) {
         this.setState({ dataModeValue: 0, dataMode: 'grid' });
      }
      else if (ModeValue === 1) {
         this.setState({ dataModeValue: 1, dataMode: 'list' });
      }
   }
   
   handleTextChange = (e) => {
      const { filterOptions } = this.state;
      // if(e.target.value === ""){
      //    this.getCourseSearchData(e.target.value, false);
      // }
      this.getCourseSearchData(e.target.value, false);
      filterOptions[e.target.name] = e.target.value;
      this.setState({ filterOptions });
   }

   handleSelectChange = (opt, meta) => {
      console.log(opt, meta);
      const { filterOptions } = this.state;
      if (meta.name === 'sortBy') {
            const sortArr = this.state.courseSearchData.sort((a,b)=>{
               if(opt.value === 'asc'){
                  var x = (a['StartTime'] === null) ? "" : "" + a['StartTime'],
                  y = (b['StartTime'] === null) ? "" : "" + b['StartTime'];
                  return x < y ? -1 :(x > y ? 1 : 0);
               }else if(opt.value === 'des'){
                  var x = (a['StartTime'] === null) ? "" : "" + a['StartTime'],
                  y = (b['StartTime'] === null) ? "" : "" + b['StartTime'];
                  return x < y ? 1 :(x > y ? -1 : 0);
               }else if(opt.value === 'hl'){
                  var x = (a['Fee'] === null) ? "" : a['Fee'],
                  y = (b['Fee'] === null) ? "" : b['Fee'];
                  return x < y ? 1 :(x > y ? -1 : 0);
               } else if(opt.value === 'lh'){
                  var x = (a['Fee'] === null) ? "" : a['Fee'],
                  y = (b['Fee'] === null) ? "" : b['Fee'];
                  return x < y ? -1 :(x > y ? 1 : 0);
               } else if(opt.value === 'rating'){
                  var x = (a['Rating'] === null) ? "" : a['Rating'],
                  y = (b['Rating'] === null) ? "" : b['Rating'];
                  return x < y ? 1 :(x > y ? -1 : 0);
               } else if(opt.value === 'ratingCount'){
                  var x = (a['RatingCount'] === null) ? "" : a['RatingCount'],
                  y = (b['RatingCount'] === null) ? "" : b['RatingCount'];
                  return x < y ? 1 :(x > y ? -1 : 0);
               }
         })
        
         this.setState(() => ({
            sortBy: opt.value,
            sortedSelectedOption : opt
         }));
         
      }
      else {
         if (meta.name === 'pageSize') {
            filterOptions["pageNbr"] = 1;
         }
         filterOptions[meta.name] = opt.value;
         this.setState({ filterOptions });
         this.getCourseSearchData(filterOptions.searchText);
      }
   }

   handlePaginatorChange = (e, pageNumber) => {
      const { filterOptions } = this.state;
      filterOptions.pageNbr = pageNumber;
      //filterOptions.pageSize = "10";// reset limit which is inreased on load more click
      this.setState({ filterOptions });
      this.getCourseSearchData(filterOptions.searchText);
      window.scrollTo(0, 150);
   }

   // Function will le called on click of load more button
   handleLoadMore = () => {
      const { filterOptions, limit } = this.state;
      filterOptions.pageSize = Number(filterOptions.pageSize) + limit;
      this.setState({ filterOptions });
      this.getCourseSearchData(filterOptions.searchText);
   }

   handleSessionChange = (e, sessionType) => {
      const { filterOptions } = this.state;
      filterOptions[e.target.name] = sessionType;
      this.setState({ filterOptions });
   }

   handleSlider = (event, newValue) => {
      const { filterOptions } = this.state;
      filterOptions.price = newValue;
      this.setState({ filterOptions });
   }

   handleSliderCommitted = () => {
      const { filterOptions } = this.state;
      this.getCourseSearchData(filterOptions.searchText);
   }

   handleMinPriceChange = (event) =>{
      const re = /^[0-9\b]+$/;
      if(re.test(event.target.value)){
         const minprice =+event.target.value;
      const { filterOptions } = this.state;
      filterOptions.price[0] = minprice;
      // if(minprice > filterOptions.price[1]){
      //    filterOptions.price[0] = +event.target.value.slice(0, -1);
      //    this.setState({ filterOptions });
      //    return false;
      // }
      this.setState({ filterOptions });
      if(event.target.value !== ''){
         this.getCourseSearchData(filterOptions.searchText);
      }
      }
      
   }

   handleMaxPriceChange = (event) =>{
      const re = /^[0-9\b]+$/;
      if(re.test(event.target.value)){
      const maxprice =+event.target.value;
      const { filterOptions } = this.state;
      filterOptions.price[1] = maxprice;
      // if(maxprice < filterOptions.price[0]){
      //    filterOptions.price[1] = +event.target.value.slice(0, -1);
      //    this.setState({ filterOptions });
      //    return false;
      // }
      this.setState({ filterOptions });
      if(event.target.value !== ''){
         this.getCourseSearchData(filterOptions.searchText);
      }
   }
   }

   handleStartDateChange = date => {
      console.log(moment().toString() );
      
      const { filterOptions } = this.state;
      if (!date || date.toString() == "Invalid Date"|| moment(date) < moment()){
         const newFilterOptions = Object.assign({}, {
            ...filterOptions, 
            startDate : moment().toString(),
            endDate : moment().add(2, 'months').toString()
         })
         this.setState({ filterOptions : newFilterOptions });
      }else{
         filterOptions.startDate = date.toString();
         filterOptions.endDate = moment(date).add(2, 'months').toString();
         this.setState({ filterOptions });
         this.getCourseSearchData(filterOptions.searchText);
      }
      
      
   };

   handleEndDateChange = (date, value)  => {
      
      const { filterOptions } = this.state;
      if (!date || date.toString() == "Invalid Date" || moment(date) < moment()){
         const newFilterOptions = Object.assign({}, {
            ...filterOptions, 
            endDate : moment(filterOptions.startDate).add(2, 'months')
         })
         this.setState({ filterOptions : newFilterOptions });
      }else{
         filterOptions.endDate = date;
         this.setState({ filterOptions });
         this.getCourseSearchData(filterOptions.searchText);
      }
      
   };

   handleApplyFilter = () => {
      const { searchText } = this.state.filterOptions;
      this.getCourseSearchData(searchText);
   }

   handleSessionType = (sessionType) => {
      const { filterOptions } = this.state;
      filterOptions.sessionType = sessionType;
      this.setState({ filterOptions });
      this.getCourseSearchData(filterOptions.searchText);
   }

   //Reset of filters to default values

   handleResetFilter = async () => {
      this.props.actions.resetSearchText('');
      let { filterOptions } = { ...this.state }
      let { availableTags, selectedTags } = this.state;
      filterOptions = {
         searchText: null,//done
         searchType: "Series & Session",
         sessionType: "Upcoming Session",
         categoryId: 0,//done
         minDate: moment().toString(),
         startDate: moment().toString(),//done
         endDate: moment().add(2, 'months').toString(),
         minPrice: 0,
         maxPrice: 10000,
         userid: null,
         pageNbr: 1,
         pageSize: "10",//done
         price: [0, 10000],
         countryId: -1
      };
      availableTags = [...availableTags, ...selectedTags]
      selectedTags = [];
      await this.setState({ filterOptions: filterOptions, availableTags, selectedTags, sortBy: '' });
      this.getCourseSearchData(filterOptions.searchText);
   }

   onKeyDown = (event) => {
      // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
      if (event.key === 'Enter') {
         this.getCourseSearchData(this.state.filterOptions.searchText);
      }
   }

   // Handling of tags input
   handleTagSelect = (opt, { action, removedValue }) => {
      let { selectedTags } = this.state;
      switch (action) {
         case 'select-option': {
            selectedTags.push(opt[opt.length - 1].value);
            break;
         }
         case 'remove-value':
            {
               selectedTags = selectedTags.filter(item => item !== removedValue.value)
               break;
            }
      }
      this.setState({ selectedTags }, () => this.getCourseSearchData(this.state.filterOptions.searchText));
   }

   ///Redirection  to detail pages
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
   showHideFilter = () => {
      let { showFilter } = this.state;
      this.setState({ showFilter: !showFilter });
   }

   render() {
      const { courseSearchData, sessionCategories, loading, dataMode, dataModeValue, filterOptions, coutriesOption, pageItemCount, availableTags, selectedTags, sortBy, showFilter, fetchedRowsCount, userTimezone, isRequestDone } = this.state;
      let categories = [];
      categories.push({ value: 0, label: 'All Categories' });
      sessionCategories.map((item) => {
         categories.push({ value: item.SessionCategoryId, label: item.SessionCategoryName });
      });

      let tagOptions = [];
      if (availableTags !== null) {
         availableTags.map((item) => {
            tagOptions.push({ value: item.interest, label: item.interest });
         });
      }

      let sortByOptions = [
         { value: 'asc', label: 'New' },
         { value: 'des', label: 'Old' },
         { value: 'lh', label: 'Price Low-High' },
         { value: 'hl', label: 'Price High-Low' },
         { value: 'rating', label: 'Rating' },
         { value: 'ratingCount', label: '# of Ratings' }
      ];

      let pageSizeOptions = [
         { value: '10', label: '10 records per page' },
         { value: '20', label: '20 records per page' },
         { value: '30', label: '30 records per page' },
         { value: '40', label: '40 records per page' }
      ]

      let typeOptions = [
         { value: 'Series & Session', label: 'Series & Sessions' },
         { value: 'Session', label: 'Sessions' },
         { value: 'Series', label: 'Series' }
      ]
      return (
         <Fragment>
            <section className="mainContent">
               <div className="container">
                  <div className="row">
                     <div className="col-sm-12">
                        <div className="breadcrumbSection">
                           <ul>
                              <li>Home <i className="fa fa-angle-right"></i></li>
                              <li><a>Series/Sessions List</a></li>
                           </ul>
                           <div className="searchBox">
                              <input className="form-control" type="text"
                                 value={filterOptions.searchText === null ? '' : filterOptions.searchText}
                                 onKeyDown={this.onKeyDown}
                                 onChange={this.handleTextChange}
                                 name='searchText'
                                 placeholder="Search Series/Session Name" />
                              <div className="icon"><i className="fa fa-search" onClick={() => this.getCourseSearchData(filterOptions.searchText)}></i></div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="row">
                     <div className="col-md-3">
                        <div className="searchFilters">
                           <div className="d-md-none d-sm-flex d-flex justify-content-between">
                              <button className="btn btn-blue rsFilterBtn" onClick={this.showHideFilter}><i className="fa fa-sliders" aria-hidden="true" ></i> Filter</button>
                              <div className="filterReset">
                                 <Button onClick={this.handleResetFilter} variant="outlined" color="primary">Reset Filter</Button>
                              </div>
                           </div>
                           <div className={`filterControls ${showFilter ? 'show' : 'hidden'}`}>
                              <div className="filterControls">
                                 <div className="filterTitle">
                                    <h3>Filters</h3>
                                 </div>
                              </div>

                              <div className="filterControls action d-none d-md-block">
                                 <div className="filterCategory">
                                    <div className="filterAction">
                                       <div className="filterBtn">
                                          <Button variant="contained" onClick={this.handleApplyFilter} color="primary">Filter</Button>
                                       </div>
                                       <div className="filterReset">
                                          <Button onClick={this.handleResetFilter} variant="outlined" color="primary">Reset Filter</Button>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                              <div className="filterControls">
                                 <div className="filterTitle">
                                    <h3>Type</h3>
                                 </div>
                                 <div className="filterCategory">
                                    <Select
                                       name="searchType"
                                       value={typeOptions.filter(obj => obj.value === filterOptions.searchType)}
                                       onChange={this.handleSelectChange}
                                       options={typeOptions}
                                    />
                                 </div>
                              </div>
                              <div className="filterControls">
                                 <div className="filterTitle">
                                    <h3>Category</h3>
                                 </div>
                                 <div className="filterCategory">
                                    <Select
                                       name="categoryId"
                                       placeholder='Category...'
                                       value={categories.filter(obj => obj.value === filterOptions.categoryId)}
                                       onChange={this.handleSelectChange}
                                       options={categories}
                                    />
                                 </div>
                              </div>
                              <div className="filterControls">
                                 <div className="filterTitle">
                                    <h3>Date</h3>
                                 </div>
                                 <div className="filterDate">
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                       <KeyboardDatePicker
                                          allowKeyboardControl={false}
                                          autoOk
                                          disableToolbar
                                          disablePast={true}
                                          inputVariant="outlined"
                                          variant="inline"
                                          format="MM-dd-yyyy"
                                          margin="normal"
                                          label="Please select a future date"
                                          name="startDate"
                                          minDate={moment().toString()}
                                          value={filterOptions.startDate}
                                          onChange={this.handleStartDateChange}
                                          KeyboardButtonProps={{
                                             'aria-label': 'change date',
                                          }}
                                       />
                                       <KeyboardDatePicker
                                          autoOk
                                          disableToolbar
                                          inputVariant="outlined"
                                          variant="inline"
                                          format="MM-dd-yyyy"
                                          margin="normal"
                                          label="End Date"
                                          name="endDate"
                                          minDate={filterOptions.startDate}
                                          value={filterOptions.endDate}
                                          onChange={this.handleEndDateChange}
                                          KeyboardButtonProps={{
                                             'aria-label': 'change date',
                                          }}
                                       />
                                    </MuiPickersUtilsProvider>
                                 </div>
                              </div>
                              <div className="filterControls">
                                 <div className="filterTitle">
                                    <h3>Tags</h3>
                                 </div>
                                 <div className="filterTags">
                                    <Select
                                       name="selectedWeekDays"
                                       isMulti
                                       closeMenuOnSelect={false}
                                       isClearable={false}
                                       value={selectedTags.map((item) => {
                                          return tagOptions.filter(obj => obj.value === item)[0]
                                       })}
                                       onChange={this.handleTagSelect}
                                       options={tagOptions}
                                    />

                                 </div>
                              </div>
                              <div className="filterControls">
                                 <div className="filterTitle">
                                    <h3>Tutor Country</h3>
                                 </div>
                                 <div className="filterTags">
                                    <Select
                                       name="countryId"
                                       placeholder=''
                                       value={coutriesOption.filter(obj => obj.value === filterOptions.countryId)}
                                       onChange={this.handleSelectChange}
                                       options={coutriesOption}
                                    />
                                 </div>
                              </div>
                              <div className="filterControls">
                                 <div className="filterTitle">
                                    <h3>All</h3>
                                 </div>
                                 <div className="filterSessions">
                                    <ul>
                                       <li><a onClick={() => this.handleSessionType('Upcoming Session')}
                                          className={filterOptions.sessionType === 'Upcoming Session' ? 'active' : ''}>
                                          <i className="fa fa-angle-double-right"></i>Upcoming Sessions</a></li>
                                       <li><a onClick={() => this.handleSessionType('Trending Sessions')}
                                          className={filterOptions.sessionType === 'Trending Sessions' ? 'active' : ''}>
                                          <i className="fa fa-angle-double-right"></i>Trending Sessions</a></li>
                                       <li><a onClick={() => this.handleSessionType('Featured Sessions')}
                                          className={filterOptions.sessionType === 'Featured Sessions' ? 'active' : ''}>
                                          <i className="fa fa-angle-double-right"></i>Featured Sessions</a></li>
                                       <li><a onClick={() => this.handleSessionType('Recently Added Sessions')}
                                          className={filterOptions.sessionType === 'Recently Added Sessions' ? 'active' : ''}>
                                          <i className="fa fa-angle-double-right"></i> Recently Added Sessions</a></li>
                                       <li><a onClick={() => this.handleSessionType('Featured Teachers')}
                                          className={filterOptions.sessionType === 'Featured Teachers' ? 'active' : ''}>
                                          <i className="fa fa-angle-double-right"></i>Featured Teachers</a></li>
                                       <li><a onClick={() => this.handleSessionType('Most Popular Sessions')}
                                          className={filterOptions.sessionType === 'Most Popular Sessions' ? 'active' : ''}>
                                          <i className="fa fa-angle-double-right"></i>Most Popular Sessions</a></li>
                                    </ul>
                                 </div>
                              </div>
                              <div className="filterControls">
                                 <div className="filterTitle">
                                    <h3>Price</h3>
                                 </div>
                                 <div className="filterPrice">
                                    <label style={{ border: '0', color: '#1c3b50', fontWeight: 'bold' }}>$</label>
                                    <input type="text" id="amountMin"  onChange={this.handleMinPriceChange} value={filterOptions.price[0]} style={{ border: '0',width:'50px', color: '#1c3b50', fontWeight: 'bold' }} />
                                    <label style={{ border: '0', color: '#1c3b50', fontWeight: 'bold' }}>$</label>
                                    <input type="text" id="amountMax"  onChange={this.handleMaxPriceChange} value={filterOptions.price[1]} style={{ border: '0',width:'80px', color: '#1c3b50', fontWeight: 'bold' }}/>
                                     {/* <input type="text" id="amount"  value={`$${filterOptions.price[0]}`} style={{ border: '0', color: '#1c3b50', fontWeight: 'bold' }}/>
                                    <input type="text" id="amount" value={`$${filterOptions.price[1]}`} style={{ border: '0', color: '#1c3b50', fontWeight: 'bold' }} /> */}
                                    <Slider
                                       onChangeCommitted={this.handleSliderCommitted}
                                       onChange={this.handleSlider}
                                       value={filterOptions.price}
                                       min={0}
                                       max={10000}
                                       name='price'
                                       valueLabelDisplay="auto"
                                       aria-labelledby="range-slider"
                                    // getAriaValueText={valuetext}
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="col-md-9">
                        <div className="row">
                           <div className="col-sm-12">
                              <div className="gridLayout">
                                 <div className="row">
                                    <div className="col-md-6">
                                       <div className="sorting">
                                          <div className="sortBy">
                                             <Select
                                                value={sortByOptions.filter(obj => obj.value === sortBy)}
                                                onChange={this.handleSelectChange}
                                                name="sortBy"
                                                placeholder='Sort By...'
                                                options={sortByOptions}
                                             />
                                          </div>
                                          <div className="showResults">
                                             <Select
                                                onChange={this.handleSelectChange}
                                                value={pageSizeOptions.filter(obj => obj.value === `${filterOptions.pageSize}`)}
                                                name="pageSize"
                                                options={pageSizeOptions}
                                             />
                                          </div>
                                       </div>
                                    </div>
                                    <div className="col-md-6">
                                       <div className="listGrid">
                                          <div className="gridIcon">
                                             <BottomNavigation
                                                value={dataModeValue}
                                                onChange={(event, newValue) => this.changeMode(event, newValue)}
                                                showLabels
                                             >
                                                <BottomNavigationAction icon={<ViewComfyIcon />} />
                                                <BottomNavigationAction icon={<ListIcon />} />
                                             </BottomNavigation>
                                          </div>
                                          <div className="cousrePagination">

                                             {courseSearchData && courseSearchData[0] &&
                                                < Pagination count={Math.ceil((courseSearchData[0].MaxRows / filterOptions.pageSize))}
                                                   variant="outlined"
                                                   shape='rounded'
                                                   size="small"
                                                   page={filterOptions.pageNbr}
                                                   name="pageNbr"
                                                   onChange={this.handlePaginatorChange}
                                                   color="primary" />
                                             }
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="row">
                           {courseSearchData.length === 0 &&
                              <div className="col-sm-12">
                                 <div className="blankSpace">
                                    <img width="493" height="375" src={require('../../assets/images/undraw_empty.png')} alt="Not Found"></img>
                                    {(!loading && isRequestDone) &&
                                       <h3 className="blankSpaceMessage">No series/sessions found. Try again with different filters.</h3>
                                    }
                                    {(loading || !isRequestDone) &&
                                       <h3 className="blankSpaceMessage">Hold on, loading your series/sessions list.</h3>
                                    }
                                 </div>
                              </div>
                           }
                           {dataMode == "grid" && courseSearchData.map((data, index) => (
                              <div className="col-xl-4 col-lg-6 col-md-6 col-sm-6 pad-75" key={index}>
                                 <div className="thumbDiv">
                                    <div className="thumbImage"
                                       onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)}
                                       style={{ backgroundImage: `url(${APP_URLS.API_URL}${data.ImageFile})` }}></div>
                                    <div className="dateDescriptionSection">
                                       <div className="thumbDesc">
                                          <div className="row">
                                             <div className="col-lg-7 col-md-7 col-sm-12">
                                                <div className="thumbTitle">
                                                   <div className="profileIcon"><img
                                                      onClick={() => this.handleTutorDetails(data.TeacherId)}
                                                      src={`${APP_URLS.API_URL}${data.TeacherImageFile}`} alt={data.Name} width="40" height="40" /></div>
                                                   <h2 onClick={() => this.handleTutorDetails(data.TeacherId)}>{data.Name}</h2>
                                                </div>
                                             </div>
                                             <div className="col-lg-5 col-md-5 col-sm-12">
                                                <div className="starRating">
                                                   <Rating name="read-only" precision={0.5} size='small' value={data.Rating} readOnly />
                                                   <span>({data.RatingCount})</span>
                                                </div>
                                             </div>
                                          </div>
                                          <h4 onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)}>{data.Title}</h4>
                                          <span className="sessionType">
                                             {data.SeriesId === null && <span className='session'>(Session)</span>}
                                             {data.SeriesId != null && <span className='series'>(Series)</span>}
                                          </span>
                                          <p className="wordlimitBrowse" onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)}>{data.Description}</p>
                                       </div>
                                       {data.SeriesId != null && data.SeriesId > 0 && JSON.parse(data.SeriesDetail) &&
                                          <div className="dateTime searchPanelDateTime">
                                             <span className="date">
                                                <span ><FormatDateTime date={JSON.parse(data.SeriesDetail)[0].StartTime}
                                                   format="ddd"></FormatDateTime></span>
                                                <span className="duration"><FormatDateTime date={JSON.parse(data.SeriesDetail)[0].StartTime}
                                                   format="MMM DD, YYYY"></FormatDateTime></span>

                                             </span>
                                             <span className="time">
                                                <span><FormatDateTime date={JSON.parse(data.SeriesDetail)[0].StartTime}
                                                   format="h:mm A"></FormatDateTime> </span>
                                                {/* ({data.TimeZone}) */} ({userTimezone})
                                                <span className="duration">{JSON.parse(data.SeriesDetail)[0].SD[0].Duration}</span>
                                             </span>

                                          </div>
                                       }
                                       {data.SeriesId === null &&
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
                                       }
                                    </div>
                                    <div className="priceDiv">
                                       <span className="price">$ {data.Fee}</span>
                                       <span className="users" title="Spots Left"><i className="fa fa-users"></i>{data.TotalSeats  - data.OccupiedSeats}</span>
                                    </div>
                                    <div className="enrollNow" onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)}><a className="btn btn-blue">Enroll Now</a></div>
                                 </div>
                              </div>
                           )
                           )}
                           {dataMode === "list" && courseSearchData.map((data, index) => (
                              <div className="col-lg-12 col-md-12 col-sm-12 pad-75">
                                 <div className="thumbDivList">
                                    <div className="row">
                                       <div className="col-md-4">
                                          {data.SeriesId != null && data.SeriesId > 0 &&
                                             <div className="thumbImage"
                                                onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)}
                                                style={{ backgroundImage: `url(${APP_URLS.API_URL}${data.ImageFile})` }}>
                                                {JSON.parse(data.SeriesDetail) &&
                                                   <Fragment>
                                                      <div className="date">
                                                         <span >
                                                            <FormatDateTime
                                                               date={JSON.parse(data.SeriesDetail)[0].StartTime}
                                                               format="MMM DD, YYYY"></FormatDateTime>
                                                         </span>
                                                         <div className="divider"></div>
                                                         <span><FormatDateTime
                                                            date={JSON.parse(data.SeriesDetail)[0].StartTime}
                                                            format="ddd"></FormatDateTime>
                                                         </span>
                                                      </div>
                                                      <div className="time">
                                                         <span><FormatDateTime date={JSON.parse(data.SeriesDetail)[0].StartTime}
                                                            format="h:mm A"></FormatDateTime></span>
                                                         <div className="divider"></div>
                                                         {/* ({data.TimeZone}) */}
                                                         ({userTimezone}) <span>{JSON.parse(data.SeriesDetail)[0].SD[0].Duration}</span>
                                                      </div>
                                                   </Fragment>
                                                }
                                             </div>
                                          }
                                          {data.SeriesId === null &&
                                             <div className="thumbImage"
                                                onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)}
                                                style={{ backgroundImage: `url(${APP_URLS.API_URL}${data.ImageFile})` }}>
                                                <div className="date">
                                                   <span >
                                                      <FormatDateTime
                                                         date={data.StartTime}
                                                         format="MMM DD, YYYY"></FormatDateTime>
                                                   </span>
                                                   <div className="divider"></div>
                                                   <span><FormatDateTime
                                                      date={data.StartTime}
                                                      format="ddd"></FormatDateTime>
                                                   </span>
                                                </div>
                                                <div className="time">
                                                   <span><FormatDateTime date={data.StartTime}
                                                      format="h:mm A"></FormatDateTime> </span>
                                                   <div className="divider"></div>
                                                   {/* ({data.TimeZone}) */}
                                                   ({userTimezone}) <span>{data.Duration} </span>
                                                </div>
                                             </div>
                                          }
                                       </div>
                                       <div className="col-md-4">
                                          <div className="thumbDesc">
                                             <div className="thumbTitle">
                                                <div className="profileIcon">
                                                   <img
                                                      onClick={() => this.handleTutorDetails(data.TeacherId)}
                                                      src={`${APP_URLS.API_URL}${data.TeacherImageFile}`} alt={data.Name} width="40" height="40" />
                                                </div>
                                                <h2 onClick={() => this.handleTutorDetails(data.TeacherId)}>{data.Name}</h2>
                                             </div>
                                             <div>
                                                <h4 onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)}>{data.Title}</h4>
                                                <span className="sessionType">({data.SeriesId === null ? 'Session' : 'Series'})</span>
                                             </div>
                                          </div>

                                          <div className="priceDiv">
                                             <span className="price">$ {data.Fee}</span>
                                             <span className="users" title="Spots Left"><i className="fa fa-users"></i>{data.TotalSeats - data.OccupiedSeats}</span>
                                             <div className="starRating">
                                                <Rating name="read-only" precision={0.5} size='small' value={data.Rating} readOnly />
                                                <span>({data.RatingCount})</span>
                                             </div>
                                          </div>
                                          <button className="enrollNow" onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)}><a className="btn btn-blue">Enroll Now</a></button>
                                       </div>
                                       <div className="col-md-4">
                                          <h5>Description:</h5>
                                          <div onClick={() => this.handleViewDetails(data.SeriesId, data.SessionId)} className="searchPanelWordLimit" ><p>{data.Description}</p>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                        {courseSearchData && courseSearchData[0] &&
                           <div className="loadMore" >
                              < Pagination count={Math.ceil((courseSearchData[0].MaxRows / filterOptions.pageSize))}
                                 variant="outlined"
                                 className='bottomPaginator'
                                 shape='rounded'
                                 size="small"
                                 page={filterOptions.pageNbr}
                                 name="pageNbr"
                                 onChange={this.handlePaginatorChange}
                                 color="primary" />
                           </div>
                        }
                        {/* {courseSearchData.length > 0 && courseSearchData[0].MaxRows > fetchedRowsCount &&
                           <div className="loadMore" onClick={this.handleLoadMore}><button className="btn btn-grey">Load More</button></div>
                        } */}
                        <div className="row">
                           {courseSearchData === [] &&
                              <div className="col-sm-12">
                                 <div className="loadMore"><a className="btn btn-blue">Load Again</a></div>
                              </div>}
                        </div>
                     </div>
                  </div>
               </div >
            </section >
            {
               (loading && !isRequestDone) &&
               <div className="loaderDiv">
                  <div className="loader">
                     <Loader type="ball-clip-rotate-multiple" style={{ transform: 'scale(1.4)' }} />
                  </div>
               </div>
            }
         </Fragment >
      )
   }
}
const mapStateToProps = state => {
   return {
      auth: state.auth,
      userTimezone: state.timezone.userTimezone,
      headerSearch: state.common.search,
      performSearch: state.common.performSearch

   };
};
const mapDispatchToProps = dispatch => {
   return {
      actions: {
         showAlert: bindActionCreators(actions.showAlert, dispatch),
         resetSearchText: bindActionCreators(actions.resetSearchText, dispatch)

      }
   };
};
export default connect(mapStateToProps, mapDispatchToProps)(SearchPanel);
