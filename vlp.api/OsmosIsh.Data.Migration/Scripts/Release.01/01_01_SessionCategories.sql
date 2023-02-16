

/****** Object:  Table [dbo].[SessionCategories]    Script Date: 2020-06-02 10:30:35 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[SessionCategories](
	[SessionCategoryId] [int] IDENTITY(1,1) NOT NULL,
	[ParentId] [int] NULL,
	[SessionCategoryName] [varchar](50) NULL,
	[Active] [char](1) NOT NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_SessionCategories] PRIMARY KEY CLUSTERED 
(
	[SessionCategoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[SessionCategories] ADD  CONSTRAINT [DF_SessionCategories_Active]  DEFAULT ('Y') FOR [Active]
GO

ALTER TABLE [dbo].[SessionCategories] ADD  CONSTRAINT [DF_SessionCategories_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO


