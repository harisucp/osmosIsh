
/****** Object:  StoredProcedure [dbo].[sp_GetPopularSessions]    Script Date: 06/17/2020 9:57:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- sp_GetPopularSessions 1,10

Create PROCEDURE [dbo].[sp_GetPopularSessions] 

    @PageNbr INT = 1,
    @PageSize INT = 10

AS
BEGIN
create table #temp
(
viewid int identity,
refrenceid int,
refencetype int
)

insert into #temp
select DISTINCT(refrenceid), refrencetype from viewlogs


create table #temp1
(
id int identity,
keyid int,
RowCounts int,
refrencetype int
)
insert into #temp1
Select refrenceid,(select count(*) from viewlogs v 
left join session s on v.refrenceid = s.sessionid and v.refrencetype = (select globalcodeid from globalcodes where codename = 'Session')
left join series se on v.refrenceid = se.seriesid and v.refrencetype = (select globalcodeid from globalcodes where codename = 'Series')
 where v.refrenceid = t.refrenceid) as count, refencetype from #temp t

 
 create table #tempPopular
 (
 RowId int identity,
 detail varchar(max),
 Popularity int
 )
 insert into #tempPopular
 Select (Select TOP 1 Sn.SessionId, Sn.SeriesId, SeD.SeriesTitle, Sn.StartTime, Sn.EndTime, dbo.fn_minutesToHhMmFormat(Sn.Duration)as Duration 
  from Session Sn
		--INNER JOIN SessionDetail SD ON SD.SessionId = Sn.SessionId
		INNER JOIN Series Se ON Se.SeriesId = Sn.SeriesId
		INNER JOIN SeriesDetail SeD ON SeD.SeriesId = Se.SeriesId
		  where starttime > getdate() AND
	 Sn.seriesid = t1.keyid
		  order by starttime asc FOR
		  JSON AUTO) as detail, RowCounts from #temp1 t1
  where t1.refrencetype = (Select globalcodeid from globalcodes where codename= 'Series') order by RowCounts desc

  insert into #tempPopular
  Select (Select TOP 1 Sn.SessionId, Sn.SeriesId, SD.SessionTitle, Sn.StartTime, Sn.EndTime, dbo.fn_minutesToHhMmFormat(Sn.Duration)as Duration 
  from Session Sn
		INNER JOIN SessionDetail SD ON SD.SessionId = Sn.SessionId
		  where starttime > getdate() AND
	 Sn.SessionId = t1.keyid
		  order by starttime asc FOR
		  JSON AUTO) as detail, RowCounts from #temp1 t1
  where t1.refrencetype = (Select globalcodeid from globalcodes where codename= 'Session') order by RowCounts desc

  select * from #tempPopular order by popularity desc OFFSET @PageSize * (@PageNbr - 1) ROWS
    FETCH NEXT @PageSize ROWS ONLY OPTION (RECOMPILE);

  drop table #tempPopular,#temp1,#temp

 END
