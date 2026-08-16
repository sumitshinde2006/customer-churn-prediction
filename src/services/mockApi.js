import {
  analysisRecords,
  analysisFilterOptions,
  customerFormDefaults,
  overviewData,
  predictionThreshold,
  riskCustomers,
  riskSummary,
} from "../data/mockData";

const mockDelay = (data, delay = 300) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(data), delay);
  });

const groupRate = (records, categories, accessor) =>
  categories.map((category) => {
    const group = records.filter((record) => accessor(record) === category);
    const churned = group.filter((record) => record.churn).length;
    const rate = group.length ? Number(((churned / group.length) * 100).toFixed(1)) : 0;

    return {
      category,
      rate,
      count: group.length,
    };
  });

const tenureBucket = (tenureMonths) => {
  if (tenureMonths <= 12) {
    return "0-12";
  }

  if (tenureMonths <= 24) {
    return "13-24";
  }

  if (tenureMonths <= 48) {
    return "25-48";
  }

  return "49-72";
};

const chargeBucket = (monthlyCharges) => {
  if (monthlyCharges < 50) {
    return "<50";
  }

  if (monthlyCharges <= 80) {
    return "50-80";
  }

  return "80+";
};

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

const formatDirectionLabel = (impact) =>
  impact > 0.24 ? "Strong upward contribution" : "Moderate upward contribution";

const formatReductionLabel = (impact) =>
  Math.abs(impact) > 0.18 ? "Strong downward contribution" : "Downward contribution";

const derivePrediction = (customerData) => {
  const data = { ...customerFormDefaults, ...customerData };
  let probability = 0.18;
  const factors = [];

  const addFactor = (feature, value, impact) => {
    if (!impact) {
      return;
    }

    factors.push({
      feature,
      value,
      impact: Number(Math.abs(impact).toFixed(2)),
      direction: impact > 0 ? "positive" : "negative",
      label: impact > 0 ? formatDirectionLabel(impact) : formatReductionLabel(impact),
    });
    probability += impact;
  };

  addFactor(
    "Contract",
    data.contract,
    data.contract === "Month-to-month"
      ? 0.28
      : data.contract === "One year"
        ? -0.08
        : -0.19
  );

  addFactor(
    "Tenure",
    `${data.tenureMonths} months`,
    data.tenureMonths < 12 ? 0.18 : data.tenureMonths < 24 ? 0.08 : data.tenureMonths > 48 ? -0.11 : -0.04
  );

  addFactor(
    "Monthly Charges",
    `$${Number(data.monthlyCharges).toFixed(2)}`,
    data.monthlyCharges >= 90 ? 0.16 : data.monthlyCharges >= 75 ? 0.1 : data.monthlyCharges <= 35 ? -0.05 : 0
  );

  addFactor(
    "Internet Service",
    data.internetService,
    data.internetService === "Fiber optic" ? 0.1 : data.internetService === "No internet" ? -0.08 : 0.03
  );

  addFactor("Tech Support", data.techSupport, data.techSupport === "No" ? 0.1 : -0.06);
  addFactor("Online Security", data.onlineSecurity, data.onlineSecurity === "No" ? 0.07 : -0.04);
  addFactor("Payment Method", data.paymentMethod, data.paymentMethod === "Electronic check" ? 0.08 : -0.02);
  addFactor("Paperless Billing", data.paperlessBilling, data.paperlessBilling === "Yes" ? 0.05 : -0.02);
  addFactor("Partner", data.partner, data.partner === "No" ? 0.04 : -0.03);
  addFactor("Dependents", data.dependents, data.dependents === "No" ? 0.03 : -0.03);
  addFactor("Senior Citizen", data.seniorCitizen, data.seniorCitizen === "Yes" ? 0.04 : 0);

  probability = clamp(Number(probability.toFixed(3)), 0.04, 0.96);

  const risk =
    probability >= predictionThreshold ? "High" : probability >= 0.35 ? "Medium" : "Low";

  const sortedFactors = factors
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5)
    .map((factor) => ({
      feature: factor.feature,
      value: factor.value,
      impact: factor.impact,
      direction: factor.direction,
      label: factor.label,
    }));

  const topPositiveFactor = sortedFactors.find((factor) => factor.direction === "positive");

  const recommendedAction =
    topPositiveFactor?.feature === "Contract"
      ? "Offer a discounted long-term contract"
      : topPositiveFactor?.feature === "Tech Support"
        ? "Provide technical support"
        : topPositiveFactor?.feature === "Online Security"
          ? "Offer online security package"
          : "Review pricing and provide a personalized offer";

  return {
    probability,
    risk,
    threshold: predictionThreshold,
    factors: sortedFactors,
    recommendedAction,
  };
};

export async function getOverview() {
  return mockDelay(overviewData);
}

export async function getChurnAnalysis(filters) {
  const normalizedFilters = {
    contract: filters?.contract ?? "All Contracts",
    internetService: filters?.internetService ?? "All Services",
    tenureRange: filters?.tenureRange ?? "All Tenure",
    paymentMethod: filters?.paymentMethod ?? "All Methods",
  };

  const filteredRecords = analysisRecords.filter((record) => {
    const matchesContract =
      normalizedFilters.contract === "All Contracts" || record.contract === normalizedFilters.contract;
    const matchesInternet =
      normalizedFilters.internetService === "All Services" ||
      record.internetService === normalizedFilters.internetService;
    const matchesTenure =
      normalizedFilters.tenureRange === "All Tenure" ||
      tenureBucket(record.tenureMonths) === normalizedFilters.tenureRange;
    const matchesPayment =
      normalizedFilters.paymentMethod === "All Methods" ||
      record.paymentMethod === normalizedFilters.paymentMethod;

    return matchesContract && matchesInternet && matchesTenure && matchesPayment;
  });

  const records = filteredRecords.length ? filteredRecords : analysisRecords;
  const contractCategories = analysisFilterOptions.contract.slice(1);
  const internetCategories = analysisFilterOptions.internetService.slice(1);
  const tenureCategories = analysisFilterOptions.tenureRange.slice(1);
  const paymentCategories = analysisFilterOptions.paymentMethod.slice(1);

  const contractChart = groupRate(records, contractCategories, (record) => record.contract);
  const tenureChart = groupRate(records, tenureCategories, (record) => tenureBucket(record.tenureMonths));
  const internetChart = groupRate(records, internetCategories, (record) => record.internetService);
  const paymentChart = groupRate(records, paymentCategories, (record) => record.paymentMethod);
  const techSupportChart = groupRate(records, ["Yes", "No"], (record) => record.techSupport);

  const chargeChart = ["<50", "50-80", "80+"].map((bucket) => {
    const group = records.filter((record) => chargeBucket(record.monthlyCharges) === bucket);
    const churned = group.filter((record) => record.churn).length;
    return {
      category: bucket,
      rate: group.length ? Number(((churned / group.length) * 100).toFixed(1)) : 0,
      averageCharge: group.length
        ? Number((group.reduce((sum, record) => sum + record.monthlyCharges, 0) / group.length).toFixed(1))
        : 0,
    };
  });

  return mockDelay(
    {
      activeCount: filteredRecords.length,
      usedFallback: !filteredRecords.length,
      contractChart,
      tenureChart,
      internetChart,
      paymentChart,
      chargeChart,
      techSupportChart,
    },
    420
  );
}

export async function predictChurn(customerData) {
  return mockDelay(derivePrediction(customerData), 520);
}

export async function getRiskCustomers(filters = {}) {
  const search = filters.search?.trim().toLowerCase() ?? "";
  const risk = filters.risk ?? "All";
  const contract = filters.contract ?? "All";
  const sortDirection = filters.sortDirection ?? "desc";
  const page = Number(filters.page ?? 1);
  const pageSize = Number(filters.pageSize ?? 6);

  let results = [...riskCustomers];

  if (search) {
    results = results.filter((customer) =>
      [
        customer.customerId,
        customer.primaryFactor,
        customer.recommendedAction,
        customer.paymentMethod,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }

  if (risk !== "All") {
    results = results.filter((customer) => customer.risk === risk);
  }

  if (contract !== "All") {
    results = results.filter((customer) => customer.contract === contract);
  }

  results.sort((customerA, customerB) =>
    sortDirection === "asc"
      ? customerA.churnProbability - customerB.churnProbability
      : customerB.churnProbability - customerA.churnProbability
  );

  const totalItems = results.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageItems = results.slice(startIndex, startIndex + pageSize);

  return mockDelay(
    {
      summary: riskSummary,
      customers: pageItems,
      totalItems,
      totalPages,
      page: safePage,
      sortDirection,
      filters: { risk, contract, search },
    },
    380
  );
}

export async function getCustomerExplanation(customerId) {
  const customer = riskCustomers.find((entry) => entry.customerId === customerId);

  if (!customer) {
    throw new Error("Customer not found");
  }

  return mockDelay(
    {
      customerId: customer.customerId,
      probability: customer.churnProbability,
      risk: customer.risk,
      factors: customer.factors,
      recommendedAction: customer.recommendedAction,
      profile: {
        tenure: customer.tenure,
        contract: customer.contract,
        monthlyCharges: customer.monthlyCharges,
        paymentMethod: customer.paymentMethod,
        internetService: customer.internetService,
        techSupport: customer.techSupport,
        phoneService: customer.phoneService,
        paperlessBilling: customer.paperlessBilling,
      },
    },
    280
  );
}
