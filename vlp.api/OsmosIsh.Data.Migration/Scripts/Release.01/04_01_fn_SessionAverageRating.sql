

/****** Object:  UserDefinedFunction [dbo].[fn_SessionAverageRating]    Script Date: 06/12/2020 2:43:39 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Ria Sahni
-- Create date: 21-May-2020
-- Description:	This function will be used to get average rating of sessioneacher 
-- =============================================
-- select [dbo].[fn_SessionAverageRating](16)

CREATE FUNCTION [dbo].[fn_SessionAverageRating]
(
	@SessionId as int
)
RETURNS decimal(5,2)
AS
BEGIN
DECLARE @AverageRating as varchar(10);
--DECLARE @AverageRating as decimal(5,2)=00.00;
Select @AverageRating = AVG(Rating) From Rating R
LEFT JOIN Session S ON S.SessionId = R.RatingRefrenceId 
Where R.RatingRefrenceId = @SessionId 
return @AverageRating 

END
GO
