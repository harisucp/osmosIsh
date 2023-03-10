
/****** Object:  StoredProcedure [dbo].[sp_GetTutorRecentSessions]    Script Date: 06/17/2020 10:01:04 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create PROCEDURE [dbo].[sp_GetTutorRecentSessions] 

	@teacherid int=null,
    @PageNbr INT = 1,
    @PageSize INT = 10

AS
BEGIN


CREATE TABLE #tempRecentSeriesSession (
    id int IDENTITY,
	SessionId int,
    SeriesId int,
	Title varchar(255),
	Description varchar(max),
	Earned decimal(18,5),
	Participants int,
	StartTime datetime,
	EndTime datetime,
	SeriesSessions varchar(max),
	CanBeSubscribedAnyTime char(1)
);

insert into #tempRecentSeriesSession
Select  
		s.SessionId, 
		null,
		SD.SessionTitle AS TITLE,
		SD.Description AS Description,
		sd.NumberOfJoineesEnrolled * (sd.SessionFee - (sd.SessionFee * 30 / 100)) AS Earned,
		sd.NumberOfJoineesEnrolled AS Participants,
		s.StartTime AS StartDate,
		s.EndTime AS EndDate,
		null,
		null
		 from Session s inner join sessiondetail sd on sd.sessionid=s.sessionid
		where s.TeacherId=@teacherid and S.seriesid is null 
		and starttime < getdate()  

insert into #tempRecentSeriesSession
	  Select 
	 null,
		Se.SeriesId, 
		SeD.SeriesTitle AS TITLE,
		SeD.NumberOfJoineesEnrolled * (SeD.SeriesFee - (SeD.SeriesFee * 30 / 100)) AS Earned,
		SeD.NumberOfJoineesEnrolled AS Participants,
		se.StartDate,
		se.EndDate
		,(Select S.SessionId, SD.SessionTitle, S.StartTime, S.EndTime, dbo.fn_minutesToHhMmFormat(S.Duration)as Duration  from Session S
		INNER JOIN SessionDetail SD ON SD.SessionId = S.SessionId
		INNER JOIN Series Se ON Se.SeriesId = S.SeriesId
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		 WHERE  S.seriesid = Se.seriesid 
		  order by starttime asc  FOR
		  JSON AUTO) AS SeriesSessions,
		  SeD.CanBeSubscribedAnyTime
		 from  Series Se
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		INNER JOIN Session Sn ON Sn.SeriesId = Se.SeriesId
		where Se.TeacherId=@teacherid 
		and Se.StartDate < getdate() 


	SELECT
	Count(*) AS MaxRows,
	id,
	SessionId,
    SeriesId,
	Title,
	Description,
	Earned,
	Participants,
	StartTime,
	EndTime,
	SeriesSessions,
	CanBeSubscribedAnyTime
    FROM  #tempRecentSeriesSession
    ORDER BY id ASC
	  OFFSET @PageSize * (@PageNbr - 1) ROWS
    FETCH NEXT @PageSize ROWS ONLY OPTION (RECOMPILE);


	DROP TABLE #tempRecentSeriesSession

	END