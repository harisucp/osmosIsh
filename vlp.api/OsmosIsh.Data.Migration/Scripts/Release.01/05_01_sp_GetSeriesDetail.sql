
/****** Object:  StoredProcedure [dbo].[sp_GetSeriesDetail]    Script Date: 2020-06-17 10:42:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author: Ria Sahni
-- Create date: 20th-May-2020
-- Description: This will fetch detail of session
-- =============================================
-- sp_GetSessionDetail 18
-- sp_GetSeriesDetail 1

Create PROCEDURE [dbo].[sp_GetSeriesDetail] @seriesid AS INT, @studentid AS INT, @usertype AS VARCHAR(50)
AS
DECLARE @teacherid as int,
@sessioncategoryid as int

If(@seriesid > 0)
BEGIN
Select @teacherid = TeacherId, @sessioncategoryid = sd.SeriesCategoryId from Series s inner join seriesdetail sd ON sd.SeriesId=s.SeriesId where s.SeriesId = @seriesid
END


BEGIN
     Select 
	 SD.SeriesTitle AS SeriesTitle,
	 SD.Description AS SeriesDescription,
	 S.StartDate AS StartDate,
	 S.Enddate AS EndDate,
	 SD.SeriesFee AS Fee,
	 U.lastname+' '+U.FirstName AS Name,
	 T.Description AS TeacherDescription,
	 T.SocialLinks AS TeacherSocialLinks,
	 SD.SeriesCategoryId AS Categoryid,
	 SC.SessionCategoryName AS CategoryName,
	 SD.NumberOfJoineesEnrolled AS NumberOfJoineesEnrolled,
	 dbo.fn_TeacherAverageRating(@teacherid) AS Rating,
	 SD.Language,
	 U.LastName+' '+U.FirstName AS FullName,
	 T.Qualification,
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
	Ser.SeriesId AS SeriesId, 
	SerD.SeriesTitle AS TITLE, 
	SerD.Description AS SeriesDescription, 
  (Case when(I.ImageFile is Null OR I.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I.ImageFile END) AS Image,
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
		  JSON AUTO) AS ClosestRelatedSession from Series Ser 
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
		Sd.Description as Description,
		s.EndTime AS EndDate,
		U.LastName+' '+U.FirstName AS Name,
	 (Case when(I.ImageFile is Null OR I.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I.ImageFile END) AS ImageFile 
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
		SeD.NumberOfJoineesEnrolled AS Participants,
		SeD.Description as description,
		se.StartDate AS StartDate,		
		se.EndDate AS EndDate,
		U.LastName+' '+U.FirstName AS Name,
		  (Case when(I.ImageFile is Null OR I.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I.ImageFile END) AS ImageFile 
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
		SeD.Description as Description,
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
		 LEFT JOIN Images I ON I.ImageRefrenceId = Se.SeriesId AND I.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SeriesImage')
		  where starttime > getdate() 
	
	AND S.seriesid = Se.seriesid 
		  order by starttime asc  FOR
		  JSON AUTO) AS ClosestSimilarSession
		 from  Series Se
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		INNER JOIN Teachers T ON T.TeacherId = Se.TeacherId
		INNER JOIN Users U ON U.UserId = T.UserId
		where SeD.SeriesCategoryId=@sessioncategoryid 
		--and Se.StartDate < getdate()   
		 FOR
		  JSON AUTO) AS SimilarSeries,

		     (Select  
		s.SessionId AS Id, 
		SD.SessionTitle AS TITLE,
		s.StartTime AS StartDate,
		s.EndTime AS EndDate,
		SD.Description as Description,
		U.LastName+' '+U.FirstName AS Name,
		 (Case when(I.ImageFile is Null OR I.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I.ImageFile END) AS ImageFile 
		 from Session s inner join sessiondetail sd on sd.sessionid=s.sessionid
		 INNER JOIN Teachers T ON T.TeacherId = S.TeacherId
		INNER JOIN Users U ON U.UserId = T.UserId
		 LEFT JOIN Images I ON I.ImageRefrenceId = S.SessionId AND I.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SessionImage')
		where sd.SessionCategoryId=@sessioncategoryid and S.seriesid is null 
	--	and starttime < getdate()    
		FOR
		  JSON AUTO) AS SimilarSessions,

	 (Select  Sen.SessionId, SD.SessionTitle, Sen.StartTime, Sen.EndTime, dbo.fn_minutesToHhMmFormat(Sen.Duration)as Duration  from Session Sen
		INNER JOIN SessionDetail SD ON SD.SessionId = Sen.SessionId
		INNER JOIN Series Se ON Se.SeriesId = Sen.SeriesId
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		  where 
		  starttime > getdate() AND 
		  Sen.seriesid = @seriesid 
		  order by starttime asc  FOR
		  JSON AUTO) AS ClosestSession
	 From Series S
	 --INNER JOIN Session Sn ON Sn.SeriesId = S.SeriesId
	 INNER JOIN SeriesDetail SD ON S.SeriesId = SD.SeriesId
	 INNER JOIN SessionCategories SC ON SC.SessionCategoryId = SD.SeriesCategoryId
	 INNER JOIN Teachers T ON T.TeacherId = S.TeacherId
	 INNER JOIN Users U ON U.UserId = T.UserId
	 LEFT JOIN Series Se ON Se.SeriesId = S.SeriesId
	 LEFT JOIN Images I ON I.ImageRefrenceId = S.TeacherId
	  where S.SeriesId = @seriesid
	 AND S.RecordDeleted = 'N'

	 
	 IF(@usertype = 'Student')
	 BEGIN
	 IF EXISTS(Select 1 from Series where seriesid = @seriesid)
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
           (@seriesid
           ,(Select GlobalCodeId From GlobalCodes Where CodeName = 'Series')
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



