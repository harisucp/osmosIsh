using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace OsmosIsh.Core.DTOs.Request
{
    public class SubscribeEmailRequest
    {
        /// <summary>
        /// Email address that need to subscribe.
        /// </summary>
        [Required]
        [DataType(DataType.EmailAddress)]
        [EmailAddress]
        public string Email { get; set; }
        /// <summary>
        /// First Name
        /// </summary>
        /// <example></example>
        public string FirstName { get; set; }
        /// <summary>
        /// Last Name
        /// </summary>
        /// <example></example>
        public string LastName { get; set; }
        /// <summary>
        /// User Type :- Tutor,Student,both 
        /// </summary>
        /// <example></example>
        public string UserType { get; set; }
        public string Source { get; set; }
    }

    public class UpdateSubscribeEmailRequest
    {
        /// <summary>
        /// Email address that need to subscribe.
        /// </summary>
        [Required]
        [DataType(DataType.EmailAddress)]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Active { get; set; }
    }

    public class SubscribeEmailToSendyRequest
    {
        /// <summary>
        /// Email address that need to subscribe.
        /// </summary>
        [Required]
        [DataType(DataType.EmailAddress)]
        [EmailAddress]
        public string Email { get; set; }
        /// <summary>
        /// First Name
        /// </summary>
        /// <example></example>
        [Required]
        public string FirstName { get; set; }
        /// <summary>
        /// Last Name
        /// </summary>
        /// <example></example>
        [Required]
        public string LastName { get; set; }
    }
}
