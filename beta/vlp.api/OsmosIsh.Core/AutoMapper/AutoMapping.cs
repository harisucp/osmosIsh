using AutoMapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.DTOs.Response.Common;
using OsmosIsh.Data.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.AutoMapper
{
    public class AutoMapping : Profile
    {
        public AutoMapping()
        {
            // Request Mapping
            CreateMap<APILogRequest, Apilogs>();
            CreateMap<CreateUpdateCouponRequest, Coupons>();
            CreateMap<CreateUpdateAffiliateRequest, Affiliates>();


            // Response Mapping
            CreateMap<PreSaveResponse, MainResponse>();
            CreateMap<Users, UserResponse>();
            CreateMap<Teachers, TeacherDetail>();
        }
    }
}
