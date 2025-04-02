package redlib.backend.service;

import org.apache.poi.ss.usermodel.Workbook;
import redlib.backend.annotation.NeedNoPrivilege;
import redlib.backend.dto.TasksDTO;
import redlib.backend.dto.query.TasksQueryDTO;
import redlib.backend.model.Page;
import redlib.backend.vo.TasksVO;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * 任务模块服务接口
 *
 * @author Ray_Yang
 * @date 2025/3/31
 */

public interface TasksService {
    Page<TasksVO> listByPage(TasksQueryDTO queryDTO);

    /**
     * 获取今日任务列表
     * @param queryDTO 查询条件
     * @return 分页数据
     */
    Page<TasksVO> listTodayTasks(TasksQueryDTO queryDTO);

    /**
     * 新建任务
     *
     * @param tasksDTO 任务输入对象
     * @return 任务编码
     */
    Integer addTask(TasksDTO tasksDTO);

    TasksDTO getById(Integer id);

    /**
     * 更新任务数据
     *
     * @param tasksDTO 任务输入对象
     * @return 任务编码
     */
    Integer updateTasks(TasksDTO tasksDTO);

    /**
     * 根据编码列表，批量删除任务
     *
     * @param ids 编码列表
     */
    void deleteByCodes(List<Integer> ids);

    /**
     * 设置/取消今日任务
     * @param id 任务ID
     * @param isTodayTask 是否设为今日任务
     * @return 任务ID
     */
    Integer setTodayTask(Integer id, Boolean isTodayTask);

    /**
     * 删除所有已完成的任务
     * @return 删除的任务数量
     */
    Integer deleteCompletedTasks();

    /**
     * 获取任务完成情况统计
     * @return 统计数据
     */
    Map<String, Object> getTaskCompletionStats();
}