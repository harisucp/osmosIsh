
/****** Object:  StoredProcedure [dbo].[sp_GetAllAvailableTags]    Script Date: 06/17/2020 10:08:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author: Ria Sahni
-- Create date: 25th-May-2020
-- Description: This will return all the unique available tags
-- =============================================
-- exec sp_GetAllAvailableTags 


Create PROCEDURE [dbo].[sp_GetAllAvailableTags]
AS
BEGIN
    create table #tempTags
(
id int IDENTITY,
interest varchar(1000)
)

insert into #tempTags(interest)
select value from Teachers CROSS APPLY STRING_SPLIT(Interest, ',')
where interest is not null
insert into #tempTags(interest)
select value from Students CROSS APPLY STRING_SPLIT(Interest, ',')
where interest is not null
insert into #tempTags(interest)
select value from SessionDetail CROSS APPLY STRING_SPLIT(SessionTags, ',')
where SessionTags is not null
insert into #tempTags(interest)
select value from SeriesDetail CROSS APPLY STRING_SPLIT(SeriesTags, ',')
where SeriesTags is not null

DECLARE @Interest NVARCHAR(MAX) =(Select DISTINCT interest from #tempTags FOR JSON AUTO)
Select @Interest As Interest;
drop table  #tempTags
END;