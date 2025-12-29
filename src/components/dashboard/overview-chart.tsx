
'use client';

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OverviewChartProps {
  data: { name: string, income: number, expense: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const formattedLabel = format(parseISO(label), "eeee, dd 'de' MMMM", { locale: ptBR });
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Entradas
            </span>
            <span className="font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
            </span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Saídas
            </span>
            <span className="font-bold text-red-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[1].value)}
            </span>
          </div>
        </div>
         <p className="text-sm font-medium mt-2 pt-2 border-t text-center text-muted-foreground capitalize">{formattedLabel}</p>
      </div>
    );
  }
  return null;
};

export function OverviewChart({ data }: OverviewChartProps) {
  
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[410px] bg-card rounded-xl border flex items-center justify-center">
        <p className="text-muted-foreground">Sem movimentações no período selecionado.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-card rounded-xl border p-6">
       <div className="mb-4 flex justify-between items-end">
        <div>
          <h3 className="text-lg font-bold font-headline text-card-foreground">Fluxo de Caixa</h3>
          <p className="text-sm text-muted-foreground">Acompanhamento de entradas e saídas no período.</p>
        </div>
      </div>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
              dy={10}
              minTickGap={30}
              tickFormatter={(str) => format(parseISO(str), "dd/MM")}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
              tickFormatter={(value) => `R$${value/1000}k`}
              domain={[0, 'dataMax + 100']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="income" name="Entradas" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
            <Area type="monotone" dataKey="expense" name="Saídas" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
