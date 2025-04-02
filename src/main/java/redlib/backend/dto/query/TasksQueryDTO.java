package redlib.backend.dto.query;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * @author Ray_Yang
 * @description 任务查询数据传输对象
 * @date 2025/3/31
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class TasksQueryDTO extends PageQueryDTO {

    /**
     * 任务标题，模糊匹配
     */
    private String taskName;

    /**
     * 任务分类，精确匹配
     */
    private String category;

    /**
     * 任务状态（"true": 已完成, "false": 未完成）
     */
    private String status;
    
    /**
     * 截止日期开始时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date startDate;
    
    /**
     * 截止日期结束时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date endDate;

    /**
     * 排序字段
     */
    private String orderBy;
}