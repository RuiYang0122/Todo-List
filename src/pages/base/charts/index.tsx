import CardChart, { ChartData, ChartType } from '@/components/CardChart';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useState } from 'react';

export default () => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  let dataList: ChartData[] = [
    { name: '1月', value: 100 },
    { name: '2月', value: 200 },
  ];

  return (
    <PageContainer>
      <ProCard
        title="图表"
        extra={[
          <Button onClick={() => setChartType('line')}>折线图</Button>,
          <Button onClick={() => setChartType('bar')}>直方图</Button>,
          <Button onClick={() => setChartType('pie')}>饼图</Button>,
        ]}
      >
        <CardChart id="mycharts1" chartType={chartType} data={dataList} height={500} />
      </ProCard>
    </PageContainer>
  );
};
