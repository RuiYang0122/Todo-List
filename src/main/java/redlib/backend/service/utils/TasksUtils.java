package redlib.backend.service.utils;

import org.springframework.beans.BeanUtils;
import org.springframework.util.Assert;
import redlib.backend.dto.TasksDTO;
import redlib.backend.model.Tasks;
import redlib.backend.utils.FormatUtils;
import redlib.backend.vo.TasksVO;

import java.util.Map;

/**
 * @author Ray_Yang
 * @description 任务模块工具类（数据校验、实体转换）
 * @date 2025/3/31
 */
public class TasksUtils {

    // 定义状态常量
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_COMPLETED = "COMPLETED";

    /**
     * 规范并校验任务输入数据
     *
     * @param tasksDTO 任务输入对象
     */
    public static void validateTasks(TasksDTO tasksDTO) {
        // 修剪字符串字段并将空字符串转为null（如title、description）
        FormatUtils.trimFieldToNull(tasksDTO);

        // 基础校验：输入对象非空
        Assert.notNull(tasksDTO, "任务输入数据不能为空");

        // 必填字段校验：任务标题
        Assert.hasText(tasksDTO.getTitle(), "任务标题不能为空");

        // 状态值验证已经不需要了，因为Boolean类型只能是true/false/null
    }

    /**
     * 将任务实体对象转换为视图对象（含创建人名称）
     *
     * @param tasks 任务实体对象
     * @param nameMap 创建人ID到姓名的映射（key: 用户ID，value: 姓名）
     * @return 任务视图对象
     */
    public static TasksVO convertToVO(Tasks tasks, Map<Integer, String> nameMap) {
        TasksVO tasksVO = new TasksVO();
        BeanUtils.copyProperties(tasks, tasksVO);
        
        // 设置创建人描述
        String createdByDesc = nameMap.get(tasks.getCreatedBy());
        tasksVO.setCreatedByDesc(createdByDesc);
        
        // 处理状态
        tasksVO.setStatus(tasks.getStatus());
        
        return tasksVO;
    }

    // （可选）如果需要更简洁的属性复制，可使用BeanUtils（需确保字段名完全匹配）
    // public static TasksVO convertToVO(Tasks tasks, Map<Integer, String> nameMap) {
    //     TasksVO tasksVO = new TasksVO();
    //     BeanUtils.copyProperties(tasks, tasksVO);
    //     tasksVO.setCreatedByDesc(nameMap.getOrDefault(tasks.getCreatedBy(), "未知"));
    //     return tasksVO;
    // }
}