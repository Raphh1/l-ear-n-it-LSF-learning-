using Microsoft.AspNetCore.Mvc;

namespace LsfApi.Features.Categories;

[ApiController]
[Route("api/categories")]
public class CategoryController(CategoryService categoryService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await categoryService.GetAllAsync();
        return Ok(categories);
    }
}
