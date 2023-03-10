
/****** Object:  StoredProcedure [dbo].[sp_GetStudentRecentSession]    Script Date: 06/17/2020 10:03:50 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author: Ria Sahni
-- Create date: 08th-June-2020
-- Description: This will return detail of teacher dashboard
-- =============================================
-- sp_GetStudentRecentSession 1

Create PROCEDURE [dbo].[sp_GetStudentRecentSession] @studentid AS INT
AS
BEGIN

 CREATE table #tempRecentSession
(
	id int IDENTITY,
	KeyId int,
	KeyType varchar(10), 
	Title varchar(100),
	Description varchar(max),
	SessionCategoryId int ,
	SessionCategoryName varchar(100),
	ImageFile varchar(255),
	Language varchar(100),
	StartTime datetime,
	Endtime datetime,
	Duration varchar(100),
	Fee decimal(18,2),
	Rating decimal(5,2),
	SeriesDetail varchar(max)
)

insert into #tempRecentSession
      Select 
	  E.RefrenceId AS KeyId,
	  GC.CodeName AS KeyType,
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
	  null AS SeriesDetail

	  from Students S
	  INNER JOIN Enrollments E ON E.StudentId = S.StudentId 
	  INNER JOIN Users U ON U.UserId = S.UserId 
	  LEFT JOIN Session Sn ON Sn.SessionId = E.RefrenceId AND  E.RefrenceType = (Select GlobalCodeId From GlobalCodes Where CodeName = 'Session')
	  LEFT JOIN SessionDetail SD ON SD.SessionId = Sn.SessionId
	  LEFT JOIN SessionCategories SC ON SC.SessionCategoryId = SD.SessionCategoryId
	  LEFT JOIN Images I1 ON I1.ImageRefrenceId = @studentid AND I1.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'StudentImage')
	  LEFT JOIN GlobalCodes GC on Gc.GlobalCodeId =E.RefrenceType 
	  Where S.StudentId=@studentid  AND Sn.StartTime < getdate()

	  insert into #tempRecentSession
      Select 
	  E.RefrenceId AS KeyId,
	  GC.CodeName AS KeyType,
	  SD.SeriesTitle,
	  SD.Description,
	  SD.SeriesCategoryId,
	  SC.SessionCategoryName,
	  I1.ImageFile,
	  SD.Language,
	  Se.StartDate,
	  Se.Enddate,
	  Null,
	  SD.SeriesFee,
	  dbo.fn_SeriesAverageRating(E.RefrenceId) AS Rating,
	 (Select TOP 1 S.SessionId, SD.SessionTitle, S.StartTime, S.EndTime, dbo.fn_minutesToHhMmFormat(S.Duration)as Duration  from Session S
		INNER JOIN SessionDetail SD ON SD.SessionId = S.SessionId
		INNER JOIN Series Se ON Se.SeriesId = S.SeriesId
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		  where starttime > getdate() 
	
	AND S.seriesid = Se.seriesid 
		  order by starttime asc  FOR
		  JSON AUTO) AS SeriesDetail

	  from Students S
	  INNER JOIN Enrollments E ON E.StudentId = S.StudentId 
	  INNER JOIN Users U ON U.UserId = S.UserId 
	  LEFT JOIN Series Se ON Se.SeriesId = E.RefrenceId AND  E.RefrenceType = (Select GlobalCodeId From GlobalCodes Where CodeName = 'Series')
	  LEFT JOIN SeriesDetail SD ON SD.SeriesId = Se.SeriesId
	  LEFT JOIN SessionCategories SC ON SC.SessionCategoryId = SD.SeriesCategoryId
	  LEFT JOIN Images I1 ON I1.ImageRefrenceId = @studentid AND I1.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'StudentImage')
	  LEFT JOIN GlobalCodes GC on Gc.GlobalCodeId =E.RefrenceType 
	  Where S.StudentId=@studentid  AND Se.StartDate < getdate()

		  Select * from #tempRecentSession order by StartTime ASC

	  DROP Table #tempRecentSession

END;