

/****** Object:  StoredProcedure [dbo].[sp_UpdateAPILog]    Script Date: 06/12/2020 2:43:39 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Saddam
-- Modified date: 18th-Feb-2020
-- Description:	 Update API log Detail.
-- =============================================

CREATE PROCEDURE [dbo].[sp_UpdateAPILog] @apilogid AS int, @success AS bit, @exceptionmsg AS varchar(max), @exceptiontype AS varchar(max), @exceptionsource AS varchar(max)
AS
BEGIN
    DECLARE @temperrorlogid AS int = NULL;
    IF(@success = 0)
    BEGIN
        INSERT INTO ErrorLogs([ExceptionMsg],
                             [ExceptionType],
                             [ExceptionSource],
                             [LogDateTime])
        VALUES(@exceptionmsg, @exceptiontype, @exceptionsource, GETUTCDATE());
        SELECT @temperrorlogid = @@identity;
    END;
  IF(ISNULL(@apilogid,-1)>-1)
	Begin
    UPDATE APILogs
      SET
          Success = @success,
          EndDateTime = GETUTCDATE(),
          ErrorLogId = @temperrorlogid
     WHERE APILogId = @apilogid;
	 End;
END;
GO
