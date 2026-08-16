from __future__ import annotations

import warnings
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
import sklearn.compose._column_transformer as column_transformer
import xgboost as xgb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict

warnings.filterwarnings("ignore")

ROOT_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT_DIR / "churn_model.pkl"
THRESHOLD_PATH = ROOT_DIR / "threshold.pkl"

FRONTEND_TO_MODEL_FIELDS = {
    "gender": "Gender",
    "seniorCitizen": "Senior Citizen",
    "partner": "Partner",
    "dependents": "Dependents",
    "tenureMonths": "Tenure Months",
    "phoneService": "Phone Service",
    "multipleLines": "Multiple Lines",
    "internetService": "Internet Service",
    "onlineSecurity": "Online Security",
    "onlineBackup": "Online Backup",
    "deviceProtection": "Device Protection",
    "techSupport": "Tech Support",
    "streamingTV": "Streaming TV",
    "streamingMovies": "Streaming Movies",
    "contract": "Contract",
    "paperlessBilling": "Paperless Billing",
    "paymentMethod": "Payment Method",
    "monthlyCharges": "Monthly Charges",
    "totalCharges": "Total Charges",
}

RECOMMENDATION_MAP = {
    "Contract": "Offer a discounted long-term contract",
    "Tech Support": "Provide technical support",
    "Online Security": "Offer online security package",
    "Monthly Charges": "Review pricing and provide a personalized offer",
    "Payment Method": "Review pricing and provide a personalized offer",
    "Tenure Months": "Provide an onboarding offer and service check-in",
    "Internet Service": "Review service quality and provide a personalized offer",
}


class PredictionRequest(BaseModel):
    gender: str
    seniorCitizen: str
    partner: str
    dependents: str
    tenureMonths: float
    phoneService: str
    multipleLines: str
    internetService: str
    onlineSecurity: str
    onlineBackup: str
    deviceProtection: str
    techSupport: str
    streamingTV: str
    streamingMovies: str
    contract: str
    paperlessBilling: str
    paymentMethod: str
    monthlyCharges: float
    totalCharges: float

    model_config = ConfigDict(populate_by_name=True)


def ensure_legacy_sklearn_compatibility() -> None:
    if not hasattr(column_transformer, "_RemainderColsList"):
        class _RemainderColsList(list):
            pass

        column_transformer._RemainderColsList = _RemainderColsList


@lru_cache(maxsize=1)
def load_assets() -> tuple[Any, float]:
    ensure_legacy_sklearn_compatibility()
    model = joblib.load(MODEL_PATH)
    threshold = float(joblib.load(THRESHOLD_PATH))
    return model, threshold


def build_feature_map(preprocessor) -> dict[str, str]:
    numeric_features = list(preprocessor.transformers_[0][2])
    categorical_features = list(preprocessor.transformers_[1][2])
    encoded_names = list(preprocessor.get_feature_names_out())
    mapping: dict[str, str] = {}

    for feature_name in encoded_names:
        if feature_name.startswith("num__"):
            raw_feature = feature_name.replace("num__", "", 1)
            mapping[feature_name] = raw_feature
            continue

        if feature_name.startswith("cat__"):
            stripped = feature_name.replace("cat__", "", 1)
            raw_feature = next(
                (
                    candidate
                    for candidate in sorted(categorical_features, key=len, reverse=True)
                    if stripped == candidate or stripped.startswith(f"{candidate}_")
                ),
                stripped,
            )
            mapping[feature_name] = raw_feature

    for numeric_feature in numeric_features:
        mapping.setdefault(f"num__{numeric_feature}", numeric_feature)

    return mapping


def normalize_input(payload: PredictionRequest, expected_columns: list[str]) -> pd.DataFrame:
    payload_dict = payload.model_dump()
    row = {
        model_field: payload_dict[frontend_field]
        for frontend_field, model_field in FRONTEND_TO_MODEL_FIELDS.items()
    }

    return pd.DataFrame([[row[column] for column in expected_columns]], columns=expected_columns)


def to_display_value(feature_name: str, customer_row: pd.DataFrame) -> str:
    value = customer_row.iloc[0][feature_name]

    if feature_name in {"Monthly Charges", "Total Charges"}:
        return f"${float(value):.2f}"

    if feature_name == "Tenure Months":
        return f"{int(float(value))} months"

    return str(value)


def build_factors(model, customer_row: pd.DataFrame) -> list[dict[str, Any]]:
    preprocessor = model.named_steps["preprocessor"]
    classifier = model.named_steps["model"]
    transformed = preprocessor.transform(customer_row)
    transformed_feature_names = list(preprocessor.get_feature_names_out())
    feature_map = build_feature_map(preprocessor)
    booster = classifier.get_booster()
    dmatrix = xgb.DMatrix(transformed, feature_names=transformed_feature_names)
    contributions = booster.predict(dmatrix, pred_contribs=True)[0]

    grouped: dict[str, float] = {}
    for feature_name, contribution in zip(transformed_feature_names, contributions[:-1]):
        raw_feature = feature_map.get(feature_name, feature_name)
        grouped[raw_feature] = grouped.get(raw_feature, 0.0) + float(contribution)

    total_abs = sum(abs(value) for value in grouped.values()) or 1.0
    ranked = sorted(grouped.items(), key=lambda item: abs(item[1]), reverse=True)[:5]

    return [
        {
            "feature": raw_feature,
            "value": to_display_value(raw_feature, customer_row),
            "impact": round(abs(contribution) / total_abs, 3),
            "direction": "positive" if contribution >= 0 else "negative",
        }
        for raw_feature, contribution in ranked
    ]


def choose_recommendation(factors: list[dict[str, Any]]) -> str:
    positive_factors = [factor for factor in factors if factor["direction"] == "positive"]

    for factor in positive_factors:
        if factor["feature"] in RECOMMENDATION_MAP:
            return RECOMMENDATION_MAP[factor["feature"]]

    return "Review pricing and provide a personalized offer"


def probability_to_risk(probability: float, threshold: float) -> str:
    if probability >= threshold:
        return "High"
    if probability >= 0.35:
        return "Medium"
    return "Low"


app = FastAPI(title="Telecom Churn Prediction API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, Any]:
    model, threshold = load_assets()
    return {
        "status": "ok",
        "model": "XGBoost",
        "threshold": threshold,
        "features": list(model.feature_names_in_),
    }


@app.post("/predict")
def predict(payload: PredictionRequest) -> dict[str, Any]:
    try:
        model, threshold = load_assets()
        expected_columns = list(model.feature_names_in_)
        customer_row = normalize_input(payload, expected_columns)
        preprocessor = model.named_steps["preprocessor"]
        classifier = model.named_steps["model"]
        transformed = preprocessor.transform(customer_row)
        booster = classifier.get_booster()
        probability = float(booster.predict(xgb.DMatrix(transformed))[0])
        factors = build_factors(model, customer_row)
    except Exception as exc:  # pragma: no cover - runtime integration guard
        raise HTTPException(status_code=500, detail="Unable to generate prediction.") from exc

    risk = probability_to_risk(probability, threshold)

    return {
        "probability": round(probability, 4),
        "risk": risk,
        "threshold": threshold,
        "factors": factors,
        "recommendedAction": choose_recommendation(factors),
        "model": "XGBoost",
    }
