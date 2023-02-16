/****** Object:  Table [dbo].[SeriesDetail]    Script Date: 06/12/2020 11:00:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SeriesDetail](
	[SeriesDetailId] [int] IDENTITY(1,1) NOT NULL,
	[SeriesId] [int] NOT NULL,
	[SeriesTitle] [varchar](255) NOT NULL,
	[NumberOfJoineesAllowed] [int] NOT NULL,
	[NumberOfJoineesEnrolled] [int] NOT NULL,
	[TimeZone] [int] NOT NULL,
	[Language] [varchar](255) NULL,
	[CanBeSubscribedAnyTime] [char](1) NOT NULL,
	[SeriesCategoryId] [int] NOT NULL,
	[SeriesTags] [varchar](1000) NULL,
	[Description] [varchar](max) NULL,
	[SeriesFee] [decimal](18, 2) NOT NULL,
	[NumberOfSessions] [int] NOT NULL,
	[Active] [char](1) NOT NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL,
	[RecordDeleted] [char](1) NOT NULL,
	[DeletedBy] [varchar](50) NULL,
	[DeletedDate] [datetime] NULL,
 CONSTRAINT [PK_SeriesDetail] PRIMARY KEY CLUSTERED 
(
	[SeriesDetailId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[SeriesDetail] ADD  CONSTRAINT [DF_SeriesDetail_NumberOfJoineesAllowed]  DEFAULT ((5)) FOR [NumberOfJoineesAllowed]
GO
ALTER TABLE [dbo].[SeriesDetail] ADD  CONSTRAINT [DF_SeriesDetail_NumberOfJoineesEnrolled]  DEFAULT ((0)) FOR [NumberOfJoineesEnrolled]
GO
ALTER TABLE [dbo].[SeriesDetail] ADD  CONSTRAINT [DF_SeriesDetail_CanBeSubscribedAnyTime]  DEFAULT ('N') FOR [CanBeSubscribedAnyTime]
GO
ALTER TABLE [dbo].[SeriesDetail] ADD  CONSTRAINT [DF_SeriesDetail_Active]  DEFAULT ('Y') FOR [Active]
GO
ALTER TABLE [dbo].[SeriesDetail] ADD  CONSTRAINT [DF_SeriesDetail_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[SeriesDetail] ADD  CONSTRAINT [DF_SeriesDetail_RecordDeleted]  DEFAULT ('N') FOR [RecordDeleted]
GO
ALTER TABLE [dbo].[SeriesDetail]  WITH CHECK ADD  CONSTRAINT [FK_SeriesDetail_GlobalCodes_TimeZone] FOREIGN KEY([TimeZone])
REFERENCES [dbo].[GlobalCodes] ([GlobalCodeId])
GO
ALTER TABLE [dbo].[SeriesDetail] CHECK CONSTRAINT [FK_SeriesDetail_GlobalCodes_TimeZone]
GO
ALTER TABLE [dbo].[SeriesDetail]  WITH CHECK ADD  CONSTRAINT [FK_SeriesDetail_Series_SeriesId] FOREIGN KEY([SeriesId])
REFERENCES [dbo].[Series] ([SeriesId])
GO
ALTER TABLE [dbo].[SeriesDetail] CHECK CONSTRAINT [FK_SeriesDetail_Series_SeriesId]
GO
ALTER TABLE [dbo].[SeriesDetail]  WITH CHECK ADD  CONSTRAINT [FK_SeriesDetail_SeriesCategoryId_SessionCategories_SessionCategoryId] FOREIGN KEY([SeriesCategoryId])
REFERENCES [dbo].[SessionCategories] ([SessionCategoryId])
GO
ALTER TABLE [dbo].[SeriesDetail] CHECK CONSTRAINT [FK_SeriesDetail_SeriesCategoryId_SessionCategories_SessionCategoryId]
GO
