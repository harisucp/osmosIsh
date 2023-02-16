
/****** Object:  Table [dbo].[GlobalCodes]    Script Date: 2020-06-02 10:26:38 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[GlobalCodes](
	[GlobalCodeId] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[CategoryId] [int] NOT NULL,
	[CodeName] [varchar](250) NOT NULL,
	[Description] [varchar](255) NOT NULL,
	[Active] [char](1) NOT NULL,
	[CannotModifyNameOrDelete] [char](1) NOT NULL,
	[SortOrder] [int] NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL,
	[RecordDeleted] [char](1) NOT NULL,
	[DeletedBy] [varchar](50) NULL,
	[DeletedDate] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[GlobalCodeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[GlobalCodes] ADD  CONSTRAINT [DF_GlobalCodes_Active]  DEFAULT ('Y') FOR [Active]
GO

ALTER TABLE [dbo].[GlobalCodes] ADD  CONSTRAINT [DF_GlobalCodes_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO

ALTER TABLE [dbo].[GlobalCodes] ADD  CONSTRAINT [DF_GlobalCodes_RecordDeleted]  DEFAULT ('N') FOR [RecordDeleted]
GO

ALTER TABLE [dbo].[GlobalCodes]  WITH CHECK ADD  CONSTRAINT [GlobalCodes_GlobalCodeCategories_FK] FOREIGN KEY([CategoryId])
REFERENCES [dbo].[GlobalCodeCategories] ([CategoryId])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[GlobalCodes] CHECK CONSTRAINT [GlobalCodes_GlobalCodeCategories_FK]
GO


