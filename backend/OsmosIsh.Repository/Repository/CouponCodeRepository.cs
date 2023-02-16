using Dapper;
using Microsoft.Data.SqlClient;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.Repository
{
    public class CouponCodeRepository
    {
        public string GetTemplateFromHtml_CouponCode(string templateName, string email)
        {

            string template = string.Empty;
            string couponCodeTemplateName = string.Empty;
            string couponCodeName = string.Empty;
            switch (templateName)
            {
                case "Subscription.html":
                    couponCodeTemplateName = "Subscription_CouponCode.html";
                    couponCodeName = "Subscription";
                    break;
                case "TutorNoShowToStudent.html":
                    couponCodeTemplateName = "TutorNoShowToStudent_CouponCode.html";
                    couponCodeName = "NoShow";
                    break;
                case "DisputeResolveStudentNoRefund.html":
                    couponCodeTemplateName = "DisputeResolveStudentNoRefund_CouponCode.html";
                    couponCodeName = "DisputeTutorFavour";
                    break;
                case "DisputeResolveStudentRefund.html":
                    couponCodeTemplateName = "DisputeResolveStudentRefund_CouponCode.html";
                    couponCodeName = "DisputeStudentFavour";
                    break;
                case "CancelledSessionByTutor.html":
                    couponCodeTemplateName = "CancelledSessionByTutor_CouponCode.html";
                    couponCodeName = "CancellationByTutor";
                    break;
                case "SignupStudent.html":
                    couponCodeTemplateName = "SignupStudent_CouponCode.html";
                    couponCodeName = "WelcomeStudent";
                    break;
                case "SignupTutor.html":
                    couponCodeTemplateName = "SignupTutor_CouponCode.html";
                    couponCodeName = "WelcomeTutor";
                    break;
                case "CancelledRequestResolveStudentNoRefund.html":
                    couponCodeTemplateName = "CancelledRequestResolveStudentNoRefund_CouponCode.html";
                    couponCodeName = "SeriesCancellation";
                    break;
                case "FirstThousandTransaction_CouponCode.html":
                    couponCodeTemplateName = "FirstThousandTransaction_CouponCode.html";
                    couponCodeName = "FirstTransaction";
                    break;
                default:
                    break;
            }

            var couponCodeDetail = new CouponCodeResponse();
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("CouponCode", couponCodeName);
                var result = db.Query("sp_GetCouponCodeDetail", dynamicParameters, commandType: CommandType.StoredProcedure).FirstOrDefault();
                couponCodeDetail = CommonFunction.DeserializedDapperObject<CouponCodeResponse>(result);
            }

            if (couponCodeDetail != null)
            {
                template = CommonFunction.GetTemplateFromHtml(couponCodeTemplateName);
                var discount = couponCodeDetail.DiscountType == "percentage" ? couponCodeDetail.Discount.ToString() + "%" : "$" + couponCodeDetail.Discount.ToString();
                template = template.Replace("{Discount}", discount);
                template = template.Replace("{CouponCode}", couponCodeDetail.CouponCode);
                if (couponCodeDetail.ValidDays > 0)
                {
                    template = template.Replace("{ValidDays}", "This coupon is valid for the next " + couponCodeDetail.ValidDays.ToString() + " days.");
                }
                else
                {
                    template = template.Replace("{ValidDays}", "Use this coupon to avail discount.");
                }

                using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
                {
                    // Creating SP paramete list
                    var dynamicParameters = new DynamicParameters();
                    dynamicParameters.Add("CouponId", couponCodeDetail.CouponId);
                    dynamicParameters.Add("Email", email);

                    db.Execute("sp_InsertUpdateUserCouponLog", dynamicParameters, commandType: CommandType.StoredProcedure);
                }
            }
            else
            {
                template = CommonFunction.GetTemplateFromHtml(templateName);
            }

            return template;
        }

        public void InserUpdateUserCouponLog(int? userCouponLogId, int? couponId, string email)
        {

            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                // Creating SP paramete list
                var dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("UserCouponLogId", userCouponLogId);
                dynamicParameters.Add("CouponId", couponId);
                dynamicParameters.Add("Email", email);

                db.Execute("sp_InsertUpdateUserCouponLog", dynamicParameters, commandType: CommandType.StoredProcedure);
            }
        }
    }
}
