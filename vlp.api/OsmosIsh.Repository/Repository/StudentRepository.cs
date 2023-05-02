using AutoMapper;
using Dapper;
using Microsoft.Data.SqlClient;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.Repository
{
    public class StudentRepository : BaseRepository<Students>, IStudentRepository
    {
        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        OsmosIshContext _ObjContext;
        MainResponse _MainResponse = null;
        private string SeriesImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Upload", "Students");

        public StudentRepository(OsmosIshContext ObjContext, IMapper Mapper) : base(ObjContext)
        {
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
            _Mapper = Mapper;
        }

        public async Task<MainResponse> UpdateStudentProfile(UpdateStudentProfileRequest updateStudentProfileRequest)
        {
            #region Student
            var studentDetail = _ObjContext.Students.Where(x => x.StudentId == updateStudentProfileRequest.StudentId).FirstOrDefault();
            if (studentDetail == null)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.STUDENT_NOT_EXISTS;
                return _MainResponse;
            }
            var userDetail = _ObjContext.Users.Where(x => x.UserId == studentDetail.UserId).FirstOrDefault();
            userDetail.FirstName = updateStudentProfileRequest.FirstName;
            userDetail.LastName = updateStudentProfileRequest.LastName;
            userDetail.Education = updateStudentProfileRequest.Education;
            userDetail.PhoneNumber = updateStudentProfileRequest.PhoneNumber;
            userDetail.Languages = updateStudentProfileRequest.Languages;
            userDetail.DateOfBirth = updateStudentProfileRequest.DateOfBirth;
            userDetail.CountryId = updateStudentProfileRequest.CountryId;


            userDetail.ModifiedBy = userDetail.Email;
            userDetail.ModifiedDate = DateTime.UtcNow;
            _ObjContext.Users.Update(userDetail);

            studentDetail.Interest = updateStudentProfileRequest.Interest;
            studentDetail.Description = updateStudentProfileRequest.Description;
            _ObjContext.Students.Update(studentDetail);
            #endregion

            #region Image
            int globalCodeImageTypeId = _ObjContext.GlobalCodes.Where(x => x.CodeName == FileTypes.USERIMAGE).Select(x => x.GlobalCodeId).FirstOrDefault();
            // Update Image Case
            if (updateStudentProfileRequest.IsImageUpdated)
            {
                var image = _ObjContext.Images.Where(x => x.ImageRefrenceId == studentDetail.UserId && x.ImageTypeId == globalCodeImageTypeId).FirstOrDefault();
                var imageStoredPath = string.Empty;
                if (image != null)
                {
                    if (updateStudentProfileRequest.Image != null)
                    {
                        imageStoredPath = CommonFunction.UploadImage(SeriesImagePath, FileTypes.USERIMAGE, updateStudentProfileRequest.Image);
                    }
                    else
                    {
                        imageStoredPath = null;
                    }
                    image.ModifiedBy = userDetail.Email;
                    image.ModifiedDate = DateTime.UtcNow;
                    image.ImageFile = imageStoredPath;
                    _ObjContext.Update(image);
                }
                else if (updateStudentProfileRequest.Image != null)
                {
                    image = new Images();
                    image.ImageFile = CommonFunction.UploadImage(SeriesImagePath, FileTypes.USERIMAGE, updateStudentProfileRequest.Image);
                    image.ImageTypeId = globalCodeImageTypeId;
                    image.ImageRefrenceId = studentDetail.UserId;
                    image.CreatedBy = userDetail.Email;
                    _ObjContext.Update(image);
                }

            }
            #endregion


            //_MainResponse.Message = await _ObjContext.SaveChangesAsync() > 0 ? SuccessMessage.STUDENT_SAVED : ErrorMessages.STUDENT_NOT_SAVED;

            if (await _ObjContext.SaveChangesAsync() > 0)
            {
                var updateUserDetail = new UpdateUserResponse();
                updateUserDetail.FirstName = updateStudentProfileRequest.FirstName;
                updateUserDetail.LastName = updateStudentProfileRequest.LastName;
                var image = _ObjContext.Images.Where(x => x.ImageRefrenceId == studentDetail.UserId && x.ImageTypeId == globalCodeImageTypeId).FirstOrDefault();
                updateUserDetail.UserImage = image != null && image.ImageFile != null ? image.ImageFile : "/Upload/default_user.png";
                _MainResponse.UpdateUserResponse = updateUserDetail;
                _MainResponse.Message = SuccessMessage.STUDENT_SAVED;
            }
            else
            {
                _MainResponse.Message = ErrorMessages.STUDENT_NOT_SAVED;
            }

            return _MainResponse;
        }

        private static string[] nullorundefined = { null, "null", "undefined" };

        /// <summary>
        /// This Procedure check's the null value and returns value too
        /// </summary>
        /// <param name="pvalue">Pass string value</param>
        /// <returns>String Value i.e if it's empty then value is null/undefined other wise return will gives you your desire value</returns>
        public static string checkString(string pvalue)
        {
            try
            {
                if (nullorundefined.Contains(pvalue))
                {
                    return "";
                }

                return (pvalue + "").Trim();
            }
            catch (Exception ex)
            {
                return "";
            }
        }

        public async Task<bool> SqlQueryCommandReturnBool(string qry, List<SqlParameter> param)
        {
            try
            {
                SqlConnection con = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString);
                await con.OpenAsync();

                SqlCommand cmd = new SqlCommand(qry, con);
                foreach (var item in param)
                {
                    cmd.Parameters.Add(item);
                }
               await cmd.ExecuteNonQueryAsync();
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        private async Task<bool> UpdateStudentTeacherInObject(UpdateStudentORTeacherRequest pupdateStudentORTeacherRequest, string pTableName) {
            try
            {
                List<SqlParameter> sparam = new List<SqlParameter>();
                sparam.Add(new SqlParameter("Value", checkString(pupdateStudentORTeacherRequest.Value)));
               
                string qry = $"UPDATE {pTableName} SET {checkString(pupdateStudentORTeacherRequest.FieldName)} = @Value WHERE UserId = {pupdateStudentORTeacherRequest.Id}";                
                return await SqlQueryCommandReturnBool(qry, sparam);
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<MainResponse> UpdateStudentORTeacherProfile(UpdateStudentORTeacherRequest updateStudentORTeacherRequest)
        {
            try
            {
                string getTypeValue = updateStudentORTeacherRequest.Type.Trim().ToUpper();
                string[] AllowedTypes = { "STUDENT", "TEACHER" };

                if (AllowedTypes.Contains(getTypeValue) == false)
                {
                    _MainResponse.Success = false;
                    _MainResponse.Message = "Invalid Type Data. Allowed Types (STUDENT, TEACHER) ";
                    return _MainResponse;
                }

                int swStudent = 0; int swTeacher = 0;
                if (getTypeValue.ToUpper() == "STUDENT")
                {
                    swStudent = 1;
                    swTeacher = 0;
                }
                if (getTypeValue.ToUpper() == "TEACHER")
                {
                    swStudent = 0;
                    swTeacher = 1;
                }


                var userdetails = _ObjContext.Users.FirstOrDefault(x => x.UserId == updateStudentORTeacherRequest.Id);
                if (userdetails == null)
                {
                    _MainResponse.Success = false;
                    _MainResponse.Message = ErrorMessages.RECORD_NOT_EXIST;
                    return _MainResponse;
                }

                //student, teacher
                bool isUpdated = false;
                string ParameterTableName = "";
                if (swStudent == 1 && userdetails.IsStudent.Trim() == "Y")
                {
                    var studentdetails = _ObjContext.Students.FirstOrDefault(x => x.UserId == updateStudentORTeacherRequest.Id);
                    if (studentdetails != null)
                    {
                        ParameterTableName = (updateStudentORTeacherRequest.IsInterestOrDescription == true? "Students" : "Users");
                        isUpdated = await UpdateStudentTeacherInObject(updateStudentORTeacherRequest, ParameterTableName);
                        
                    }
                }
                else
                {
                    if (swTeacher == 1 && userdetails.IsTutor.Trim() == "Y")
                    {
                        var objTeacher = _ObjContext.Teachers.FirstOrDefault(x => x.UserId == updateStudentORTeacherRequest.Id);
                        if (objTeacher != null)
                        {
                            if (updateStudentORTeacherRequest.IsPaypal) ParameterTableName = "Teachers";
                            else ParameterTableName = (updateStudentORTeacherRequest.IsInterestOrDescription == true ? "Teachers" : "Users");
                            isUpdated = await UpdateStudentTeacherInObject(updateStudentORTeacherRequest, ParameterTableName);
                        }
                    }
                }

                _MainResponse.Success = isUpdated;
                _MainResponse.Message = (isUpdated == true ? SuccessMessage.MESSAGE_STATUS_UPDATED : ErrorMessages.MESSAGE_STATUS_NOT_UPDATED);                
            }
            catch (Exception ex)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.STUDENT_NOT_SAVED;                
            }
            return _MainResponse;
        }

        public async Task<MainResponse> CreateStudent(CreateStudentRequest createStudentRequest)
        {
            var studentDetail = _ObjContext.Students.Where(x => x.UserId == createStudentRequest.UserId && x.RecordDeleted == "N").FirstOrDefault();
            if (studentDetail == null)
            {
                var Students = new Students()
                {
                    UserId = createStudentRequest.UserId
                };
                _ObjContext.Students.Add(Students);


                var userDetail = _ObjContext.Users.Where(x => x.UserId == createStudentRequest.UserId && x.RecordDeleted == "N").FirstOrDefault();
                userDetail.IsStudent = "Y";
                _ObjContext.Users.Update(userDetail);
                await _ObjContext.SaveChangesAsync();
                var studentResponse = new StudentResponse();
                studentResponse.StudentId = Students.StudentId;
                _MainResponse.StudentResponse = studentResponse;
                _MainResponse.Message = SuccessMessage.STUDENT_SAVED;
                _MainResponse.Success = true;
            }
            else
            {
                _MainResponse.Message = ErrorMessages.STUDENT_NOT_SAVED;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }
        public async Task<MainResponse> ValidateCouponCode(ValidateCouponRequest validateCouponRequest)
        {
            var promotionalCouponCode = (from C in _ObjContext.Coupons
                                         join G in _ObjContext.GlobalCodes on C.CouponType equals G.GlobalCodeId
                                         where C.BlockCoupon == "N"
                                         && C.StartDate <= validateCouponRequest.UserDate
                                         && (C.EndDate == null || C.EndDate >= validateCouponRequest.UserDate)
                                         && G.CodeName == "PromotionalCode"
                                         && C.CouponCode == validateCouponRequest.CouponCode
                                         select new
                                         {
                                             C.CouponId,
                                             C.EndDate,
                                             G.CodeName,
                                             C.ValidDays
                                         }).FirstOrDefault();

            if (promotionalCouponCode != null)
            {
                var userPromotionalCouponCode = _ObjContext.UserCouponLogs.Where(x => x.CouponId == promotionalCouponCode.CouponId && x.Email == validateCouponRequest.UserEmail).FirstOrDefault();
                if (userPromotionalCouponCode == null)
                {
                    var userCouponsLogs = new UserCouponLogs();
                    userCouponsLogs.CouponId = promotionalCouponCode.CouponId;
                    userCouponsLogs.CreatedDate = DateTime.UtcNow.Date;
                    var expirationDate = promotionalCouponCode.ValidDays == 0 ? Convert.ToDateTime("12-31-2099").Date : DateTime.UtcNow.AddDays(promotionalCouponCode.ValidDays).Date;
                    userCouponsLogs.ExpirationDate = expirationDate;
                    userCouponsLogs.Email = validateCouponRequest.UserEmail;
                    userCouponsLogs.Availed = "N";
                    _ObjContext.UserCouponLogs.Add(userCouponsLogs);
                    _ObjContext.SaveChanges();
                }
            }

            var couponCodeDetail = (from C in _ObjContext.Coupons
                                    join UC in _ObjContext.UserCouponLogs on C.CouponId equals UC.CouponId
                                    where C.CouponCode == validateCouponRequest.CouponCode && UC.Email == validateCouponRequest.UserEmail
                                    && C.BlockCoupon == "N" && UC.ExpirationDate >= validateCouponRequest.UserDate && UC.Availed == "N"
                                    orderby UC.ExpirationDate ascending
                                    select new CouponValidateResponse
                                    {
                                        UserCouponLogId = UC.UserCouponLogId,
                                        CouponId = C.CouponId,
                                        DiscountType = C.DiscountType,
                                        Discount = Convert.ToInt32(C.Discount),
                                        MaximumDiscount = C.MaximumDiscount,
                                        MinimumCartAmount = C.MinimumCartAmount
                                    }).FirstOrDefault();

            if (couponCodeDetail == null)
            {
                _MainResponse.Success = false;
                _MainResponse.Message = ErrorMessages.INVALID_COUPON;

            }
            else
            {
                if (couponCodeDetail.MinimumCartAmount > 0 && validateCouponRequest.TotalAmount < couponCodeDetail.MinimumCartAmount)
                {
                    _MainResponse.Success = false;

                    //_MainResponse.Message = "Minimum $" + couponCodeDetail.MinimumCartAmount + " total cart amount required to avail this coupon.";
                    _MainResponse.Message = "The promotional code you entered requires a minimum spend of $" + couponCodeDetail.MinimumCartAmount;

                    return _MainResponse;
                }

                var discountedDetial = await GetTotalAmountAfterDiscount(validateCouponRequest.StudentId, validateCouponRequest.Enrollments, couponCodeDetail.UserCouponLogId);
                couponCodeDetail.TotalDiscountedAmount = discountedDetial.TotalDiscountedAmount;
                couponCodeDetail.Discount = discountedDetial.TotalCalculatedDiscount;

                _MainResponse.CouponValidateResponse = couponCodeDetail;
                _MainResponse.Success = true;

                if (Math.Round((decimal)couponCodeDetail.Discount) >= couponCodeDetail.MaximumDiscount)
                {
                    _MainResponse.Message = "The promotional code you entered has been applied.The maximum discount of $" + couponCodeDetail.Discount.ToString() + " has been met.";
                }
                else
                {
                    _MainResponse.Message = SuccessMessage.VALID_COUPON;
                }
            }
            return _MainResponse;
        }


        private async Task<DiscountedDetial> GetTotalAmountAfterDiscount(int StudentId, string Enrollments, int UserCouponLogId)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@StudentId", StudentId);
                dynamicParameters.Add("@Enrollments", Enrollments);
                dynamicParameters.Add("@UserCouponLogId", UserCouponLogId);

                var result = await db.QueryAsync("sp_GetTotalAmountAfterDiscount", dynamicParameters, commandType: CommandType.StoredProcedure);

                var discountedDetial = CommonFunction.DeserializedDapperObject<DiscountedDetial>(result.FirstOrDefault());
                return discountedDetial;
            }
        }
    }
}
