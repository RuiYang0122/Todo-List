package redlib.backend.service.impl;

import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;
import redlib.backend.dao.TasksMapper;
import redlib.backend.dto.TasksDTO;
import redlib.backend.dto.query.TasksQueryDTO;
import redlib.backend.model.Tasks;
import redlib.backend.model.Page;
import redlib.backend.model.Token;
import redlib.backend.service.AdminService;
import redlib.backend.service.TasksService;
import redlib.backend.service.utils.TasksUtils;
import redlib.backend.utils.FormatUtils;
import redlib.backend.utils.PageUtils;
import redlib.backend.utils.ThreadContextHolder;
import redlib.backend.utils.XlsUtils;
import redlib.backend.vo.TasksVO;

import java.io.InputStream;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class TasksServiceImpl implements TasksService {

    @Autowired
    private TasksMapper tasksMapper;

    @Autowired
    private AdminService adminService;

    /**
     * 分页获取任务信息
     *
     * @param queryDTO 查询条件和分页信息
     * @return 带分页信息的任务数据列表
     */
    @Override
    public Page<TasksVO> listByPage(TasksQueryDTO queryDTO) {
        // 1. 初始化查询参数
        if (queryDTO == null) {
            queryDTO = new TasksQueryDTO();
        }
        
        // 2. 处理模糊查询参数
        if (queryDTO.getTaskName() != null) {
            queryDTO.setTaskName(FormatUtils.makeFuzzySearchTerm(queryDTO.getTaskName()));
        }
        
        // 3. 查询总记录数
        Integer total = tasksMapper.count(queryDTO);
        PageUtils pageUtils = new PageUtils(queryDTO.getCurrent(), queryDTO.getPageSize(), total);
        
        // 4. 如果没有数据，返回空页
        if (total == 0) {
            return pageUtils.getNullPage();
        }
        
        // 5. 查询分页数据
        List<Tasks> list = tasksMapper.list(queryDTO, pageUtils.getOffset(), pageUtils.getLimit());
        
        // 6. 获取用户信息
        Set<Integer> userIds = list.stream()
            .flatMap(task -> Stream.of(task.getCreatedBy(), task.getUpdatedBy()))
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        Map<Integer, String> userMap = adminService.getNameMap(userIds);
        
        // 7. 转换为VO对象
        List<TasksVO> voList = list.stream()
            .map(task -> TasksUtils.convertToVO(task, userMap))
            .collect(Collectors.toList());
        
        // 8. 返回分页结果
        return new Page<>(
            pageUtils.getCurrent(),
            pageUtils.getPageSize(),
            pageUtils.getTotal(),
            voList
        );
    }

    /**
     * 新建任务
     *
     * @param tasksDTO 任务输入对象
     * @return 任务编码
     */
    @Override
    public Integer addTask(TasksDTO tasksDTO) {
        Token token = ThreadContextHolder.getToken();
        // 校验输入数据正确性
        TasksUtils.validateTasks(tasksDTO);
        // 创建实体对象
        Tasks tasks = new Tasks();
        // 复制属性
        BeanUtils.copyProperties(tasksDTO, tasks);
        tasks.setCreatedAt(new Date());
        tasks.setUpdatedAt(new Date());
        tasks.setCreatedBy(token.getUserId());
        tasks.setUpdatedBy(token.getUserId());
        // 如果状态为空,设置默认值
        if(tasks.getStatus() == null) {
            tasks.setStatus("false"); // 默认未完成，使用字符串
        }
        // 保存到数据库
        tasksMapper.insert(tasks);
        return tasks.getId();
    }

    @Override
    public TasksDTO getById(Integer id) {
        Assert.notNull(id, "请提供id");
        Assert.notNull(id, "任务id不能为空");
        Tasks tasks = tasksMapper.selectByPrimaryKey(id);
        Assert.notNull(tasks, "id不存在");
        TasksDTO dto = new TasksDTO();
        BeanUtils.copyProperties(tasks, dto);
        return dto;
    }

    /**
     * 更新任务数据
     *
     * @param tasksDTO 任务输入对象
     * @return 任务编码
     */
    @Override
    public Integer updateTasks(TasksDTO tasksDTO) {
        // 校验输入数据正确性
        Token token = ThreadContextHolder.getToken();
        Assert.notNull(tasksDTO.getId(), "任务id不能为空");
        Tasks tasks = tasksMapper.selectByPrimaryKey(tasksDTO.getId());
        Assert.notNull(tasks, "没有找到任务，Id为：" + tasksDTO.getId());

        // 如果只更新状态，则只更新状态字段
        if (tasksDTO.getStatus() != null && 
            tasksDTO.getTitle() == null && 
            tasksDTO.getDescription() == null && 
            tasksDTO.getCategory() == null && 
            tasksDTO.getDueDate() == null) {
            // 直接设置状态，不进行类型转换
            tasks.setStatus(tasksDTO.getStatus());
        } else {
            // 常规更新，验证必填字段
            TasksUtils.validateTasks(tasksDTO);
            BeanUtils.copyProperties(tasksDTO, tasks);
        }
        
        tasks.setUpdatedBy(token.getUserId());
        tasks.setUpdatedAt(new Date());
        tasksMapper.updateByPrimaryKey(tasks);
        return tasks.getId();
    }

    /**
     * 根据编码列表，批量删除任务
     *
     * @param ids 编码列表
     */
    @Override
    public void deleteByCodes(List<Integer> ids) {
        Assert.notEmpty(ids, "任务id列表不能为空");
        tasksMapper.deleteByCodes(ids);
    }

    @Override
    public Page<TasksVO> listTodayTasks(TasksQueryDTO queryDTO) {
        if (queryDTO == null) {
            queryDTO = new TasksQueryDTO();
        }
        
        Integer total = tasksMapper.countTodayTasks(queryDTO);
        PageUtils pageUtils = new PageUtils(queryDTO.getCurrent(), queryDTO.getPageSize(), total);
        
        if (total == 0) {
            return pageUtils.getNullPage();
        }
        
        List<Tasks> list = tasksMapper.listTodayTasks(queryDTO, pageUtils.getOffset(), pageUtils.getLimit());
        
        Set<Integer> userIds = list.stream()
            .flatMap(task -> Stream.of(task.getCreatedBy(), task.getUpdatedBy()))
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        Map<Integer, String> userMap = adminService.getNameMap(userIds);
        
        List<TasksVO> voList = list.stream()
            .map(task -> TasksUtils.convertToVO(task, userMap))
            .collect(Collectors.toList());
        
        return new Page<>(
            pageUtils.getCurrent(),
            pageUtils.getPageSize(),
            pageUtils.getTotal(),
            voList
        );
    }

    @Override
    public Integer setTodayTask(Integer id, Boolean isTodayTask) {
        Token token = ThreadContextHolder.getToken();
        Assert.notNull(id, "任务id不能为空");
        
        Tasks tasks = tasksMapper.selectByPrimaryKey(id);
        Assert.notNull(tasks, "没有找到任务，Id为：" + id);
        
        tasks.setIsTodayTask(isTodayTask);
        tasks.setUpdatedBy(token.getUserId());
        tasks.setUpdatedAt(new Date());
        
        tasksMapper.updateByPrimaryKey(tasks);
        return tasks.getId();
    }

    @Override
    @Transactional
    public Integer deleteCompletedTasks() {
        return tasksMapper.deleteCompleted();
    }

    @Override
    public Map<String, Object> getTaskCompletionStats() {
        Map<String, Object> stats = tasksMapper.getTaskCompletionStats();
        return stats;
    }

}