package redlib.backend.service;

public interface AIService {
    /**
     * 生成AI建议
     * @param prompt 提示词
     * @return AI生成的建议
     */
    String generateSuggestion(String prompt);
} 