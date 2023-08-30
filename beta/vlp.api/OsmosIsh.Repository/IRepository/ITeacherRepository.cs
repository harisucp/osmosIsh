using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.DTOs.Response;
using OsmosIsh.Data.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.IRepository
{
    public interface ITeacherRepository : IBaseRepository<Teachers>
    {
        Task<MainResponse> UpdateTeacherProfile(UpdateTeacherProfileRequest updateTeacherProfileRequest);
        Task<MainResponse> CreateTutor(CreateTutorRequest createTutorRequest);
    }
}
