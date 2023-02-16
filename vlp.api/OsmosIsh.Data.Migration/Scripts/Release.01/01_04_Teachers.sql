/****** Object:  Table [dbo].[Teachers]    Script Date: 06/12/2020 11:00:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Teachers](
	[TeacherId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NULL,
	[DateOfBirth] [date] NULL,
	[PhoneNumber] [varchar](20) NULL,
	[Qualification] [varchar](1000) NULL,
	[Awards] [varchar](1000) NULL,
	[Specialization] [varchar](1000) NULL,
	[Education] [varchar](1000) NULL,
	[Hobbies] [varchar](1000) NULL,
	[Interest] [varchar](1000) NULL,
	[Description] [varchar](max) NULL,
	[PrivateSession] [char](1) NOT NULL,
	[NumberOfPublishedCourse] [int] NULL,
	[SocialLinks] [varchar](1000) NULL,
	[WebSite] [varchar](1000) NULL,
	[PackageId] [int] NULL,
	[Languages] [varchar](1000) NULL,
	[SessionDeliveredCount] [int] NULL,
	[CountryId] [int] NULL,
	[Active] [char](1) NOT NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL,
	[RecordDeleted] [char](1) NOT NULL,
	[DeletedBy] [varchar](50) NULL,
	[DeletedDate] [datetime] NULL,
 CONSTRAINT [PK_Teachers] PRIMARY KEY CLUSTERED 
(
	[TeacherId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[Teachers] ADD  CONSTRAINT [DF_Teachers_Active]  DEFAULT ('Y') FOR [Active]
GO
ALTER TABLE [dbo].[Teachers] ADD  CONSTRAINT [DF_Teachers_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[Teachers] ADD  CONSTRAINT [DF_Teachers_RecordDeleted]  DEFAULT ('N') FOR [RecordDeleted]
GO
ALTER TABLE [dbo].[Teachers] ADD  DEFAULT ('N') FOR [PrivateSession]
GO
ALTER TABLE [dbo].[Teachers]  WITH CHECK ADD  CONSTRAINT [FK_Teachers_Packages_PackageId] FOREIGN KEY([PackageId])
REFERENCES [dbo].[Packages] ([PackageId])
GO
ALTER TABLE [dbo].[Teachers] CHECK CONSTRAINT [FK_Teachers_Packages_PackageId]
GO
ALTER TABLE [dbo].[Teachers]  WITH CHECK ADD  CONSTRAINT [FK_Teachers_Users_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[Teachers] CHECK CONSTRAINT [FK_Teachers_Users_UserId]
GO

ALTER TABLE [dbo].[Teachers]  WITH CHECK ADD  CONSTRAINT [FK_Teachers_Countries_CountryId] FOREIGN KEY([CountryId])
REFERENCES [dbo].[Countries] ([CountryId])
GO

ALTER TABLE [dbo].[Teachers] CHECK CONSTRAINT [FK_Teachers_Countries_CountryId]
GO