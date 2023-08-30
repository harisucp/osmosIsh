using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Data.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.IRepository
{
    public interface IAPIErrorLogRepository: IBaseRepository<Apilogs>
    {
    }
}
