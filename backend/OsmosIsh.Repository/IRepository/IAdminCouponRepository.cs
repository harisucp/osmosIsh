using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.IRepository
{
    public interface IAdminCouponRepository
    {
        Task<MainResponse> CreateUpdateCoupon(CreateUpdateCouponRequest createUpdateCouponRequest);
        Task<MainResponse> BlockUnBlockCoupon(BlockUnBlockCouponRequest blockUnBlockCouponRequest);
    }
}
