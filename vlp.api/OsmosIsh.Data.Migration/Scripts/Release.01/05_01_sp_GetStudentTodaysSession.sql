
/****** Object:  StoredProcedure [dbo].[sp_GetStudentTodaysSession]    Script Date: 06/17/2020 10:02:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author: Ria Sahni
-- Create date: 08th-June-2020
-- Description: This will return detail of student's today's sessions
-- =============================================
-- sp_GetStudentTodaysSession 1

Create PROCEDURE [dbo].[sp_GetStudentTodaysSession] @studentid AS INT
AS
BEGIN

 CREATE table #tempTodaySeries
(
	id int IDENTITY,
	KeyId int,
	KeyType varchar(10), 
	Title varchar(100),
	Description varchar(max),
	SessionCategoryId int,
	SessionCategoryName varchar(100),
	ImageFile varchar(255),
	Language varchar(100),
	StartTime datetime,
	Endtime datetime,
	Duration varchar(100),
	Fee decimal(18,2),
	Rating decimal(5,2),
	SeriesDetail varchar(max),
	VacantSeats varchar(10),
	TotalSeats int,
	OccupiedSeats int,
	TimeZone varchar(5)
)

   insert into #tempTodaySeries
      Select 
	  E.RefrenceId AS KeyId,
	  '' AS KeyType,
	  SD.SessionTitle,
	  SD.Description,
	  SD.SessionCategoryId,
	  SC.SessionCategoryName,
	  I1.ImageFile,
	  SD.Language,
	  Sn.StartTime,
	  Sn.EndTime,
	  Sn.Duration,
	  SD.SessionFee,
	  dbo.fn_SessionAverageRating(E.RefrenceId) AS Rating,
	  null AS SeriesDetail,
	     (select Numberofjoineesallowed - numberofjoineesenrolled from SessionDetail where SessionId = Sn.SessionId AND Numberofjoineesallowed > numberofjoineesenrolled) AS VacantSeats,
	   SD.Numberofjoineesallowed AS TotalSeats, 
	   SD.numberofjoineesenrolled AS OccupiedSeats,
	   GC.CodeName AS TimeZone

	  from Students S
	  INNER JOIN Enrollments E ON E.StudentId = S.StudentId 
	  INNER JOIN Users U ON U.UserId = S.UserId
	  LEFT JOIN Session Sn ON Sn.SessionId = E.RefrenceId AND  E.RefrenceType = (Select GlobalCodeId From GlobalCodes Where CodeName = 'Session')
	  LEFT JOIN SessionDetail SD ON SD.SessionId = Sn.SessionId
	  LEFT JOIN GlobalCodes GC ON GC.GlobalCodeId = SD.TimeZone 
	  LEFT JOIN SessionCategories SC ON SC.SessionCategoryId = SD.SessionCategoryId
	  LEFT JOIN Images I1 ON I1.ImageRefrenceId = Sn.SessionId AND I1.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SessionImage')
	  Where S.StudentId=@studentid  AND (CAST(Sn.StartTime AS date) = CAST(getdate() AS date))

    insert into #tempTodaySeries
      Select 
	  E.RefrenceId AS KeyId,
	  '' AS KeyType,
	  SD.SeriesTitle,
	  SD.Description,
	  SD.SeriesCategoryId,
	  SC.SessionCategoryName,
	  I1.ImageFile,
	  SD.Language,
	  Se.StartDate,
	  Se.Enddate,
	  NULL,
	  SD.SeriesFee,
	  dbo.fn_SeriesAverageRating(E.RefrenceId) AS Rating,
	   (Select TOP 1 S.SessionId, SD.SessionTitle, S.StartTime, S.EndTime, dbo.fn_minutesToHhMmFormat(S.Duration)as Duration  from Session S
		INNER JOIN SessionDetail SD ON SD.SessionId = S.SessionId
		INNER JOIN Series Se ON Se.SeriesId = S.SeriesId
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		  where starttime > getdate() 
	
	AND S.seriesid = Se.seriesid 
		  order by starttime asc  FOR
		  JSON AUTO) AS SeriesDetail,
		  (select Numberofjoineesallowed - numberofjoineesenrolled from SeriesDetail where SeriesId = Se.SeriesId AND Numberofjoineesallowed > numberofjoineesenrolled) AS VacantSeats,
	 SD.Numberofjoineesallowed AS TotalSeats, 
	 SD.numberofjoineesenrolled AS OccupiedSeats,
	GC.CodeName AS TimeZone

	  from Students S
	  INNER JOIN Enrollments E ON E.StudentId = S.StudentId 
	  INNER JOIN Users U ON U.UserId = S.UserId 
	  LEFT JOIN Series Se ON Se.SeriesId = E.RefrenceId AND  E.RefrenceType = (Select GlobalCodeId From GlobalCodes Where CodeName = 'Series')
	  LEFT JOIN SeriesDetail SD ON SD.SeriesId = Se.SeriesId
	  LEFT JOIN SessionCategories SC ON SC.SessionCategoryId = SD.SeriesCategoryId
	  LEFT JOIN GlobalCodes GC ON GC.GlobalCodeId = SD.TimeZone
	  LEFT JOIN Images I1 ON I1.ImageRefrenceId = Se.SeriesId AND I1.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SeriesImage')
	  Where S.StudentId=@studentid  AND (CAST(Se.StartDate AS date) = CAST(getdate() AS date))

	  Select * from #tempTodaySeries order by StartTime ASC

	  DROP Table #tempTodaySeries 

END;