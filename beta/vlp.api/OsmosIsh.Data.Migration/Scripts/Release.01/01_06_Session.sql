/****** Object:  Table [dbo].[Session]    Script Date: 06/12/2020 11:00:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Session](
	[SessionId] [int] IDENTITY(1,1) NOT NULL,
	[SeriesId] [int] NULL,
	[TeacherId] [int] NOT NULL,
	[StartTime] [datetime] NOT NULL,
	[EndTime] [datetime] NOT NULL,
	[Duration] [int] NOT NULL,
	[Active] [char](1) NOT NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL,
	[RecordDeleted] [char](1) NOT NULL,
	[DeletedBy] [varchar](50) NULL,
	[DeletedDate] [datetime] NULL,
 CONSTRAINT [PK_Session] PRIMARY KEY CLUSTERED 
(
	[SessionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Session] ADD  CONSTRAINT [DF_Session_Active]  DEFAULT ('Y') FOR [Active]
GO
ALTER TABLE [dbo].[Session] ADD  CONSTRAINT [DF_Session_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[Session] ADD  CONSTRAINT [DF_Session_RecordDeleted]  DEFAULT ('N') FOR [RecordDeleted]
GO
ALTER TABLE [dbo].[Session]  WITH CHECK ADD  CONSTRAINT [FK_Session_Series_SeriesId] FOREIGN KEY([SeriesId])
REFERENCES [dbo].[Series] ([SeriesId])
GO
ALTER TABLE [dbo].[Session] CHECK CONSTRAINT [FK_Session_Series_SeriesId]
GO
ALTER TABLE [dbo].[Session]  WITH CHECK ADD  CONSTRAINT [FK_Session_Teachers_TeacherId] FOREIGN KEY([TeacherId])
REFERENCES [dbo].[Teachers] ([TeacherId])
GO
ALTER TABLE [dbo].[Session] CHECK CONSTRAINT [FK_Session_Teachers_TeacherId]
GO
