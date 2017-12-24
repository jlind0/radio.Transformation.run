using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using trasformation.run.Radio.Models;

namespace trasformation.run.Radio.Controllers
{
    public class HomeController : Controller
    {
        [Route("{tenant?}")]
        public IActionResult Index(string tenant = "jason")
        {
            return View((object)tenant);
        }
        
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
