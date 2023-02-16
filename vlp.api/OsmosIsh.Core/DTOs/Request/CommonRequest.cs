using Microsoft.EntityFrameworkCore.ChangeTracking;
using OsmosIsh.Core.Shared.Helper;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
    /// <summary>
    /// Json object used for perform common save/update opertion on entity.
    /// </summary>
    public class SaveRequest
    {
        /// <summary>
        /// Json object used for send entity data.
        /// </summary>
        /// <example></example>
        [Required]
        public List<object> Data { get; set; }
        /// <summary>
        /// The entity name on which we need to perform create/update operation.
        /// </summary>
        /// <example>Clients</example>
        [Required]
        public string EntityName { get; set; }
        /// <summary>
        /// Json object used for any odditional information that we need to send with entity data.
        /// </summary>
        public AdditionalFields AdditionalFields { get; set; }
    }

    public class AdditionalFields
    {
        /// <summary>
        /// Pass currently logged in user in the application.
        /// </summary>
        /// <example>Admin</example>
        public string UserName { get; set; }
    }

    public class PreSaveEventArgs : EventArgs
    {
        public SaveRequest SaveRequest { get; set; }
    }

    public class PostSaveEventArgs : EventArgs
    {
        public SaveRequest SaveRequest { get; set; }
        public IEnumerable<EntityEntry> ModifiedEntities { get; set; }
    }

    /// <summary>
    /// Json object used for perform common get opertion on entity.
    /// </summary>
    public class GetRequest
    {
        /// <summary>
        /// Json object used to send data.
        /// </summary>
        /// <example></example>
        [Required]
        public object Data { get; set; }
        /// <summary>
        /// The key name which is used to get data.
        /// </summary>
        /// <example>GetAllGlobalCodes</example>
        [Required]
        public string KeyName { get; set; }
    }


    /// <summary>
    /// Json object used for perform common get opertion on entity.
    /// </summary>
    public class GetTabRequest
    {
        /// <summary>
        /// Json object used to send data.
        /// </summary>
        /// <example></example>
        [Required]
        public object Data { get; set; }
        /// <summary>
        /// The tab name which is used to get data.
        /// </summary>
        /// <example>Medications</example>
        [Required]
        public string TabName { get; set; }
    }
    public class DisputeDataRequest
    {
        public int DisputeId { get; set; }
        public string DisputeReason { get; set; }
        public DateTime Createddate { get; set; }
        public string StudentName { get; set; }
        public string TutorName { get; set; }
        public string SessionName { get; set; }
        public int TeacherId { get; set; }
        public int StudentId { get; set; }
        public int SessionId { get; set; }
        public string StudentEmail { get; set; }
        public string TeacherEmail { get; set; }
        public string TutorResponse { get; set; }
    }
    public class CancelledSeriesRequestDataRequest
    {
        public int TeacherId { get; set; }
        public int StudentId { get; set; }
        public int SeriesId { get; set; }
        public DateTime Createddate { get; set; }
        public string StudentName { get; set; }
        public string TutorName { get; set; }
        public string SeriesName { get; set; }
        public int CancelledSeriesId { get; set; }
        public string StudentEmail { get; set; }
        public string TeacherEmail { get; set; }
    }
}
