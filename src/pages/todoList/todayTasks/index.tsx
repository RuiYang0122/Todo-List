import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space, message, Card, Typography } from 'antd';
import { useRef, useState } from 'react';
import { ClockCircleOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { listTodayTasks, deleteTasks, updateTasks, setTodayTask } from '@/services/api/tasks';
import { convertPageData } from '@/utils/request';
import { openConfirm } from '@/utils/ui';
import TaskInputDialog from '../taskList/components/TaskInputDialog';
import PomodoroTimer from './components/PomodoroTimer';
import AIAssistant from './components/AIAssistant';

const { Text } = Typography;

export default () => {
  const refAction = useRef<ActionType>(null);
  const [selectedRowKeys, selectRow] = useState<number[]>([]);
  const [task, setTask] = useState<API.TasksVO>();
  const [visible, setVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<API.TasksVO>();
  const [pomodoroVisible, setPomodoroVisible] = useState(false);
  const [tableData, setTableData] = useState<API.TasksVO[]>([]);
  const [loading, setLoading] = useState(false);

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

  // 移出今日待办
  const handleRemoveFromToday = async (taskIds: number[]) => {
    if (!taskIds || taskIds.length === 0) return;
    
    openConfirm(`您确定要将选定的${taskIds.length}个任务从今日待办移出吗？`, async () => {
      try {
        const updatePromises = taskIds.map(id => 
          setTodayTask({
            id,
            isTodayTask: false
          })
        );
        await Promise.all(updatePromises);
        message.success(`成功将${taskIds.length}个任务从今日待办移出！`);
        refAction.current?.clearSelected!();
        refAction.current?.reload();
      } catch (error) {
        message.error('移出今日待办失败');
        console.error('移出今日待办失败:', error);
      }
    });
  };

  // 表格列定义
  const columns: ProColumns<API.TasksVO>[] = [
    {
      title: '任务标题',
      dataIndex: 'title',
      width: 300,
      search: false,
      render: (dom, record) => (
        <Space>
          <Text
            style={{ 
              textDecoration: record.status === 'true' ? 'line-through' : 'none',
              color: record.status === 'true' ? '#999' : 'inherit'
            }}
          >
            {dom}
          </Text>
          {record.dueDate && new Date(record.dueDate) < new Date() && record.status !== 'true' && (
            <Text type="danger">(已逾期)</Text>
          )}
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 100,
      search: false,
      render: (category) => (
        <Text type="secondary">{category}</Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      search: false,
      render: (_, record) => (
        <Button 
          type={record.status === 'true' ? 'primary' : 'default'}
          size="small"
          onClick={async (e) => {
            e.stopPropagation();
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
      title: '操作',
      width: 180,
      search: false,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<ClockCircleOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTask(record);
              setPomodoroVisible(true);
            }}
          >
            专注
          </Button>
          <Button 
            type="link" 
            danger
            onClick={(e) => {
              e.stopPropagation();
              handleDelete([record.id!]);
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Card bordered={false}>
          <ProTable<API.TasksVO>
            headerTitle={
              <Space>
                今日待办任务
              </Space>
            }
            actionRef={refAction}
            rowKey="id"
            search={false}
            options={false}
            cardProps={false}
            request={async (params = {}) => {
              const props = {
                ...params,
                current: params.current || 1,
                pageSize: params.pageSize || 10,
              };
              const result = await listTodayTasks(props);
              setTableData(result?.list || []);
              setLoading(false);
              return convertPageData(result);
            }}
            toolBarRender={() => [
              <Button
                type="primary"
                key="remove"
                onClick={() => handleRemoveFromToday(selectedRowKeys)}
                disabled={!selectedRowKeys?.length}
              >
                <CalendarOutlined /> 移出今日待办
              </Button>,
              <Button
                type="primary"
                danger
                key="delete"
                onClick={() => handleDelete(selectedRowKeys)}
                disabled={!selectedRowKeys?.length}
              >
                <DeleteOutlined /> 删除
              </Button>,
            ]}
            columns={columns}
            rowSelection={{
              onChange: (rowKeys) => selectRow(rowKeys as number[]),
            }}
            onRow={(record) => ({
              onClick: () => {
                setSelectedTask(record);
                setPomodoroVisible(true);
              },
              style: { 
                cursor: 'pointer',
                backgroundColor: record.status === 'true' ? '#fafafa' : undefined
              },
            })}
          />
        </Card>
        <AIAssistant 
          tasks={tableData || []} 
          loading={loading}
        />
      </Space>
      <PomodoroTimer
        visible={pomodoroVisible}
        onClose={() => setPomodoroVisible(false)}
        taskName={selectedTask?.title}
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