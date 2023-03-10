

/****** Object:  UserDefinedFunction [dbo].[fn_SeriesAverageRating]    Script Date: 06/12/2020 2:43:39 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--select dbo.fn_SeriesAverageRating(1)
-- =============================================
-- Author:		Ria Sahni
-- Create date: 21-May-2020
-- Description:	This function will be used to get average rating of series 
-- =============================================
CREATE FUNCTION [dbo].[fn_SeriesAverageRating]
(
	@seriesid as int
)
RETURNS varchar(10)
AS
BEGIN

DECLARE @AverageRating as varchar(10);
--DECLARE @AverageRating as decimal(5,2)=00.00;
Select @AverageRating = AVG(Rating) From Rating R
LEFT JOIN Session Se ON Se.SessionId = R.RatingRefrenceId
 LEFT JOIN Series S ON S.SeriesId = R.RatingRefrenceId 
Where R.RatingRefrenceId in (Select SessionId From Session Where SeriesId = @seriesid) 

return @AverageRating 

END
GO
