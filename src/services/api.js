import {
  getChurnAnalysis as getMockChurnAnalysis,
  getCustomerExplanation as getMockCustomerExplanation,
  getOverview as getMockOverview,
  getRiskCustomers as getMockRiskCustomers,
} from "./mockApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

function toBackendPayload(customerData) {
  return {
    gender: customerData.gender,
    seniorCitizen: customerData.seniorCitizen,
    partner: customerData.partner,
    dependents: customerData.dependents,
    tenureMonths: Number(customerData.tenureMonths),
    phoneService: customerData.phoneService,
    multipleLines: customerData.multipleLines,
    internetService: customerData.internetService,
    onlineSecurity: customerData.onlineSecurity,
    onlineBackup: customerData.onlineBackup,
    deviceProtection: customerData.deviceProtection,
    techSupport: customerData.techSupport,
    streamingTV: customerData.streamingTV,
    streamingMovies: customerData.streamingMovies,
    contract: customerData.contract,
    paperlessBilling: customerData.paperlessBilling,
    paymentMethod: customerData.paymentMethod,
    monthlyCharges: Number(customerData.monthlyCharges),
    totalCharges: Number(customerData.totalCharges),
  };
}

async function readApiError(response) {
  try {
    const data = await response.json();
    return data?.detail || "Prediction request failed.";
  } catch {
    return "Prediction request failed.";
  }
}

export async function getOverview() {
  return getMockOverview();
}

export async function getChurnAnalysis(filters) {
  return getMockChurnAnalysis(filters);
}

export async function predictChurn(customerData) {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toBackendPayload(customerData)),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json();
}

export async function getRiskCustomers(filters) {
  return getMockRiskCustomers(filters);
}

export async function getCustomerExplanation(customerId) {
  return getMockCustomerExplanation(customerId);
}
