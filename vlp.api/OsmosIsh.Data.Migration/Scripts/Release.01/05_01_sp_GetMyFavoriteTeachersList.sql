
/****** Object:  StoredProcedure [dbo].[sp_GetMyFavoriteTeachersList]    Script Date: 06/17/2020 10:07:05 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author: Ria Sahni
-- Create date: 15th-June-2020
-- Description: This will return detail of teacher dashboard
-- =============================================
-- sp_GetMyFavoriteTeachersList 1

Create PROCEDURE [dbo].[sp_GetMyFavoriteTeachersList] @studentid AS INT
AS
BEGIN

Select 
	  F.RefrenceId AS KeyId,
	  GC.CodeName AS KeyType,
	  T.TeacherId,
	  U1.LastName+' '+U1.FirstName AS TeachersName,
	  I1.ImageFile,
	  dbo.fn_TeacherAverageRating(T.TeacherId) AS Rating
	  from Favorites F
	  INNER JOIN Students S ON S.StudentId = F.StudentId 
	  INNER JOIN Users U ON U.UserId = S.UserId 
	  INNER JOIN Teachers T ON T.TeacherId = F.RefrenceId AND  F.RefrenceType = (Select GlobalCodeId From GlobalCodes Where CodeName = 'Tutor')
	  INNER JOIN Users U1 ON U1.UserId = T.Teacherid 
	  LEFT JOIN Images I1 ON I1.ImageRefrenceId = T.TeacherId AND I1.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'TeacherImage')
	  LEFT JOIN GlobalCodes GC on Gc.GlobalCodeId =F.RefrenceType 
	  Where F.StudentId=@studentid

	  END