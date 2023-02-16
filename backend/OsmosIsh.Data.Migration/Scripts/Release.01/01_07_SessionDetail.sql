/****** Object:  Table [dbo].[SessionDetail]    Script Date: 06/12/2020 11:00:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SessionDetail](
	[SessionDetailId] [int] IDENTITY(1,1) NOT NULL,
	[SessionId] [int] NOT NULL,
	[SessionTitle] [varchar](255) NOT NULL,
	[Status] [int] NULL,
	[TimeZone] [int] NOT NULL,
	[NumberOfJoineesAllowed] [int] NOT NULL,
	[NumberOfJoineesEnrolled] [int] NOT NULL,
	[SessionFee] [decimal](18, 0) NOT NULL,
	[Language] [varchar](255) NULL,
	[SessionCategoryId] [int] NOT NULL,
	[SessionTags] [varchar](1000) NULL,
	[Description] [varchar](max) NULL,
	[Active] [char](1) NOT NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL,
	[RecordDeleted] [char](1) NOT NULL,
	[DeletedBy] [varchar](50) NULL,
	[DeletedDate] [datetime] NULL,
 CONSTRAINT [PK_SessionDetail] PRIMARY KEY CLUSTERED 
(
	[SessionDetailId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[SessionDetail] ADD  CONSTRAINT [DF_SessionDetail_NumberOfJoineesAllowed]  DEFAULT ((5)) FOR [NumberOfJoineesAllowed]
GO
ALTER TABLE [dbo].[SessionDetail] ADD  CONSTRAINT [DF_SessionDetail_NumberOfJoineesEnrolled]  DEFAULT ((0)) FOR [NumberOfJoineesEnrolled]
GO
ALTER TABLE [dbo].[SessionDetail] ADD  CONSTRAINT [DF_SessionDetail_Active]  DEFAULT ('Y') FOR [Active]
GO
ALTER TABLE [dbo].[SessionDetail] ADD  CONSTRAINT [DF_SessionDetail_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[SessionDetail] ADD  CONSTRAINT [DF_SessionDetail_RecordDeleted]  DEFAULT ('N') FOR [RecordDeleted]
GO
ALTER TABLE [dbo].[SessionDetail]  WITH CHECK ADD  CONSTRAINT [FK_SessionDetail_GlobalCodes] FOREIGN KEY([TimeZone])
REFERENCES [dbo].[GlobalCodes] ([GlobalCodeId])
GO
ALTER TABLE [dbo].[SessionDetail] CHECK CONSTRAINT [FK_SessionDetail_GlobalCodes]
GO
ALTER TABLE [dbo].[SessionDetail]  WITH CHECK ADD  CONSTRAINT [FK_SessionDetail_GlobalCodes_Status] FOREIGN KEY([Status])
REFERENCES [dbo].[GlobalCodes] ([GlobalCodeId])
GO
ALTER TABLE [dbo].[SessionDetail] CHECK CONSTRAINT [FK_SessionDetail_GlobalCodes_Status]
GO
ALTER TABLE [dbo].[SessionDetail]  WITH CHECK ADD  CONSTRAINT [FK_SessionDetail_Session_SessionId] FOREIGN KEY([SessionId])
REFERENCES [dbo].[Session] ([SessionId])
GO
ALTER TABLE [dbo].[SessionDetail] CHECK CONSTRAINT [FK_SessionDetail_Session_SessionId]
GO
