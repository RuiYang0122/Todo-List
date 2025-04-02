package redlib.backend.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import redlib.backend.annotation.BackendModule;
import redlib.backend.annotation.Privilege;
import redlib.backend.dto.TasksDTO;
import redlib.backend.dto.query.TasksQueryDTO;
import redlib.backend.model.Page;
import redlib.backend.service.TasksService;
import redlib.backend.vo.TasksVO;
import redlib.backend.vo.Result;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;

import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 任务管理后端服务模块
 *
 * @author Ray_Yang
 * @description 处理任务相关的HTTP请求
 * @date 2025/3/31
 */
@Slf4j
@RestController
@RequestMapping("/api/tasks")
@BackendModule({"page:任务列表", "add:新建任务", "update:更新任务", "delete:删除任务"})
public class TasksController {
    @Autowired
    private TasksService tasksService;

    @PostMapping("listTasks")
    @Privilege("page")
    public Page<TasksVO> listTasks(@RequestBody TasksQueryDTO queryDTO) {
        return tasksService.listByPage(queryDTO);
    }


    @PostMapping("addTasks")
    @Privilege("add")
    public Integer addTasks(@RequestBody TasksDTO tasksDTO) {
        return tasksService.addTask(tasksDTO);
    }


    @PostMapping("updateTasks")
    @Privilege("update")
    public Integer updateTasks(@RequestBody TasksDTO tasksDTO) {
        return tasksService.updateTasks(tasksDTO);
    }


    @GetMapping("getTasks")
    @Privilege("update")
    public TasksDTO getTasks(Integer id) {
        return tasksService.getById(id);
    }


    @PostMapping("deleteTasks")
    @Privilege("delete")
    public void deleteTasks(@RequestBody List<Integer> ids) {
        tasksService.deleteByCodes(ids);
    }


    @PostMapping("listTodayTasks")
    @Privilege("page")
    public Page<TasksVO> listTodayTasks(@RequestBody TasksQueryDTO queryDTO) {
        return tasksService.listTodayTasks(queryDTO);
    }


    @PostMapping("setTodayTask")
    @Privilege("edit")
    public Integer setTodayTask(@RequestBody Map<String, Object> params) {
        Integer id = (Integer) params.get("id");
        Boolean isTodayTask = (Boolean) params.get("isTodayTask");
        return tasksService.setTodayTask(id, isTodayTask);
    }

    /**
     * 删除所有已完成的任务
     * @return 删除的任务数量
     */
    @PostMapping("/deleteCompleted")
    @Privilege("delete")
    public Result<Integer> deleteCompletedTasks() {
        try {
            Integer count = tasksService.deleteCompletedTasks();
            return Result.success(count);
        } catch (Exception e) {
            log.error("删除已完成任务失败", e);
            return Result.error("删除已完成任务失败");
        }
    }

    @GetMapping("/stats/completion")
    @Operation(summary = "获取任务完成情况统计")
    @Privilege("page")
    public Result<Map<String, Object>> getTaskCompletionStats() {
        try {
            Map<String, Object> stats = tasksService.getTaskCompletionStats();
            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取任务统计失败", e);
            return Result.error("获取任务统计失败");
        }
    }
}