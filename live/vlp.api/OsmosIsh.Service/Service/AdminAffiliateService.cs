using AutoMapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Service.IService;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.Service
{
    public class AdminAffiliateService : IAdminAffiliateService
    {
        #region readonly
        private readonly IAdminAffiliateRepository _AdminAffiliateRepository;
        private readonly IMapper _Mapper;
        #endregion

        #region Private
        private MainResponse _MainResponse;
        #endregion
        public AdminAffiliateService(IAdminAffiliateRepository AdminAffiliateRepository, IMapper Mapper)
        {
            _AdminAffiliateRepository = AdminAffiliateRepository;
            _Mapper = Mapper;
            _MainResponse = new MainResponse();
        }

        public async Task<MainResponse> CreateUpdateAffiliate(CreateUpdateAffiliateRequest createUpdateAffiliateRequest)
        {
            return await _AdminAffiliateRepository.CreateUpdateAffiliate(createUpdateAffiliateRequest);
        }
        public async Task<MainResponse> BlockUnBlockeAffiliate(BlockUnBlockAffiliateRequest blockUnBlockAffiliateRequest)
        {
            return await _AdminAffiliateRepository.BlockUnBlockeAffiliate(blockUnBlockAffiliateRequest);
        }

        public async Task<MainResponse> ValidateAffiliate(ValideAffiliateRequest valideAffiliateRequest)
        {
            return await _AdminAffiliateRepository.ValidateAffiliate(valideAffiliateRequest);
        }
    }
}
