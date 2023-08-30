using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.IService
{
    public interface IAdminAffiliateService
    {
        Task<MainResponse> CreateUpdateAffiliate(CreateUpdateAffiliateRequest createUpdateAffiliateRequest);
        Task<MainResponse> BlockUnBlockeAffiliate(BlockUnBlockAffiliateRequest blockUnBlockAffiliateRequest);
        Task<MainResponse> ValidateAffiliate(ValideAffiliateRequest valideAffiliateRequest);
    }
}
