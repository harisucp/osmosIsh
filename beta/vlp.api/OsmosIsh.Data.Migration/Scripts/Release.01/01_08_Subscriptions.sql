/****** Object:  Table [dbo].[Subscriptions]    Script Date: 06/12/2020 11:00:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Subscriptions](
	[SubscriptionId] [int] IDENTITY(1,1) NOT NULL,
	[Email] [varchar](255) NOT NULL,
	[FirstName] [varchar](50) NULL,
	[LastName] [varchar](50) NULL,
	[UserTypeId] [int] NULL,
	[Active] [char](1) NOT NULL,
	[SubscriptionDate] [date] NOT NULL,
	[UnSubscriptionDate] [date] NULL,
 CONSTRAINT [PK_Subscriptions] PRIMARY KEY CLUSTERED 
(
	[SubscriptionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Subscriptions] ADD  CONSTRAINT [DF_Subscriptions_Active]  DEFAULT ('Y') FOR [Active]
GO
ALTER TABLE [dbo].[Subscriptions] ADD  CONSTRAINT [DF_Subscriptions_SubscriptionDate]  DEFAULT (getdate()) FOR [SubscriptionDate]
GO
ALTER TABLE [dbo].[Subscriptions]  WITH CHECK ADD  CONSTRAINT [FK_Subscriptions_GlobalCodes_UserTypeId] FOREIGN KEY([UserTypeId])
REFERENCES [dbo].[GlobalCodes] ([GlobalCodeId])
GO
ALTER TABLE [dbo].[Subscriptions] CHECK CONSTRAINT [FK_Subscriptions_GlobalCodes_UserTypeId]
GO
