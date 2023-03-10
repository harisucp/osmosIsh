
/****** Object:  StoredProcedure [dbo].[sp_GetTutorDashboardDetail]    Script Date: 06/17/2020 10:02:05 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author: Ria Sahni
-- Create date: 04th-June-2020
-- Description: This will return detail of teacher dashboard
-- =============================================
-- sp_GetTutorDashboardDetail 4

Create PROCEDURE [dbo].[sp_GetTutorDashboardDetail] @teacherid AS INT
AS
BEGIN


CREATE TABLE #TotalEarned (
    id int IDENTITY,
    Earned decimal(18,5),
	TotalDeliveredSessions int,
	TotalDeliveredSeries int,
	TotalDeliveredHours int
);

insert into #TotalEarned
Select 
sd.NumberOfJoineesEnrolled * (sd.SessionFee - (sd.SessionFee * 30 / 100)) AS Earned,
S.SessionId AS TotalDeliveredSessions,
null,
s.Duration
from Session s inner join sessiondetail sd on sd.sessionid=s.sessionid
		where s.TeacherId=@teacherid and S.seriesid is null 
		and starttime < getdate() 
insert into #TotalEarned
Select 
SeD.NumberOfJoineesEnrolled * (SeD.SeriesFee - (SeD.SeriesFee * 30 / 100)) AS Earned,
null,
Se.SeriesId AS TotalDeliveredSeries,
null
 from  Series Se
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		where Se.TeacherId=@teacherid
		and Se.StartDate < getdate() 


CREATE TABLE #PendingStats (
    id int IDENTITY,
	TotalPendingSessions int,
	TotalPendingSeries int
);

insert into #PendingStats
Select 
S.SessionId AS TotalPendingSessions,
null
from Session s inner join sessiondetail sd on sd.sessionid=s.sessionid
		where s.TeacherId=@teacherid and S.seriesid is null 
		and starttime > getdate() 
insert into #PendingStats
Select 
null,
Se.SeriesId AS TotalPendingSeries
 from  Series Se
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		where Se.TeacherId=@teacherid
		and Se.StartDate > getdate() 


      Select 
	  (SELECT SUM(Earned) FROM #TotalEarned) AS TotalEarned,
	  (Select COUNT(TotalDeliveredSessions) FROM #TotalEarned where TotalDeliveredSessions is not null) AS TotalDeliveredSessions,
	  (Select COUNT(TotalDeliveredSeries) FROM #TotalEarned where TotalDeliveredSeries is not null) AS TotalDeliveredSeries,
	  (Select COUNT(TotalPendingSessions) FROM #PendingStats) AS TotalPendingSessions,
	  (Select COUNT(TotalPendingSeries) FROM #PendingStats) AS TotalPendingSeries,
	  (Select SUM(TotalDeliveredHours) FROM #TotalEarned) AS TotalDeliveredHours,
	  T.TeacherId,
	  U.UserId,
	  U.LastName+' '+U.FirstName AS Name,
	  dbo.fn_TeacherAverageRating(@teacherid) AS TeachersRating,
	  I1.ImageFile,
	  T.PrivateSession

	  from Teachers T
	  --INNER JOIN Session S ON S.TeacherId = T.TeacherId
	  --INNER JOIN SessionDetail SD ON S.SessionId = SD.SessionId
	  INNER JOIN Users U ON U.UserId = T.UserId 
	  LEFT JOIN Images I1 ON I1.ImageRefrenceId = @teacherid AND I1.ImageTypeId = (Select GlobalCodeId from globalcodes where codename = 'TeacherImage')

	  Where T.TeacherId=@teacherid

	  DROP TABLE #TotalEarned
	  DROP TABLE #PendingStats

END;