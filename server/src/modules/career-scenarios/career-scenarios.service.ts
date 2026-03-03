import { Injectable } from '@nestjs/common';
import prisma from '../../config/prisma';
import {
  type CareerScenarioType,
  SCENARIOS,
} from '../../config/career-scenarios.constants';

export interface ScenariosResponseDto {
  activeScenario: CareerScenarioType;
  scenarios: Array<{
    type: CareerScenarioType;
    title: string;
    description: string;
    theme: { accent: string; highlight: string };
  }>;
}

@Injectable()
export class CareerScenariosService {
  async getScenarios(userId: string): Promise<ScenariosResponseDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { activeScenario: true },
    });
    const activeScenario = user?.activeScenario ?? 'FAST_GROWTH';
    return {
      activeScenario,
      scenarios: SCENARIOS.map((s) => ({
        type: s.type,
        title: s.title,
        description: s.description,
        theme: s.theme,
      })),
    };
  }

  async setActiveScenario(
    userId: string,
    scenario: CareerScenarioType,
  ): Promise<{ activeScenario: CareerScenarioType }> {
    await prisma.user.update({
      where: { id: userId },
      data: { activeScenario: scenario },
    });
    return { activeScenario: scenario };
  }
}
