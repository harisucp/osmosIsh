
/****** Object:  StoredProcedure [dbo].[sp_GetCustomerReviews]    Script Date: 06/12/2020 2:43:39 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author: Ria Sahni
-- Create date: 20th May 2020
-- Description: This will return the reviews of users
-- =============================================
-- sp_GetCustomerReviews -1

CREATE PROCEDURE [dbo].[sp_GetCustomerReviews] @studentid AS INT
AS
BEGIN
     Select 
	 U.FirstName + ' ' + U.LastName as StudentName,
	 R.Comments,
	 I.ImageFile,
	 R.CreatedDate,
	 R.ModifiedDate
	  from Reviews R
	 INNER JOIN Students S on R.StudentId = S.StudentId
	 INNER JOIN Users U on S.UserId = U.UserId
	 LEFT JOIN Images I on S.StudentId = I.ImageRefrenceId and I.ImageTypeId = (Select GlobalCodeId from GlobalCodes where CodeName = 'StudentImage')
	 where (S.StudentId = @studentid
	 OR ISNULL(@studentid, -1) < 1) AND R.Comments IS NOT NULL
END;
GO
