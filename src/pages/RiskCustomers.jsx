import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import CustomerTable from "../components/CustomerTable";
import ExplanationPanel from "../components/ExplanationPanel";
import KpiCard from "../components/KpiCard";
import RecommendationCard from "../components/RecommendationCard";
import RiskBadge from "../components/RiskBadge";
import { getCustomerExplanation, getRiskCustomers } from "../services/api";

const initialFilters = {
  search: "",
  risk: "All",
  contract: "All",
  sortDirection: "desc",
  page: 1,
  pageSize: 6,
};

export default function RiskCustomers() {
  const [filters, setFilters] = useState(initialFilters);
  const [tableData, setTableData] = useState({
    summary: [],
    customers: [],
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCustomers() {
      try {
        setLoading(true);
        setError("");
        const response = await getRiskCustomers(filters);
        if (active) {
          setTableData(response);
          if (response.customers.length === 0) {
            setSelectedCustomerId("");
            setDrawerData(null);
          }
        }
      } catch {
        if (active) {
          setError("Unable to load customer data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCustomers();

    return () => {
      active = false;
    };
  }, [filters]);

  useEffect(() => {
    if (!selectedCustomerId) {
      return undefined;
    }

    let active = true;

    async function loadExplanation() {
      try {
        setDrawerLoading(true);
        const response = await getCustomerExplanation(selectedCustomerId);
        if (active) {
          setDrawerData(response);
        }
      } catch {
        if (active) {
          setDrawerData(null);
        }
      } finally {
        if (active) {
          setDrawerLoading(false);
        }
      }
    }

    loadExplanation();

    return () => {
      active = false;
    };
  }, [selectedCustomerId]);

  const updateFilters = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  return (
    <div className="page-stack">
      <section className="kpi-grid">
        {(tableData.summary.length ? tableData.summary : Array.from({ length: 3 }, () => null)).map((metric, index) => (
          <KpiCard
            key={metric?.label ?? `summary-${index}`}
            label={metric?.label}
            value={metric?.value}
            supportingText={metric ? "Current dataset" : ""}
            loading={loading}
          />
        ))}
      </section>

      <section className="filter-card">
        <div className="filter-grid filter-grid--risk">
          <label className="field field--search">
            <span>Search</span>
            <div className="search-input">
              <Search size={16} />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => updateFilters("search", event.target.value)}
                placeholder="Search by customer ID or factor"
              />
            </div>
          </label>

          <label className="field">
            <span>Risk</span>
            <select value={filters.risk} onChange={(event) => updateFilters("risk", event.target.value)}>
              {["All", "High", "Medium", "Low"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Contract</span>
            <select value={filters.contract} onChange={(event) => updateFilters("contract", event.target.value)}>
              {["All", "Month-to-month", "One year", "Two year"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <CustomerTable
        customers={tableData.customers}
        loading={loading}
        error={error}
        page={tableData.page}
        totalPages={tableData.totalPages}
        sortDirection={filters.sortDirection}
        onSortToggle={() =>
          updateFilters("sortDirection", filters.sortDirection === "desc" ? "asc" : "desc")
        }
        onPageChange={(page) => updateFilters("page", page)}
        onSelectCustomer={setSelectedCustomerId}
      />

      <div className={`drawer-backdrop ${selectedCustomerId ? "is-visible" : ""}`} onClick={() => setSelectedCustomerId("")} />
      <aside className={`drawer ${selectedCustomerId ? "is-open" : ""}`} aria-label="Customer detail drawer">
        <div className="drawer__header">
          <div>
            <div className="panel__eyebrow">Customer detail</div>
            <h2>{drawerData?.customerId ?? "Loading customer"}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={() => setSelectedCustomerId("")}
            aria-label="Close customer drawer"
          >
            <X size={16} />
          </button>
        </div>

        {drawerLoading ? (
          <div className="drawer__loading">
            <div className="skeleton skeleton--panel" />
            <div className="skeleton skeleton--panel" />
          </div>
        ) : drawerData ? (
          <div className="drawer__content">
            <div className="drawer__summary">
              <div>
                <div className="panel__eyebrow">Churn probability</div>
                <strong>{Math.round(drawerData.probability * 1000) / 10}%</strong>
              </div>
              <RiskBadge risk={drawerData.risk} />
            </div>

            <section className="panel panel--compact">
              <div className="panel__header">
                <h3>Customer information</h3>
              </div>
              <dl className="detail-list">
                <div>
                  <dt>Tenure</dt>
                  <dd>{drawerData.profile.tenure} months</dd>
                </div>
                <div>
                  <dt>Contract</dt>
                  <dd>{drawerData.profile.contract}</dd>
                </div>
                <div>
                  <dt>Monthly Charges</dt>
                  <dd>${drawerData.profile.monthlyCharges.toFixed(2)}</dd>
                </div>
                <div>
                  <dt>Payment Method</dt>
                  <dd>{drawerData.profile.paymentMethod}</dd>
                </div>
                <div>
                  <dt>Internet Service</dt>
                  <dd>{drawerData.profile.internetService}</dd>
                </div>
                <div>
                  <dt>Tech Support</dt>
                  <dd>{drawerData.profile.techSupport}</dd>
                </div>
              </dl>
            </section>

            <ExplanationPanel
              title="Why this customer may churn"
              result={{
                probability: drawerData.probability,
                risk: drawerData.risk,
                factors: drawerData.factors,
              }}
            />
            <RecommendationCard action={drawerData.recommendedAction} />
          </div>
        ) : (
          <div className="empty-state empty-state--compact">
            <p>Select a customer to view detailed risk information.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
