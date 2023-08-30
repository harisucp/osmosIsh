
/****** Object:  Table [dbo].[Reviews]    Script Date: 2020-06-02 10:28:24 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Reviews](
	[ReviewId] [int] IDENTITY(1,1) NOT NULL,
	[SessionId] [int] NOT NULL,
	[StudentId] [int] NOT NULL,
	[Comments] [varchar](max) NULL,
	[Active] [char](1) NOT NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL,
	[RecordDeleted] [char](1) NOT NULL,
	[DeletedBy] [varchar](50) NULL,
	[DeletedDate] [datetime] NULL,
 CONSTRAINT [PK_Reviews] PRIMARY KEY CLUSTERED 
(
	[ReviewId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[Reviews] ADD  CONSTRAINT [DF_Reviews_Active]  DEFAULT ('Y') FOR [Active]
GO

ALTER TABLE [dbo].[Reviews] ADD  CONSTRAINT [DF_Reviews_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO

ALTER TABLE [dbo].[Reviews] ADD  CONSTRAINT [DF_Reviews_RecordDeleted]  DEFAULT ('N') FOR [RecordDeleted]
GO

ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD  CONSTRAINT [FK_Reviews_Session_SessionId] FOREIGN KEY([SessionId])
REFERENCES [dbo].[Session] ([SessionId])
GO

ALTER TABLE [dbo].[Reviews] CHECK CONSTRAINT [FK_Reviews_Session_SessionId]
GO

ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD  CONSTRAINT [FK_Reviews_Students_StudentId] FOREIGN KEY([StudentId])
REFERENCES [dbo].[Students] ([StudentId])
GO

ALTER TABLE [dbo].[Reviews] CHECK CONSTRAINT [FK_Reviews_Students_StudentId]
GO


