from datetime import datetime
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="Land Acquisition Prototype ML Service",
    description="Prototype scoring API. Replace this logic with a trained model when validated data is available.",
    version="1.0.0",
)


class PredictionInput(BaseModel):
    projectId: str | None = None
    projectType: str | None = None
    state: str | None = None
    district: str | None = None
    landRequired: float = Field(default=0, ge=0)
    landAcquired: float = Field(default=0, ge=0)
    affectedFamilies: int = Field(default=0, ge=0)
    landowners: int = Field(default=0, ge=0)
    totalCompensation: float = Field(default=0, ge=0)
    paidCompensation: float = Field(default=0, ge=0)
    pendingApprovals: int = Field(default=0, ge=0)
    activeLegalCases: int = Field(default=0, ge=0)
    documentationCompletion: float = Field(default=0, ge=0, le=100)
    rehabilitationProgress: float = Field(default=0, ge=0, le=100)
    stakeholderResponseTime: float = Field(default=0, ge=0)
    historicalPerformance: float = Field(default=60, ge=0, le=100)
    previousDelayMonths: float = Field(default=0, ge=0)


def clamp(value: float, low: float = 0, high: float = 100) -> float:
    return max(low, min(high, value))


def risk_level(score: int) -> str:
    if score >= 81:
        return "Critical"
    if score >= 61:
        return "High"
    if score >= 31:
        return "Medium"
    return "Low"


def explainable_score(payload: PredictionInput) -> dict[str, Any]:
    land_progress = (payload.landAcquired / payload.landRequired * 100) if payload.landRequired else 0
    payment_progress = (payload.paidCompensation / payload.totalCompensation * 100) if payload.totalCompensation else 0
    factors = {
        "Compensation pending": clamp(100 - payment_progress),
        "Legal disputes": clamp(payload.activeLegalCases / 18 * 100),
        "Pending approvals": clamp(payload.pendingApprovals / 7 * 100),
        "Documentation completeness": clamp(100 - payload.documentationCompletion),
        "Acquisition progress": clamp(100 - land_progress),
        "Rehabilitation progress": clamp(100 - payload.rehabilitationProgress),
        "Stakeholder responsiveness": clamp(payload.stakeholderResponseTime / 30 * 100),
        "Historical performance": clamp(100 - payload.historicalPerformance),
    }
    weights = {
        "Compensation pending": 0.21,
        "Legal disputes": 0.17,
        "Pending approvals": 0.12,
        "Documentation completeness": 0.09,
        "Acquisition progress": 0.10,
        "Rehabilitation progress": 0.10,
        "Stakeholder responsiveness": 0.07,
        "Historical performance": 0.06,
    }
    score = round(sum(factors[name] * weights[name] for name in weights))
    delay_probability = round(clamp(score * 0.72 + factors["Legal disputes"] * 0.12 + factors["Compensation pending"] * 0.10 + factors["Pending approvals"] * 0.06))
    total_factor = sum(factors.values()) or 1
    contributors = [
        {
            "name": name,
            "impact": round(value, 2),
            "contribution": round(value / total_factor * 100),
        }
        for name, value in sorted(factors.items(), key=lambda item: item[1], reverse=True)
    ]
    return {
        "projectId": payload.projectId,
        "riskScore": int(clamp(score)),
        "riskLevel": risk_level(score),
        "delayProbability": delay_probability,
        "expectedDelay": "4-7 months" if delay_probability >= 76 else "3-5 months" if delay_probability >= 61 else "1-3 months" if delay_probability >= 36 else "0-1 month",
        "contributingFactors": contributors,
        "recommendations": [
            {
                "title": f"{idx + 1}. {factor['name']}",
                "priority": "High" if factor["contribution"] >= 24 else "Medium",
                "action": f"Prioritize {factor['name'].lower()} through district review, escalation deadlines and accountable ownership.",
            }
            for idx, factor in enumerate(contributors[:3])
        ],
        "modelVersion": "prototype-fastapi-v1.4",
        "prototype": True,
        "predictedAt": datetime.utcnow().isoformat() + "Z",
        "disclaimer": "Prototype scoring logic only. No government-trained model is claimed.",
    }


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "land-risk-ml", "prototype": True}


@app.post("/predict")
def predict(payload: PredictionInput) -> dict[str, Any]:
    return explainable_score(payload)


@app.post("/predict/stages")
def predict_stages(payload: PredictionInput) -> dict[str, Any]:
    overall = explainable_score(payload)
    stages = [
        ("Notification", -48, "0-1 month"),
        ("Survey", -34, "1-2 months"),
        ("Land Identification", -28, "1-2 months"),
        ("Valuation", -18, "1-3 months"),
        ("Compensation Approval", 4, "2-4 months"),
        ("Compensation Payment", 13, "3-5 months"),
        ("Possession", 7, "2-4 months"),
        ("Rehabilitation", -2, "2-3 months"),
        ("Final Handover", -20, "1-2 months"),
    ]
    return {
        "projectId": payload.projectId,
        "overall": overall,
        "stages": [
            {
                "stage": stage,
                "delayProbability": round(clamp(overall["delayProbability"] + modifier)),
                "expectedDelay": delay,
            }
            for stage, modifier, delay in stages
        ],
    }
