import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space, Tag, message, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import { PlusOutlined, DeleteOutlined, CheckOutlined, CalendarOutlined } from '@ant-design/icons';
import { listTasks, deleteTasks, updateTasks, setTodayTask, deleteCompletedTasks } from '@/services/api/tasks';
import { convertPageData, orderBy } from '@/utils/request';
import { openConfirm } from '@/utils/ui';
import { Link } from '@umijs/max';
import TaskInputDialog from './components/TaskInputDialog';

// 1. 首先定义一些统一的样式常量
const styles = {
  button: {
    borderRadius: '8px',
    transition: 'all 0.2s ease-in-out',
    fontWeight: 500
  },
  table: {
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  }
};

export default () => {
  const refAction = useRef<ActionType>(null);
  const [selectedRowKeys, selectRow] = useState<number[]>([]);
  const [task, setTask] = useState<API.TasksVO>();
  const [visible, setVisible] = useState(false);

  // 删除任务
  const handleDelete = async (taskIds: number[]) => {
    if (!taskIds || taskIds.length === 0) return;
    
    openConfirm(`您确定要删除选定的${taskIds.length}个任务吗？`, async () => {
      const result = await deleteTasks(taskIds);
      message.success(`成功删除了${result}条任务！`);
      refAction.current?.clearSelected!();
      refAction.current?.reload();
    });
  };

  // 添加到今日待办
  const handleAddToToday = async (taskIds: number[]) => {
    if (!taskIds || taskIds.length === 0) return;
    
    openConfirm(`您确定要将选定的${taskIds.length}个任务添加到今日待办吗？`, async () => {
      const updatePromises = taskIds.map(id => 
        setTodayTask({
          id,
          isTodayTask: true
        })
      );
      await Promise.all(updatePromises);
      message.success(`成功将${taskIds.length}个任务添加到今日待办！`);
      refAction.current?.clearSelected!();
      refAction.current?.reload();
    });
  };

  // 添加删除已完成任务的处理函数
  const handleDeleteCompleted = async () => {
    try {
      await deleteCompletedTasks();
      message.success('已删除所有已完成任务');
      // 刷新任务列表
      if (refAction.current) {
        refAction.current.reload();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 表格列定义
  const columns: ProColumns<API.TasksVO>[] = [
    {
      title: '任务ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '任务标题',
      dataIndex: 'title',
      width: 200,
      fieldProps: {
        name: 'taskName',
      },
      render: (dom, record) => {
        return (
          <a
            onClick={() => {
              setTask(record);
              setVisible(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 300,
      search: false,
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 100,
      valueEnum: {
        工作: { text: '工作' },
        学习: { text: '学习' },
        生活: { text: '生活' },
        其他: { text: '其他' },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      fieldProps: {
        options: [
          { label: '已完成', value: 'true' },
          { label: '未完成', value: 'false' }
        ]
      },
      render: (_, record: API.TasksVO) => (
        <Button 
          type={record.status === 'true' ? 'primary' : 'default'}
          onClick={async () => {
            try {
              await updateTasks({
                id: record.id,
                status: (record.status === 'true' ? 'false' : 'true')
              });
              message.success(`任务已${record.status === 'true' ? '设为未完成' : '完成'}`);
              refAction.current?.reload();
            } catch (error) {
              message.error('更新状态失败');
            }
          }}
        >
          {record.status === 'true' ? '已完成' : '未完成'}
        </Button>
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      width: 120,
      valueType: 'dateRange',
      sorter: true,
      search: {
        transform: (value) => {
          return {
            startDate: value ? value[0] : undefined,
            endDate: value ? value[1] : undefined,
          };
        },
      },
      render: (_, record) => record.dueDate ? new Date(record.dueDate).toLocaleDateString() : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setTask(record);
            setVisible(true);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            handleDelete([record.id!]);
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.TasksVO>
        style={styles.table}
        cardProps={{
          bodyStyle: { padding: '24px' }
        }}
        actionRef={refAction}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        request={async (params = {}, sort) => {
          const props = {
            ...params,
            taskName: params.title,
            startDate: params.startDate,
            endDate: params.endDate,
            current: params.current || 1,
            pageSize: params.pageSize || 10,
            orderBy: sort?.dueDate 
              ? `dueDate ${sort.dueDate === 'ascend' ? 'ASC' : 'DESC'}`
              : sort?.createdAt
                ? `created_at ${sort.createdAt === 'ascend' ? 'ASC' : 'DESC'}`
                : undefined,
          };
          
          return convertPageData(await listTasks(props));
        }}
        tableAlertOptionRender={() => {
          return (
            <Space size={16}>
              <a onClick={() => handleAddToToday(selectedRowKeys)}>
                添加到今日待办
              </a>
              <a onClick={() => handleDelete(selectedRowKeys)}>批量删除</a>
              <a onClick={() => refAction.current?.clearSelected!()}>取消选择</a>
            </Space>
          );
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            style={styles.button}
            onClick={() => {
              setTask(undefined);
              setVisible(true);
            }}
          >
            <PlusOutlined /> 新建任务
          </Button>,
          <Button
            type="primary"
            key="today"
            onClick={() => handleAddToToday(selectedRowKeys)}
            disabled={!selectedRowKeys?.length}
          >
            <CalendarOutlined /> 添加到今日待办
          </Button>,
          <Button
            type="primary"
            key="delete"
            danger
            style={styles.button}
            onClick={() => handleDelete(selectedRowKeys)}
            disabled={!selectedRowKeys?.length}
          >
            <DeleteOutlined /> 删除
          </Button>,
          <Popconfirm
            key="deleteCompleted"
            title="确定要删除所有已完成的任务吗？"
            onConfirm={handleDeleteCompleted}
            okText="确定"
            cancelText="取消"
          >
            <Button type="primary" danger>
              删除已完成任务
            </Button>
          </Popconfirm>,
        ]}
        columns={columns}
        rowSelection={{
          onChange: (rowKeys) => {
            selectRow(rowKeys as number[]);
          },
        }}
      />
      <TaskInputDialog
        visible={visible}
        onClose={(result) => {
          if (result) {
            refAction.current?.reload();
          }
          setVisible(false);
          setTask(undefined);
        }}
        taskData={task}
      />
    </PageContainer>
  );
};