using AutoMapper;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.Repository
{
    public class SubscriptionRepository: BaseRepository<Subscriptions>, ISubscriptionRepository
    {
        #region readonly
        private readonly IMapper _Mapper;
        #endregion

        OsmosIshContext _ObjContext;
        MainResponse _MainResponse = null;


        public SubscriptionRepository(OsmosIshContext ObjContext, IMapper Mapper) : base(ObjContext)
        {
            _MainResponse = new MainResponse();
            _ObjContext = ObjContext;
            _Mapper = Mapper;
        }

        public async Task<MainResponse> UpdateSubscribeEmail(UpdateSubscribeEmailRequest updateSubscribeEmailRequest)
        {
            var active = "";
            if (updateSubscribeEmailRequest.Active == "N")
            {
                _MainResponse.Message = SuccessMessage.EMAIL_UNSUBSCRIBED;
                active = "Y";
            }
            else
            {
                _MainResponse.Message = SuccessMessage.EMAIL_RESUBSCRIBED;
                active = "N";
            }

            var subscribedUserDetail = _ObjContext.Subscriptions.Where(x => x.Email == updateSubscribeEmailRequest.Email && x.Active == active).FirstOrDefault();
            if (subscribedUserDetail != null)
            {
                subscribedUserDetail.Active = updateSubscribeEmailRequest.Active;
                _ObjContext.Subscriptions.Update(subscribedUserDetail);
                _ObjContext.SaveChanges();
            }
            else
            {
                _MainResponse.Message = ErrorMessages.EMAIL_NOT_SUBSCRIBED;
                _MainResponse.Success = false;
            }
            return _MainResponse;
        }
    }
}
