-- Insert Global Category SessionType 
INSERT INTO [dbo].[GlobalCodeCategories]([CategoryName], 
                                         [AllowAddDelete], 
                                         [AllowCodeNameEdit], 
                                         [AllowSortOrderEdit], 
                                         [Description], 
                                         [Active], 
                                         [CreatedBy], 
                                         [CreatedDate])
VALUES(N'SessionType', N'N', N'N', N'N', N'Session Type', N'Y', N'admin', GETDATE());
GO

DECLARE @categoryid int = (SELECT CategoryId FROM GlobalCodeCategories WHERE CategoryName='SessionType');

INSERT INTO [dbo].[GlobalCodes]([CategoryId], 
                                [CodeName], 
                                [Description], 
                                [Active], 
                                [CannotModifyNameOrDelete], 
                                [SortOrder], 
                                [CreatedBy], 
                                [CreatedDate])
VALUES(@categoryid, N'Trending', N'Trending Session', N'Y', N'N', NULL, N'admin', GETDATE()),
( @categoryid, N'Upcoming', N'Upcoming Sessions', N'Y', N'N', NULL, N'admin', GETDATE()),
( @categoryid, N'Today', N'Today', N'Y', N'N', NULL, N'admin', GETDATE()),
( @categoryid, N'FeaturedTeachers', N'Featured Teachers', N'Y', N'N', NULL, N'admin', GETDATE()),
( @categoryid, N'MostPopular', N'Most Popular', N'Y', N'N', NULL, N'admin', GETDATE()),
( @categoryid, N'FeaturedSessions', N'Featured Session', N'Y', N'N', NULL, N'admin', GETDATE());
GO


-- Insert Global Category UserType 
INSERT INTO [dbo].[GlobalCodeCategories]([CategoryName], 
                                         [AllowAddDelete], 
                                         [AllowCodeNameEdit], 
                                         [AllowSortOrderEdit], 
                                         [Description], 
                                         [Active], 
                                         [CreatedBy], 
                                         [CreatedDate])
VALUES(N'UserType', N'N', N'N', N'N', N'User Type', N'Y' ,N'admin', GETDATE());
GO

DECLARE @categoryid int = (SELECT CategoryId FROM GlobalCodeCategories WHERE CategoryName='UserType');

INSERT INTO [dbo].[GlobalCodes]([CategoryId], 
                                [CodeName], 
                                [Description], 
                                [Active], 
                                [CannotModifyNameOrDelete], 
                                [SortOrder], 
                                [CreatedBy], 
                                [CreatedDate])
VALUES(@categoryid, N'Admin', N'Admin', N'Y', N'N', NULL, N'admin', GETDATE()),
(@categoryid, N'Tutor', N'Tutor', N'Y', N'N', NULL, N'admin', GETDATE()),
(@categoryid, N'Student', N'Student', N'Y', N'N', NULL, N'admin', GETDATE()),
(@categoryid, N'Tutor&Student', N'Tutor and Student', N'Y', N'N', NULL, N'admin', GETDATE());
GO


-- Insert Global Category Gender 
INSERT INTO [dbo].[GlobalCodeCategories]([CategoryName], 
                                         [AllowAddDelete], 
                                         [AllowCodeNameEdit], 
                                         [AllowSortOrderEdit], 
                                         [Description], 
                                         [Active], 
                                         [CreatedBy], 
                                         [CreatedDate])
VALUES(N'Gender', N'N', N'N', N'N', N'Gender', N'Y', N'admin', GETDATE());
GO

DECLARE @categoryid int = (SELECT CategoryId FROM GlobalCodeCategories WHERE CategoryName='Gender');

INSERT INTO [dbo].[GlobalCodes]([CategoryId], 
                                [CodeName], 
                                [Description], 
                                [Active], 
                                [CannotModifyNameOrDelete], 
                                [SortOrder], 
                                [CreatedBy], 
                                [CreatedDate])
VALUES(@categoryid, N'Male', N'Male', N'Y', N'N', NULL, N'admin', GETDATE()),
(@categoryid, N'Female', N'Female', N'Y', N'N', NULL, N'admin', GETDATE());
GO



-- Insert Global Category Status 
INSERT INTO [dbo].[GlobalCodeCategories]([CategoryName], 
                                         [AllowAddDelete], 
                                         [AllowCodeNameEdit], 
                                         [AllowSortOrderEdit], 
                                         [Description], 
                                         [Active], 
                                         [CreatedBy], 
                                         [CreatedDate])
VALUES(N'Status', N'N', N'N', N'N', N'Status', N'Y', NULL, GETDATE());
GO

DECLARE @categoryid int = (SELECT CategoryId FROM GlobalCodeCategories WHERE CategoryName='Status');

INSERT INTO [dbo].[GlobalCodes]([CategoryId], 
                                [CodeName], 
                                [Description], 
                                [Active], 
                                [CannotModifyNameOrDelete], 
                                [SortOrder], 
                                [CreatedBy], 
                                [CreatedDate] 
                                )
VALUES(@categoryid, N'Pending', N'Pending', N'Y', N'N', NULL,  N'admin', GETDATE()),
(@categoryid, N'Completed', N'Completed', N'Y', N'N', NULL,  N'admin', GETDATE()),
(@categoryid, N'InProgress', N'In Progress', N'Y', N'N',NULL, N'admin', GETDATE());
GO


-- Insert Global Category ImageType 
INSERT INTO [dbo].[GlobalCodeCategories]([CategoryName], 
                                         [AllowAddDelete], 
                                         [AllowCodeNameEdit], 
                                         [AllowSortOrderEdit], 
                                         [Description], 
                                         [Active], 
                                         [CreatedBy], 
                                         [CreatedDate])
VALUES(N'ImageType', N'N', N'N', N'N', N'Image Type', N'Y', N'admin', GETDATE());
GO

DECLARE @categoryid int = (SELECT CategoryId FROM GlobalCodeCategories WHERE CategoryName='ImageType');

INSERT INTO [dbo].[GlobalCodes]([CategoryId],
								[CodeName], 
                                [Description], 
                                [Active], 
                                [CannotModifyNameOrDelete], 
                                [SortOrder], 
                                [CreatedBy], 
                                [CreatedDate])
VALUES(@categoryid, N'SessionImage', N'Session Image', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'SeriesImage', N'Series Image', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'StudentImage', N'Student Image', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'TeacherImage', N'Teacher Image', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'SessionVideo', N'Session Video', N' ', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'SeriesVideo', N'Series Video', N'Y', N'N', NULL,  N'admin', GETDATE());
GO

-- Insert Global Category TimeZones 
INSERT INTO [dbo].[GlobalCodeCategories]([CategoryName], 
                                         [AllowAddDelete], 
                                         [AllowCodeNameEdit], 
                                         [AllowSortOrderEdit], 
                                         [Description], 
                                         [Active], 
                                         [CreatedBy], 
                                         [CreatedDate])
VALUES(N'TimeZones', N'N', N'N', N'N', N'TimeZones', N'Y', N'admin', GETDATE());
GO
DECLARE @categoryid int = (SELECT CategoryId FROM GlobalCodeCategories WHERE CategoryName='TimeZones');

INSERT INTO [dbo].[GlobalCodes]([CategoryId],
								[CodeName], 
                                [Description], 
                                [Active], 
                                [CannotModifyNameOrDelete], 
                                [SortOrder], 
                                [CreatedBy], 
                                [CreatedDate])
VALUES( @categoryid, N'ST', N'Samoa Standard Time', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'HAT', N'Hawaii-Aleutian Standard Time', N'Y', N'N',NULL,  N'admin', GETDATE()),
( @categoryid, N'AKT', N'Alaska Standard Time', N'Y', N'N',NULL,  N'admin', GETDATE()),
( @categoryid, N'PT', N'Pacific Standard Time', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'MT', N'Mountain Standard Time', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'CT', N'Central Standard Time', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'ET', N'Eastern Standard Time', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'AST', N'Atlantic Standard Time', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'ChT', N'Chamorro Standard Time', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'WIT', N'Wake Island Time Zone', N'Y', N'N',NULL,  N'admin', GETDATE());
GO



-- Insert Global Category RatingType
INSERT INTO [dbo].[GlobalCodeCategories]([CategoryName], 
                                         [AllowAddDelete], 
                                         [AllowCodeNameEdit], 
                                         [AllowSortOrderEdit], 
                                         [Description], 
                                         [Active], 
                                         [CreatedBy], 
                                         [CreatedDate])
VALUES( N'RatingType', N'N', N'N', N'N', N'Rating Type', N'Y', N'admin', GETDATE());
GO
DECLARE @categoryid int = (SELECT CategoryId FROM GlobalCodeCategories WHERE CategoryName='RatingType');

INSERT INTO [dbo].[GlobalCodes]([CategoryId], 
                                [CodeName], 
                                [Description], 
                                [Active], 
                                [CannotModifyNameOrDelete], 
                                [SortOrder], 
                                [CreatedBy], 
                                [CreatedDate])
VALUES( @categoryid, N'SeriesRating', N'Series Rating', N'Y', N'N', NULL,  N'admin', GETDATE()),
(@categoryid, N'SessionRating', N'Session Rating', N'Y', N'N', NULL,  N'admin', GETDATE());



-- Insert Global Category WeekDays 
INSERT INTO [dbo].[GlobalCodeCategories]([CategoryName], 
                                         [AllowAddDelete], 
                                         [AllowCodeNameEdit], 
                                         [AllowSortOrderEdit], 
                                         [Description], 
                                         [Active], 
                                         [CreatedBy], 
                                         [CreatedDate])
VALUES(N'WeekDays', N'N', N'N', N'N', N'WeekDays', N'Y', N'admin', GETDATE());
GO
DECLARE @categoryid int = (SELECT CategoryId FROM GlobalCodeCategories WHERE CategoryName='WeekDays');

INSERT INTO [dbo].[GlobalCodes]([CategoryId],
								[CodeName], 
                                [Description], 
                                [Active], 
                                [CannotModifyNameOrDelete], 
                                [SortOrder], 
                                [CreatedBy], 
                                [CreatedDate])
VALUES( @categoryid, N'Sunday', N'Sunday', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'Monday', N'Monday', N'Y', N'N',NULL,  N'admin', GETDATE()),
( @categoryid, N'Tuesday', N'Tuesday', N'Y', N'N',NULL,  N'admin', GETDATE()),
( @categoryid, N'Wednesday', N'Wednesday', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'Thuesday', N'Thuesday', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'Friday', N'Friday', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'Saturday', N'Saturday', N'Y', N'N', NULL,  N'admin', GETDATE());
GO


-- Insert Global Category EventType 
INSERT INTO [dbo].[GlobalCodeCategories]([CategoryName], 
                                         [AllowAddDelete], 
                                         [AllowCodeNameEdit], 
                                         [AllowSortOrderEdit], 
                                         [Description], 
                                         [Active], 
                                         [CreatedBy], 
                                         [CreatedDate])
VALUES(N'EventType', N'N', N'N', N'N', N'EventType', N'Y', N'admin', GETDATE());
GO
DECLARE @categoryid int = (SELECT CategoryId FROM GlobalCodeCategories WHERE CategoryName='EventType');

INSERT INTO [dbo].[GlobalCodes]([CategoryId],
								[CodeName], 
                                [Description], 
                                [Active], 
                                [CannotModifyNameOrDelete], 
                                [SortOrder], 
                                [CreatedBy], 
                                [CreatedDate])
VALUES( @categoryid, N'Series', N'Series', N'Y', N'N', NULL,  N'admin', GETDATE()),
( @categoryid, N'Session', N'Session', N'Y', N'N',NULL,  N'admin', GETDATE());
GO


