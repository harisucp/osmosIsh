using System;
using System.Collections.Generic;

namespace OsmosIsh.Data.DBEntities
{
    public partial class Users
    {
        public Users()
        {
            Students = new HashSet<Students>();
            Teachers = new HashSet<Teachers>();
            Transactions = new HashSet<Transactions>();
            UserActivities = new HashSet<UserActivities>();
        }

        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Password { get; set; }
        public string ExternalToken { get; set; }
        public string ExternalProvider { get; set; }
        public string Email { get; set; }
        public DateTime RegisterationDate { get; set; }
        public int? CountryId { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string PhoneNumber { get; set; }
        public string Education { get; set; }
        public string Languages { get; set; }
        public int? Gender { get; set; }
        public Guid? ResetToken { get; set; }
        public DateTime? ResetTokenExpiration { get; set; }
        public string IsStudent { get; set; }
        public string IsTutor { get; set; }
        public Guid? VerifyAccountToken { get; set; }
        public DateTime? VerifyAccountTokenExpiration { get; set; }
        public string PhoneNumberVerified { get; set; }
        public string PhoneNumberVerificationOtp { get; set; }
        public DateTime? PhoneNumberOtpexpiration { get; set; }
        public string Active { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string RecordDeleted { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }

        public virtual Countries Country { get; set; }
        public virtual GlobalCodes GenderNavigation { get; set; }
        public virtual ICollection<Students> Students { get; set; }
        public virtual ICollection<Teachers> Teachers { get; set; }
        public virtual ICollection<Transactions> Transactions { get; set; }
        public virtual ICollection<UserActivities> UserActivities { get; set; }
    }
}
