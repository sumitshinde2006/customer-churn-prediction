import { useState } from "react";
import { ArrowRight } from "lucide-react";
import ExplanationPanel from "../components/ExplanationPanel";
import PredictionResult from "../components/PredictionResult";
import RecommendationCard from "../components/RecommendationCard";
import { customerFormDefaults, formOptions } from "../data/mockData";
import { predictChurn } from "../services/api";

const profileFields = [
  { name: "gender", label: "Gender", type: "select", options: formOptions.gender },
  { name: "seniorCitizen", label: "Senior Citizen", type: "select", options: formOptions.binary },
  { name: "partner", label: "Partner", type: "select", options: formOptions.binary },
  { name: "dependents", label: "Dependents", type: "select", options: formOptions.binary },
  { name: "tenureMonths", label: "Tenure Months", type: "number", min: 0, max: 72 },
];

const serviceFields = [
  { name: "phoneService", label: "Phone Service", type: "select", options: formOptions.binary },
  { name: "multipleLines", label: "Multiple Lines", type: "select", options: formOptions.multipleLines },
  { name: "internetService", label: "Internet Service", type: "select", options: formOptions.internetService },
  { name: "onlineSecurity", label: "Online Security", type: "select", options: formOptions.binary },
  { name: "onlineBackup", label: "Online Backup", type: "select", options: formOptions.binary },
  { name: "deviceProtection", label: "Device Protection", type: "select", options: formOptions.binary },
  { name: "techSupport", label: "Tech Support", type: "select", options: formOptions.binary },
  { name: "streamingTV", label: "Streaming TV", type: "select", options: formOptions.binary },
  { name: "streamingMovies", label: "Streaming Movies", type: "select", options: formOptions.binary },
];

const billingFields = [
  { name: "contract", label: "Contract", type: "select", options: formOptions.contract },
  { name: "paperlessBilling", label: "Paperless Billing", type: "select", options: formOptions.binary },
  { name: "paymentMethod", label: "Payment Method", type: "select", options: formOptions.paymentMethod },
  { name: "monthlyCharges", label: "Monthly Charges", type: "number", min: 0, step: 0.01 },
  { name: "totalCharges", label: "Total Charges", type: "number", min: 0, step: 0.01 },
];

function FormField({ field, value, onChange }) {
  if (field.type === "select") {
    return (
      <label className="field">
        <span>{field.label}</span>
        <select name={field.name} value={value} onChange={onChange}>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="field">
      <span>{field.label}</span>
      <input
        type="number"
        name={field.name}
        value={value}
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        onChange={onChange}
      />
    </label>
  );
}

function FormSection({ title, fields, values, onChange }) {
  return (
    <section className="form-section">
      <div className="form-section__header">
        <h2>{title}</h2>
      </div>
      <div className="form-grid">
        {fields.map((field) => (
          <FormField key={field.name} field={field} value={values[field.name]} onChange={onChange} />
        ))}
      </div>
    </section>
  );
}

export default function CustomerPrediction() {
  const [formValues, setFormValues] = useState(customerFormDefaults);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    const numericFields = new Set(["tenureMonths", "monthlyCharges", "totalCharges"]);

    setFormValues((current) => ({
      ...current,
      [name]: numericFields.has(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      const prediction = await predictChurn(formValues);
      setResult(prediction);
    } catch {
      setError("Unable to generate a churn prediction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="prediction-layout">
        <form className="prediction-form" onSubmit={handleSubmit}>
          <FormSection title="Customer Profile" fields={profileFields} values={formValues} onChange={handleChange} />
          <FormSection title="Services" fields={serviceFields} values={formValues} onChange={handleChange} />
          <FormSection title="Billing" fields={billingFields} values={formValues} onChange={handleChange} />
          <div className="prediction-actions">
            <button type="submit" className="button button--primary" disabled={loading}>
              <span>Predict Churn</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <div className="prediction-output">
          <PredictionResult result={result} loading={loading} error={error} />
          <ExplanationPanel result={result} />
          <RecommendationCard action={result?.recommendedAction ?? "Recommended actions will appear after a prediction is generated."} />
        </div>
      </section>
    </div>
  );
}
