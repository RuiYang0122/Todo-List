import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card } from 'antd';
import CardChart, { ChartData } from '@/components/CardChart';
import { getTaskCompletionStats } from '@/services/api/tasks';

const Stats: React.FC = () => {
  const [statsData, setStatsData] = useState<any>({});

  const fetchData = async () => {
    try {
      const response = await getTaskCompletionStats();
      if (response?.success) {
        setStatsData(response.data || {});
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData: ChartData[] = [
    { name: '已完成', value: statsData.completed || 0 },
    { name: '未完成', value: statsData.uncompleted || 0 },
  ];

  return (
    <PageContainer>
      <Card title="任务完成情况统计">
        <CardChart 
          id="taskCompletionChart"
          chartType="pie"
          data={chartData}
          height={400}
        />
      </Card>
    </PageContainer>
  );
};

export default Stats;