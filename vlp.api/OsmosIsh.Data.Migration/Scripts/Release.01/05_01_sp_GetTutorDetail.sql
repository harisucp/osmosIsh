
/****** Object:  StoredProcedure [dbo].[sp_GetTutorDetail]    Script Date: 06/17/2020 10:01:36 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author: Ria Sahni
-- Create date: 20th May 2020
-- Description: This will return detail of teacher
-- =============================================
-- sp_GetTutorDetail 4

Create PROCEDURE [dbo].[sp_GetTutorDetail] @teacherid AS INT
AS
BEGIN


      Select 

	  T.TeacherId,
	  T.Qualification,
	  T.Education,
	  T.Hobbies,
	  T.Languages,
	  T.SocialLinks,
	  T.Awards,
	  T.Specialization,
	  T.WebSite,
	  T.Description,
	  U.UserId,
	  U.LastName+' '+U.FirstName AS Name,
	  dbo.fn_TeacherAverageRating(@teacherid) AS TeachersRating,
	  I1.ImageFile,
	  T.PrivateSession,
	  (Select DISTINCT SC.SessionCategoryName, SC.SessionCategoryId
	    from Session S
		INNER JOIN SessionDetail SD ON SD.SessionId = S.SessionId
		LEFT JOIN Series Se ON Se.SeriesId = S.SeriesId
		LEFT JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		INNER JOIN SessionCategories SC ON SC.sessionCategoryId = SD.SessionCategoryId
		  where S.TeacherId = @teacherid    FOR
		  JSON AUTO) AS SessionCategories,
    (Select
	  S.SeriesId,
	  SD.SessionTitle,
   	  SD.Description,
	  SD.SessionCategoryId,
	  SC.SessionCategoryName,
	  SC.ParentId,
	  I.ImageFile,
	  SD.Language,
	  S.StartTime,
	  S.EndTime,
	  dbo.fn_minutesToHhMmFormat(S.Duration) as Duration,
	  SD.SessionFee,
	  GC.CodeName AS TimeZone,
	  dbo.fn_SessionAverageRating(S.SessionId) AS Rating
      from session S
	  INNER JOIN SessionDetail SD ON S.SessionId = SD.SessionId
	  INNER JOIN SessionCategories SC ON SC.SessionCategoryId = SD.SessionCategoryId
	  INNER JOIN Teachers T1 ON T1.TeacherId = S.TeacherId
	  INNER JOIN GlobalCodes GC ON GC.GlobalCodeId = SD.TimeZone
	  LEFT JOIN Images I ON I.ImageRefrenceId = S.SessionId AND I.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SessionImage')	 
      where S.SeriesId IS NULL AND S.StartTime >= getdate() 
      AND S.TeacherId = 4
      Order by S.StartTime asc FOR JSON AUTO) AS SessionDetail,

	(Select 
	Ser.SeriesId, 
	SerD.SeriesTitle, 
	SerD.Description, 
	SerD.SeriesCategoryId,
	SC.SessionCategoryName,
	I.ImageFile,
	SerD.Language,
	SerD.SeriesFee,
	GC.CodeName AS TimeZone,
	dbo.fn_SeriesAverageRating(Ser.SeriesId) AS Rating,
	SerD.CanBeSubscribedAnyTime
	,(Select TOP 1 S.SessionId, SD.SessionTitle, S.StartTime, S.EndTime, dbo.fn_minutesToHhMmFormat(S.Duration)as Duration  from Session S
		INNER JOIN SessionDetail SD ON SD.SessionId = S.SessionId
		INNER JOIN Series Se ON Se.SeriesId = S.SeriesId
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		  where starttime > getdate() 
	
	AND S.seriesid = Ser.seriesid 
		  order by starttime asc  FOR
		  JSON AUTO) AS ClosestSession from Series Ser 
		  INNER JOIN SeriesDetail SerD ON SerD.SeriesId = Ser.SeriesId
		  --INNER JOIN Session Sn ON Sn.SeriesId = Ser.SeriesId
		  INNER JOIN SessionCategories SC ON SC.SessionCategoryId = SerD.SeriesCategoryId
		  INNER JOIN Teachers T ON T.TeacherId = Ser.TeacherId
		  INNER JOIN Users U ON U.UserId = T.UserId 
		  INNER JOIN GlobalCodes GC ON GC.GlobalCodeId = SerD.TimeZone
		  LEFT JOIN Images I ON I.ImageRefrenceId = Ser.SeriesId AND I.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SeriesImage')
	     
	   Where Ser.Active = 'Y' and Ser.RecordDeleted = 'N'  AND 
	  Ser.TeacherId = @teacherid  FOR
		  JSON AUTO) AS SeriesDetail 


	  from Teachers T
	  --INNER JOIN Session S ON S.TeacherId = T.TeacherId
	  --INNER JOIN SessionDetail SD ON S.SessionId = SD.SessionId
	  INNER JOIN Users U ON U.UserId = T.UserId 
	  LEFT JOIN Images I1 ON I1.ImageRefrenceId = @teacherid AND I1.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'TeacherImage')

	  Where T.TeacherId=@teacherid



END;
