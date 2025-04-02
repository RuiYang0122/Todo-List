import { ModalForm, ProForm, ProFormDatePicker, ProFormInstance, ProFormSelect, ProFormText, ProFormTextArea, ProFormSwitch } from '@ant-design/pro-components';
import { message } from 'antd';
import { useEffect, useRef } from 'react';
import { addTasks, updateTasks } from '@/services/api/tasks';

interface TaskInputDialogProps {
  taskData?: API.TasksVO;
  visible: boolean;
  onClose: (result: boolean) => void;
}

export default ({ taskData, visible, onClose }: TaskInputDialogProps) => {
  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    if (visible) {
      if (taskData) {
        // 编辑模式：设置现有数据
        formRef.current?.setFieldsValue({
          ...taskData,
          isTodayTask: taskData.isTodayTask || false,  // 确保编辑时正确显示今日任务状态
        });
      } else {
        // 新建模式：重置表单
        formRef.current?.resetFields();
        // 设置默认值
        formRef.current?.setFieldsValue({
          status: 'false',  // 默认未完成
          category: '学习',  // 可选：设置默认分类
          isTodayTask: false,  // 默认不是今日任务
        });
      }
    }
  }, [visible, taskData]);

  return (
    <ModalForm
      title={taskData ? '编辑任务' : '新建任务'}
      width={500}
      formRef={formRef}
      visible={visible}
      onVisibleChange={(v) => {
        if (!v) {
          onClose(false);
        }
      }}
      onFinish={async (values) => {
        const data: API.TasksDTO = {
          ...values,
          id: taskData?.id,
          isTodayTask: Boolean(values.isTodayTask),  // 直接转换为布尔值
        };

        console.log('提交的数据：', data);

        try {
          if (taskData?.id) {
            await updateTasks(data);
            message.success('任务更新成功');
          } else {
            await addTasks(data);
            message.success('任务创建成功');
          }
          onClose(true);
          return true;
        } catch (error) {
          console.error('提交失败：', error);
          return false;
        }
      }}
    >
      <ProForm.Group>
        <ProFormText
          width="md"
          name="title"
          label="任务标题"
          placeholder="请输入任务标题"
          rules={[{ required: true, message: '请输入任务标题' }]}
        />
        <ProFormSelect
          width="md"
          name="category"
          label="任务分类"
          placeholder="请选择任务分类"
          options={[
            { label: '工作', value: '工作' },
            { label: '学习', value: '学习' },
            { label: '生活', value: '生活' },
            { label: '其他', value: '其他' },
          ]}
          rules={[{ required: true, message: '请选择任务分类' }]}
        />
      </ProForm.Group>
      <ProFormTextArea
        name="description"
        label="任务描述"
        placeholder="请输入任务描述"
      />
      <ProForm.Group>
        <ProFormDatePicker
          width="md"
          name="dueDate"
          label="截止日期"
          placeholder="请选择截止日期"
        />
        <ProFormSelect
          width="md"
          name="status"
          label="任务状态"
          placeholder="请选择任务状态"
          options={[
            { label: '未完成', value: 'false' },
            { label: '已完成', value: 'true' },
          ]}
          initialValue="false"
        />
      </ProForm.Group>
      <ProFormSwitch
        name="isTodayTask"
        label="今日任务"
        checkedChildren="是"
        unCheckedChildren="否"
        initialValue={false}
      />
    </ModalForm>
  );
}; 