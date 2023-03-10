
/****** Object:  StoredProcedure [dbo].[sp_GetStudentDashboard]    Script Date: 06/17/2020 10:04:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author: Ria Sahni
-- Create date: 08th-June-2020
-- Description: This will return detail of student dashboard
-- =============================================
-- sp_GetStudentDashboard 1

Create PROCEDURE [dbo].[sp_GetStudentDashboard] @studentid AS INT
AS
BEGIN

      Select 
(Select Count(*) from Enrollments E 
INNER JOIN Session S ON S.SessionId = E.RefrenceId AND E.RefrenceType = (Select GlobalCodeId from GlobalCodes Where CodeName = 'Session')
WHERE S.StartTime < getdate() AND S.SessionId = E.RefrenceId) AS CountRecentEnrolled,
(Select Count(*) from Enrollments E 
INNER JOIN Session S ON S.SessionId = E.RefrenceId AND E.RefrenceType = (Select GlobalCodeId from GlobalCodes Where CodeName = 'Session')
WHERE S.StartTime > getdate() AND S.SessionId = E.RefrenceId) AS CountUpcomingEnrolled,
	 S.StudentId AS StudentId,
	 S.Description AS Description,
	 U.UserId,
	 U.LastName+' '+U.FirstName as Name,
	 I1.ImageFile
	  from Students S
	  --INNER JOIN Enrollments E ON E.StudentId = S.StudentId 
	  INNER JOIN Users U ON U.UserId = S.UserId 
	  --LEFT JOIN Session Sn ON Sn.SessionId = E.RefrenceId AND  E.RefrenceType = (Select GlobalCodeId From GlobalCodes Where CodeName = 'Session')
	  --LEFT JOIN SessionDetail SD ON SD.SessionId = Sn.SessionId
	  --LEFT JOIN SessionCategories SC ON SC.SessionCategoryId = SD.SessionCategoryId
	  LEFT JOIN Images I1 ON I1.ImageRefrenceId = @studentid AND I1.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'StudentImage')
	  Where S.StudentId=@studentid  
	  --AND (CAST(Sn.StartTime AS date) = CAST(getdate() AS date))

   


END;

