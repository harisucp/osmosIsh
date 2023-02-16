using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using OsmosIsh.Core.Shared.Static;
using OsmosIsh.Data.DBContext;
using OsmosIsh.Data.DBEntities;
//using OsmosIsh.Repository.DBContext;
//using OsmosIsh.Repository.DBEntities;
using OsmosIsh.Repository.IRepository;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace OsmosIsh.Repository.Repository
{
    public class BaseRepository<T> : IBaseRepository<T> where T : class
    {
        private readonly DbContext _dbContext;
        protected DbSet<T> DbSet;
        public BaseRepository(OsmosIshContext dbContext)
        {
            _dbContext = dbContext;
            DbSet = _dbContext.Set<T>();
        }
        public T Add(T entity)
        {
            _dbContext.Set<T>().Add(entity);
            int result = Save();
            if (result > 0)
                return entity;
            else
                return null;
        }

        public void Delete(T entity)
        {
            _dbContext.Entry(entity).State = EntityState.Deleted;
            Save();
        }

        public T Get<Tkey>(T id)
        {
            return DbSet.Find(id);
        }

        public IQueryable<T> GetAll()
        {
            return DbSet;
        }

        public List<T> GetAll(Expression<Func<T, bool>> whereCondition)
        {
            return DbSet.Where(whereCondition).ToList<T>();
        }

        public T GetSingle(Expression<Func<T, bool>> whereCondition)
        {
            return DbSet.Where(whereCondition).FirstOrDefault<T>();
        }

        public void Update(T entity)
        {
            _dbContext.Entry(entity).State = EntityState.Modified;
            Save();
        }
        private int Save()
        {
            int result = _dbContext.SaveChanges();
            return result;
        }

        public async Task<T> AddAsync(T entity)
        {
            _dbContext.Set<T>().Add(entity);
            int result = await SaveAsync();
            if (result > 0)
                return entity;
            else
                return null;
        }

        public async Task UpdateAsync(T entity)
        {
            _dbContext.Entry(entity).State = EntityState.Modified;
            await SaveAsync();
        }

        private async Task<int> SaveAsync()
        {
            int result = await _dbContext.SaveChangesAsync();
            return result;
        }


        public async Task SPExecuteNonQueryAsync(DynamicParameters dynamicParameters, String StorePorcedureName)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                await db.ExecuteAsync(StorePorcedureName, dynamicParameters, commandType: CommandType.StoredProcedure);
            }
        }

        public async Task<string> SPReadDataListAsync(DynamicParameters dynamicParameters, String StorePorcedureName)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                var result = await db.QueryAsync(StorePorcedureName, dynamicParameters, commandType: CommandType.StoredProcedure);
                return JsonConvert.SerializeObject(result.ToList());
            }
        }

        public async Task<string> SPReadSingleDataAsync(DynamicParameters dynamicParameters, String StorePorcedureName)
        {
            using (IDbConnection db = new SqlConnection(AppSettingConfigurations.AppSettings.ConnectionString))
            {
                var result = await db.QueryAsync(StorePorcedureName, dynamicParameters, commandType: CommandType.StoredProcedure);
                return JsonConvert.SerializeObject(result.FirstOrDefault());
            }
        }
    }
}