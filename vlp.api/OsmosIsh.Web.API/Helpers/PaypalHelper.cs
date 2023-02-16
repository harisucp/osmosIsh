using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using PayPal.Api;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OsmosIsh.Web.API.Helpers
{
    public static class PaypalConfiguration
    {
        private readonly static string ClientId;

        private readonly static string ClientSecret;

        static PaypalConfiguration()
        {
            ClientId = AppSettingConfigurations.PaypalSettings.Settings.clientId;
            ClientSecret = AppSettingConfigurations.PaypalSettings.Settings.clientSecret;
        }

        public static APIContext GetAPIContext()
        {
            APIContext apiContext = new APIContext(GetAccessToken());
            apiContext.Config = GetConfig();
            return apiContext;
        }

        private static Dictionary<string, string> GetConfig()
        {
            return new Dictionary<string, string>()
                {
                    { "connectionTimeout", AppSettingConfigurations.PaypalSettings.Settings.connectionTimeout },
                    { "requestRetries", AppSettingConfigurations.PaypalSettings.Settings.requestRetries },
                    { "mode", AppSettingConfigurations.PaypalSettings.Settings.mode }
                };
        }

        private static string GetAccessToken()
        {
            string accessToken = new OAuthTokenCredential
            (ClientId, ClientSecret, GetConfig()).GetAccessToken();
            return accessToken;
        }
    }

    public static class PaypalHelper
    {
        public static Payment CreatePayment(List<Transaction> transactions, string intent, RedirectUrls redirectUrls)
        {
            var apiContext = PaypalConfiguration.GetAPIContext();

            Payment payment = new Payment
            {
                intent = intent,
                payer = new Payer { payment_method = "paypal" },
                transactions = transactions,
                redirect_urls = redirectUrls
            };

            var createdPayment = payment.Create(apiContext);
            return createdPayment;
        }

        public static Payment ExecutePayment(string paymentId, string payerId)
        {
            var apiContext = PaypalConfiguration.GetAPIContext();

            var paymentExecution = new PaymentExecution() { payer_id = payerId };
            var payment = new Payment() { id = paymentId };

            // Execute the payment.
            var executedPayment = payment.Execute(apiContext, paymentExecution);

            return executedPayment;
        }

        public static AuthorizedCapturedDetail CapturePayment(string paymentId, string payerId, Amount amount)
        {
            var apiContext = PaypalConfiguration.GetAPIContext();
            AuthorizedCapturedDetail authorizedCapturedDetail = new AuthorizedCapturedDetail();

            //var payment = Payment.Get(apiContext, paymentId);
            //var payment = Payment.Execute(apiContext, paymentId);

            var paymentExecution = new PaymentExecution() { payer_id = payerId };
            var payment = new Payment() { id = paymentId };
            // Execute authorization.
            var executedPayment = payment.Execute(apiContext, paymentExecution);// Execute the payment
            if (executedPayment.state.ToLower() == "approved")
            {
                var auth = executedPayment.transactions[0].related_resources[0].authorization;
                authorizedCapturedDetail.AuthorizationId = auth.id;
                authorizedCapturedDetail.PaymentMode = auth.payment_mode;
                authorizedCapturedDetail.ValidUntill = auth.valid_until;
                authorizedCapturedDetail.AuthorizationUpdateTime = Convert.ToDateTime(auth.update_time);
                authorizedCapturedDetail.AuthorizationCreateTime = Convert.ToDateTime(auth.create_time);
                // Specify an amount to capture.  By setting 'is_final_capture' to true, all remaining funds held by the authorization will be released from the funding instrument.
                var capture = new Capture()
                {
                    amount = amount,
                    is_final_capture = false
                };

                // Capture an authorized payment by POSTing to
                // URI v1/payments/authorization/{authorization_id}/capture
                var responseCapture = auth.Capture(apiContext, capture);
                authorizedCapturedDetail.CaptureId = responseCapture.id;
                authorizedCapturedDetail.IsFinalCapture = false;
                authorizedCapturedDetail.State = responseCapture.state;
                authorizedCapturedDetail.TransactionFee = responseCapture.transaction_fee.value;
                authorizedCapturedDetail.Amount = responseCapture.amount.total;
                authorizedCapturedDetail.CaptureUpdateTime = Convert.ToDateTime(responseCapture.update_time);
                authorizedCapturedDetail.CaptureCreateTime = Convert.ToDateTime(responseCapture.create_time);
                authorizedCapturedDetail.PaymentId = responseCapture.parent_payment;
                return authorizedCapturedDetail;

            }

            return null;

        }
    }
}


//// refrence URL : https://code.tutsplus.com/articles/paypal-integration-part-2-paypal-rest-api--cms-22917