package redlib.backend.dao;

import org.apache.ibatis.annotations.Param;
import redlib.backend.dto.query.TasksQueryDTO;
import redlib.backend.model.Tasks;

import java.util.List;
import java.util.Map;

public interface TasksMapper {
    int deleteByPrimaryKey(Integer id);

    int insertSelective(Tasks record);

    int updateByPrimaryKeySelective(Tasks record);

    Tasks selectByPrimaryKey(Integer id);

    int insert(Tasks record);

    int updateByPrimaryKey(Tasks record);

    /**
     * 根据查询条件获取命中个数
     *
     * @param queryDTO 查询条件
     * @return 命中数量
     */
    Integer count(TasksQueryDTO queryDTO);

    /**
     * 根据查询条件获取任务列表
     *
     * @param queryDTO 查询条件
     * @param offset   开始位置
     * @param limit    记录数量
     * @return 任务列表
     */
    List<Tasks> list(@Param("queryDTO") TasksQueryDTO queryDTO, @Param("offset") Integer offset, @Param("limit") Integer limit);

    /**
     * 根据代码列表批量删除任务
     *
     * @param codeList id列表
     */
    void deleteByCodes(@Param("codeList") List<Integer> codeList);

    List<Tasks> listTodayTasks(@Param("queryDTO") TasksQueryDTO queryDTO, @Param("offset") Integer offset, @Param("limit") Integer limit);

    Integer countTodayTasks(TasksQueryDTO queryDTO);

    /**
     * 删除所有已完成的任务
     * @return 删除的记录数
     */
    Integer deleteCompleted();

    /**
     * 获取任务完成情况统计
     * @return 统计数据
     */
    Map<String, Object> getTaskCompletionStats();
}