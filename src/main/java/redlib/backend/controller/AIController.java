package redlib.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import io.swagger.v3.oas.annotations.Operation;
import redlib.backend.annotation.Privilege;
import redlib.backend.service.AIService;
import redlib.backend.vo.Result;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Slf4j
public class AIController {
    @Autowired
    private AIService aiService;

    @PostMapping("/suggest")
    @Operation(summary = "获取AI任务规划建议")
    @Privilege("page")
    public Result<String> getSuggestion(@RequestBody Map<String, String> params) {
        try {
            String suggestion = aiService.generateSuggestion(params.get("prompt"));
            return Result.success(suggestion);
        } catch (Exception e) {
            log.error("获取AI建议失败", e);
            return Result.error("获取AI建议失败");
        }
    }
} 