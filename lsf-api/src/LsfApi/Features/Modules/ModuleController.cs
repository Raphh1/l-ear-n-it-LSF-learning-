using Microsoft.AspNetCore.Mvc;

namespace LsfApi.Features.Modules;

[ApiController]
[Route("api/modules")]
public class ModuleController(ModuleService moduleService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var modules = await moduleService.GetAllAsync();
        return Ok(modules);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await moduleService.GetByIdAsync(id);
        return result.IsSuccess ? Ok(result.Value) : NotFound();
    }
}
