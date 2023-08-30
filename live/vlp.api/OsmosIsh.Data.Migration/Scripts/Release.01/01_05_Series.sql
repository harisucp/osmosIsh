/****** Object:  Table [dbo].[Series]    Script Date: 06/12/2020 11:00:22 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Series](
	[SeriesId] [int] IDENTITY(1,1) NOT NULL,
	[TeacherId] [int] NOT NULL,
	[StartDate] [datetime] NULL,
	[Enddate] [datetime] NULL,
	[Active] [char](1) NOT NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL,
	[RecordDeleted] [char](1) NOT NULL,
	[DeletedBy] [varchar](50) NULL,
	[DeletedDate] [datetime] NULL,
 CONSTRAINT [PK_Series] PRIMARY KEY CLUSTERED 
(
	[SeriesId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Series] ADD  CONSTRAINT [DF_Series_Active]  DEFAULT ('Y') FOR [Active]
GO
ALTER TABLE [dbo].[Series] ADD  CONSTRAINT [DF_Series_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[Series] ADD  CONSTRAINT [DF_Series_RecordDeleted]  DEFAULT ('N') FOR [RecordDeleted]
GO
ALTER TABLE [dbo].[Series]  WITH CHECK ADD  CONSTRAINT [FK_Series_Teachers_teacherId] FOREIGN KEY([TeacherId])
REFERENCES [dbo].[Teachers] ([TeacherId])
GO
ALTER TABLE [dbo].[Series] CHECK CONSTRAINT [FK_Series_Teachers_teacherId]
GO
