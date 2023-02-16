using AutoMapper;
using Dapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Service.IService;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.Service
{
    public class APIErrorLogService: IAPIErrorLogService
    {
        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        #region private
        private MainResponse _MainResponse;
        private IAPIErrorLogRepository _APIErrorLogRepository;
        #endregion

        public APIErrorLogService(IAPIErrorLogRepository APIErrorLogRepository, IMapper Mapper)
        {
            _APIErrorLogRepository = APIErrorLogRepository;
            _Mapper = Mapper;
            _MainResponse = new MainResponse();
        }

        public async Task<int> InserAPILogToDB(APILogRequest apiLogRequest)
        {
            var apilogs = _Mapper.Map<Apilogs>(apiLogRequest);
            apilogs.StartDateTime = DateTime.UtcNow;
            StringBuilder log = new StringBuilder();
            log.Append(Environment.NewLine);
            log.Append($"URL: {apilogs.Apiurl} PARAMS: {apilogs.Apiparams} StartDateTime: {apilogs.StartDateTime} METHOD: {apilogs.Method} HEADERS: {apilogs.Headers}");
            log.Append(Environment.NewLine);
            log.Append("----------------------------------------------------------------------------");
            //await _APIErrorLogRepository.AddAsync(apilogs);
            var folderName = Path.Combine("LogData");
            var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName , "ApiLog.txt");

            using (StreamWriter sw = File.AppendText(pathToSave))
            {
                await sw.WriteLineAsync(log.ToString());
                sw.Flush();
                sw.Close();
            }
            //await File.AppendAllTextAsync(pathToSave, log.ToString());
            // add to text file here instead of database
            return apilogs.ApilogId;
        }

        public async Task UpdateAPILogToDB(UpdateAPILogRequest updateAPILogRequest)
        {
            StringBuilder log = new StringBuilder();
            log.Append(Environment.NewLine);
            log.Append($"IfSuccessfull: {updateAPILogRequest.Success} | EndDateTime: {DateTime.Now}");
            if (!updateAPILogRequest.Success)
            {
                log.Append($" | ExceptionMsg: {updateAPILogRequest.ExceptionMsg} | ExceptionType: {updateAPILogRequest.ExceptionType} | ExceptionSource: {updateAPILogRequest.ExceptionSource}");
            }
            log.Append(Environment.NewLine);
            log.Append("----------------------------------------------------------------------------");
            var folderName = Path.Combine("LogData");
            var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName, "ApiLog.txt");

            using (StreamWriter sw = File.AppendText(pathToSave))
            {
                await sw.WriteLineAsync(log.ToString());
                sw.Flush();
                sw.Close();
            }

            //await File.AppendAllTextAsync(pathToSave, log.ToString());
        }
    }
}
