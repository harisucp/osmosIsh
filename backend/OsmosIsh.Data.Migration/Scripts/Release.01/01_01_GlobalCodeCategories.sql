

/****** Object:  Table [dbo].[GlobalCodeCategories]    Script Date: 2020-06-02 10:26:14 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[GlobalCodeCategories](
	[CategoryId] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[CategoryName] [varchar](250) NOT NULL,
	[AllowAddDelete] [char](1) NOT NULL,
	[AllowCodeNameEdit] [char](1) NOT NULL,
	[AllowSortOrderEdit] [char](1) NOT NULL,
	[Description] [varchar](255) NULL,
	[Active] [char](1) NOT NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL,
	[RecordDeleted] [char](1) NOT NULL,
	[DeletedBy] [varchar](50) NULL,
	[DeletedDate] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[CategoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[GlobalCodeCategories] ADD  CONSTRAINT [DF_GlobalCodeCategories_Active]  DEFAULT ('Y') FOR [Active]
GO

ALTER TABLE [dbo].[GlobalCodeCategories] ADD  CONSTRAINT [DF_GlobalCodeCategories_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO

ALTER TABLE [dbo].[GlobalCodeCategories] ADD  CONSTRAINT [DF_GlobalCodeCategories_RecordDeleted]  DEFAULT ('N') FOR [RecordDeleted]
GO


