using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Data.DBContext;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace OsmosIsh.Core.Shared.Static
{
    public class CommonFunction
    {
        /// <summary>
        /// This function is used to combine class name with namespace of data project.
        /// </summary>
        /// <param name="EntityName"></param>
        /// <returns></returns>
        public static string GetEntityPath(string EntityName)
        {
            return "OsmosIsh.Data.DBEntities." + EntityName;
        }

        /// <summary>
        /// This function is used to get type from different layer and try to access method of different layer.
        /// </summary>
        /// <param name="typeName"></param>
        /// <returns></returns>
        public static Type GetType(string typeName)
        {
            var type = Type.GetType(typeName);
            if (type != null) return type;
            foreach (var a in AppDomain.CurrentDomain.GetAssemblies())
            {
                type = a.GetType(typeName);
                if (type != null)
                    return type;
            }
            return null;
        }

        /// <summary>
        /// This function used to get primary column name of specific entity.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="entity"></param>
        /// <param name="ObjContext"></param>
        /// <returns></returns>
        public static int GetPrimaryKeyValue<T>(T entity, OsmosIshContext ObjContext)
        {
            var keyName = ObjContext.Model.FindEntityType(entity.GetType()).FindPrimaryKey().Properties.Select(x => x.Name).Single();

            return (int)entity.GetType().GetProperty(keyName).GetValue(entity, null);
        }

        /// <summary>
        /// This function is used to convert get sql parameters to object to key and value pair.
        /// </summary>
        /// <param name="Data"></param>
        /// <returns></returns>
        public static List<KeyValuePair<string, string>> GetSQLParameters(string Data)
        {
            var returnSQLParameter = new List<KeyValuePair<string, string>>();
            JObject jsonData = JObject.Parse(Data);
            foreach (var parameters in jsonData)
            {
                var paramName = parameters.Value.ToString();
                returnSQLParameter.Add(new KeyValuePair<string, string>(parameters.Key, paramName));
            }
            return returnSQLParameter;
        }

        /// <summary>
        /// Map object specific entity type.
        /// </summary>
        /// <param name="EntityPath"></param>
        /// <param name="dataList"></param>
        /// <returns></returns>
        public static dynamic MapWithSpecificEntityType(string EntityPath, dynamic dataList)
        {
            Type type = GetType(EntityPath);
            if (type != null)
            {
                var json = JsonConvert.SerializeObject(dataList, Formatting.None);
                var listType = typeof(List<>).MakeGenericType(type);
                var entity = JsonConvert.DeserializeObject(json, listType);
                return entity;
            }
            return null;
        }

        public static T DeserializedDapperObject<T>(dynamic data)
        {
            var json = JsonConvert.SerializeObject(data, Formatting.None);
            return JsonConvert.DeserializeObject<T>(json);
        }

        /// <summary>
        /// Get structure of particular entity type.
        /// </summary>
        /// <param name="EntityPath"></param>
        /// <returns></returns>
        public static object GetStructureType(string EntityPath)
        {
            Type type = GetType(EntityPath);
            if (type != null)
            {
                var propertyInfos = type.GetProperties();
                string structureSring = "{";
                foreach (var prop in propertyInfos)
                {
                    structureSring += '"' + prop.Name + '"' + " : " + '"' + prop.PropertyType.Name + "\",";
                }
                structureSring = structureSring.Remove(structureSring.Length - 1, 1);
                structureSring += "}";
                return (object)structureSring;
            }
            return null;
        }


        /// <summary>
        /// Get structure of particular entity type.
        /// </summary>
        /// <param name="EntityPath"></param>
        /// <returns></returns>
        public static object GetStructureTypeWithRequiredCheck(string EntityPath)
        {
            Type type = GetType(EntityPath);
            if (type != null)
            {
                var propertyInfos = type.GetProperties();
                string structureSring = "{";
                foreach (var prop in propertyInfos)
                {
                    string propertyName = prop.Name;
                    string IsRequired = "N";
                    string dataType = prop.PropertyType.Name;
                    if (prop.CustomAttributes.Count() > 0)
                    {
                        foreach (var namedArgument in prop.CustomAttributes.FirstOrDefault().NamedArguments)
                        {
                            if (namedArgument.TypedValue.ArgumentType.FullName == "Newtonsoft.Json.Required")
                            {
                                IsRequired = "Y";
                            }
                            else if (namedArgument.MemberName == "PropertyName" && namedArgument.TypedValue.Value.ToString() != "Id")
                            {
                                propertyName = namedArgument.TypedValue.Value.ToString();
                                dataType = "GC";
                            }
                        }
                    }

                    structureSring += '"' + propertyName + '"' + " : " + "{\"PropertyType\":\"" + dataType + "\",\"IsRequired\":\"" + IsRequired + "\"},";
                }
                structureSring = structureSring.Remove(structureSring.Length - 1, 1);
                structureSring += "}";
                return (object)structureSring;
            }
            return null;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="FilePath"></param>
        /// <returns></returns>
        public static string GetDataFromJsonFile(string fileName)
        {
            string filePath = Path.Combine(System.AppContext.BaseDirectory, fileName);
            var myJsonString = string.Empty;
            if (File.Exists(filePath))
            {
                myJsonString = File.ReadAllText(filePath);
            }
            return myJsonString;
        }

        /// <summary>
        /// This method will be used to encrypt string information
        /// </summary>
        /// <param name="password"></param>
        /// <returns></returns>
        public static string EncryptPassword(string Password)
        {
            UnicodeEncoding UnicodeEncodingEncoding = null;
            string Encrypted = "";
            UnicodeEncodingEncoding = new UnicodeEncoding();
            byte[] hashBytes = UnicodeEncodingEncoding.GetBytes(Password);

            // compute SHA-1 hash.
            SHA1 SHA1Object = new SHA1CryptoServiceProvider();
            byte[] cryptPassword = SHA1Object.ComputeHash(hashBytes);
            Encrypted = Convert.ToBase64String(hashBytes);

            return Encrypted;
        }

        /// <summary>
        /// Convert to object to string.
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static string ConvertObjectToString(Object obj)
        {
            var objString = string.Empty;
            if (obj.ToString().Contains("OsmosIsh"))
            {
                objString = JsonConvert.SerializeObject(obj);
            }
            else
            {
                objString = obj.ToString();
            }
            return objString;
        }

        /// <summary>
        /// This method is used to read all template data.
        /// </summary>
        /// <param name="templateName"></param>
        /// <param name="path"></param>
        /// <returns></returns>
        public static string GetTemplateFromHtml(string templateName, string path = "Templates")
        {
            var filePath = Path.Combine(System.AppContext.BaseDirectory, path, templateName);
            var myJsonString = string.Empty;
            if (File.Exists(filePath))
            {
                myJsonString = File.ReadAllText(filePath);
                myJsonString = ReplaceBaseUrl(myJsonString);
            }
            return myJsonString;
        }

        public static string ReplaceBaseUrl(string emailTemplate)
        {
            if (!string.IsNullOrEmpty(emailTemplate))
            {
                emailTemplate = emailTemplate.Replace("{BaseUrl}", AppSettingConfigurations.AppSettings.APIApplicationUrl + "/");
            }
            return emailTemplate;
        }


        public static string UploadImage(string folderPath, string fileName, IFormFile image)
        {
            string basePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

            string newFileName = "";
            var path = "";

            bool exists = System.IO.Directory.Exists(folderPath);
            // Check folder exists.
            if (!exists)
            {
                Directory.CreateDirectory(folderPath);
            }

            if (image.Length > 0)
            {
                // optimizing image here
                if (fileName.Contains("Image", StringComparison.OrdinalIgnoreCase))
                {
                    // changing image format to webp
                    newFileName = fileName + DateTime.UtcNow.ToString("_yyyy_MM_dd_hh_mm_ss") + ".webp";
                    path = Path.Combine(folderPath, newFileName);
                    Image optimizedImage = Image.FromStream(image.OpenReadStream(), true, true);
                    using (Bitmap newBitmap = new Bitmap(optimizedImage))
                    {
                        newBitmap.SetResolution(1, 1);
                        newBitmap.Save(path);
                    }
                }
                else
                {
                    newFileName = fileName + DateTime.UtcNow.ToString("_yyyy_MM_dd_hh_mm_ss") + Path.GetExtension(image.FileName);
                    path = Path.Combine(folderPath, newFileName);
                    image.CopyTo(new FileStream(path, FileMode.Create));
                }
            }
            path = path.Replace(basePath, "").Replace("\\", "/");
            return path;
        }

        public static List<DateTime> RecurrenceDays(DateTime startDate, int numberDaysRepeat, string SelectedWeekDays)
        {
            DateTime _StartDate = startDate;
            Dictionary<DateTime, string> days = new Dictionary<DateTime, string>();

            List<string> selectedWeekDaysArray = SelectedWeekDays.Split(',').ToList();


            decimal countWeeks = Convert.ToDecimal(numberDaysRepeat) / Convert.ToDecimal(selectedWeekDaysArray.Count);
            int calculateWeeks = Convert.ToInt32(Math.Ceiling(countWeeks));

            for (int i = 1; i <= calculateWeeks * 7; i++)
            {
                days.Add(_StartDate, _StartDate.DayOfWeek.ToString());
                _StartDate = _StartDate.AddDays(1);
            }

            var result = days.Where(x => selectedWeekDaysArray.Contains(x.Value)).ToDictionary(x => x.Key, x => x.Value);

            return result.Keys.Take(numberDaysRepeat).ToList();
        }

        public static List<DateTime> RecurrenceMonths(DateTime startDate, int numberDaysRepeat)
        {
            DateTime _StartDate = startDate;
            List<DateTime> recurranceDates = new List<DateTime>();
            recurranceDates.Add(_StartDate);
            for (int i = 1; i < numberDaysRepeat; i++)
            {
                _StartDate = _StartDate.AddMonths(1);
                recurranceDates.Add(_StartDate);
            }
            return recurranceDates.ToList();
        }

        public static List<DateTime> RecurrenceWeeks(DateTime startDate, int numberDaysRepeat)
        {
            DateTime _StartDate = startDate;
            List<DateTime> recurranceDates = new List<DateTime>();
            recurranceDates.Add(_StartDate);
            for (int i = 1; i < numberDaysRepeat; i++)
            {
                _StartDate = _StartDate.AddDays(7);
                recurranceDates.Add(_StartDate);
            }
            return recurranceDates.ToList();
        }

        /// <summary>
        /// This is method is used to generate.
        /// </summary>
        /// <returns></returns>
        public static string GenerateCode()
        {
            string characters = "1234567890";
            string otp = string.Empty;
            for (int i = 0; i < 4; i++)
            {
                string character = string.Empty;
                do
                {
                    int index = new Random().Next(0, characters.Length);
                    character = characters.ToCharArray()[index].ToString();
                } while (otp.IndexOf(character) != -1);
                otp += character;
            }
            return otp;
        }
        
        public static string GenerateRefreshToken()
        {
            using (var rngCryptoServiceProvider = new RNGCryptoServiceProvider())
            {
                var randomBytes = new byte[64];
                rngCryptoServiceProvider.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }
        public static bool CheckIn24Hours(DateTime? date)
        {
            DateTime booking = Convert.ToDateTime(date);
            DateTime ending = booking.AddHours(23).AddMinutes(59).AddSeconds(59);
            var n = DateTime.Compare(DateTime.UtcNow,ending );
            return ((n == -1)) ? false : true;
        }


    }
}
