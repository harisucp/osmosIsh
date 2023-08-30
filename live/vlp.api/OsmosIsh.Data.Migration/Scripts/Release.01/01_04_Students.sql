
/****** Object:  Table [dbo].[Students]    Script Date: 2020-06-02 10:32:42 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Students](
	[StudentId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[DateOfBirth] [date] NULL,
	[PhoneNumber] [varchar](20) NULL,
	[NumberOfCoursesEnrolled] [int] NULL,
	[NumberOfCoursesCompleted] [int] NULL,
	[PackageId] [int] NULL,
	[Hobbies] [varchar](1000) NULL,
	[Interest] [varchar](1000) NULL,
	[Description] [varchar](1000) NULL,
	[Languages] [varchar](1000) NULL,
	[CountryId] [int] NULL,
	[Active] [char](1) NOT NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL,
	[RecordDeleted] [char](1) NOT NULL,
	[DeletedBy] [varchar](50) NULL,
	[DeletedDate] [datetime] NULL,
	
 CONSTRAINT [PK_Students] PRIMARY KEY CLUSTERED 
(
	[StudentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Students] ADD  CONSTRAINT [DF_Students_Active]  DEFAULT ('Y') FOR [Active]
GO

ALTER TABLE [dbo].[Students] ADD  CONSTRAINT [DF_Students_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO

ALTER TABLE [dbo].[Students] ADD  CONSTRAINT [DF_Students_RecordDeleted]  DEFAULT ('N') FOR [RecordDeleted]
GO

ALTER TABLE [dbo].[Students]  WITH CHECK ADD  CONSTRAINT [FK_Students_Packages_PackageId] FOREIGN KEY([PackageId])
REFERENCES [dbo].[Packages] ([PackageId])
GO

ALTER TABLE [dbo].[Students] CHECK CONSTRAINT [FK_Students_Packages_PackageId]
GO

ALTER TABLE [dbo].[Students]  WITH CHECK ADD  CONSTRAINT [FK_Students_Users_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO

ALTER TABLE [dbo].[Students] CHECK CONSTRAINT [FK_Students_Users_UserId]
GO

ALTER TABLE [dbo].[Students]  WITH CHECK ADD  CONSTRAINT [FK_Students_Countries_CountryId] FOREIGN KEY([CountryId])
REFERENCES [dbo].[Countries] ([CountryId])
GO

ALTER TABLE [dbo].[Students] CHECK CONSTRAINT [FK_Students_Countries_CountryId]
GO

