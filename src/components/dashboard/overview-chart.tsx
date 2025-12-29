
'use client';

import {Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend} from 'recharts';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {ChartContainer, ChartTooltipContent, type ChartConfig} from '@/components/ui/chart';
import type {Transaction} from '@/lib/definitions';

interface OverviewChartProps {
  data: Transaction[];
}

const chartConfig = {
  income: {
    label: 'Entradas',
    color: 'hsl(var(--chart-1))',
  },
  expense: {
    label: 'Saídas',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function OverviewChart({data}: OverviewChartProps) {
  const processDataForChart = (transactions: Transaction[]) => {
    const dailyData: {[key: string]: {income: number; expense: number}} = {};

    transactions.forEach((transaction) => {
      const day = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!dailyData[day]) {
        dailyData[day] = {income: 0, expense: 0};
      }
      if (transaction.type === 'income') {
        dailyData[day].income += transaction.amount;
      } else {
        dailyData[day].expense += transaction.amount;
      }
    });

    return Object.keys(dailyData)
      .map((day) => ({
        name: new Date(day),
        income: dailyData[day].income,
        expense: dailyData[day].expense,
      }))
      .sort((a, b) => a.name.getTime() - b.name.getTime());
  };

  const chartData = processDataForChart(data);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(date) => format(date, 'dd/MMM', {locale: ptBR})}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `R$${value}`}
          />
          <Tooltip
            cursor={{fill: 'hsl(var(--accent) / 0.2)'}}
            content={
              <ChartTooltipContent
                labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                        return format(new Date(payload[0].payload.name), "eeee, dd 'de' MMMM", { locale: ptBR });
                    }
                    return label;
                }}
                formatter={(value, name) => (
                  <div className="flex flex-col">
                    <span className="capitalize text-muted-foreground">
                      {name === 'income' ? 'Entrada' : 'Saída'}
                    </span>
                    <span>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(value as number)}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Legend
            formatter={(value) => (
              <span className="capitalize text-muted-foreground">
                {value === 'income' ? 'Entradas' : 'Saídas'}
              </span>
            )}
          />
          <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
