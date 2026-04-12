import { CreditCard, Receipt } from 'lucide-react';
import CustomerAccountShell from '../../components/CustomerAccountShell';
import { useCustomerData } from '../../context/CustomerDataContext';

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const formatDateTime = (value) => new Date(value).toLocaleString('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const statusStyles = {
  Paid: 'bg-emerald-100 text-emerald-700',
  'Pending on delivery': 'bg-amber-100 text-amber-700',
};

export default function CustomerTransactions() {
  const { transactions } = useCustomerData();

  return (
    <CustomerAccountShell
      title="Transaction History"
      description="Review all order payments, amounts, and payment references."
    >
      {transactions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <Receipt size={40} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900">No transactions yet</h2>
          <p className="mt-2 text-sm text-gray-500">Your completed orders will create payment records here automatically.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-4 text-left font-semibold text-gray-500">Transaction</th>
                  <th className="px-5 py-4 text-left font-semibold text-gray-500">Order</th>
                  <th className="px-5 py-4 text-left font-semibold text-gray-500">Method</th>
                  <th className="px-5 py-4 text-left font-semibold text-gray-500">Amount</th>
                  <th className="px-5 py-4 text-left font-semibold text-gray-500">Status</th>
                  <th className="px-5 py-4 text-left font-semibold text-gray-500">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-primary-50 p-2 text-primary-700">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{transaction.id}</p>
                          <p className="text-xs text-gray-500">{formatDateTime(transaction.date)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-800">{transaction.orderId || '—'}</td>
                    <td className="px-5 py-4 text-gray-600">{transaction.method}</td>
                    <td className="px-5 py-4 font-bold text-gray-900">{formatPrice(transaction.amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[transaction.status] || 'bg-gray-100 text-gray-600'}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {transaction.paymentId ? <span className="font-mono">{transaction.paymentId}</span> : 'COD / no gateway ref'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CustomerAccountShell>
  );
}
