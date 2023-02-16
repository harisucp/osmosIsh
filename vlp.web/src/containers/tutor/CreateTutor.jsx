import React, { Component, Fragment } from "react";
import AvailableTimes from "react-available-times";
import Select from "react-select";
import SimpleReactValidator from "simple-react-validator";
import { apiService } from "../../services/api.service";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import Loader from "react-loaders";
import ChipInput from "material-ui-chip-input";
import DropdownDate from "react-dropdown-date";
import TwilioVerification from "../../containers/common/Twilio";
import Button from '@material-ui/core/Button';
import DeleteProfileModal from "../../containers/common/DeleteProfileModal";

// File Pond
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImageCrop from "filepond-plugin-image-crop";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { APP_URLS, PUBLIC_URL } from "../../config/api.config";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import { commonFunctions } from "../../shared/components/functional/commonfunctions";
import { history } from "../../helpers/history";
import { InputGroup } from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import { localStorageService } from "../../services/localStorageService";
import "react-phone-input-2/lib/high-res.css";
registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginImageCrop
);
const formatDate = (date) => {
  // formats a JS date to 'yyyy-mm-dd'
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

class CreateTutor extends Component {
  constructor(props) {
    super(props);
    let { auth, match } = this.props;

    this.state = {
      tutorProfileData: {
        teacherId: this.props.auth.user.TeacherId,
        image: "",
        isImageUpdated: false,
        firstName: "",
        lastName: "",
        countryId: "",
        dateofbirth: "",
        education: [],
        phoneNumber: "",
        awards: [],
        specialization: [],
        instaProfile: "",
        linkedinProfile: "",
        description: "",
        interest: [],
        languages: [],
        privateSession: "Y",
        FeePerHours: "",
        paypalAccountType: "",
        paypalAccount: "",
        affiliateCode: "",
        phoneNumberVerified: ""
      },
      showTwilio: false,
      coutriesOption: [],
      countriesList: [],
      loading: false,
      showImage: false,
      getDataInprogress: false,
      verifiedPhoneNumber: "",
      affiliateMessgae: "",
      affiliateStatus: "",
      isAffiliateAvailable: false,
      showDeleteModal: false
    };
    this.validator = new SimpleReactValidator({
      messages: {
        min: `The minimum hourly fee is $10.`,
      },
    });
  }

  getTutorDetail = () => {
    this.setState({ loading: true, getDataInprogress: true });
    apiService
      .post("GETDATA", {
        data: { teacherId: this.state.tutorProfileData.teacherId },
        keyName: "getTutorProfileDetail",
      })
      .then(
        (response) => {
          if (response.Success) {
            const { coutriesOption } = this.state;
            if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
              let tutorDetail = response.Data.ResultDataList[0];
              const { tutorProfileData } = this.state;
              let defaultCountry = coutriesOption.filter((obj) => obj.label === "UNITED STATES");
              this.setState({
                tutorProfileData: {
                  ...tutorProfileData,
                  teacherId: tutorDetail.TeacherId,
                  image: tutorDetail.ImageFile ? APP_URLS.API_URL + tutorDetail.ImageFile : null,
                  firstName: tutorDetail.FirstName,
                  lastName: tutorDetail.LastName,
                  countryId: tutorDetail.CountryId > 0 ? tutorDetail.CountryId : defaultCountry[0].value,
                  phoneNumber: tutorDetail.PhoneNumber,
                  phoneCode: tutorDetail.PhoneCode,
                  dateofbirth: tutorDetail.DateOfBirth === null ? "" : tutorDetail.DateOfBirth,
                  education: tutorDetail.Education ? tutorDetail.Education.split(",") : [],
                  instaProfile: tutorDetail.instaProfile || "",
                  linkedinProfile: tutorDetail.linkedinProfile || "",
                  description: tutorDetail.Description,
                  awards: tutorDetail.Awards ? tutorDetail.Awards.split(",") : [],
                  specialization: tutorDetail.Specialization ? tutorDetail.Specialization.split(",") : [],
                  privateSession: tutorDetail.PrivateSession,
                  FeePerHours: tutorDetail.FeePerHours === null && tutorDetail.FeePerHours === 0 ? "" : Number(tutorDetail.FeePerHours),
                  languages: tutorDetail.Languages ? tutorDetail.Languages.split(",") : [],
                  interest: tutorDetail.Interest ? tutorDetail.Interest.split(",") : [],
                  paypalAccountType: tutorDetail.PaypalAccountType,
                  paypalAccount: tutorDetail.PaypalAccount,
                  affiliateCode: tutorDetail.AffiliateCode === null || tutorDetail.AffiliateCode === "null" ? "" : tutorDetail.AffiliateCode,
                  phoneNumberVerified: tutorDetail.PhoneNumberVerified
                },
                isAffiliateAvailable: tutorDetail.AffiliateCode === null || tutorDetail.AffiliateCode === "null" ? false : true,
                verifiedPhoneNumber: tutorDetail.PhoneNumberVerified === "Y" ? tutorDetail.PhoneNumber : "",
                showImage: tutorDetail.ImageFile ? true : false
              });
              this.validator = new SimpleReactValidator({
                messages: {
                  min: `The minimum hourly fee is $10.`,
                },
              });
            }
          }else{
            this.props.actions.showAlert({ message: response.Message, variant: "error" });
          }
          this.setState({ loading: false, getDataInprogress: false });
        },
        (error) =>
          this.setState((prevState) => {
            this.props.actions.showAlert({ message: error !== undefined ? error : 'Something went wrong please try again !!', variant: "error" });
            this.setState({ loading: false, getDataInprogress: false });
          })
      );
  };

  getAllCountries = () => {
    this.setState({ loading: true });
    apiService
      .post("GETDATA", { data: { CountryId: -1 }, keyName: "GetAllCountries" })
      .then(
        (response) => {
          if (response.Success) {
            if (
              response.Data !== null &&
              Object.keys(response.Data).length > 0 &&
              response.Data.ResultDataList.length > 0
            ) {
              let coutriesOption = [];
              response.Data.ResultDataList.map((item) => {
                coutriesOption.push({
                  value: item.CountryId,
                  label: item.Name,
                });
              });
              this.setState({
                coutriesOption: coutriesOption,
                countriesList: response.Data.ResultDataList,
              });
              this.getTutorDetail();
            } else {
              this.setState({ coutriesOption: [], countriesList: [] });
            }
          }
          this.setState({ loading: false });
        },
        (error) =>
          this.setState((prevState) => {
            console.log(`Tag:${error}`);
            this.props.actions.showAlert({
              message: "Something went wrong...",
              variant: "error",
            });
            this.setState({ loading: false });
          })
      );
  };

  handleSelectChange = (opt, meta) => {
    const { tutorProfileData } = this.state;
    tutorProfileData[meta.name] = opt.value;
    if (meta.name === "paypalAccountType") {
      tutorProfileData["paypalAccount"] = "";
      // this.validator = new SimpleReactValidator();
    }
    this.setState({ tutorProfileData });
  };

  handleChange = (e) => {
    const { tutorProfileData } = this.state;
    if (e.target.name === "privateSession") {
      tutorProfileData[e.target.name] = e.target.checked ? "Y" : "N";
      if (!e.target.checked) {
        tutorProfileData["FeePerHours"] = "";
      }
      this.validator = new SimpleReactValidator({
        messages: {
          min: `The minimum hourly fee is $10.`,
        },
      });
    } else if (e.target.name === "FeePerHours") {
      tutorProfileData[e.target.name] =
        e.target.value !== "" ? Number(e.target.value) : "";
    }
    else if (e.target.name === "affiliateCode") {
      tutorProfileData[e.target.name] = e.target.value;
      this.setState({ affiliateMessgae: "", affiliateStatus: e.target.value === "" ? "" : false });
    }
    else {
      tutorProfileData[e.target.name] = e.target.value;
    }
    this.setState({ tutorProfileData });
  };

  handlePhoneNumber = (value, country, e, formattedValue, invokedBy) => {
    const { tutorProfileData, verifiedPhoneNumber } = this.state;
    tutorProfileData[invokedBy] = formattedValue;
    if (verifiedPhoneNumber != formattedValue) {
      tutorProfileData["phoneNumberVerified"] = "N";
    }
    else {
      tutorProfileData["phoneNumberVerified"] = "Y";
    }
    this.setState({ tutorProfileData });
  };

  addTags = (value, name) => {
    const { tutorProfileData } = this.state;
    tutorProfileData[name].push(value.charAt(0).toUpperCase() + value.slice(1));
    this.setState({ tutorProfileData });
  };
  removeTags = (chip, index, name) => {
    const { tutorProfileData } = this.state;
    tutorProfileData[name].splice(index, 1);
    this.setState({ tutorProfileData });
  };

  handleFileUpload = (fileItems) => {
    const { tutorProfileData } = this.state;
    if (fileItems[0] && fileItems[0].fileType.search("image") > -1) {
      tutorProfileData.image = fileItems.map((fileItem) => fileItem.file);
      tutorProfileData.isImageUpdated = true;
    } else {
      tutorProfileData.image = [];
      tutorProfileData.isImageUpdated = true;
    }
    this.setState({ tutorProfileData });
  };

  hadleDateChange = (date) => {
    const { tutorProfileData } = this.state;
    tutorProfileData["dateofbirth"] = formatDate(date);
    this.setState({ tutorProfileData });
  };

  handleDeSelect = (value) => {
    if (value === undefined || value === -1) {
      const { tutorProfileData } = this.state;
      tutorProfileData["dateofbirth"] = "";
      this.setState({ tutorProfileData });
    }
  };

  ChangeImage = () => {
    const { tutorProfileData } = this.state;
    tutorProfileData.image = [];
    tutorProfileData.isImageUpdated = true;
    this.setState({ showImage: false, tutorProfileData });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.validator.allValid() === false) {
      this.validator.showMessages();
      this.forceUpdate();
      this.props.actions.showAlert({ message: "Please go back and review your profile", variant: "error" });
      return false;
    }

    const { tutorProfileData, affiliateStatus } = this.state;
    if (tutorProfileData.phoneNumberVerified === "N") {
      this.props.actions.showAlert({ message: "Please verify your phone number.", variant: "error" });
      return false;
    }
    if (affiliateStatus === false) {
      this.props.actions.showAlert({ message: "Please verify your affiliate code or clear the entered affiliated code to continue.", variant: "error" });
      return false;
    }
    var formData = new FormData();
    Object.entries(tutorProfileData).map(function ([key, val]) {
      if (key === "image" && val !== null) {
        formData.append(key, val[0]);
      } else if (
        key === "education" ||
        key === "interest" ||
        key === "languages"
      ) {
        formData.append(key, val.toString());
      } else if (key === "description" || key === "instaProfile" || key === "linkedinProfile" ) {
        formData.append(key, val !== null ? val : "");
      } else {
        formData.append(key, val);
      }
    });
    this.setState({ loading: true });
    apiService.postFile("UPDATETEACHERPROFILE", formData).then(
      (response) => {
        if (response.Success) {
          let data = response.Data;
          localStorageService.updateAuthUser(
            data.FirstName,
            data.LastName,
            data.UserImage,
            "tutor"
          );
          this.props.actions.loginSuccess(localStorageService.getUserDetail());
          this.props.actions.changeUserMode("tutor");
          this.props.actions.showAlert({
            message: response.Message,
            variant: "success",
            open: false,
          });
          history.push(
            `${PUBLIC_URL}/TutorProfile/${this.state.tutorProfileData.teacherId}`
          );
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
  };

  // REsponse from twilio api
  setVerificationStatus = (status) => {

    const { tutorProfileData } = this.state;
    if (status) {
      this.setState({ tutorProfileData: { ...tutorProfileData, phoneNumberVerified: 'Y' }, verifiedPhoneNumber: tutorProfileData.phoneNumber });
    }
    else {
      this.setState({ tutorProfileData: { ...tutorProfileData, phoneNumberVerified: 'N' }, verifiedPhoneNumber: "" });
    }
  }

  componentDidMount = () => {
    this.getAllCountries();
  };

  showTwilioPopup = (status) => {
    this.setState({ showTwilio: status });
  }

  validateAffiliateCode = () => {
    this.setState({ loading: true });
    let { tutorProfileData } = this.state;
    apiService.post("VALIDATEAFFILIATE", {
      "affiliateCode": tutorProfileData.affiliateCode
    })
      .then(response => {
        if (response.Success) {
          this.setState({ affiliateStatus: true, affiliateMessgae: response.Message });
        }
        this.setState({ loading: false });
      },
        (error) =>
          this.setState((prevState) => {
            this.setState({ affiliateStatus: false, affiliateMessgae: error });
            this.setState({ loading: false });
          })
      )
  }

  showDeletePopup = () => {
    const { showDeleteModal } = this.state;
    this.setState({ showDeleteModal: !showDeleteModal });
  }
  render() {
    const { tutorProfileData, coutriesOption, loading, getDataInprogress, showTwilio, affiliateMessgae, affiliateStatus, isAffiliateAvailable,showDeleteModal } = this.state;
    const { auth } = this.props;

    let accountTypeOptions = [
      { value: "phoneNumber", label: "Phone Number" },
      { value: "email", label: "Email" },
    ];
    return (
      <Fragment>
        <section className="series-Session">
          <div className="container">
            <div className="row">
              <div className="col-lg-12  col-md-12 col-sm-12">
                <div className="resetForm tutorProfile">
                  <h1 className="text-center">Host Profile</h1>

                  <div className="grayWrapper">
                    <div className="row">
                      <div className="col-lg-12 col-md-12 col-sm-12 text-center">
                        <div className="tpImage">
                          {this.state.showImage && (
                            <div
                              className="closeProfileImage"
                              onClick={this.ChangeImage}
                            >
                              <img
                                src={tutorProfileData.image}
                                alt="image"
                                width="170"
                                height="170"
                              />
                            </div>
                          )}
                          {!this.state.showImage && (
                            <FilePond
                            labelIdle='Drag & Drop Your
                            <span className="filepond--label-action">Picture or Browse.
                            1:1 ratio, 5MB max size</span>'
                              allowMultiple={false}
                              onupdatefiles={this.handleFileUpload}
                              acceptedFileTypes={["image/jpeg", "image/png"]}
                              stylePanelLayout="compact circle"
                              imagePreviewHeight="200"
                              imageCropAspectRatio="1:1"
                              imageResizeTargetWidth="200"
                              imageResizeTargetHeight="200"
                              styleLoadIndicatorPosition="center bottom"
                              styleButtonRemoveItemPosition="center bottom"
                              allowImageResize={true}
                              allowFileSizeValidation={true}
                              labelMaxFileSize="File types allowed: JPG,PNG"
                              labelMaxFileSizeExceeded="Maximum file size is 5MB."
                              maxFileSize="5MB"
                              allowImageCrop={true}
                              imageResizeMode="contain"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label for="uname1">First Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="firstName"
                            onChange={this.handleChange}
                            value={tutorProfileData.firstName}
                            onBlur={() =>
                              this.validator.showMessageFor("firstName")
                            }
                          />
                          {this.validator.message(
                            "First Name",
                            tutorProfileData.firstName,
                            "required"
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padleft">
                          <label for="uname1">Last Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="lastName"
                            onChange={this.handleChange}
                            value={tutorProfileData.lastName}
                            onBlur={() =>
                              this.validator.showMessageFor("lastName")
                            }
                          />
                          {this.validator.message(
                            "Last Name",
                            tutorProfileData.lastName,
                            "required"
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label for="uname1">Country</label>
                          <Select
                            name="countryId"
                            value={coutriesOption.filter(
                              (obj) => obj.value === tutorProfileData.countryId
                            )}
                            onChange={this.handleSelectChange}
                            options={coutriesOption}
                            onBlur={() =>
                              this.validator.showMessageFor("country")
                            }
                          />
                          {this.validator.message(
                            "country",
                            tutorProfileData.countryId,
                            "required"
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padleft">
                          <label for="uname1">Phone</label>
                          <PhoneInput name="phoneNumber" country="us" className="form-control" value={tutorProfileData.phoneNumber} onChange={(value, country, e, formattedValue) => this.handlePhoneNumber(value, country, e, formattedValue, "phoneNumber")}
                            onBlur={() => this.validator.showMessageFor("phoneNumber")} />
                          {this.validator.message("phoneNumber", tutorProfileData.phoneNumber, "required")}
                          {(() => {
                            if (tutorProfileData.phoneNumberVerified === "N") {
                              return <div>Phone number not verified. <label className="verifyPhoneNumberLink" onClick={() => this.showTwilioPopup(true)}><u>Click here to verify.</u></label></div>
                            }
                            else {
                              return <label>Phone number verified</label>
                            }

                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6 col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label for="uname1">Birthday</label>
                          <DropdownDate
                            order={
                              // optional
                              ["month", "day", "year"] // Order of the dropdowns
                            }
                            onDateChange={this.hadleDateChange}
                            onMonthChange={this.handleDeSelect}
                            onDayChange={this.handleDeSelect}
                            onYearChange={this.handleDeSelect}
                            defaultValues={
                              // optional
                              {
                                month: "Select Month",
                                day: "Select Day",
                                year: "Select Year",
                              }
                            }
                            selectedDate={
                              tutorProfileData.dateofbirth // 'yyyy-mm-dd' format only
                            }
                          />
                          {this.validator.message(
                            "birthday",
                            tutorProfileData.dateofbirth,
                            "required"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padleft">
                          <label for="uname1">Languages</label>
                          <div className="form-control commonInputField">
                            <ChipInput
                              value={tutorProfileData.languages}
                              onAdd={(chip) => this.addTags(chip, "languages")}
                              onDelete={(chip, index) =>
                                this.removeTags(chip, index, "languages")
                              }
                              variant="outlined"
                              allowDuplicates={false}
                              newChipKeyCodes={[9, 13, 187, 188]}
                            />
                            {this.validator.message(
                              "Language",
                              tutorProfileData.languages,
                              "required"
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label for="uname1">Interests</label>
                          <div className="form-control commonInputField">
                            <ChipInput
                              value={tutorProfileData.interest}
                              onAdd={(chip) => this.addTags(chip, "interest")}
                              onDelete={(chip, index) =>
                                this.removeTags(chip, index, "interest")
                              }
                              variant="outlined"
                              allowDuplicates={false}
                              newChipKeyCodes={[9, 13, 187, 188]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6 col-md-6 col-sm-12 ">
                        <div className="form-group">
                          <label for="uname1">Linkedin Profile Address</label>
                          <input
                            className="form-control" value={tutorProfileData.linkedinProfile} name="linkedinProfile" onChange={this.handleChange}
                            placeholder="Linkedin Profile Address"
                          />
                          {/* {this.validator.message("Linkedin Profile Address", tutorProfileData.linkedinProfile, "required")} */}
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12 ">
                        <div className="form-group">
                          <label for="uname1">Instagram Profile Address</label>
                          <input
                            className="form-control" value={tutorProfileData.instaProfile} name="instaProfile" onChange={this.handleChange}
                            placeholder="Instagram Profile Address"
                          />
                          {/* {this.validator.message("Instagram Profile Address", tutorProfileData.instaProfile, "required")} */}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12 col-md-12 col-sm-12 ">
                        <div className="form-group">
                          <label for="uname1">About Yourself</label>
                          <textarea
                            className="form-control" value={tutorProfileData.description} name="description" onChange={this.handleChange}
                            placeholder="Description"
                          ></textarea>
                          {this.validator.message("description", tutorProfileData.description, "required")}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-12 col-md-12 col-sm-12 mt-4">
                        <label className="mainCaption" for="uname1">
                          Qualifications
                        </label>
                      </div>
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label for="uname1">Education</label>
                          <div className="form-control commonInputField">
                            <ChipInput
                              value={tutorProfileData.education}
                              onAdd={(chip) => this.addTags(chip, "education")}
                              onDelete={(chip, index) =>
                                this.removeTags(chip, index, "education")
                              }
                              variant="outlined"
                              allowDuplicates={false}
                              newChipKeyCodes={[9, 13, 187, 188]}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padleft">
                          <label for="uname1">Awards</label>
                          <div className="form-control commonInputField">
                            <ChipInput
                              value={tutorProfileData.awards}
                              onAdd={(chip) => this.addTags(chip, "awards")}
                              onDelete={(chip, index) =>
                                this.removeTags(chip, index, "awards")
                              }
                              variant="outlined"
                              allowDuplicates={false}
                              newChipKeyCodes={[9, 13, 187, 188]}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label for="uname1">Specialization</label>
                          <div className="form-control commonInputField">
                            <ChipInput
                              value={tutorProfileData.specialization}
                              onAdd={(chip) =>
                                this.addTags(chip, "specialization")
                              }
                              onDelete={(chip, index) =>
                                this.removeTags(chip, index, "specialization")
                              }
                              variant="outlined"
                              allowDuplicates={false}
                              newChipKeyCodes={[9, 13, 187, 188]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-12 col-md-12 col-sm-12 mt-4">
                        <label className="mainCaption" for="uname1">
                          Paypal Information
                        </label>
                      </div>
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padRight">
                          <label for="uname1" className="lightColor">
                            Account Information
                          </label>
                          <Select
                            name="paypalAccountType"
                            value={accountTypeOptions.filter(
                              (obj) =>
                                obj.value === tutorProfileData.paypalAccountType
                            )}
                            onChange={this.handleSelectChange}
                            options={accountTypeOptions}
                            onBlur={() =>
                              this.validator.showMessageFor("country")
                            }
                          />
                          {this.validator.message(
                            "Account Type",
                            tutorProfileData.paypalAccountType,
                            "required"
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padleft">
                          {tutorProfileData.paypalAccountType ===
                            "phoneNumber" && (
                              <Fragment>
                                <label for="uname1" className="lightColor">
                                  Account Detail
                              </label>
                                <PhoneInput
                                  name="paypalAccount"
                                  country="us"
                                  className="form-control"
                                  value={tutorProfileData.paypalAccount}
                                  onChange={(value, country, e, formattedValue) =>
                                    this.handlePhoneNumber(
                                      value,
                                      country,
                                      e,
                                      formattedValue,
                                      "paypalAccount"
                                    )
                                  }
                                  onBlur={() =>
                                    this.validator.showMessageFor("paypalAccount")
                                  }
                                />
                                {this.validator.message(
                                  "Paypal Account",
                                  tutorProfileData.paypalAccount,
                                  "required"
                                )}
                              </Fragment>
                            )}
                          {tutorProfileData.paypalAccountType === "email" && (
                            <Fragment>
                              <label for="uname1" className="lightColor">
                                Account Detail
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                name="paypalAccount"
                                onChange={this.handleChange}
                                value={tutorProfileData.paypalAccount}
                                onBlur={() =>
                                  this.validator.showMessageFor("paypalAccount")
                                }
                              />
                              {this.validator.message("Paypal Account", tutorProfileData.paypalAccount, "required|email")}
                            </Fragment>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-12 col-md-12 col-sm-12 mt-4">
                        <label className="mainCaption" for="uname1">
                          Affiliate Code
                        </label>
                      </div>
                      <div className="col-lg-6  col-md-6 col-sm-12">
                        <div className="form-group padleft">
                          <label for="uname1" className="lightColor">
                            If referred to Osmos-ish, enter the code you were given here
                          </label>
                          <div className="d-flex">
                            <div className="acField">
                              <input
                                type="text"
                                className="form-control"
                                name="affiliateCode"
                                onChange={this.handleChange}
                                value={tutorProfileData.affiliateCode}
                                onBlur={() =>
                                  this.validator.showMessageFor(
                                    "affiliateCode"
                                  )
                                }
                                disabled={isAffiliateAvailable}

                              />
                              {this.validator.message("Shared Referral Code", tutorProfileData.affiliateCode, "max:12")}

                            </div>
                            {tutorProfileData.affiliateCode !== "" && isAffiliateAvailable === false &&
                              <Button variant="contained" color="primary" onClick={this.validateAffiliateCode} className="ml-2">
                                Verify
                          </Button>
                            }
                          </div>
                          <label className={affiliateStatus === true ? "stausValid" : "stausInValid"}>{affiliateMessgae}</label>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-12 col-md-12 col-sm-12 text-center mt-3">
                        <button className="btn btn-blue" type="button" onClick={() => history.goBack()}>
                          Back
                        </button>
                        <button
                          type="submit"
                          onClick={this.handleSubmit}
                          className="btn btn-blue grey-button"
                        >
                          Save
                        </button>
                        <button
                            className="btn btn-blue grey-button"
                            type="button"
                            onClick={() => this.showDeletePopup()}
                          >
                            Delete Account
                          </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
          </div>
        </section>
        <TwilioVerification showTwilioPoup={showTwilio} VerificationNumber={tutorProfileData.phoneNumber} onVerified={this.setVerificationStatus} onTwilioClose={this.showTwilioPopup}> </TwilioVerification>
        <DeleteProfileModal showModal={showDeleteModal} onDeleteProfileModalClose={this.showDeletePopup} teacherId={tutorProfileData.teacherId}></DeleteProfileModal>
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
      loginSuccess: bindActionCreators(actions.loginSuccess, dispatch),
      changeUserMode: bindActionCreators(actions.changeUserMode, dispatch),
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(CreateTutor);
