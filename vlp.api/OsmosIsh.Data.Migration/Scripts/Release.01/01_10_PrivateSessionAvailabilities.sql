/****** Object:  Table [dbo].[PrivateSessionAvailabilities]    Script Date: 06/17/2020 11:02:06 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PrivateSessionAvailabilities](
	[PrivateSessionAvailabilityId] [int] IDENTITY(1,1) NOT NULL,
	[TeacherId] [int] NOT NULL,
	[WeekDay] [int] NOT NULL,
	[StartDateTime] [datetime] NOT NULL,
	[EndDateTime] [datetime] NOT NULL,
	[CreateDate] [datetime] NOT NULL,
 CONSTRAINT [PK_PrivateSessionAvailabilities] PRIMARY KEY CLUSTERED 
(
	[PrivateSessionAvailabilityId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[PrivateSessionAvailabilities] ADD  CONSTRAINT [DF_PrivateSessionAvailabilities_CreateDate]  DEFAULT (getdate()) FOR [CreateDate]
GO

ALTER TABLE [dbo].[PrivateSessionAvailabilities]  WITH CHECK ADD  CONSTRAINT [FK_PrivateSessionAvailabilities_GlobalCodes_WeekDay] FOREIGN KEY([WeekDay])
REFERENCES [dbo].[GlobalCodes] ([GlobalCodeId])
GO

ALTER TABLE [dbo].[PrivateSessionAvailabilities] CHECK CONSTRAINT [FK_PrivateSessionAvailabilities_GlobalCodes_WeekDay]
GO

ALTER TABLE [dbo].[PrivateSessionAvailabilities]  WITH CHECK ADD  CONSTRAINT [FK_PrivateSessionAvailabilities_Teachers_TeacherId] FOREIGN KEY([TeacherId])
REFERENCES [dbo].[Teachers] ([TeacherId])
GO

ALTER TABLE [dbo].[PrivateSessionAvailabilities] CHECK CONSTRAINT [FK_PrivateSessionAvailabilities_Teachers_TeacherId]
GO


