import type { RunnerResultRow } from './queries';

export interface ProcessedResult extends RunnerResultRow {
  isLifetimePR: boolean;
  isSeasonPR: boolean;
  FormattedDistance: string;
}

// The strongly-typed PR calculator function
export function processRunnerResults(results: RunnerResultRow[]): ProcessedResult[] {
  const lifetimeBests: Record<string, string> = {}; 
  const seasonBests: Record<string, string> = {};   

  // First Pass: Find the absolute best times
  results.forEach(result => {
    const distanceKey = `${result.Distance}-${result.DistanceUnit}`;
    const seasonKey = `${result.Season}-${distanceKey}`;

    // Update Lifetime Best
    if (!lifetimeBests[distanceKey] || result.Time < lifetimeBests[distanceKey]) {
      lifetimeBests[distanceKey] = result.Time;
    }

    // Update Season Best
    if (!seasonBests[seasonKey] || result.Time < seasonBests[seasonKey]) {
      seasonBests[seasonKey] = result.Time;
    }
  });

  // Second Pass: Tag the results
  return results.map(result => {
    const distanceKey = `${result.Distance}-${result.DistanceUnit}`;
    const seasonKey = `${result.Season}-${distanceKey}`;

    return {
      ...result,
      isLifetimePR: result.Time === lifetimeBests[distanceKey],
      isSeasonPR: result.Time === seasonBests[seasonKey],
      FormattedDistance: `${parseFloat(result.Distance)} ${result.DistanceUnit}`
    };
  });
}