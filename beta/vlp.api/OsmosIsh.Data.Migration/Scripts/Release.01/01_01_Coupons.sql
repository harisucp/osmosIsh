

/****** Object:  Table [dbo].[Coupons]    Script Date: 2020-06-02 10:24:54 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Coupons](
	[CouponId] [int] IDENTITY(1,1) NOT NULL,
	[Code] [varchar](10) NULL,
	[Discount] [decimal](18, 0) NULL,
	[Expiration] [datetime] NULL,
	[Active] [char](1) NOT NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NOT NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL,
	[RecordDeleted] [char](1) NOT NULL,
	[DeletedBy] [varchar](50) NULL,
	[DeletedDate] [datetime] NULL,
 CONSTRAINT [PK_Coupons] PRIMARY KEY CLUSTERED 
(
	[CouponId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Coupons] ADD  CONSTRAINT [DF_Coupons_Active]  DEFAULT ('Y') FOR [Active]
GO

ALTER TABLE [dbo].[Coupons] ADD  CONSTRAINT [DF_Coupons_CreatedDate]  DEFAULT (getdate()) FOR [CreatedDate]
GO

ALTER TABLE [dbo].[Coupons] ADD  CONSTRAINT [DF_Coupons_RecordDeleted]  DEFAULT ('N') FOR [RecordDeleted]
GO


