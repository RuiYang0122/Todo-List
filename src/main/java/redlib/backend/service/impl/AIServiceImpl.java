package redlib.backend.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import redlib.backend.service.AIService;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.Duration;

@Service
@Slf4j
public class AIServiceImpl implements AIService {
    @Value("${ai.api.key}")
    private String apiKey;
    
    @Value("${ai.api.url}")
    private String baseUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String generateSuggestion(String prompt) {
        try {
            // 检查配置
            if (apiKey == null || apiKey.isEmpty()) {
                log.error("API key is not configured");
                throw new RuntimeException("API密钥未配置");
            }

            // 构建请求体
            Map<String, Object> payload = new HashMap<>();
            payload.put("model", "doubao-1-5-lite-32k-250115");
            payload.put("messages", List.of(
                Map.of(
                    "role", "system",
                    "content", "你是一个专业的任务管理助手，擅长分析和规划任务。"
                ),
                Map.of(
                    "role", "user",
                    "content", prompt
                )
            ));

            String requestBody = objectMapper.writeValueAsString(payload);
            log.info("Request payload: {}", requestBody);

            // 创建 HTTP 客户端
            HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();

            // 创建请求
            HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(baseUrl + "/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

            // 发送请求
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // 检查响应
            if (response.statusCode() != 200) {
                log.error("API error: status={}, body={}", response.statusCode(), response.body());
                throw new RuntimeException("API返回错误: " + response.statusCode());
            }

            // 解析响应
            JsonNode responseNode = objectMapper.readTree(response.body());
            return responseNode.path("choices")
                .get(0)
                .path("message")
                .path("content")
                .asText();

        } catch (Exception e) {
            log.error("AI API调用失败: {}", e.getMessage(), e);
            throw new RuntimeException("AI服务调用失败: " + e.getMessage());
        }
    }
} 