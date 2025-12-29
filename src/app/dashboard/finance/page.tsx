import {getTransactions} from './actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {cn} from '@/lib/utils';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

export default async function FinancePage() {
  const transactions = await getTransactions();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM, yyyy", {locale: ptBR});
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Financeiro</h1>
        <p className="text-muted-foreground">
          Acompanhe as entradas e saídas da sua loja.
        </p>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="hidden md:table-cell">{formatDate(transaction.date)}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                        <span>{transaction.description}</span>
                        {transaction.clientName && <span className="text-xs text-muted-foreground">{transaction.clientName}</span>}
                        <span className="text-sm text-muted-foreground md:hidden">{formatDate(transaction.date)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.type === 'income'
                          ? 'default'
                          : 'destructive'
                      }
                      className={cn(transaction.type === 'income' && "bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
                        transaction.type === 'expense' && "bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                      )}
                    >
                      {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold',
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
