package redlib.backend.model;

import lombok.Data;

import java.util.Collections;
import java.util.List;

/**
 * @author 李洪文
 * @description
 * @date 2019/11/14 16:12
 */
@Data
public class Page<T> {
    /**
     * 当前页码
     **/
    private Integer current;
    /**
     * 每页记录条数
     **/
    private Integer pageSize;
    /**
     * 总记录条数
     **/
    private Integer total;
    /**
     * 当前页需要的数据
     **/
    private List<T> list;

    public Page() {

    }

    public Page(Integer current, Integer pageSize, Integer total, List<T> list) {
        this.current = current;
        this.pageSize = pageSize;
        this.total = total;
        this.list = list;
    }

    public static Page getNullPage(Integer page, Integer pageSize) {
        return new Page(page, pageSize, 0, Collections.emptyList());
    }
}