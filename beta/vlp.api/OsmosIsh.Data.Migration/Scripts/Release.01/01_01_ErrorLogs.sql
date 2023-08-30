

/****** Object:  Table [dbo].[ErrorLogs]    Script Date: 2020-06-02 10:25:47 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ErrorLogs](
	[ErrorLogId] [int] IDENTITY(1,1) NOT NULL,
	[ExceptionMsg] [varchar](max) NULL,
	[ExceptionType] [varchar](max) NULL,
	[ExceptionSource] [varchar](max) NULL,
	[LogDateTime] [datetime] NULL,
 CONSTRAINT [PK_ErrorLogId] PRIMARY KEY CLUSTERED 
(
	[ErrorLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO


