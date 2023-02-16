using OsmosIsh.Data.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.IRepository
{
    public interface IChatMessageRepository : IBaseRepository<Messages>
    {
        Task<MainResponse> UpdateMessageStatus(UpdateMessageStatus updateMessageStatus);

    }
}
