import React, { useState } from 'react';
import { Card, Button, Input, Spin, Typography, Space, message, Empty } from 'antd';
import { RobotOutlined, SyncOutlined } from '@ant-design/icons';
import { getSuggestion } from '@/services/api/ai';

const { Text, Paragraph } = Typography;

interface AIAssistantProps {
  tasks: API.TasksVO[];
  loading?: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ tasks, loading }) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  const generatePrompt = (tasks: API.TasksVO[]) => {
    const unfinishedTasks = tasks.filter(task => task.status !== 'true');
    const completedTasks = tasks.filter(task => task.status === 'true');
    
    return `作为一个专业的任务管理助手，请帮我分析和规划以下任务：

当前待完成的任务：
${unfinishedTasks.map(task => 
  `- ${task.title}${task.dueDate ? ` (截止日期: ${new Date(task.dueDate).toLocaleDateString()})` : ''}`
).join('\n')}

${completedTasks.length > 0 ? `
已完成的任务：
${completedTasks.map(task => `- ${task.title}`).join('\n')}
` : ''}

请从以下几个方面给出建议：

1. 任务优先级分析
- 基于截止日期的紧急程度
- 任务的重要性评估
- 识别关键任务和依赖关系

2. 时间规划建议
- 合理的任务执行顺序
- 每个任务的预估时间
- 建议的时间分配方案

3. 执行策略
- 结合番茄工作法的具体执行建议
- 合理的休息安排
- 潜在风险和注意事项

4. 效率提升建议
- 任务分解和里程碑设置
- 专注度保持技巧
- 进度追踪方法

请给出具体、可操作的建议，帮助我更好地完成这些任务。`;
  };

  const generateSuggestion = async (retryCount = 0) => {
    setGenerating(true);
    try {
      const prompt = generatePrompt(tasks);
      const response = await getSuggestion({ prompt });
      if (response?.success) {
        setSuggestion(response.data || '');
      } else {
        if (retryCount < 2) {
          message.warning('生成建议失败，正在重试...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          await generateSuggestion(retryCount + 1);
        } else {
          message.error(response?.message || '生成建议失败，请稍后重试');
        }
      }
    } catch (error) {
      console.error('生成建议失败:', error);
      message.error('生成建议失败，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  const formatSuggestion = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.match(/^\d+\./)) {
        // 主标题
        return (
          <Typography.Title level={4} key={index} style={{ marginTop: 16 }}>
            {line}
          </Typography.Title>
        );
      } else if (line.startsWith('-')) {
        // 子项
        return (
          <Typography.Paragraph key={index} style={{ marginLeft: 24 }}>
            {line}
          </Typography.Paragraph>
        );
      } else {
        // 普通文本
        return <Typography.Paragraph key={index}>{line}</Typography.Paragraph>;
      }
    });
  };

  return (
    <Card
      title={
        <Space>
          <RobotOutlined />
          <span>AI 任务助手</span>
        </Space>
      }
      extra={
        <Space>
          <Button
            type="primary"
            icon={<SyncOutlined spin={generating} />}
            onClick={generateSuggestion}
            loading={generating}
            disabled={!tasks.length}
          >
            生成规划建议
          </Button>
        </Space>
      }
      loading={loading}
    >
      {suggestion ? (
        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
          {formatSuggestion(suggestion)}
        </div>
      ) : (
        <Empty
          description={
            tasks.length ? 
              '点击"生成规划建议"，AI 助手将帮您分析任务并提供合理的规划建议。' :
              '请先添加今日待办任务，然后让 AI 助手为您提供规划建议。'
          }
        />
      )}
    </Card>
  );
};

export default AIAssistant; 