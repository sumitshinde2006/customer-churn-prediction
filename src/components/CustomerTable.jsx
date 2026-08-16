import { ArrowDownUp, ChevronLeft, ChevronRight } from "lucide-react";
import RiskBadge from "./RiskBadge";

export default function CustomerTable({
  customers,
  loading,
  error,
  page,
  totalPages,
  sortDirection,
  onSortToggle,
  onPageChange,
  onSelectCustomer,
}) {
  const skeletonRows = Array.from({ length: 6 }, (_, index) => `row-${index}`);

  return (
    <section className="table-card">
      <div className="table-scroll">
        <table className="customer-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Tenure</th>
              <th>Contract</th>
              <th>Monthly Charges</th>
              <th>
                <button
                  type="button"
                  className="table-sort"
                  onClick={onSortToggle}
                  aria-label="Sort by churn probability"
                >
                  <span>Churn Probability</span>
                  <ArrowDownUp size={14} />
                </button>
              </th>
              <th>Risk</th>
              <th>Primary Factor</th>
              <th>Recommended Action</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? skeletonRows.map((rowId) => (
                  <tr key={rowId}>
                    <td colSpan="8">
                      <div className="skeleton skeleton--table-row" />
                    </td>
                  </tr>
                ))
              : error
                ? (
                    <tr>
                      <td colSpan="8">
                        <div className="empty-state empty-state--compact" role="alert">
                          <p>{error}</p>
                        </div>
                      </td>
                    </tr>
                  )
                : customers.length
                  ? customers.map((customer) => (
                      <tr
                        key={customer.customerId}
                        className="customer-row"
                        tabIndex={0}
                        onClick={() => onSelectCustomer(customer.customerId)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onSelectCustomer(customer.customerId);
                          }
                        }}
                      >
                        <td>{customer.customerId}</td>
                        <td>{customer.tenure} mo</td>
                        <td>{customer.contract}</td>
                        <td>${customer.monthlyCharges.toFixed(2)}</td>
                        <td>{Math.round(customer.churnProbability * 1000) / 10}%</td>
                        <td>
                          <RiskBadge risk={customer.risk} />
                        </td>
                        <td>{customer.primaryFactor}</td>
                        <td>{customer.recommendedAction}</td>
                      </tr>
                    ))
                  : (
                      <tr>
                        <td colSpan="8">
                          <div className="empty-state empty-state--compact">
                            <p>No customers match the selected filters.</p>
                          </div>
                        </td>
                      </tr>
                    )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="muted-text">Sorted by churn probability ({sortDirection})</div>
        <div className="pagination">
          <button
            type="button"
            className="icon-button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="icon-button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
