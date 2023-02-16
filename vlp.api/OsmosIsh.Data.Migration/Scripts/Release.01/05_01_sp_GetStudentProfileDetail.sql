-- =============================================
-- Author: Saddam
-- Create date: 16th June 2020
-- Description: This will return detail of student of profile.
-- =============================================


CREATE PROCEDURE sp_GetStudentProfileDetail @studentid AS int
AS
BEGIN
    SELECT FirstName, 
           LastName, 
           Email, 
           S.UserId, 
           StudentId, 
           DateOfBirth, 
           Description, 
           Interest, 
           C.CountryId, 
           C.Name CountryName, 
           PhoneNumber, 
           PhoneCode,
		   I.ImageFile
      FROM Students AS S
      INNER JOIN Users AS U ON S.UserId = U.UserId
      LEFT JOIN Images AS I ON I.ImageRefrenceId = S.StudentId
                               AND I.ImageTypeId =
                                                   (
           SELECT GlobalCodeId
             FROM globalcodes
            WHERE codename = 'StudentImage'
                                                   )
      LEFT JOIN Countries AS C ON C.CountryId = S.CountryId
     WHERE S.StudentId = @studentid;
END;