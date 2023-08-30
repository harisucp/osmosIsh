-- =============================================    
-- Author:  Saddam    
-- Create date: 20-06-2020    
-- Description: Update Available slots.    
-- =============================================    
-- '[{"StartDateTime":"2020-06-19 14:00","EndDateTime":"2020-06-19 14:30"},{"StartDateTime":"2020-06-19 16:00","EndDateTime":"2020-06-19 16:30"}]'    

CREATE PROCEDURE [dbo].[sp_UpdateTeacherSlots] @teacherid AS int, @json AS varchar(max)
AS
BEGIN    
    -- Read data from json and store them in temp table.    
    SELECT StartDateTime, 
           EndDateTime
    INTO #TempPrivateSessionSlots
      FROM OPENJSON(@json) WITH(StartDateTime datetime '$.StartDateTime', EndDateTime datetime '$.EndDateTime') AS xm;

    -- Delete all modified existing records for particular teachers.    
    UPDATE PrivateSessionSlots
      SET 
          RecordDeleted = 'Y', 
          DeletedDate = GETDATE()
     WHERE PrivateSessionSlotId NOT IN
                                      (
                                       SELECT PrivateSessionSlotId
                                         FROM PrivateSessionSlots AS PS
                                         INNER JOIN #TempPrivateSessionSlots AS TPS ON PS.StartDateTime = TPS.StartDateTime
                                                                                       AND PS.EndDateTime = TPS.EndDateTime
                                                                                       AND TeacherId = @teacherid
                                                                                       AND RecordDeleted = 'N'
                                      );

    -- Insert those record which modified and not exists in the table.    
    INSERT INTO PrivateSessionSlots(StartDateTime, 
                                    EndDateTime, 
                                    TeacherId)
    SELECT StartDateTime, 
           EndDateTime, 
           @teacherid
      FROM #TempPrivateSessionSlots
     WHERE NOT EXISTS
                     (
                      SELECT StartDateTime, 
                             EndDateTime
                        FROM PrivateSessionSlots
                       WHERE PrivateSessionSlots.StartDateTime = #TempPrivateSessionSlots.StartDateTime
                             AND PrivateSessionSlots.EndDateTime = #TempPrivateSessionSlots.EndDateTime
                             AND RecordDeleted = 'N'
                     );
END;