
/****** Object:  StoredProcedure [dbo].[sp_GetTutorUpcomingSessions]    Script Date: 06/17/2020 10:00:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create PROCEDURE [dbo].[sp_GetTutorUpcomingSessions] 

	@teacherid int=null,
    @PageNbr INT = 1,
    @PageSize INT = 10

AS
BEGIN


CREATE TABLE #tempUpcomingSeriesSession (
    id int IDENTITY,
	SessionId int,
    SeriesId int,
	Title varchar(255),
	Description varchar(max),
	SessioncategoryId int,
	SessionCategoryName varchar(100),
	ImageFile varchar(200),
	Language varchar(100),
	StartTime datetime,
	EndTime datetime,
	Duration varchar(50),
	Fee decimal(10,2),
	TimeZone varchar(50),
	Rating varchar(10),
	CanBeSubscribedAnyTime char(1),
	SeriesSessions varchar(max)
);

insert into #tempUpcomingSeriesSession
Select
	  S.SeriesId,
	  null,
	  SD.SessionTitle,
   	  SD.Description,
	  SD.SessionCategoryId,
	  SC.SessionCategoryName,
	  I.ImageFile,
	  SD.Language,
	  S.StartTime,
	  S.EndTime,
	  dbo.fn_minutesToHhMmFormat(S.Duration) as Duration,
	  SD.SessionFee,
	  GC.CodeName AS TimeZone,
	  dbo.fn_SessionAverageRating(S.SessionId) AS Rating,
	  null
      from session S
	  INNER JOIN SessionDetail SD ON S.SessionId = SD.SessionId
	  INNER JOIN SessionCategories SC ON SC.SessionCategoryId = SD.SessionCategoryId
	  INNER JOIN Teachers T1 ON T1.TeacherId = S.TeacherId
	  INNER JOIN GlobalCodes GC ON GC.GlobalCodeId = SD.TimeZone
	  LEFT JOIN Images I ON I.ImageRefrenceId = S.SessionId AND I.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SessionImage')	 
      where S.SeriesId IS NULL AND S.StartTime >= getdate() 
      AND S.TeacherId = @teacherid
      Order by S.StartTime asc

insert into #tempUpcomingSeriesSession
	  Select 
	  Sn.SessionId,
	Ser.SeriesId, 
	SerD.SeriesTitle, 
	SerD.Description, 
	SerD.SeriesCategoryId,
	SC.SessionCategoryName,
	I.ImageFile,
	SerD.Language, 
	Sn.StartTime,
	Sn.EndTime,
	null,
	SerD.SeriesFee,
	GC.CodeName AS TimeZone,
	dbo.fn_SeriesAverageRating(Ser.SeriesId) AS Rating,
	SerD.CanBeSubscribedAnyTime
	,(Select S.SessionId, SD.SessionTitle, S.StartTime, S.EndTime, dbo.fn_minutesToHhMmFormat(S.Duration)as Duration  from Session S
		INNER JOIN SessionDetail SD ON SD.SessionId = S.SessionId
		INNER JOIN Series Se ON Se.SeriesId = S.SeriesId
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		  where starttime > getdate() 
	
	AND S.seriesid = Ser.seriesid 
		  order by starttime asc  FOR
		  JSON AUTO) AS SeriesSessions from Series Ser 
		  INNER JOIN SeriesDetail SerD ON SerD.SeriesId = Ser.SeriesId
		  INNER JOIN Session Sn ON Sn.SeriesId = Ser.SeriesId
		  INNER JOIN SessionCategories SC ON SC.SessionCategoryId = SerD.SeriesCategoryId
		  INNER JOIN Teachers T ON T.TeacherId = Ser.TeacherId
		  INNER JOIN Users U ON U.UserId = T.UserId 
		  INNER JOIN GlobalCodes GC ON GC.GlobalCodeId = SerD.TimeZone
		  LEFT JOIN Images I ON I.ImageRefrenceId = Ser.SeriesId AND I.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SeriesImage')
	     
	   Where Ser.Active = 'Y' and Ser.RecordDeleted = 'N' AND Sn.SeriesId IS NOT NULL AND 
	  Ser.TeacherId = @teacherid 


	SELECT
	Count(*) AS MaxRows,
	id,
    SessionId,
    SeriesId,
	Title,
	Description,
	SessioncategoryId,
	SessionCategoryName,
	ImageFile,
	Language,
	StartTime,
	EndTime,
	Duration,
	Fee,
	TimeZone,
	Rating,
	CanBeSubscribedAnyTime,
	SeriesSessions
    FROM  #tempUpcomingSeriesSession
    ORDER BY id ASC
	  OFFSET @PageSize * (@PageNbr - 1) ROWS
    FETCH NEXT @PageSize ROWS ONLY OPTION (RECOMPILE);


	DROP TABLE #tempUpcomingSeriesSession

	END