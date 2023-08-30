using AutoMapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Repository.IRepository;
using OsmosIsh.Service.IService;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Service.Service
{
    public class AdminCouponService: IAdminCouponService
    {
        #region readonly
        private readonly IAdminCouponRepository _AdminCouponRepository;
        private readonly IMapper _Mapper;
        #endregion

        #region Private
        private MainResponse _MainResponse;
        #endregion
        public AdminCouponService(IAdminCouponRepository AdminCouponService, IMapper Mapper)
        {
            _AdminCouponRepository = AdminCouponService;
            _Mapper = Mapper;
            _MainResponse = new MainResponse();
        }

        public async Task<MainResponse> CreateUpdateCoupon(CreateUpdateCouponRequest createUpdateCouponRequest)
        {
            return await _AdminCouponRepository.CreateUpdateCoupon(createUpdateCouponRequest);
        }
        public async Task<MainResponse> BlockUnBlockCoupon(BlockUnBlockCouponRequest blockUnBlockCouponRequest)
        {
            return await _AdminCouponRepository.BlockUnBlockCoupon(blockUnBlockCouponRequest);
        }
    }
}
