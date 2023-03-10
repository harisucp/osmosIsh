
/****** Object:  StoredProcedure [dbo].[sp_GetSeriesSessions]    Script Date: 06/17/2020 5:41:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- sp_GetSeriesSessions null,'Upcoming Session',null,null,null,0,100,null,1,10,'Series & Session','Cash'

--exec sp_GetSeriesSessions @SearchText=N'',@SessionType=N'Upcoming Session',@CategoryId=N'',@StartDate=N'1990-01-01',@EndDate=N'2099-01-01',@MinPrice=N'0',@MaxPrice=N'100',@userid=N'',@PageNbr=N'1',@PageSize=N'10',@Type=N'Series & Session',@Tag=null

Create PROCEDURE [dbo].[sp_GetSeriesSessions] 

    @SearchText varchar(50) = NULL,  
	@SessionType varchar(50)=null,
	@CategoryId int =null,
	@StartDate date=null,
	@EndDate date=null,
	@MinPrice int=0,
	@MaxPrice int=100,
	@userid int=null,
    @PageNbr INT = 1,
    @PageSize INT = 10,
	@type varchar(50),
	@Tag varchar(max) = null

AS
BEGIN

IF(@tag = '')
BEGIN
SET @tag = null
END


-- Temporary table for tags parameter
DECLARE @split TABLE (word VARCHAR(64))	
DECLARE @word  VARCHAR(64),@start INT, @end INT, @stop  INT

SELECT @tag += ',',@start = 1,@stop = Len(@tag) + 1

WHILE @start < @stop
  BEGIN
      SELECT @end = Charindex(',', @tag, @start),
             @word = Rtrim(Ltrim(Substring(@tag, @start, @end - @start))),
             @start = @end + 1
       INSERT @split VALUES (@word)
  END

-- Temporary table for Session records
 CREATE table #tempSeries
(
	id int IDENTITY,
	UserId int ,
	SeriesId int, 
	Title varchar(100),
	Description varchar(max),
	Name varchar(100),
	SessionCategoryId int ,
	SessionCategoryName varchar(100),
	SessionCategoryParentId int,
	ImageFile varchar(255),
	TeacherImageFile varchar(255),
	Language varchar(100),
	StartTime datetime,
	Endtime datetime,
	Duration varchar(100),
	Fee decimal(18,2),
	VacantSeats varchar(10),
	TotalSeats int,
	OccupiedSeats int,
	TimeZone varchar(5),
	Rating decimal(5,2),
	CanBeSubscribedAnyTime Char(1),
	SeriesDetail varchar(max)
)

-- insert session records in #tempSeries
Insert into #tempSeries
       Select 
	   U.UserId,
	   S.SeriesId,
	   SD.SessionTitle,
   	   SD.Description,
	   U.FirstName+','+U.LastName AS Name,
	   SD.SessionCategoryId,
	   SC.SessionCategoryName,
	   SC.ParentId,	   
	  (Case when(I.ImageFile is Null OR I.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I.ImageFile END) AS ImageFile ,

	    (Case when(I1.ImageFile is Null OR I1.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I1.ImageFile END) AS ImageFile ,	    
	   SD.Language,
	   S.StartTime,
	   S.EndTime,
	   dbo.fn_minutesToHhMmFormat(S.Duration) as Duration,
	   SD.SessionFee,
	   (select Numberofjoineesallowed - numberofjoineesenrolled from SessionDetail where SessionId = S.SessionId AND Numberofjoineesallowed > numberofjoineesenrolled) AS VacantSeats,
	   SD.Numberofjoineesallowed AS TotalSeats, 
	   SD.numberofjoineesenrolled AS OccupiedSeats,
	   GC.CodeName AS TimeZone,
	   dbo.fn_SessionAverageRating(S.SessionId) AS Rating,
	   null AS CanBeSubscribedAnyTime, 
	   null AS SeriesDetail
  from session S
	  INNER JOIN SessionDetail SD ON S.SessionId = SD.SessionId
	  INNER JOIN SessionCategories SC ON SC.SessionCategoryId = SD.SessionCategoryId
	  INNER JOIN Teachers T ON T.TeacherId = S.TeacherId
	  INNER JOIN Users U ON U.UserId = T.UserId 
	  INNER JOIN GlobalCodes GC ON GC.GlobalCodeId = SD.TimeZone
	  LEFT JOIN Images I ON I.ImageRefrenceId = S.SessionId AND I.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SessionImage')
	  LEFT JOIN Images I1 ON I1.ImageRefrenceId = S.TeacherId AND I1.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'TeacherImage')
 where S.SeriesId IS NULL AND S.StartTime >= getdate() AND 
		  ((@StartDate IS NULL OR CAST(S.StartTime AS DATE) >= @StartDate) AND (@EndDate IS NULL OR CAST(S.EndTime AS DATE) <= @EndDate)) AND
       (NULLIF(@tag,'') is null or EXISTS (SELECT * FROM   @split w
               WHERE  Charindex(',' + w.word + ',', ',' + SD.SessionTags + ',') > 0))
       Order by S.StartTime asc


Insert into #tempSeries
	Select 
	U.userId,
	Ser.SeriesId, 
	SerD.SeriesTitle, 
	SerD.Description,
	U.FirstName+','+U.LastName AS Name, 
	SerD.SeriesCategoryId,
	SC.SessionCategoryName,
	SC.ParentId,
		  (Case when(I.ImageFile is Null OR I.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I.ImageFile END) AS ImageFile ,

	    (Case when(I1.ImageFile is Null OR I1.ImageFile='')
	 then
	 '/upload/undraw_not_found.png' 
	 Else
	 I1.ImageFile END) AS ImageFile ,
	SerD.Language, 
	Sn.StartTime,
	Sn.EndTime,
	null,
	SerD.SeriesFee,
	(select Numberofjoineesallowed - numberofjoineesenrolled from SeriesDetail where SeriesId = Ser.SeriesId AND Numberofjoineesallowed > numberofjoineesenrolled) AS VacantSeats,
	 SerD.Numberofjoineesallowed AS TotalSeats, 
	 SerD.numberofjoineesenrolled AS OccupiedSeats,
	GC.CodeName AS TimeZone,
	dbo.fn_SeriesAverageRating(Ser.SeriesId) AS Rating,
	SerD.CanBeSubscribedAnyTime
	,(Select TOP 1 S.SessionId, SD.SessionTitle, S.StartTime, S.EndTime, dbo.fn_minutesToHhMmFormat(S.Duration)as Duration  from Session S
		Left JOIN SessionDetail SD ON SD.SessionId = S.SessionId
		INNER JOIN Series Se ON Se.SeriesId = S.SeriesId
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		  where starttime > getdate() and 
		  ((@StartDate IS NULL OR CAST(S.StartTime AS DATE) >= @StartDate) AND (@EndDate IS NULL OR CAST(S.EndTime AS DATE) <= @EndDate))
	
	AND S.seriesid = Ser.seriesid 
		  order by starttime asc  FOR
		  JSON AUTO) AS ClosestSession from Series Ser 
		  INNER JOIN SeriesDetail SerD ON SerD.SeriesId = Ser.SeriesId
		  INNER JOIN Session Sn ON Sn.SeriesId = Ser.SeriesId
		  INNER JOIN SessionCategories SC ON SC.SessionCategoryId = SerD.SeriesCategoryId
		  INNER JOIN Teachers T ON T.TeacherId = Ser.TeacherId
		  INNER JOIN Users U ON U.UserId = T.UserId 
		  INNER JOIN GlobalCodes GC ON GC.GlobalCodeId = SerD.TimeZone
		  LEFT JOIN Images I ON I.ImageRefrenceId = Ser.SeriesId AND I.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'SeriesImage')
	      LEFT JOIN Images I1 ON I1.ImageRefrenceId = Ser.TeacherId AND I1.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'TeacherImage')
	  
	   Where Ser.Active = 'Y' and Ser.RecordDeleted = 'N' AND 
	   (NULLIF(@tag,'' )is null or EXISTS (SELECT *
               FROM   @split w
               WHERE  Charindex(',' + w.word + ',', ',' + SerD.SeriesTags + ',') > 0))

-- CTE from #tempSeries
	   ; WITH CTE_FilterResult AS   
    ( 
	Select 
	ROW_NUMBER() OVER (ORDER BY Id) AS ROWNUM,
	UserId,
	SeriesId, 
	Title,
	Description,
	Name,
	SessionCategoryId,
	SessionCategoryName,
	ImageFile,
	TeacherImageFile,
	Language,
	StartTime,
	Endtime,
	Duration,
	Fee,
	(CASE WHEN VacantSeats > 0 THEN VacantSeats + ' Spots Left' ELSE '' END) AS VacantSeats,
	TotalSeats, 
	OccupiedSeats,
	TimeZone,
	(CASE WHEN Rating IS NULL THEN 0 ELSE Rating END) AS Rating,
	CanBeSubscribedAnyTime,
	SeriesDetail
	from #tempSeries temp
	 WHERE 
	   (
	((temp.SessionCategoryParentId = @CategoryId OR ISNULL(@CategoryId, -1) < 1) AND
	 (@SearchText Is NUll Or temp.Title like '%'+@SearchText+'%') AND
	  (temp.Fee Between @MinPrice and @MaxPrice) 
	  ) AND
	   (temp.UserId = @userid OR ISNULL(@userid, -1) < 1) AND
	   ((@type = 'Series' AND SeriesId IS NOT NULL) OR
     (@type = 'Session' AND SeriesId IS NULL) OR
	 (@type = 'Series & Session' AND (SeriesId IS NULL OR SeriesId IS NOT NULL))) 
	 AND	((@SessionType = 'Todays Session' AND (cast(temp.StartTime as date) = cast(Getdate() as date)) OR
	(@SessionType = 'Upcoming Session' AND (cast(temp.StartTime as date) > cast(Getdate() as date)))))
	   )
), TempCount AS (
    SELECT COUNT(*) AS MaxRows FROM CTE_FilterResult
)
	SELECT
	TC.MaxRows AS MaxRows,
	RowNum,
    UserId,
	SeriesId, 
	Title,
	Description,
	Name,
	SessionCategoryId,
	SessionCategoryName,
	ImageFile,
	TeacherImageFile,
	Language,
	StartTime,
	Endtime,
	Duration,
	Fee,
	VacantSeats,
	TotalSeats, 
	OccupiedSeats,
	TimeZone,
	Rating,
	CanBeSubscribedAnyTime,
	SeriesDetail
    FROM TempCount AS TC,CTE_FilterResult AS CPC
    ORDER BY ROWNUM ASC
	  OFFSET @PageSize * (@PageNbr - 1) ROWS
    FETCH NEXT @PageSize ROWS ONLY OPTION (RECOMPILE);


	DROP TABLE #tempSeries

END






