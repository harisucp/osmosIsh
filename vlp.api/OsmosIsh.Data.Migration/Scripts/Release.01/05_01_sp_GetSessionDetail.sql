
/****** Object:  StoredProcedure [dbo].[sp_GetSessionDetail]    Script Date: 2020-06-17 10:44:13 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author: Ria Sahni
-- Create date: 20th-May-2020
-- Description: This will fetch detail of session
-- =============================================
-- sp_GetSessionDetail 13
-- sp_GetSeriesDetail -1

Create PROCEDURE [dbo].[sp_GetSessionDetail] @sessionid AS INT, @studentid AS INT, @usertype AS VARCHAR(50)
AS
DECLARE @teacherid as int,@sessioncategoryid as int;
If(@sessionid > 0)
BEGIN
Select @sessioncategoryid=(Sd.SessionCategoryId), @teacherid = (TeacherId) from session s inner join SessionDetail sd on sd.sessionId=s.SessionId where s.sessionid = @sessionid
END

BEGIN
     Select 
	 SD.SessionTitle AS SessionTitle,
	 SD.Description AS SessionDescription,
	 S.StartTime AS StartTime,
	 S.EndTime AS EndTime,
	 S.Duration AS Duration,
	 SD.Status AS Status,
	 SD.SessionFee AS SessionFee,
	 U.lastname+' '+U.FirstName AS Name,
	 T.Description AS TeacherDescription,
	 T.SocialLinks AS SocialLinks,
	 SC.SessionCategoryName AS CategoryName,
	 SD.NumberOfJoineesEnrolled AS NumberOfJoineesEnrolled,
	 dbo.fn_TeacherAverageRating(@teacherid) AS Rating,
	 SD.Language AS Language,
	 U.FirstName+','+U.LastName AS FullName,
	 T.Qualification AS Qualification,
	  (Case when(I.ImageFile is Null OR I.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I.ImageFile END) AS ImageFile ,

	  (Select 
	  Sn.SessionId AS SessionId,
	   Sn.SeriesId AS SeriesId,
	   SD.SessionTitle AS Title,
   	   SD.Description AS SeriesDescription,
	   U.LastName+' '+U.FirstName AS Name,
	   (Case when(I.ImageFile is Null OR I.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I.ImageFile END) AS Image ,
	   SD.Language AS Language,
	    SD.SessionFee AS Fee,
	   Sn.StartTime AS StartDate,
	   Sn.EndTime AS EndDate,
	   GC.CodeName AS TimeZone,
	   dbo.fn_minutesToHhMmFormat(Sn.Duration) as Duration,
	   null AS CanBeSubscribedAnyTime
  from session Sn
	  INNER JOIN SessionDetail SD ON Sn.SessionId = SD.SessionId
	  INNER JOIN SessionCategories SC ON SC.SessionCategoryId = SD.SessionCategoryId
	  INNER JOIN Teachers T ON T.TeacherId = Sn.TeacherId
	  INNER JOIN Users U ON U.UserId = T.UserId 
	  INNER JOIN GlobalCodes GC ON GC.GlobalCodeId = SD.TimeZone
	  LEFT JOIN Images I ON I.ImageRefrenceId = Sn.SessionId AND I.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SessionImage')
	 where  Sn.TeacherId = @teacherid AND Sn.SeriesId IS NULL AND Sn.StartTime >= getdate()  FOR
	 JSON AUTO) AS RelatedSessions,


	 (Select 
	Ser.SeriesId AS Id, 
	SerD.SeriesTitle AS TITLE, 
	SerD.Description AS SeriesDescription, 
	 (Case when(I.ImageFile is Null OR I.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I.ImageFile END) AS Image ,
	SerD.Language AS Language,
	SerD.SeriesFee AS Fee,
	Ser.StartDate AS StartDate,
	Ser.Enddate AS EndDate,
	GC.CodeName AS TimeZone,
	NULL AS Duration,
	SerD.CanBeSubscribedAnyTime AS CanBeSubscribedAnyTime,
	(Select TOP 1 S.SessionId, SD.SessionTitle, S.StartTime, S.EndTime, dbo.fn_minutesToHhMmFormat(S.Duration)as Duration  from Session S
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
	     
	   Where Ser.Active = 'Y' and Ser.RecordDeleted = 'N' AND 
	  Ser.TeacherId = @teacherid  FOR
		  JSON AUTO) AS RelatedSeries, 
		   
		    (Select  
		s.SessionId AS Id, 
		SD.SessionTitle AS TITLE,
		s.StartTime AS StartDate,
		sd.Description AS Description,
		s.EndTime AS EndDate,
		U.LastName+' '+U.FirstName AS Name,
		 (Case when(I.ImageFile is Null OR I.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I.ImageFile END) AS Image
		 from Session s inner join sessiondetail sd on sd.sessionid=s.sessionid
		 INNER JOIN Teachers T ON T.TeacherId = S.TeacherId
		INNER JOIN Users U ON U.UserId = T.UserId
		 LEFT JOIN Images I ON I.ImageRefrenceId = S.SessionId AND I.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SessionImage')
		where s.TeacherId=@teacherid and S.seriesid is null 
		and starttime < getdate()    FOR
		  JSON AUTO) AS PastSessions,

		   (Select  
		Se.SeriesId AS SeriesId, 
		SeD.SeriesTitle AS TITLE,
		SeD.Description AS Description,
		SeD.NumberOfJoineesEnrolled AS Participants,
		se.StartDate AS StartDate,
		se.EndDate AS EndDate,
		U.LastName+' '+U.FirstName AS Name,
		 (Case when(I.ImageFile is Null OR I.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I.ImageFile END) AS Image
		 from  Series Se
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		INNER JOIN Teachers T ON T.TeacherId = Se.TeacherId
		INNER JOIN Users U ON U.UserId = T.UserId
		 LEFT JOIN Images I ON I.ImageRefrenceId = Se.SeriesId AND I.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SeriesImage')
		where Se.TeacherId=@teacherid 
		and Se.StartDate < getdate()    FOR
		  JSON AUTO) AS PastSeries,
		     (Select  
		Se.SeriesId AS SeriesId, 
		SeD.SeriesTitle AS TITLE,
		SeD.NumberOfJoineesEnrolled AS Participants,
		se.StartDate AS StartDate,
		se.EndDate AS EndDate,
		U.LastName+' '+U.FirstName AS Name
		 from  Series Se
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		INNER JOIN Teachers T ON T.TeacherId = Se.TeacherId
		INNER JOIN Users U ON U.UserId = T.UserId
		where Se.TeacherId=@teacherid 
		and Se.StartDate < getdate()    FOR
		  JSON AUTO) AS PastSeries,

		     (Select  
		Se.SeriesId AS SeriesId, 
		SeD.SeriesTitle AS TITLE,
		SeD.Description  AS Description,
		SeD.NumberOfJoineesEnrolled AS Participants,
		se.StartDate AS StartDate,
		se.EndDate AS EndDate,
		U.LastName+' '+U.FirstName AS Name,
		  (Case when(I.ImageFile is Null OR I.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I.ImageFile END) AS ImageFile ,
		(Select TOP 1 S.SessionId, SD.SessionTitle, S.StartTime, S.EndTime, dbo.fn_minutesToHhMmFormat(S.Duration)as Duration  from Session S
		INNER JOIN SessionDetail SD ON SD.SessionId = S.SessionId
		INNER JOIN Series Se ON Se.SeriesId = S.SeriesId
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		  where starttime > getdate() 
	
	AND S.seriesid = Se.seriesid 
		  order by starttime asc  FOR
		  JSON AUTO) AS ClosestSimilarSession
		 from  Series Se
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		INNER JOIN Teachers T ON T.TeacherId = Se.TeacherId
		INNER JOIN Users U ON U.UserId = T.UserId
		LEFT JOIN Images I ON I.ImageRefrenceId = Se.SeriesId AND I.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SeriesImage')
		where SeD.SeriesCategoryId=@sessioncategoryid 
		and Se.StartDate < getdate()    FOR
		  JSON AUTO) AS SimilarSeries,

		     (Select  
		s.SessionId AS Id, 
		SD.SessionTitle AS TITLE,
		sd.Description  AS Description,
		s.StartTime AS StartDate,
		s.EndTime AS EndDate,
		U.LastName+' '+U.FirstName AS Name,
		 (	 Case when(I.ImageFile is Null OR I.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I.ImageFile END) AS ImageFile 
		 from Session s inner join sessiondetail sd on sd.sessionid=s.sessionid
		 INNER JOIN Teachers T ON T.TeacherId = S.TeacherId
		INNER JOIN Users U ON U.UserId = T.UserId
				 LEFT JOIN Images I ON I.ImageRefrenceId = S.SessionId AND I.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SessionImage')
		where sd.SessionCategoryId=@sessioncategoryid and S.seriesid is null 
		and starttime < getdate()    FOR
		  JSON AUTO) AS SimilarSessions

	 From Session S
	 INNER JOIN SessionDetail SD ON S.SessionId = SD.SessionId
	 INNER JOIN SessionCategories SC ON SC.SessionCategoryId = SD.SessionCategoryId
	 INNER JOIN Teachers T ON T.TeacherId = S.TeacherId
	 INNER JOIN Users U ON U.UserId = T.UserId
	 LEFT JOIN Series Se ON Se.SeriesId = S.SeriesId
	 LEFT JOIN Images I ON I.ImageRefrenceId = S.TeacherId
	  where S.SessionId = @sessionid
	 AND S.RecordDeleted = 'N'


	  IF(@usertype = 'Student')
	 BEGIN 
	 IF EXISTS(Select 1 from Session where SessionId = @sessionid)
	 BEGIN
	   INSERT INTO [dbo].[ViewLogs]
           ([RefrenceId]
           ,[RefrenceType]
           ,[StudentId]
           ,[Active]
           ,[CreatedBy]
           ,[CreatedDate]
           ,[ModifiedBy]
           ,[ModifiedDate]
           ,[RecordDeleted])
     VALUES
           (@sessionid
           ,(Select GlobalCodeId From GlobalCodes Where CodeName = 'Session')
           ,@studentid
           ,'Y'
           ,'admin'
           ,GETDATE()
           ,'admin'
           ,GETDATE()
           ,'N')
	  END
	 END

END;



