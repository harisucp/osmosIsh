/****** Object:  Table [dbo].[Favorites]    Script Date: 06/17/2020 1:57:28 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Favorites](
	[FavoriteId] [int] IDENTITY(1,1) NOT NULL,
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
 CONSTRAINT [PK_Favorites] PRIMARY KEY CLUSTERED 
(
	[FavoriteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Favorites] ADD  CONSTRAINT [DF_Favorites_Active]  DEFAULT ('Y') FOR [Active]
GO

ALTER TABLE [dbo].[Favorites] ADD  CONSTRAINT [DF_Favorites_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO

ALTER TABLE [dbo].[Favorites] ADD  CONSTRAINT [DF_Favorites_RecordDeleted]  DEFAULT ('N') FOR [RecordDeleted]
GO

ALTER TABLE [dbo].[Favorites]  WITH CHECK ADD  CONSTRAINT [FK_Favorites_GlobalCodes_RefrenceType] FOREIGN KEY([RefrenceType])
REFERENCES [dbo].[GlobalCodes] ([GlobalCodeId])
GO

ALTER TABLE [dbo].[Favorites] CHECK CONSTRAINT [FK_Favorites_GlobalCodes_RefrenceType]
GO

ALTER TABLE [dbo].[Favorites]  WITH CHECK ADD  CONSTRAINT [FK_Favorites_Students_StudentId] FOREIGN KEY([StudentId])
REFERENCES [dbo].[Students] ([StudentId])
GO

ALTER TABLE [dbo].[Favorites] CHECK CONSTRAINT [FK_Favorites_Students_StudentId]
GO

