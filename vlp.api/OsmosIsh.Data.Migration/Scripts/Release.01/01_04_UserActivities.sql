
/****** Object:  Table [dbo].[UserActivities]    Script Date: 2020-06-02 10:34:57 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[UserActivities](
	[UserActivityLogId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[Activity] [varchar](255) NULL,
	[ActivityDescription] [varchar](max) NULL,
	[ActivityDate] [date] NOT NULL,
 CONSTRAINT [PK_UserActivities] PRIMARY KEY CLUSTERED 
(
	[UserActivityLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[UserActivities] ADD  CONSTRAINT [DF_UserActivities_ActivityDate]  DEFAULT (getdate()) FOR [ActivityDate]
GO

ALTER TABLE [dbo].[UserActivities]  WITH CHECK ADD  CONSTRAINT [FK_UserActivities_Users_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO

ALTER TABLE [dbo].[UserActivities] CHECK CONSTRAINT [FK_UserActivities_Users_UserId]
GO


