using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace OsmosIsh.Core.DTOs.Response
{
    public class AdminBlockUnBlockTutorResponse
    {
        public string TeacherName { get; set; }
        public string TeacherEmail { get; set; }
    }
    public class AdminBlockUnBlockStudentResponse
    {
        public string StudentName { get; set; }
        public string StudentEmail { get; set; }
    }
}

