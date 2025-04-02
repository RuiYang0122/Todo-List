package redlib.backend.dto;

import lombok.Data;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * @author Ray_Yang
 * @description 任务数据传输对象
 * @date 2025/3/31
 */
@Data
public class TasksDTO {
    private Integer id;

    /**
     * 任务标题
     */
    private String title;

    /**
     * 截止日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date dueDate;

    /**
     * 任务分类
     */
    private String category;

    /**
     * 任务状态（"true": 已完成, "false": 未完成）
     */
    private String status;

    /**
     * 任务描述
     */
    private String description;

    /**
     * 是否为今日任务
     */
    private Boolean isTodayTask;
}