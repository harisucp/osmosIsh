using AutoMapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.DTOs.Response.Common;
using OsmosIsh.Repository.Common.CommonSave;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Repository.Repository;
using OsmosIsh.Service.IService;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.Service
{
    public class CommonService : ICommonService
    {

        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        #region private
        private MainResponse _MainResponse;
        public ICommonRepository _ClientRepository;
        #endregion

        public CommonService(ICommonRepository CommonRepository, IMapper Mapper)
        {
            _ClientRepository = CommonRepository;
            _Mapper = Mapper;
            _MainResponse = new MainResponse();
        }


        #region Delegates
        //Define a delegate
        public delegate PreSaveResponse PreSaveEventHandler(object source, PreSaveEventArgs args);

        //Define event based on that delefate
        public event PreSaveEventHandler PreSaved;
        #endregion

        public async Task<MainResponse> SaveUpdateEntity(SaveRequest request)
        {
            PreSaveResponse preSaveResponse = OnPreSaved(request);
            if (preSaveResponse.Success)
            {
                if (preSaveResponse.Data != null)
                {
                    request.Data = preSaveResponse.Data;
                }
                BindPostCommonSaveEvent.BindPostEvent(request, ref _ClientRepository);
                _MainResponse = await _ClientRepository.SaveUpdateEntity(request);
            }
            else
            {
                _MainResponse = _Mapper.Map<MainResponse>(preSaveResponse);
            }
            return _MainResponse;
        }

        public MainResponse GetData(GetRequest request)
        {
            return  _ClientRepository.GetData(request);
        }

        public MainResponse GetNotifications(GetRequest request)
        {
            return _ClientRepository.GetNotifications(request);
        }

        #region Pre save Event
        protected virtual PreSaveResponse OnPreSaved(SaveRequest SaveRequest)
        {
            var PreSaveResponse = new PreSaveResponse();
            if (PreSaved != null)
            {
                PreSaveResponse = PreSaved(this, new PreSaveEventArgs() { SaveRequest = SaveRequest });
            }
            return PreSaveResponse;
        }

        #endregion
    }
}
