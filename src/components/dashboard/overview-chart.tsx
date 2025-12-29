'use client';

import { 
  ComposedChart,
  Line,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

interface OverviewChartProps {
  data: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-4 border rounded-xl shadow-lg outline-none">
        <p className="text-sm font-bold text-card-foreground mb-2">{label}</p>
        <div className="space-y-1 text-sm">
            {payload.map((entry: any, index: number) => (
                <div key={index} style={{ color: entry.color }} className="flex justify-between gap-4 font-medium">
                    <span>{entry.name}:</span>
                    <span>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entry.value)}
                    </span>
                </div>
            ))}
        </div>
      </div>
    );
  }
  return null;
};


export function OverviewChart({ data }: OverviewChartProps) {
  
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] bg-card rounded-xl border p-6 flex items-center justify-center text-muted-foreground flex-col gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Sem dados financeiros neste período.
      </div>
    );
  }

  return (
    <div className="w-full bg-card rounded-xl border p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
            <h3 className="text-xl font-bold font-headline text-card-foreground">Fluxo & Saldo Líquido</h3>
            <p className="text-sm text-muted-foreground">Barras = Movimentação | Linha = O que sobrou no dia.</p>
        </div>
      </div>

      <div className="h-[400px] w-full font-sans">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <defs>
              <linearGradient id="colorIncomeBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
              </linearGradient>
              <linearGradient id="colorExpenseBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
              tickFormatter={(value) => `R$${value / 1000}k`}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            
            <Legend 
                verticalAlign="top" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '13px', fontWeight: 500, color: 'hsl(var(--foreground))' }}
            />

            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />

            <Bar 
              dataKey="income" 
              name="Entradas" 
              fill="url(#colorIncomeBar)"
              radius={[8, 8, 0, 0]} 
              barSize={12}
            />
            <Bar 
              dataKey="expense" 
              name="Saídas" 
              fill="url(#colorExpenseBar)"
              radius={[8, 8, 0, 0]}
              barSize={12}
            />

            <Line 
                type="monotone"
                dataKey="saldo" 
                name="Saldo Líquido" 
                stroke="hsl(var(--primary))"
                strokeWidth={4}
                dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--card))' }}
                activeDot={{ r: 8, strokeWidth: 0, stroke: 'hsl(var(--primary))' }}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
