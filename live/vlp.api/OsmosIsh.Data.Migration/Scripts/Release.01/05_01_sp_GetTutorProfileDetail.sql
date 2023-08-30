-- =============================================
-- Author: Saddam
-- Create date: 16th June 2020
-- Description: This will return detail of teacher of profile.
-- =============================================
-- sp_GetTutorProfileDetail 1

CREATE PROCEDURE sp_GetTutorProfileDetail @teacherid AS int
AS
BEGIN
    SELECT FirstName, 
           LastName, 
           Email, 
           T.UserId, 
           TeacherId, 
           DateOfBirth, 
           Description, 
           Hobbies, 
           C.CountryId, 
           C.Name CountryName, 
           PhoneNumber, 
           PhoneCode,
		   Education,
		   Awards,
		   Specialization,
		   PrivateSession,
		   I.ImageFile,
		   CASE WHEN  PrivateSession = 'Y' THEN 
		   (SELECT  WeekDay as WeekDayId,G.CodeName as WeekDay ,StartDateTime,EndDateTime 
		   FROM PrivateSessionAvailabilities  P
		   INNER JOIN GlobalCodes G on G.GlobalCodeId = P.WeekDay 
		   where TeacherId = @teacherid 
		   FOR JSON AUTO) Else NULL End as PrivateSessionAvailabilityDetail
      FROM Teachers AS T
      INNER JOIN Users AS U ON T.UserId = U.UserId
      LEFT JOIN Images AS I ON I.ImageRefrenceId = T.TeacherId
                               AND I.ImageTypeId =
                                                   (
           SELECT GlobalCodeId
             FROM globalcodes
            WHERE codename = 'TeacherImage'
                                                   )
      LEFT JOIN Countries AS C ON C.CountryId = T.CountryId
     WHERE T.TeacherId = @teacherid;
END;

