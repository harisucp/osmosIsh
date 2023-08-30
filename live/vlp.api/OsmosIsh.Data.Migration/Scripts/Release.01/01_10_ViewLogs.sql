
/****** Object:  Table [dbo].[ViewLogs]    Script Date: 06/17/2020 11:24:59 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ViewLogs](
	[ViewLogId] [int] IDENTITY(1,1) NOT NULL,
	[RefrenceId] [int] NOT NULL,
	[RefrenceType] [int] NOT NULL,
	[StudentId] [int] NOT NULL,
	[Active] [char](1) NOT NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NOT NULL,
	[RecordDeleted] [char](1) NOT NULL,
	[DeletedBy] [varchar](50) NULL,
	[DeletedDate] [datetime] NULL,
 CONSTRAINT [PK_ViewLogs] PRIMARY KEY CLUSTERED 
(
	[ViewLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[ViewLogs] ADD  CONSTRAINT [DF_ViewLogs_Active]  DEFAULT ('Y') FOR [Active]
GO

ALTER TABLE [dbo].[ViewLogs] ADD  CONSTRAINT [DF_ViewLogs_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO

ALTER TABLE [dbo].[ViewLogs] ADD  CONSTRAINT [DF_ViewLogs_RecordDeleted]  DEFAULT ('N') FOR [RecordDeleted]
GO

ALTER TABLE [dbo].[ViewLogs]  WITH CHECK ADD  CONSTRAINT [FK_ViewLogs_GlobalCodes_RefrenceType] FOREIGN KEY([RefrenceType])
REFERENCES [dbo].[GlobalCodes] ([GlobalCodeId])
GO

ALTER TABLE [dbo].[ViewLogs] CHECK CONSTRAINT [FK_ViewLogs_GlobalCodes_RefrenceType]
GO

ALTER TABLE [dbo].[ViewLogs]  WITH CHECK ADD  CONSTRAINT [FK_ViewLogs_Students_StudentId] FOREIGN KEY([StudentId])
REFERENCES [dbo].[Students] ([StudentId])
GO

ALTER TABLE [dbo].[ViewLogs] CHECK CONSTRAINT [FK_ViewLogs_Students_StudentId]
GO

