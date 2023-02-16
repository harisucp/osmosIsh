/*****************************************************************************************************
***** Object:  StoredProcedure [dbo].[sp_GetAllCountries]    Script Date: 06/18/2020 12:22:27 PM *****
*****************************************************************************************************/

SET ANSI_NULLS ON;
GO

SET QUOTED_IDENTIFIER ON;
GO
-- =============================================
-- Author:		Saddam
-- Create date: 18-06-2020
-- Description:	This sp is used to get all country detail.
-- =============================================
-- sp_GetAllCountries -1

CREATE PROCEDURE [dbo].[sp_GetAllCountries] @countryid AS int
AS
BEGIN
    SELECT CountryId, 
           ISO, 
           Name, 
           NiceName, 
           ISO3, 
           NumberCode, 
           PhoneCode
      FROM Countries
     WHERE(CountryId = @countryid
           OR ISNULL(@countryid, -1) < 1);
END;