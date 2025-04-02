import React, { useState, useEffect } from 'react';
import { Modal, Button, Progress, Space, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, RedoOutlined } from '@ant-design/icons';

interface PomodoroTimerProps {
  visible: boolean;
  onClose: () => void;
  taskName?: string;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ visible, onClose, taskName }) => {
  const WORK_TIME = 25 * 60; // 25分钟
  const SHORT_BREAK = 5 * 60; // 5分钟
  const LONG_BREAK = 15 * 60; // 15分钟

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (!isBreak) {
      setPomodoroCount(prev => prev + 1);
      message.success('完成一个番茄钟！');
      // 每4个番茄钟后进入长休息
      if (pomodoroCount % 4 === 3) {
        setTimeLeft(LONG_BREAK);
        message.info('开始长休息（15分钟）');
      } else {
        setTimeLeft(SHORT_BREAK);
        message.info('开始短休息（5分钟）');
      }
      setIsBreak(true);
    } else {
      setTimeLeft(WORK_TIME);
      setIsBreak(false);
      message.info('休息结束，开始新的番茄钟');
    }
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(WORK_TIME);
    setIsBreak(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = isBreak ? (pomodoroCount % 4 === 0 ? LONG_BREAK : SHORT_BREAK) : WORK_TIME;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <Modal
      title={taskName ? `专注: ${taskName}` : '番茄钟'}
      open={visible}
      onCancel={() => {
        if (isRunning) {
          const confirmed = window.confirm('计时器正在运行，确定要退出吗？');
          if (!confirmed) return;
        }
        setIsRunning(false);
        onClose();
      }}
      footer={null}
      width={400}
      centered
    >
      <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
        <Progress
          type="circle"
          percent={getProgress()}
          format={() => formatTime(timeLeft)}
          status={isBreak ? 'success' : 'active'}
        />
        <Space>
          {!isRunning ? (
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStart}>
              开始
            </Button>
          ) : (
            <Button icon={<PauseCircleOutlined />} onClick={handlePause}>
              暂停
            </Button>
          )}
          <Button icon={<RedoOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
        <div>已完成 {pomodoroCount} 个番茄钟</div>
      </Space>
    </Modal>
  );
};

export default PomodoroTimer; 