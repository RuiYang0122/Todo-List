package redlib.backend.vo;

import lombok.Data;

import java.util.Date;

/**
 * @author Ray_Yang
 * @description 任务视图对象
 * @date 2025/3/31
 */
@Data
public class TasksVO {
    /**
     * 任务ID
     */
    private Integer id;

    /**
     * 任务标题
     */
    private String title;

    /**
     * 任务描述
     */
    private String description;

    /**
     * 截止日期
     */
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
     * 创建日期
     */
    private Date createdAt;

    /**
     * 修改日期
     */
    private Date updatedAt;

    /**
     * 创建人
     */
    private Integer createdBy;

    /**
     * 创建人名称
     */
    private String createdByDesc;

    /**
     * 更新人ID
     */
    private Integer updatedBy;

    /**
     * 更新人姓名
     */
    private String updatedByDesc;

    /**
     * 是否为今日任务
     */
    private Boolean isTodayTask;
}