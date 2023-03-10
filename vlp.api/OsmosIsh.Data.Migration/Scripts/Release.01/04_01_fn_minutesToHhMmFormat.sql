

/****** Object:  UserDefinedFunction [dbo].[fn_minutesToHhMmFormat]    Script Date: 06/12/2020 2:43:39 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[fn_minutesToHhMmFormat]
(
        @minutes int
)
RETURNS varchar(50)
AS
BEGIN
  DECLARE @hours nvarchar(MAX)
    SET @hours = CASE WHEN @minutes >= 60 THEN
     (SELECT
            CASE WHEN LEN(@minutes/60) > 1
              THEN CAST((@minutes/60) AS VARCHAR(MAX))
              ELSE '0' + CAST((@minutes/60)AS VARCHAR(MAX))
            END
            +':'+
            CASE WHEN (@minutes%60) > 0
             THEN CASE WHEN LEN(@minutes%60) > 1
               THEN CAST((@minutes%60) AS VARCHAR(MAX))
               ELSE '0' + CAST((@minutes%60) AS VARCHAR(MAX))
            END
            ELSE '00'
      END)
     ELSE
      '00:' + CAST((@minutes%60) AS VARCHAR(2))
     END
  RETURN @hours
END
GO
