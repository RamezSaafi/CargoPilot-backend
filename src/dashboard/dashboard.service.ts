import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MissionStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregates all necessary data for the main admin dashboard.
   */
  async getDashboardAnalytics() {
    // We can run all these queries in parallel for maximum efficiency!
    const [
      kpiData,
      dailyMissionStats,
      expenseStats,
      monthlyDurationStats,
    ] = await Promise.all([
      this.getKpiStats(),
      this.getDailyMissionStats(),
      this.getExpenseStats(),
      this.getMonthlyMissionDurationStats(),
    ]);

    return {
      kpis: kpiData,
      missionsGlobales: dailyMissionStats,
      expenseStatistics: expenseStats,
      tempsMoyenMission: monthlyDurationStats,
    };
  }

  /**
   * Private helper method to calculate the Key Performance Indicators (KPIs).
   */
  private async getKpiStats() {
    const missionsEnCours = this.prisma.mission.count({
      where: { status: MissionStatus.En_cours },
    });

    const missionsTerminees = this.prisma.mission.count({
      where: { status: MissionStatus.Termine },
    });

    const incidentsSignales = this.prisma.incident.count();

    const consommation = this.prisma.mission.aggregate({
      _sum: {
        carburantConsommeL: true,
        distanceReelleKm: true,
      },
      where: {
        status: MissionStatus.Termine,
        distanceReelleKm: { gt: 0 },
      },
    });

    // Await all promises
    const [
      enCours,
      terminees,
      incidents,
      consommationData,
    ] = await Promise.all([
      missionsEnCours,
      missionsTerminees,
      incidentsSignales,
      consommation,
    ]);

    const { _sum } = consommationData;
    const moyenneConsommation =
      _sum.distanceReelleKm && _sum.carburantConsommeL
        ? (_sum.carburantConsommeL.toNumber() / _sum.distanceReelleKm.toNumber()) * 100
        : 0;

    return {
      missionsEnCours: enCours,
      missionsTerminees: terminees,
      incidentsSignales: incidents,
      moyenneConsommation: parseFloat(moyenneConsommation.toFixed(2)),
    };
  }

  /**
   * Private helper method for the "Statistiques globales sur les missions" bar chart.
   * Fetches mission counts for the last 7 days.
   */
  private async getDailyMissionStats() {
    // Using a raw query is the most efficient way to group by day.
    const last7DaysStats: any[] = await this.prisma.$queryRaw`
        SELECT
            TO_CHAR(DATE(m."createdAt"), 'YYYY-MM-DD') as date,
            COUNT(*) as "missionsRealisees",
            COUNT(CASE WHEN m."dateArriveeReelle" > m."dateArriveeEstimee" THEN 1 END) as "missionsEnRetard"
        FROM "Mission" m
        WHERE m."createdAt" >= NOW() - INTERVAL '7 days' AND m.status = 'Termine'
        GROUP BY DATE(m."createdAt")
        ORDER BY date ASC;
    `;
    // Convert BigInts from raw query to numbers for JSON compatibility
    return last7DaysStats.map(s => ({
      ...s,
      missionsRealisees: Number(s.missionsRealisees),
      missionsEnRetard: Number(s.missionsEnRetard),
    }));
  }

  /**
   * Private helper method for the "Expense Statistics" pie chart.
   */
  private async getExpenseStats() {
    const expenseStats = await this.prisma.expense.groupBy({
      by: ['category'],
      _sum: {
        amount: true,
      },
    });

    const totalExpenses = expenseStats.reduce(
      (acc, curr) => acc + (curr._sum.amount?.toNumber() ?? 0),
      0,
    );

    if (totalExpenses === 0) return [];

    return expenseStats.map(stat => ({
      category: stat.category,
      // Calculate percentage and format to 2 decimal places
      percentage: parseFloat(
        (((stat._sum.amount?.toNumber() ?? 0) / totalExpenses) * 100).toFixed(2)
      ),
    }));
  }

  /**
   * Private helper method for the "Temps moyen pour chaque mission" line chart.
   */
  private async getMonthlyMissionDurationStats() {
    // This query calculates the average duration of missions in minutes, grouped by month.
    const monthlyDuration: any[] = await this.prisma.$queryRaw`
        SELECT
            TO_CHAR(DATE_TRUNC('month', m."createdAt"), 'YYYY-MM') as month,
            AVG(EXTRACT(EPOCH FROM (m."dateArriveeReelle" - m."dateDepart")) / 60) as "averageDurationMinutes"
        FROM "Mission" m
        WHERE m.status = 'Termine' AND m."dateArriveeReelle" IS NOT NULL AND m."dateDepart" IS NOT NULL
        GROUP BY DATE_TRUNC('month', m."createdAt")
        ORDER BY month ASC;
    `;
    return monthlyDuration.map(m => ({
        month: m.month,
        averageDurationMinutes: m.averageDurationMinutes ? parseFloat(m.averageDurationMinutes.toFixed(2)) : 0
    }));
  }
}