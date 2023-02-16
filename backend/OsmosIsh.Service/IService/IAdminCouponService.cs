using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.IService
{
    public interface IAdminCouponService
    {
        Task<MainResponse> CreateUpdateCoupon(CreateUpdateCouponRequest createUpdateCouponRequest);
        Task<MainResponse> BlockUnBlockCoupon(BlockUnBlockCouponRequest blockUnBlockCouponRequest);
    }
}
