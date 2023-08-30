

/****** Object:  Table [dbo].[APILogs]    Script Date: 2020-06-02 10:24:15 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[APILogs](
	[APILogId] [int] IDENTITY(1,1) NOT NULL,
	[APIUrl] [varchar](500) NULL,
	[APIParams] [varchar](max) NULL,
	[Headers] [varchar](max) NULL,
	[Method] [varchar](10) NULL,
	[Success] [bit] NOT NULL,
	[StartDateTime] [datetime] NULL,
	[EndDateTime] [datetime] NULL,
	[ErrorLogId] [int] NULL,
 CONSTRAINT [PK_APILog] PRIMARY KEY CLUSTERED 
(
	[APILogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[APILogs]  WITH CHECK ADD  CONSTRAINT [FK_APILogs_PK_ErrorLogs_ErrorId] FOREIGN KEY([ErrorLogId])
REFERENCES [dbo].[ErrorLogs] ([ErrorLogId])
GO

ALTER TABLE [dbo].[APILogs] CHECK CONSTRAINT [FK_APILogs_PK_ErrorLogs_ErrorId]
GO


