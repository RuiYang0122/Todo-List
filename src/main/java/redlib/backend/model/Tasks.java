package redlib.backend.model;

import lombok.Data;

import java.util.Date;

/**
 * 描述: tasks表的实体类
 * @version
 * @author:  Ray_Yang
 * @创建时间: 2025-03-31
 */
@Data
public class Tasks {
    /**
     * 主键（自增）
     */
    private Integer id;

    /**
     * 任务标题（必填）
     */
    private String title;

    /**
     * 任务描述（可选）
     */
    private String description;

    /**
     * 截止日期
     */

    private Date dueDate;

    /**
     * 任务分类（如"工作"）
     */
    private String category;

    /**
     * 任务状态（"true": 已完成, "false": 未完成）
     */
    private String status;

    /**
     * 创建日期
     */
    private Date createdAt;

    /**
     * 更新日期
     */
    private Date updatedAt;

    /**
     * 创建人代码
     */
    private Integer createdBy;

    /**
     * 更新人代码
     */
    private Integer updatedBy;

    /**
     * 是否为今日任务
     */
    private Boolean isTodayTask;
}