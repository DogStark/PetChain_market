import { Injectable } from '@nestjs/common';
import { EmergencyPriority, TriageLevel } from '../common/enums/emergency.enum';

@Injectable()
export class TriageService {
  private readonly criticalSymptoms = [
    'unconscious',
    'not breathing',
    'severe bleeding',
    'cardiac arrest',
    'choking',
    'seizure',
    'trauma',
    'poisoning',
    'difficulty breathing',
  ];

  private readonly urgentSymptoms = [
    'vomiting blood',
    'severe pain',
    'bloated abdomen',
    'pale gums',
    'rapid breathing',
    'lethargy',
    'broken bone',
    'eye injury',
  ];

  private readonly moderateSymptoms = [
    'vomiting',
    'diarrhea',
    'limping',
    'ear infection',
    'skin irritation',
    'loss of appetite',
    'coughing',
    'minor cuts',
  ];

  assessTriage(symptoms: string): {
    level: TriageLevel;
    priority: EmergencyPriority;
    estimatedWaitTime: number;
  } {
    const lowerSymptoms = symptoms.toLowerCase();

    // Check for critical symptoms
    if (
      this.criticalSymptoms.some(symptom => lowerSymptoms.includes(symptom))
    ) {
      return {
        level: TriageLevel.IMMEDIATE,
        priority: EmergencyPriority.CRITICAL,
        estimatedWaitTime: 0,
      };
    }

    // Check for urgent symptoms
    if (this.urgentSymptoms.some(symptom => lowerSymptoms.includes(symptom))) {
      return {
        level: TriageLevel.URGENT,
        priority: EmergencyPriority.HIGH,
        estimatedWaitTime: 30,
      };
    }

    // Check for moderate symptoms
    if (
      this.moderateSymptoms.some(symptom => lowerSymptoms.includes(symptom))
    ) {
      return {
        level: TriageLevel.LESS_URGENT,
        priority: EmergencyPriority.MEDIUM,
        estimatedWaitTime: 120,
      };
    }

    // Default to non-urgent
    return {
      level: TriageLevel.NON_URGENT,
      priority: EmergencyPriority.LOW,
      estimatedWaitTime: 1440, // 24 hours
    };
  }

  calculatePriorityScore(appointment: any): number {
    let score = 0;

    // Triage level scoring (higher score = higher priority)
    switch (appointment.triageLevel) {
      case TriageLevel.IMMEDIATE:
        score += 1000;
        break;
      case TriageLevel.URGENT:
        score += 800;
        break;
      case TriageLevel.LESS_URGENT:
        score += 500;
        break;
      case TriageLevel.NON_URGENT:
        score += 100;
        break;
    }

    // Time factor (older appointments get slightly higher priority within same triage level)
    const hoursWaiting =
      (new Date().getTime() - appointment.createdAt.getTime()) /
      (1000 * 60 * 60);
    score += Math.min(hoursWaiting * 5, 50); // Max 50 points for waiting time

    return score;
  }
}
