using AutoMapper;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using OsmosIsh.Core.DTOs.Request;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
using OsmosIsh.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.Repository
{
    public class APIErrorLogRepository: BaseRepository<Apilogs>,IAPIErrorLogRepository
    {
        private readonly OsmosIshContext _ObjContext;
        private readonly IMapper _mapper;

        public APIErrorLogRepository(OsmosIshContext context, IMapper mapper) : base(context)
        {
            _ObjContext = context;
            _mapper = mapper;
        }

    }
}
