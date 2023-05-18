import React, { Component, Fragment } from "react";
import Select from "react-select";
import SimpleReactValidator from "simple-react-validator";
import { apiService } from "../../services/api.service";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import ChipInput from "material-ui-chip-input";
import DropdownDate from "react-dropdown-date";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { APP_URLS, PUBLIC_URL } from "../../config/api.config";
import Loader from "react-loaders";
import { localStorageService } from "../../services/localStorageService";
import TwilioVerification from "../../containers/common/Twilio";
import DeleteProfileModal from "../../containers/common/DeleteProfileModal";

// import { FilePond } from 'react-filepond';
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import { history } from "../../helpers/history";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/high-res.css";
registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);
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

class CreateStudent extends Component {
  constructor(props) {
    super(props);
    let { auth, match } = this.props;
    this.state = {
      studentProfileData: {
        studentId: auth.user.StudentId,
        image: "",
        isImageUpdated: false,
        firstName: "",
        lastName: "",
        countryId: "",
        phoneNumber: "",
        phoneCode: "",
        dateofbirth: "",
        education: [],
        description: "",
        languages: [],
        interest: [],
      },
      coutriesOption: [],
      countriesList: [],
      loading: false,
      showImage: false,
      showTwilio: false,
      verifiedPhoneNumber: "",
      showDeleteModal: false,
      IsLockOut: false,
      verifyPhoneMsg: "",
      showVerifyMsg: false,
      isValidNumber: true,
    };
    this.validator = new SimpleReactValidator();
  }
  componentDidMount = () => {
    this.getAllCountries();
  };

  //API calls------------------------------------------------------
  setLockStatus = (data) => {
    if (data != null) {
      this.setState({ IsLockOut: data?.IsLockOut });
    }
  };
  getStudentDetail = () => {
    this.setState({ loading: true });
    apiService
      .post("GETDATA", {
        data: { Studentid: this.state.studentProfileData.studentId },
        keyName: "GetStudentProfileDetail",
      })
      .then(
        (response) => {
          if (response.Success) {
            if (
              response.Data !== null &&
              Object.keys(response.Data).length > 0 &&
              response.Data.ResultDataList.length > 0
            ) {
              let studentDetail = response.Data.ResultDataList[0];
              const { studentProfileData } = this.state;
              const { coutriesOption } = this.state;
              let defaultCountry = coutriesOption.filter(
                (obj) => obj.label === "UNITED STATES"
              );
              this.setState({
                studentProfileData: {
                  ...studentProfileData,
                  studentId: studentDetail.StudentId,
                  image: studentDetail.ImageFile
                    ? APP_URLS.API_URL + studentDetail.ImageFile
                    : null,
                  firstName: studentDetail.FirstName,
                  lastName: studentDetail.LastName,
                  countryId:
                    studentDetail.CountryId > 0
                      ? studentDetail.CountryId
                      : defaultCountry[0].value,
                  phoneNumber: studentDetail.PhoneNumber,
                  phoneCode: studentDetail.PhoneCode,
                  dateofbirth:
                    studentDetail.DateOfBirth === null
                      ? ""
                      : studentDetail.DateOfBirth,
                  education: studentDetail.Education
                    ? studentDetail.Education.split(",")
                    : [],
                  description:
                    studentDetail.Description === null
                      ? ""
                      : studentDetail.Description,
                  languages: studentDetail.Languages
                    ? studentDetail.Languages.split(",")
                    : [],
                  interest: studentDetail.Interest
                    ? studentDetail.Interest.split(",")
                    : [],
                  phoneNumberVerified: studentDetail.PhoneNumberVerified,
                },
                showImage: studentDetail.ImageFile ? true : false,
                verifiedPhoneNumber:
                  studentDetail.PhoneNumberVerified === "Y"
                    ? studentDetail.PhoneNumber
                    : "",
              });
            }
          } else {
            this.props.actions.showAlert({
              message: response.Message,
              variant: "error",
            });
          }
          this.setState({ loading: false });
        },
        (error) =>
          this.setState((prevState) => {
            this.props.actions.showAlert({
              message: "Something went wrong...",
              variant: "error",
            });

            this.setState({ loading: false });
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
              this.getStudentDetail();
            } else {
              this.setState({ coutriesOption: [], countriesList: [] });
            }
          }
          this.setState({ loading: false });
        },
        (error) =>
          this.setState((prevState) => {
            this.props.actions.showAlert({
              message: "Something went wrong...",
              variant: "error",
            });
            this.setState({ loading: false });
          })
      );
  };
  // handler functions-----------------------

  handleCountryChange = (opt, meta) => {
    const { studentProfileData, countriesList } = this.state;
    studentProfileData[meta.name] = opt.value;
    this.setState({ studentProfileData });
    this.handleOnBlur(meta.name, studentProfileData[meta.name]);
  };

  handlePhoneNumber = (value, country, e, formattedValue) => {
    let selCountryFormatLength = country.format.length;
    let valueLength = formattedValue.length;

    if (valueLength != selCountryFormatLength) {
      this.setState({ isValidNumber: false });
    } else {
      this.setState({ isValidNumber: true });
    }
    const { studentProfileData, verifiedPhoneNumber } = this.state;
    if (verifiedPhoneNumber != formattedValue) {
      studentProfileData["phoneNumberVerified"] = "N";
    } else {
      studentProfileData["phoneNumberVerified"] = "Y";
    }
    studentProfileData["phoneNumber"] = formattedValue;
    this.setState({ studentProfileData });
    // this.handleOnBlur("phoneNumber", formattedValue);
  };

  phoneVerification = () => {
    if (!this.state.isValidNumber) {
      this.setState({
        showVerifyMsg: true,
        verifyPhoneMsg: "Please Enter valid Number",
      });
      this.startCountDown();
      return false;
    }
    this.setState({ loading: true });
    const { studentProfileData } = this.state;
    apiService
      .post("VERIFYPHONE", {
        userId: this.props.auth.user.UserId,
        phoneNumber: studentProfileData.phoneNumber,
      })
      .then(
        (response) => {
          if (response.Success) {
            this.setState({
              showVerifyMsg: true,
              verifyPhoneMsg: response.Message,
            });
          } else {
            this.setState({
              showVerifyMsg: true,
              verifyPhoneMsg: response.Message,
            });
          }
          this.setState({ loading: false });
          this.startCountDown();
        },
        (error) =>
          this.setState((prevState) => {
            this.props.actions.showAlert({
              message:
                error !== undefined
                  ? error
                  : "Something went wrong please try again !!",
              variant: "error",
            });
            this.setState({ loading: false });
          })
      );
  };

  startCountDown() {
    let countDown = 5; // 2 minutes in seconds

    const interval = setInterval(() => {
      if (--countDown < 0) {
        clearInterval(interval);
        this.setState({ showVerifyMsg: false, verifyPhoneMsg: "" });
      }
    }, 1000); // update the timer every second
  }
  handleChange = (e) => {
    const { studentProfileData } = this.state;
    studentProfileData[e.target.name] = e.target.value;
    this.setState({ studentProfileData });
  };

  handleOnBlur = (name, value) => {
    var formData = new FormData();
    const { studentProfileData } = this.state;
    studentProfileData[name] = value;
    this.setState({ studentProfileData });
    formData.append("Type", "STUDENT");
    formData.append("Id", this.props.auth.user.UserId);
    formData.append(
      "IsInterestOrDescription",
      ["description", "interest"].includes(name)
    );
    formData.append("FieldName", name);
    formData.append("Value", value);
    this.updateData(formData, false, "UPDATESTUDENTORTEACHERPROFILE");
  };
  addTags = (value, name) => {
    if (/^[a-zA-Z0-9 ]*[a-zA-Z ]+[a-zA-Z0-9 ]*$/.test(value)) {
      const { studentProfileData } = this.state;
      studentProfileData[name].push(
        value.charAt(0).toUpperCase() + value.slice(1)
      );
      this.setState({ studentProfileData });
      this.handleOnBlur(name, studentProfileData[name]);
    }
  };

  removeTags = (chip, index, name) => {
    const { studentProfileData } = this.state;
    studentProfileData[name].splice(index, 1);
    this.setState({ studentProfileData });
    this.handleOnBlur(name, studentProfileData[name]);
  };

  //Old Code
  // handleFileUpload = (fileItems) => {
  //   const { studentProfileData } = this.state;
  //   if (fileItems[0] && fileItems[0].fileType.search("image") > -1) {
  //     studentProfileData.image = fileItems.map((fileItem) => fileItem.file);
  //     studentProfileData.isImageUpdated = true;
  //     this.converFileToBase64(studentProfileData.image);
  //   } else {
  //     studentProfileData.image = [];
  //     studentProfileData.isImageUpdated = true;
  //   }
  //   this.setState({ studentProfileData });
  // };

  //New Code
  handleFileUpload = async (fileItems) => {
    const { studentProfileData } = this.state;
    if (fileItems[0] && fileItems[0].fileType.search("image") > -1) {
      const resizedImageBlob = await this.resizeImage(
        fileItems[0].file,
        250,
        250
      );
      studentProfileData.image = [
        new File([resizedImageBlob], "resized.jpg", { type: "image/jpeg" }),
      ];
      studentProfileData.isImageUpdated = true;
    } else {
      studentProfileData.image = [];
      studentProfileData.isImageUpdated = true;
    }
    this.setState({ studentProfileData });
  };

  resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          0.9
        );
      };
      img.src = URL.createObjectURL(file);
    });
  };

  converFileToBase64 = (file) => {
    let that = this;
    const { studentProfileData } = this.state;
    var reader = new FileReader();
    reader.onloadend = function () {
      studentProfileData.base64file = reader.result;
      that.setState({ studentProfileData });
      that.handleOnBlur("imagefile", reader.result);
    };
    reader.readAsDataURL(file[0]);
  };

  hadleDateChange = (date) => {
    const { studentProfileData } = this.state;
    studentProfileData["dateofbirth"] = formatDate(date);
    this.setState({ studentProfileData });
    this.handleOnBlur("dateofbirth", studentProfileData["dateofbirth"]);
  };

  handleDeSelect = (value) => {
    if (value === undefined || value === -1) {
      const { studentProfileData } = this.state;
      studentProfileData["dateofbirth"] = "";
      this.setState({ studentProfileData });
      this.handleOnBlur("dateofbirth", "");
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.validator.allValid() === false) {
      this.validator.showMessages();
      this.forceUpdate();
      this.props.actions.showAlert({
        message: "Please go back and review your profile.",
        variant: "error",
      });
      return false;
    }
    // const { studentProfileData } = this.state;
    // if (studentProfileData.phoneNumberVerified === "N") {
    //   this.props.actions.showAlert({
    //     message: "Please verify your phone number.",
    //     variant: "error",
    //   });
    //   return false;
    // }

    var formData = new FormData();
    Object.entries(this.state.studentProfileData).map(function ([key, val]) {
      if (key === "image" && val !== null) {
        formData.append(key, val[0]);
      } else if (
        key === "education" ||
        key === "interest" ||
        key === "languages"
      ) {
        formData.append(key, val.toString());
      } else if (key === "description") {
        formData.append(key, val !== null ? val : "");
      } else {
        formData.append(key, val);
      }
    });
    this.updateData(formData, true);
  };

  updateData = (
    dataToUpdate,
    isRedirect,
    endPoint = "UPDATESTUDENTPROFILE"
  ) => {
    this.setState({ loading: true });

    apiService.postFile(endPoint, dataToUpdate).then(
      (response) => {
        if (response.Success) {
          let data = response.Data;
          if (data) {
            this.validator = new SimpleReactValidator();
            localStorageService.updateAuthUser(
              data.FirstName,
              data.LastName,
              data.UserImage
            );
            this.props.actions.loginSuccess(
              localStorageService.getUserDetail()
            );
            this.props.actions.changeUserMode("student");
          }
          this.props.actions.showAlert({
            message: response.Message,
            variant: "success",
            open: false,
          });
          if (isRedirect) {
            history.push(`${PUBLIC_URL}/StudentDashboard`);
          } else {
            this.setState({ loading: false });
          }
        } else {
          this.props.actions.showAlert({
            message: response.Message,
            variant: "error",
          });
        }
        this.setState({ loading: false });
      },
      (error) =>
        this.setState((prevState) => {
          this.props.actions.showAlert({
            message:
              error !== undefined
                ? error
                : "Something went wrong please try again !!",
            variant: "error",
          });

          this.setState({ loading: false });
        })
    );
  };

  ChangeImage = () => {
    const { studentProfileData } = this.state;
    studentProfileData.image = [];
    studentProfileData.isImageUpdated = true;
    this.setState({ showImage: false, studentProfileData });
  };
  setVerificationStatus = (status) => {
    const { studentProfileData } = this.state;
    if (status) {
      this.setState({
        studentProfileData: { ...studentProfileData, phoneNumberVerified: "Y" },
        verifiedPhoneNumber: studentProfileData.phoneNumber,
      });
    } else {
      this.setState({
        studentProfileData: { ...studentProfileData, phoneNumberVerified: "N" },
        verifiedPhoneNumber: "",
      });
    }
  };
  showTwilioPopup = (status) => {
    this.setState({ showTwilio: status });
  };

  showDeletePopup = () => {
    const { showDeleteModal } = this.state;
    this.setState({ showDeleteModal: !showDeleteModal });
  };
  render() {
    const {
      studentProfileData,
      coutriesOption,
      loading,
      showTwilio,
      showDeleteModal,
      IsLockOut,
      isValidNumber,
      verifyPhoneMsg,
      showVerifyMsg,
    } = this.state;
    return (
      <Fragment>
        <section className="series-Session">
          <div className="container">
            <div className="row">
              <div className="col-lg-12  col-md-12 col-sm-12">
                <form onSubmit={this.handleSubmit}>
                  <div className="resetForm tutorProfile">
                    <h1 className="text-center">User Profile</h1>
                    <div className="grayWrapper">
                      <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12 text-center">
                          <div className="tpImage">
                            {this.state.showImage && (
                              <div
                                className="closeProfileImage"
                                onClick={this.ChangeImage}
                              >
                                {" "}
                                <img
                                  width=""
                                  height=""
                                  src={studentProfileData.image}
                                  alt="image"
                                />
                              </div>
                            )}
                            {!this.state.showImage && (
                              <FilePond
                                labelIdle='Drag & Drop Your
                                <span className="filepond--label-action">Picture or Browse.
                                1:1 ratio, 3MB max size</span>'
                                allowMultiple={false}
                                onupdatefiles={this.handleFileUpload}
                                acceptedFileTypes={["image/jpeg", "image/png"]}
                                stylePanelLayout="compact circle"
                                imagePreviewHeight="170"
                                imageCropAspectRatio="1:1"
                                imageResizeTargetWidth="200"
                                imageResizeTargetHeight="200"
                                styleLoadIndicatorPosition="center bottom"
                                styleButtonRemoveItemPosition="center bottom"
                                allowFileSizeValidation={true}
                                labelMaxFileSize="File types allowed: JPG,PNG"
                                labelMaxFileSizeExceeded="Maximum file size is 3MB."
                                maxFileSize="3MB"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-6  col-md-6 col-sm-12">
                          <div className="form-group padRight">
                            <label htmlFor="uname1">First Name</label>
                            <input
                              type="text"
                              className="form-control"
                              name="firstName"
                              maxLength={50}
                              onChange={this.handleChange}
                              value={studentProfileData.firstName}
                              onBlur={(e) => {
                                this.validator.showMessageFor("firstName");
                                this.handleOnBlur(
                                  e.target.name,
                                  e.target.value
                                );
                              }}
                            />
                            {this.validator.message(
                              "First Name",
                              studentProfileData.firstName,
                              "required"
                            )}
                          </div>
                        </div>
                        <div className="col-lg-6  col-md-6 col-sm-12">
                          <div className="form-group padleft">
                            <label htmlFor="uname1">Last Name</label>
                            <input
                              type="text"
                              className="form-control"
                              name="lastName"
                              maxLength={50}
                              onChange={this.handleChange}
                              value={studentProfileData.lastName}
                              onBlur={(e) => {
                                this.validator.showMessageFor("lastName");
                                this.handleOnBlur(
                                  e.target.name,
                                  e.target.value
                                );
                              }}
                            />
                            {this.validator.message(
                              "Last Name",
                              studentProfileData.lastName,
                              "required"
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-6  col-md-6 col-sm-12">
                          <div className="form-group padRight">
                            <label htmlFor="uname1">Country</label>
                            <Select
                              name="countryId"
                              value={coutriesOption.filter(
                                (obj) =>
                                  obj.value === studentProfileData.countryId
                              )}
                              onChange={this.handleCountryChange}
                              options={coutriesOption}
                              onBlur={(e) => {
                                this.validator.showMessageFor("country");
                              }}
                            />
                            {this.validator.message(
                              "country",
                              studentProfileData.countryId,
                              "required"
                            )}
                          </div>
                        </div>
                        <div className="col-lg-6  col-md-6 col-sm-12">
                          <div className="form-group padleft">
                            <label htmlFor="uname1">Phone</label>
                            <div className="phoneFieldCol">
                              {/* <span className="phoneCode">+{studentProfileData.phoneCode}</span> */}
                              {/* <input type="text" maxlength="10" className="form-control" name="phoneNumber"
                                                                onChange={this.handleChange}
                                                                value={studentProfileData.phoneNumber}
                                                                onBlur={() => this.validator.showMessageFor('phoneNumber')} /> */}

                              <PhoneInput
                                name="phoneNumber"
                                country="us"
                                className="form-control"
                                value={studentProfileData.phoneNumber}
                                onChange={(value, country, e, formattedValue) =>
                                  this.handlePhoneNumber(
                                    value,
                                    country,
                                    e,
                                    formattedValue
                                  )
                                }
                                isValid={() => isValidNumber}
                                onBlur={(e) => {
                                  this.validator.showMessageFor("phoneNumber");
                                  this.phoneVerification();
                                }}
                              />
                            </div>
                            {this.validator.message(
                              "phoneNumber",
                              studentProfileData.phoneNumber,
                              "required"
                            )}
                            {showVerifyMsg && <p>{verifyPhoneMsg}</p>}
                            {/* {(() => {
                              if (studentProfileData.phoneNumberVerified === "N") {
                                return <div>Phone number not verified.
                                  {(() => {
                                    if (IsLockOut) {
                                      return <label className="lockOutMsg"> Please Try Later</label>
                                    } else {
                                      return <label className="verifyPhoneNumberLink" onClick={() => this.showTwilioPopup(true)}><u>Click here to verify.</u></label>
                                    }
                                  })()
                                  }

                                </div>
                              }
                              else {
                                return <label>Phone number verified</label>
                              }
                            })()} */}
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-12">
                          <div className="form-group padRight">
                            <label htmlFor="uname1">Birthday</label>
                            <DropdownDate
                              className="birthDayDate"
                              order={
                                // optional
                                ["month", "day", "year"] // Order of the dropdowns
                              }
                              onDateChange={this.hadleDateChange}
                              defaultValues={
                                // optional
                                {
                                  month: "Select Month",
                                  day: "Select Day",
                                  year: "Select Year",
                                }
                              }
                              onMonthChange={this.handleDeSelect}
                              onDayChange={this.handleDeSelect}
                              onYearChange={this.handleDeSelect}
                              selectedDate={
                                studentProfileData.dateofbirth // 'yyyy-mm-dd' format only
                              }
                            />
                            {this.validator.message(
                              "birthday",
                              studentProfileData.dateofbirth,
                              "required"
                            )}
                          </div>
                        </div>
                        <div className="col-lg-6  col-md-6 col-sm-12">
                          <div className="form-group padleft">
                            <label htmlFor="uname1">Education</label>
                            <div className="form-control commonInputField">
                              <ChipInput
                                value={studentProfileData.education}
                                onAdd={(chip) =>
                                  this.addTags(chip, "education")
                                }
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
                      </div>

                      <div className="row">
                        <div className="col-lg-6  col-md-6 col-sm-12">
                          <div className="form-group padRight">
                            <label htmlFor="uname1">Languages</label>
                            <div className="form-control commonInputField">
                              <ChipInput
                                value={studentProfileData.languages}
                                onAdd={(chip) =>
                                  this.addTags(chip, "languages")
                                }
                                onDelete={(chip, index) =>
                                  this.removeTags(chip, index, "languages")
                                }
                                variant="outlined"
                                allowDuplicates={false}
                                newChipKeyCodes={[9, 13, 187, 188]}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-12">
                          <div className="form-group padleft">
                            <label htmlFor="uname1">Interests</label>
                            <div className="form-control commonInputField">
                              <ChipInput
                                value={studentProfileData.interest}
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
                        <div className="col-lg-12 col-md-12 col-sm-12 ">
                          <div className="form-group">
                            <label htmlFor="uname1">About Yourself</label>
                            <textarea
                              className="form-control"
                              value={studentProfileData.description}
                              name="description"
                              onChange={this.handleChange}
                              onBlur={(e) => {
                                this.handleOnBlur(
                                  e.target.name,
                                  e.target.value
                                );
                              }}
                              placeholder="Description"
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12 text-center mt-3">
                          <button
                            className="btn btn-blue"
                            type="button"
                            onClick={() => history.goBack()}
                          >
                            Back
                          </button>
                          <button
                            type="submit"
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
                </form>
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
        <TwilioVerification
          showTwilioPoup={showTwilio}
          VerificationNumber={studentProfileData.phoneNumber}
          onVerified={this.setVerificationStatus}
          onLockStatus={this.setLockStatus}
          onTwilioClose={this.showTwilioPopup}
        >
          {" "}
        </TwilioVerification>
        <DeleteProfileModal
          showModal={showDeleteModal}
          onDeleteProfileModalClose={this.showDeletePopup}
          studentId={studentProfileData.studentId}
        ></DeleteProfileModal>
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
export default connect(mapStateToProps, mapDispatchToProps)(CreateStudent);
