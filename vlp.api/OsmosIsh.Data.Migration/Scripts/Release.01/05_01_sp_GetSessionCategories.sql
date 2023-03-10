
/****** Object:  StoredProcedure [dbo].[sp_GetSessionCategories]    Script Date: 06/17/2020 10:05:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author: Ria Sahni
-- Create date: 20th May 2020
-- Description: This will return all the parent categories of series/sessions
-- =============================================
-- sp_GetSessionCategories -1


Create PROCEDURE [dbo].[sp_GetSessionCategories] @sessioncategoryid AS INT
AS
BEGIN

     Select 
	SessionCategoryId,
	ParentId,
	SessionCategoryName,
	CreatedDate
	  from SessionCategories SC
	 where (SC.SessionCategoryId = @sessioncategoryid
	 OR (ISNULL(@sessioncategoryid, -1) < 1) AND ParentId IS NULL)
END;